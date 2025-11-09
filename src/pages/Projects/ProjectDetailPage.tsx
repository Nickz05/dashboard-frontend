// src/pages/Projects/ProjectDetailPage.tsx

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
// import TaskListComponent, InvoiceSnapshot, etc.
import '../../styles/pages/ProjectDetailPage.css';

const ProjectDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const projectId = id ? parseInt(id) : null;

    const { user } = useAuth();
    const { currentProject, fetchProjectDetails, isLoadingProjects } = useProjects();

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails(projectId);
        }
    }, [projectId, fetchProjectDetails]);

    if (isLoadingProjects) {
        return <LoadingSpinner size="lg" />;
    }

    if (!currentProject) {
        return <div className="project-detail-container card">Project niet gevonden of geen toegang.</div>;
    }

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="project-detail-container">
            <header className="project-detail-header">
                <div>
                    <h1 className="page-title">{currentProject.title}</h1>
                    <p className="text-lg text-gray-600">
                        Klant: {currentProject.client.name} | {currentProject.client.email}
                    </p>
                </div>

                <div className="status-display">
                    <p className="text-sm text-gray-500">Huidige Status:</p>
                    <StatusBadge status={currentProject.status} />
                    {isAdmin && (
                        <Button className="mt-2" variant="secondary">
                            Status Wijzigen
                        </Button>
                    )}
                </div>
            </header>

            <div className="project-detail-grid">
                {/* LINKER KOLOM: Details */}
                <div className="detail-column-left">
                    <div className="card space-y-4">
                        <h2 className="card-title">Project Details</h2>
                        <p><strong>Beschrijving:</strong> {currentProject.description}</p>
                        <p><strong>Contactpersoon:</strong> {currentProject.contactPerson || 'Niet opgegeven'}</p>
                        <p><strong>Staging URL:</strong> <a href={currentProject.stagingUrl || 'geen link'} target="_blank" rel="noopener noreferrer">{currentProject.stagingUrl}</a></p>
                        <p><strong>Aangemaakt op:</strong> {new Date(currentProject.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="card mt-6">
                        <h2 className="card-title">Financiën & Documenten</h2>
                        {/* Hier kun je InvoiceSnapshot of FileList componenten toevoegen */}
                    </div>
                </div>

                {/* RECHTER KOLOM: Tijdlijn & Taken */}
                <div className="detail-column-right">
                    <div className="card">
                        <h2 className="card-title">Project Tijdlijn & Fasering</h2>
                        <p>{currentProject.timeline || 'Geen tijdlijn beschikbaar'}</p>
                        {/* ProjectTimeline component hier */}
                    </div>

                    <div className="card mt-6">
                        <h2 className="card-title">Taken & Acties</h2>
                        {/* TaskListComponent hier */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailPage;