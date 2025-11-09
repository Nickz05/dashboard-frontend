// src/pages/Dashboard/DashboardPage.tsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import '../../styles/pages/DashboardPage.css';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    const {
        currentProject: project,
        fetchCurrentProject,
        isLoadingProjects,
        error
    } = useProjects();

    useEffect(() => {
        fetchCurrentProject();
    }, [fetchCurrentProject]);

    if (isLoadingProjects) {
        return (
            <div className="dashboard-container">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) return <div className="dashboard-container text-red-500">Fout: {error}</div>;

    if (!project) return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Welkom, {user?.name || 'Klant'}</h1>
            <p>Er is momenteel geen actief project gekoppeld aan dit account.</p>
        </div>
    );

    const progressStyle = { width: `${project.progress}%` };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">
                👋 Welkom, {user?.name || 'Klant'}
            </h1>
            <p className="dashboard-subtitle">
                Inzage in project: **{project.title}**
            </p>

            <div className="dashboard-grid">
                <div className="card status-card">
                    <h2 className="card-title">🚀 Huidige Status & Voortgang</h2>

                    <p className="card-content-status">
                        Status: <span className="card-status-value">{project.status}</span>
                    </p>

                    <div className="progress-bar-group">
                        <label className="progress-label">
                            Voortgang: {project.progress}%
                        </label>
                        <div className="progress-bar-base">
                            <div
                                className="progress-bar-fill"
                                style={progressStyle}
                            ></div>
                        </div>
                    </div>

                    <p className="milestone-text">
                        Volgende Mijlpaal: **{project.nextMilestone || 'Nog niet vastgesteld'}**
                    </p>

                    <Link
                        to={`/projects/${project.id}`}
                        className="link-button"
                    >
                        Bekijk Details & Feedback →
                    </Link>
                </div>

                <div className="card">
                    <h2 className="card-title">💬 Contact & Hulp</h2>
                    <p className="mb-4">
                        Uw contactpersoon bij Zomer Dev: **{project.contactPerson || 'Nog niet toegewezen'}**
                    </p>
                    <div className="quick-links">
                        <Link to="/projects" >
                            Mijn Projecten Overzicht
                        </Link>

                        {project.stagingUrl && (
                            <a
                                href={project.stagingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                🔗 Ga naar Testomgeving
                            </a>
                        )}

                        <Link to="/files">
                            📂 Bestanden Uploaden
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;