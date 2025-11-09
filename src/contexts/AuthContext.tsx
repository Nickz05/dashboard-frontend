import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../api/api';
import { User, DecodedToken } from '../types/user';
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
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
    const [isLoading, setIsLoading] = useState(true); // ✅ Alleen true tijdens initialisatie
    const isAuthenticated = !!user;

    // ✅ Haal echte gebruiker op
    const fetchUserDetails = async () => {
        try {
            const response = await api.get('/user/me');
            setUser(response.data);
        } catch (error) {
            console.error("Kon gebruikersgegevens niet ophalen:", error);
            throw error; // ✅ Gooi error door zodat login het kan afhandelen
        }
    };

    // ✅ Dit draait alleen bij het opstarten van de app (initialisatie)
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
                        localStorage.removeItem('token');
                    }
                } catch (error) {
                    console.error("Fout bij decoderen token:", error);
                    localStorage.removeItem('token');
                }
            }
            setIsLoading(false); // ✅ Initialisatie klaar
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        // ✅ Gebruik GEEN isLoading hier, dat is alleen voor initialisatie
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token: receivedToken, mustChangePassword } = response.data;

            localStorage.setItem('token', receivedToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
            setToken(receivedToken);

            // ✅ Haal gebruikersgegevens op
            await fetchUserDetails();

            // ✅ Als mustChangePassword in de login response zit, update de user state
            if (mustChangePassword !== undefined) {
                setUser(prevUser => prevUser ? { ...prevUser, mustChangePassword } : null);
            }
        } catch (error: any) {
            const message = error.response?.data?.message ?? 'Login mislukt';
            throw new Error(message);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setToken(null);
    };

    const value = useMemo(() => ({
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
    }), [user, token, isAuthenticated, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};