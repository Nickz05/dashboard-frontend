import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';
import { Task, TaskStatus, TaskCreationData } from '../types/task';

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

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTasksForProject = useCallback(async (projectId: number) => {
        if (!token) return;
        setIsLoadingTasks(true);
        setError(null);
        try {
            const response = await api.get<Task[]>('/tasks', { params: { projectId } });
            setTasks(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kon taken niet laden.');
        } finally {
            setIsLoadingTasks(false);
        }
    }, [token]);

    const submitClientFeedback = useCallback(async (taskId: number, feedback: string, newStatus?: TaskStatus) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const payload: any = { feedback };
            if (newStatus) payload.status = newStatus;
            const response = await api.put<Task>(`/tasks/${taskId}`, payload);
            setTasks(prev => prev.map(t => t.id === taskId ? response.data : t));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Fout bij verzenden feedback.');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    const createTask = useCallback(async (data: TaskCreationData) => {
        setIsSubmitting(true);
        try {
            const response = await api.post<Task>('/tasks', data);
            setTasks(prev => [...prev, response.data]);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Fout bij aanmaken taak.');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    const updateTaskStatus = useCallback(async (taskId: number, status: TaskStatus) => {
        setIsSubmitting(true);
        try {
            const response = await api.put<Task>(`/tasks/${taskId}`, { status });
            setTasks(prev => prev.map(t => t.id === taskId ? response.data : t));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Fout bij updaten status');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    const value = useMemo(() => ({
        tasks, isLoadingTasks, isSubmitting, error,
        fetchTasksForProject, submitClientFeedback, createTask, updateTaskStatus
    }), [tasks, isLoadingTasks, isSubmitting, error, fetchTasksForProject, submitClientFeedback, createTask, updateTaskStatus]);

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};