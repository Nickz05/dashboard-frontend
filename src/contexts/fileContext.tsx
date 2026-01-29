// src/contexts/FileContext.tsx

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';
import { FileRecord, Invoice } from '../types/file';

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

    // Haalt alle bestanden en facturen voor een project op
    const fetchFilesAndInvoices = useCallback(async (projectId: number) => {
        if (!token) return;
        setIsLoadingFiles(true);
        setError(null);
        try {
            const response = await api.get<{ files: FileRecord[], invoices: Invoice[] }>(`/files/${projectId}`);
            setFiles(response.data.files || []);
            setInvoices(response.data.invoices || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kon bestanden niet laden.');
        } finally {
            setIsLoadingFiles(false);
        }
    }, [token]);

    // CLIENT: Uploaden van bestanden
    const uploadClientFile = useCallback(async (projectId: number, file: File) => {
        setIsLoadingFiles(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId.toString());

        try {
            const response = await api.post<FileRecord>('/files/upload', formData);
            setFiles(prev => [...prev, response.data]);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Fout bij bestandsupload.';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoadingFiles(false);
        }
    }, []);

    // FIX: De useMemo was niet correct gedefinieerd
    const contextValue = useMemo(() => ({
        files,
        invoices,
        isLoadingFiles,
        error,
        fetchFilesAndInvoices,
        uploadClientFile,
    }), [files, invoices, isLoadingFiles, error, fetchFilesAndInvoices, uploadClientFile]);

    return (
        <FileContext.Provider value={contextValue}>
            {children}
        </FileContext.Provider>
    );
};