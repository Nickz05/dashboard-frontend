// src/contexts/UserContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { User } from '../types/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Types ---
interface UserContextType {
    users: User[];
    isLoadingUsers: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    updateUserRole: (id: number, newRole: 'ADMIN' | 'CLIENT') => Promise<void>;
    // Functies voor het aanmaken/verwijderen van gebruikers (voor ADMIN)
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// --- Custom Hook ---
export const useUsers = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
};

// --- Provider Component ---
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getConfig = () => {
        if (!token) throw new Error("Niet geautoriseerd: Token ontbreekt.");
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // Alleen voor ADMIN: Haalt alle gebruikers op
    const fetchUsers = useCallback(async () => {
        if (!token || user?.role !== 'ADMIN') {
            setError('Toegang geweigerd: Admin rechten vereist.');
            return;
        }
        setIsLoadingUsers(true);
        setError(null);
        try {
            // Backend route GET /api/user
            const response = await axios.get<User[]>(`${API_URL}/user`, getConfig());
            setUsers(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kon gebruikers niet laden.');
        } finally {
            setIsLoadingUsers(false);
        }
    }, [token, user?.role]);

    // Alleen voor ADMIN: Rol van een gebruiker updaten (Klantenbeheer)
    const updateUserRole = useCallback(async (id: number, newRole: 'ADMIN' | 'CLIENT') => {
        if (!token || user?.role !== 'ADMIN') throw new Error("Toegang geweigerd.");

        try {
            // Backend route PUT /api/user/:id
            const response = await axios.put<User>(`${API_URL}/user/${id}`, { role: newRole }, getConfig());

            // Update de lijst lokaal
            setUsers(prev => prev.map(u => u.id === id ? response.data : u));

        } catch (err: any) {
            const message = err.response?.data?.message || 'Fout bij updaten van de rol.';
            setError(message);
            throw new Error(message);
        }
    }, [token, user?.role]);


    const contextValue: UserContextType = {
        users,
        isLoadingUsers,
        error,
        fetchUsers,
        updateUserRole,
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};