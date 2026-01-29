import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';
import { User } from '../types/user';

interface UserContextType {
    users: User[];
    isLoadingUsers: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    updateUserRole: (id: number, newRole: 'ADMIN' | 'CLIENT') => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        if (!token || user?.role !== 'ADMIN') return;
        setIsLoadingUsers(true);
        setError(null);
        try {
            const response = await api.get<User[]>('/user');
            setUsers(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kon gebruikers niet laden.');
        } finally {
            setIsLoadingUsers(false);
        }
    }, [token, user?.role]);

    const updateUserRole = useCallback(async (id: number, newRole: 'ADMIN' | 'CLIENT') => {
        if (!token || user?.role !== 'ADMIN') throw new Error("Toegang geweigerd.");
        try {
            const response = await api.put<User>(`/user/${id}`, { role: newRole });
            setUsers(prev => prev.map(u => u.id === id ? response.data : u));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Fout bij updaten van de rol.');
            throw err;
        }
    }, [token, user?.role]);

    const value = useMemo(() => ({
        users, isLoadingUsers, error, fetchUsers, updateUserRole
    }), [users, isLoadingUsers, error, fetchUsers, updateUserRole]);

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};