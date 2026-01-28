// src/contexts/ProjectContext.tsx

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Project, ProjectStatus } from '../types/project';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getUpdatedTimestamp = () => new Date().toISOString();

// --- Types ---
interface ProjectCreationData {
    title: string;
    clientId: number;
    contactPerson?: string;
    stagingUrl?: string;
    description?: string;
    timeline?: string;
}
interface ProjectContextType {
    projects: Project[];
    currentProject: Project | null;
    setCurrentProject: React.Dispatch<React.SetStateAction<Project | null>>;
    isLoadingProjects: boolean;
    error: string | null;
    fetchProjects: () => Promise<void>;
    fetchCurrentProject: () => Promise<void>;
    fetchProjectDetails: (id: number) => Promise<void>;
    createProject: (data: ProjectCreationData) => Promise<void>;
    updateProjectStatus: (id: number, status: ProjectStatus) => Promise<void>;
}

// --- Initial State & Context aanmaken ---
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// --- Custom Hook ---
export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjects moet binnen een ProjectProvider gebruikt worden');
    }
    return context;
};

// --- Provider Component ---
export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);

    // FIX 1: Hernoem state van 'project' naar 'currentProject'
    const [currentProject, setCurrentProject] = useState<Project | null>(null);

    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getConfig = () => {
        if (!token) throw new Error("Niet geautoriseerd: Token ontbreekt.");
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // Ophalen van alle projecten (voor CLIENT of ADMIN)
    const fetchProjects = useCallback(async () => {
        if (!token) return;
        setIsLoadingProjects(true);
        setError(null);
        try {
            const response = await axios.get<Project[]>(`${API_URL}/projects`, getConfig());
            setProjects(response.data);

            // OPTIONEEL: Als dit een CLIENT is, stel de eerste in als currentProject
            if (user?.role === 'CLIENT' && response.data.length > 0) {
                setCurrentProject(response.data[0]);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kon projecten niet ophalen');
        } finally {
            setIsLoadingProjects(false);
        }
    }, [token, user?.role]);

    // FIX 2: Implementeer fetchCurrentProject
    const fetchCurrentProject = useCallback(async () => {
        if (!token) return;
        setIsLoadingProjects(true);
        setError(null);
        try {
            // Dit roept de backend route GET /api/projects?current=true aan
            const response = await axios.get<Project[]>(`${API_URL}/projects?current=true`, getConfig());
            // Neem het eerste project als 'current'
            setCurrentProject(response.data[0] || null);
        } catch (err: any) {
            setError('Kon actief project niet laden.');
            console.error(err);
        } finally {
            setIsLoadingProjects(false);
        }
    }, [token]);

    // Ophalen van details van één project
    const fetchProjectDetails = useCallback(async (id: number) => {
        if (!token) return;
        setIsLoadingProjects(true);
        setCurrentProject(null); // Clear de state voordat we nieuwe details laden
        setError(null);
        try {
            const response = await axios.get<Project>(`${API_URL}/projects/${id}`, getConfig());
            // Gebruik 'currentProject' state om de details op te slaan
            setCurrentProject(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kon projectdetails niet ophalen');
        } finally {
            setIsLoadingProjects(false);
        }
    }, [token]);

    // NIEUW: Functie voor aanmaken (Admin)
    const createProject = useCallback(async (data: ProjectCreationData) => {
        if (!token || user?.role !== 'ADMIN') throw new Error("Toegang geweigerd: Admin rechten vereist.");

        setIsLoadingProjects(true);
        setError(null);
        try {
            const response = await axios.post<Project>(`${API_URL}/projects`, data, getConfig());
            setProjects(prev => [...prev, response.data]);
        } catch (err: any) {
            const message = err.response?.data?.message || "Fout bij aanmaken project.";
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoadingProjects(false);
        }
    }, [token, user?.role]);

    // Alleen voor ADMIN: Status of Tijdlijn aanpassen
    const updateProjectStatus = useCallback(async (id: number, status: ProjectStatus) => {
        if (!token || user?.role !== 'ADMIN') throw new Error("Toegang geweigerd: Admin rechten vereist.");

        try {
            const response = await axios.put(`${API_URL}/projects/${id}`, { status }, getConfig());

            const updatedTime = getUpdatedTimestamp();
            const newStatus = response.data.status;

            // Update de detailweergave
            setCurrentProject(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    status: newStatus,
                    updatedAt: updatedTime
                };
            });

            // Update de overzichtsweergave
            setProjects(prev => prev.map(p => {
                if (p.id !== id) return p;
                return {
                    ...p,
                    status: newStatus,
                    updatedAt: updatedTime
                } as Project;
            }));

            return response.data;
        } catch (err: any) {
            const message = err.response?.data?.message || 'Fout bij updaten status';
            setError(message);
            throw new Error(message);
        }
    }, [token, user?.role]);

    const value = useMemo(() => ({
        projects,
        currentProject, // FIX: Exporteer currentProject
        isLoadingProjects,
        setCurrentProject,
        error,
        fetchProjects,
        fetchCurrentProject, // FIX: Exporteer fetchCurrentProject
        fetchProjectDetails,
        updateProjectStatus,
        createProject
    }), [projects, currentProject, isLoadingProjects, error, fetchProjects, fetchCurrentProject, fetchProjectDetails, updateProjectStatus, createProject]);

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};