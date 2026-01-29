import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import api from '../api/api';
import { Project, ProjectStatus } from '../types/project';
import { useAuth } from './AuthContext';

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

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjects moet binnen een ProjectProvider gebruikt worden');
    }
    return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        if (!token) return;
        setIsLoadingProjects(true);
        setError(null);
        try {
            const response = await api.get<Project[]>('/projects');
            setProjects(response.data);
            if (user?.role === 'CLIENT' && response.data.length > 0) {
                setCurrentProject(response.data[0]);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kon projecten niet ophalen');
        } finally {
            setIsLoadingProjects(false);
        }
    }, [token, user?.role]);

    const fetchCurrentProject = useCallback(async () => {
        if (!token) return;
        setIsLoadingProjects(true);
        setError(null);
        try {
            const response = await api.get<Project[]>('/projects?current=true');
            setCurrentProject(response.data[0] || null);
        } catch (err: any) {
            setError('Kon actief project niet laden.');
        } finally {
            setIsLoadingProjects(false);
        }
    }, [token]);

    const fetchProjectDetails = useCallback(async (id: number) => {
        if (!token) return;
        setIsLoadingProjects(true);
        setError(null);
        try {
            const response = await api.get<Project>(`/projects/${id}`);
            setCurrentProject(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kon projectdetails niet ophalen');
        } finally {
            setIsLoadingProjects(false);
        }
    }, [token]);

    const createProject = useCallback(async (data: ProjectCreationData) => {
        setIsLoadingProjects(true);
        setError(null);
        try {
            const response = await api.post<Project>('/projects', data);
            setProjects(prev => [...prev, response.data]);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Fout bij aanmaken project.";
            setError(msg);
            throw new Error(msg);
        } finally {
            setIsLoadingProjects(false);
        }
    }, []);

    const updateProjectStatus = useCallback(async (id: number, status: ProjectStatus) => {
        setError(null);
        try {
            const response = await api.put<Project>(`/projects/${id}`, { status });
            const updated = response.data;
            setCurrentProject(prev => prev?.id === id ? updated : prev);
            setProjects(prev => prev.map(p => p.id === id ? updated : p));
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Fout bij updaten status';
            setError(msg);
            throw new Error(msg);
        }
    }, []);

    const value = useMemo(() => ({
        projects, currentProject, isLoadingProjects, setCurrentProject, error,
        fetchProjects, fetchCurrentProject, fetchProjectDetails, updateProjectStatus, createProject
    }), [projects, currentProject, isLoadingProjects, error, fetchProjects, fetchCurrentProject, fetchProjectDetails, updateProjectStatus, createProject]);

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};