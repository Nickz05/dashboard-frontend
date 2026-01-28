import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/api';
import { User, DecodedToken } from '../types/user';
import { jwtDecode } from "jwt-decode";
import axios from 'axios'; // Importeer axios om te controleren op foutcodes

// Frequentie van de periodieke check (3 seconden)
const TOKEN_CHECK_INTERVAL_MS = 3000;

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logoutReason: string | null; // <-- NIEUW: reden voor automatische uitlog
    login: (email: string, password: string) => Promise<void>;
    logout: (reason?: string) => void; // <-- NIEUW: optionele reden
    clearLogoutReason: () => void; // <-- NIEUW: om de melding te wissen
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth moet binnen een AuthProvider gebruikt worden');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [logoutReason, setLogoutReason] = useState<string | null>(null); // <-- NIEUWE STATE
    const isAuthenticated = !!user;

    // 1. Herbruikbare en stabiele logout functie
    const logout = useCallback((reason?: string) => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setToken(null);
        if (reason) {
            setLogoutReason(reason); // Stel de reden in
        }
        console.log("Gebruiker is uitgelogd. Token verwijderd.");
    }, []);

    const clearLogoutReason = useCallback(() => {
        setLogoutReason(null);
    }, []);

    // 2. Haal gebruikersgegevens op met automatische logout bij 401
    const fetchUserDetails = useCallback(async () => {
        try {
            const response = await api.get('/user/me');
            setUser(response.data);
        } catch (error) {
            console.error("Kon gebruikersgegevens niet ophalen:", error);

            // Controleer op 401 Unauthorized
            if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
                console.warn("API gaf 401 Unauthorized. Automatisch uitloggen geactiveerd.");
                // Geef een duidelijke foutmelding mee
                logout("Je sessie is verlopen. Log opnieuw in om verder te gaan.");
            }

            throw error;
        }
    }, [logout]);

    // 3. Interval voor periodieke geldigheid check
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        const checkTokenExpiration = () => {
            if (token) {
                try {
                    const decoded = jwtDecode<DecodedToken>(token);
                    const currentTime = Date.now();
                    const expirationTime = decoded.exp * 1000;

                    // Als de token binnen 1 seconde is verlopen of al is verlopen
                    if (expirationTime < currentTime + 1000) {
                        console.log(`Lokaal gedetecteerd: Token verloopt/is verlopen op ${new Date(expirationTime)}.`);
                        // Geef een duidelijke foutmelding mee
                        logout("Je sessie is verlopen. Log opnieuw in om verder te gaan.");
                    }
                } catch (error) {
                    console.error("Fout bij decoderen token tijdens periodieke check.", error);
                    logout("Er is een fout opgetreden met je sessie. Log opnieuw in.");
                }
            }
        };

        if (token) {
            interval = setInterval(checkTokenExpiration, TOKEN_CHECK_INTERVAL_MS);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [token, logout]);

    // 4. Initialisatie bij het opstarten van de app
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const decoded = jwtDecode<DecodedToken>(storedToken);

                    if (decoded.exp * 1000 > Date.now()) {
                        setToken(storedToken);
                        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                        await fetchUserDetails();
                    } else {
                        console.log("Token was al lokaal verlopen bij opstarten.");
                        // Geef reden mee bij opstarten
                        logout("Je vorige sessie is verlopen. Log opnieuw in.");
                    }
                } catch (error) {
                    console.error("Fout bij decoderen token bij opstarten. Log uit.", error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, [fetchUserDetails, logout]);

    const login = async (email: string, password: string) => {
        // ... (login logica)
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token: receivedToken, mustChangePassword } = response.data;

            localStorage.setItem('token', receivedToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
            setToken(receivedToken);
            clearLogoutReason(); // Wis de logout reden na succesvolle login

            await fetchUserDetails();

            if (mustChangePassword !== undefined) {
                setUser(prevUser => prevUser ? { ...prevUser, mustChangePassword } : null);
            }
        } catch (error: any) {
            const message = error.response?.data?.message ?? 'Login mislukt';
            throw new Error(message);
        }
    };

    const value = useMemo(() => ({
        user,
        token,
        isAuthenticated,
        isLoading,
        logoutReason, // <-- Voeg toe aan value
        login,
        logout,
        clearLogoutReason, // <-- Voeg toe aan value
    }), [user, token, isAuthenticated, isLoading, logoutReason, login, logout, clearLogoutReason]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};