// src/types/file.ts

// Gebaseerd op de Enum in je Prisma schema
export type PaymentStatus =
    | 'PENDING'
    | 'PAID'
    | 'OVERDUE'
    | 'CANCELED';

export interface FileRecord {
    id: number;
    fileName: string;
    fileType: string;
    fileUrl: string; // URL naar de opslag
    isPublic: boolean;
    uploadedBy: 'CLIENT' | 'ZD'; // Wie heeft het bestand geüpload?

    projectId: number;

    createdAt: Date;
}

export interface Invoice {
    id: number;
    invoiceNumber: string;
    amount: number;
    dueDate: Date;
    paymentStatus: PaymentStatus;
    fileUrl: string; // URL naar de PDF factuur

    projectId: number;

    createdAt: Date;
}