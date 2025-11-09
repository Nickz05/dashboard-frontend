// src/contexts/TaskContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Task, TaskStatus, TaskCreationData } from '../types/task';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helperfunctie om een ISO datum string te genereren
const getUpdatedTimestamp = () => new Date().toISOString();

// --- Types ---
interface TaskContextType {
    tasks: Task[];
    isLoadingTasks: boolean;
    isSubmitting: boolean;
    error: string | null;
    fetchTasksForProject: (projectId: number) => Promise<void>;
    submitClientFeedback: (taskId: number, feedback: string, newStatus?: TaskStatus) => Promise<void>;
    createTask: (data: TaskCreationData) => Promise<void>;
    updateTaskStatus: (taskId: number, status: TaskStatus) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// --- Custom Hook ---
export const useTasks = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};

// --- Provider Component ---
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getConfig = () => {
        if (!token) throw new Error("Niet geautoriseerd: Token ontbreekt.");
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // Haalt alle taken op voor een specifiek project (gebruikt op ProjectDetailPage)
    const fetchTasksForProject = useCallback(async (projectId: number) => {
        if (!token) return;
        setIsLoadingTasks(true);
        setError(null);
        try {
            // Backend route GET /api/tasks?projectId=X
            const response = await axios.get<Task[]>(`${API_URL}/tasks?projectId=${projectId}`, getConfig());
            setTasks(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kon taken niet laden.');
        } finally {
            setIsLoadingTasks(false);
        }
    }, [token]);

    // CLIENT: Feedback geven op een taak (User Story III.1)
    const submitClientFeedback = useCallback(async (taskId: number, feedback: string, newStatus?: TaskStatus) => {
        if (!token) throw new Error("Niet geautoriseerd.");

        setIsSubmitting(true);
        setError(null);
        try {
            const data: { feedback: string; status?: TaskStatus } = { feedback };
            if (newStatus) {
                data.status = newStatus;
            }

            // Backend route PUT /api/tasks/:id
            const response = await axios.put<Task>(`${API_URL}/tasks/${taskId}`, data, getConfig());

            // Update de takenlijst lokaal
            setTasks(prev => prev.map(t => t.id === taskId ? response.data : t));

        } catch (err: any) {
            const message = err.response?.data?.message || 'Fout bij het verzenden van feedback.';
            setError(message);
            throw new Error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [token]);

    // ADMIN: Nieuwe taak aanmaken (User Story III.2)
    const createTask = useCallback(async (data: TaskCreationData) => {
        if (!token || user?.role !== 'ADMIN') throw new Error("Toegang geweigerd: Admin rechten vereist.");

        setIsSubmitting(true);
        setError(null);
        try {
            // Backend route POST /api/tasks
            const response = await axios.post<Task>(`${API_URL}/tasks`, data, getConfig());

            // Voeg de nieuwe taak toe aan de lijst
            setTasks(prev => [...prev, response.data]);

        } catch (err: any) {
            const message = err.response?.data?.message || 'Fout bij het aanmaken van de taak.';
            setError(message);
            throw new Error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [token, user?.role]);

    // ADMIN: Status van een ZD taak wijzigen (optioneel, voor interne tracking)
    const updateTaskStatus = useCallback(async (taskId: number, status: TaskStatus) => {
        if (!token || user?.role !== 'ADMIN') throw new Error("Toegang geweigerd: Admin rechten vereist.");

        // Simpele PUT naar de backend
        await axios.put(`${API_URL}/tasks/${taskId}`, { status }, getConfig());

        // Update de takenlijst lokaal
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, updatedAt: getUpdatedTimestamp() } : t));
    }, [token, user?.role]);


    const contextValue: TaskContextType = {
        tasks,
        isLoadingTasks,
        isSubmitting,
        error,
        fetchTasksForProject,
        submitClientFeedback,
        createTask,
        updateTaskStatus,
    };

    return (
        <TaskContext.Provider value={contextValue}>
            {children}
        </TaskContext.Provider>
    );
};