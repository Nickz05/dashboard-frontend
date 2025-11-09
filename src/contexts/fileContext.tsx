// src/contexts/FileContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { FileRecord, Invoice } from '../types/file';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Types ---
interface FileContextType {
    files: FileRecord[];
    invoices: Invoice[];
    isLoadingFiles: boolean;
    error: string | null;
    fetchFilesAndInvoices: (projectId: number) => Promise<void>;
    uploadClientFile: (projectId: number, file: File) => Promise<void>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

// --- Custom Hook ---
export const useFiles = () => {
    const context = useContext(FileContext);
    if (context === undefined) {
        throw new Error('useFiles must be used within a FileProvider');
    }
    return context;
};

// --- Provider Component ---
export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getConfig = (isMultipart = false) => {
        if (!token) throw new Error("Niet geautoriseerd: Token ontbreekt.");
        const headers = {
            Authorization: `Bearer ${token}`,
            // De browser stelt Content-Type automatisch in bij FormData, dus we laten deze weg.
            ...(isMultipart ? {} : { 'Content-Type': 'application/json' })
        };
        return { headers };
    };

    // Haalt alle bestanden en facturen voor een project op
    const fetchFilesAndInvoices = useCallback(async (projectId: number) => {
        if (!token) return;
        setIsLoadingFiles(true);
        setError(null);
        try {
            // Backend route GET /api/files/:projectId
            const response = await axios.get<{ files: FileRecord[], invoices: Invoice[] }>(
                `${API_URL}/files/${projectId}`,
                getConfig()
            );

            setFiles(response.data.files || []);
            setInvoices(response.data.invoices || []);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Kon bestanden niet laden.');
        } finally {
            setIsLoadingFiles(false);
        }
    }, [token]);

    // CLIENT: Uploaden van bestanden (logo's, content)
    const uploadClientFile = useCallback(async (projectId: number, file: File) => {
        if (!token) throw new Error("Niet geautoriseerd.");

        setIsLoadingFiles(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', String(projectId));

        try {
            // Backend route POST /api/files/upload
            const response = await axios.post<FileRecord>(`${API_URL}/files/upload`, formData, getConfig(true));

            setFiles(prev => [...prev, response.data]);

        } catch (err: any) {
            const message = err.response?.data?.message || 'Fout bij bestandsupload.';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoadingFiles(false);
        }
    }, [token]);


    const contextValue: FileContextType = {
        files,
        invoices,
        isLoadingFiles,
        error,
        fetchFilesAndInvoices,
        uploadClientFile,
    };

    return (
        <FileContext.Provider value={contextValue}>
            {children}
        </FileContext.Provider>
    );
};