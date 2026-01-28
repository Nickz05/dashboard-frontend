// src/types/project.ts

// ============= ENUMS - SYNC MET PRISMA =============

export enum ProjectStatus {
    CONCEPT = 'CONCEPT',
    IN_DESIGN = 'IN_DESIGN',
    WAITING_FOR_CONTENT = 'WAITING_FOR_CONTENT',
    DEVELOPMENT = 'DEVELOPMENT',
    STAGING = 'STAGING',
    LIVE = 'LIVE'
}

export enum FeatureStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}

export enum FeaturePriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    NEEDS_REVIEW = 'NEEDS_REVIEW'
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELED = 'CANCELED'
}

// ============= INTERFACES =============

export interface User {
    id: number;
    name: string | null;
    email: string;
    role: 'ADMIN' | 'CLIENT';
}

export interface Client {
    id: number;
    name: string;
    email: string;
}

export interface Comment {
    id: number;
    content: string;
    createdAt: string;
    parentId?: number | null;
    author: {
        name: string | null;
        role: 'ADMIN' | 'CLIENT';
        email?: string;
    };
}

export interface Feature {
    id: number;
    title: string;
    description: string;
    status: FeatureStatus;
    priority: FeaturePriority;
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    isClientTask: boolean;
    feedback?: string;
    createdAt: string;
    updatedAt: string;
}

export interface File {
    id: number;
    fileName: string;
    fileType: string;
    fileUrl: string;
    isPublic: boolean;
    uploadedBy: string;
    createdAt: string;
}

export interface Invoice {
    id: number;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    paymentStatus: PaymentStatus;
    fileUrl: string;
    createdAt: string;
}

export interface Project {
    id: number;
    title: string;
    description?: string;
    status: ProjectStatus;
    timeline?: string;
    stagingUrl?: string;
    contactPerson?: string;
    createdAt: string;
    updatedAt: string;

    client: Client;
    tasks?: Task[];
    files?: File[];
    invoices?: Invoice[];
    comments?: Comment[];
    features?: Feature[];
}

// ============= CREATION DATA TYPES =============

export interface ProjectCreationData {
    title: string;
    clientId: number;
    contactPerson?: string;
    stagingUrl?: string;
    description?: string;
    timeline?: string;
}

export interface CommentCreationData {
    content: string;
}

export interface FeatureCreationData {
    title: string;
    description?: string;
    priority?: FeaturePriority;
}

export interface FeatureUpdateData {
    title?: string;
    description?: string;
    status?: FeatureStatus;
    priority?: FeaturePriority;
}