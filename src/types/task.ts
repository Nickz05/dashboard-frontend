// src/types/task.ts

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'NEEDS_REVIEW';

export interface Task {
    id: number;
    projectId: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    isClientTask: boolean; // True: taak voor klant; False: taak voor Zomer Dev
    feedback: string | null; // Veld voor klantfeedback
    createdAt: string;
    updatedAt: string;
}

export interface TaskCreationData {
    projectId: number;
    title: string;
    description?: string;
    isClientTask: boolean;
}