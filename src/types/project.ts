// src/types/project.ts

// Moet matchen met de enum ProjectStatus in de backend (Prisma)
export type ProjectStatus = 'CONCEPT' | 'IN_DESIGN' | 'WAITING_FOR_CONTENT' | 'DEVELOPMENT' | 'STAGING' | 'LIVE';

export interface Project {
    id: number;
    title: string;
    description: string | null;
    status: ProjectStatus;

    // Velden gebruikt op DashboardPage en ProjectDetailPage
    progress: number; // FIX: Toegevoegd voor de voortgangsbalk (DashboardPage)
    timeline: string | null;
    nextMilestone: string | null; // FIX: Toegevoegd voor de mijlpaal tekst (DashboardPage)

    contactPerson: string | null;
    stagingUrl: string | null;
    clientId: number;

    // Relatiegegevens voor de detailweergave
    client: {
        name: string;
        email: string
    };

    // Relaties (moeten matchen met de Prisma include uit de backend)
    tasks: any[]; // Task[]
    files: any[]; // FileRecord[]
    invoices: any[]; // Invoice[]

    // Datums moeten strings zijn (ISO-8601) om de TS2345 fout op te lossen
    createdAt: string;
    updatedAt: string;
}