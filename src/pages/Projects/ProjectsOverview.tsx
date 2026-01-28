// src/pages/Projects/ProjectsOverview.tsx

import React, { useEffect } from 'react';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import '../../styles/pages/ProjectsOverview.css';
import Button from '../../components/ui/Button';
import { ProjectStatus } from '../../types/project';

const ProjectsOverview: React.FC = () => {
    const { user } = useAuth();
    const { projects, fetchProjects, isLoadingProjects } = useProjects();

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    if (isLoadingProjects) {
        return (
            <div className="loading-container">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const isAdmin = user?.role === 'ADMIN';
    const title = isAdmin ? 'Alle Projecten Overzicht' : 'Mijn Projecten';

    // Bereken statistieken
    const stats = {
        total: projects.length,
        active: projects.filter(p =>
            p.status === 'DEVELOPMENT' as ProjectStatus ||
            p.status === 'IN_DESIGN' as ProjectStatus
        ).length,
        completed: projects.filter(p => p.status === 'LIVE' as ProjectStatus).length,
        waiting: projects.filter(p => p.status === 'WAITING_FOR_CONTENT' as ProjectStatus).length,
        concept: projects.filter(p => p.status === 'CONCEPT' as ProjectStatus).length
    };

    const getStatusColor = (status: ProjectStatus) => {
        const colors = {
            'CONCEPT': '#6366F1',
            'IN_DESIGN': '#EC4899',
            'WAITING_FOR_CONTENT': '#F59E0B',
            'DEVELOPMENT': '#3B82F6',
            'STAGING': '#8B5CF6',
            'LIVE': '#10B981'
        };
        return colors[status] || '#9CA3AF';
    };

    return (
        <div className="projects-overview-page">
            {/* Header */}
            <header className="overview-header">
                <div>
                    <h1 className="overview-title">{title}</h1>
                    <p className="overview-subtitle">
                        {isAdmin
                            ? 'Beheer en monitor alle actieve projecten'
                            : 'Bekijk de voortgang van je projecten'
                        }
                    </p>
                </div>

                {isAdmin && (
                    <Link to="/admin/create-project">
                        <Button variant="primary" >
                            <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nieuw Project
                        </Button>
                    </Link>
                )}
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-wrapper stat-total">
                        <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Totaal Projecten</p>
                        <p className="stat-value">{stats.total}</p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="stat-card">
                    <div className="stat-icon-wrapper stat-active">
                        <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">In Ontwikkeling</p>
                        <p className="stat-value">{stats.active}</p>
                    </div>
                </div>
                    )}

                <div className="stat-card">
                    <div className="stat-icon-wrapper stat-completed">
                        <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Live</p>
                        <p className="stat-value">{stats.completed}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper stat-waiting">
                        <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Wacht op Content</p>
                        <p className="stat-value">{stats.waiting}</p>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h2 className="empty-state-title">Geen projecten gevonden</h2>
                    <p className="empty-state-text">
                        {isAdmin
                            ? 'Klik op "Nieuw Project" om een project aan te maken'
                            : 'Er zijn momenteel geen actieve projecten gekoppeld aan dit account'
                        }
                    </p>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map((project) => {
                        const daysAgo = Math.floor(
                            (Date.now() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
                        );
                        const updateText = daysAgo === 0
                            ? 'Vandaag'
                            : daysAgo === 1
                                ? '1 dag geleden'
                                : `${daysAgo} dagen geleden`;

                        return (
                            <Link
                                key={project.id}
                                to={`/projects/${project.id}`}
                                className="project-card"
                            >
                                {/* Card Header met Status Indicator */}
                                <div className="project-card-header">
                                    <div
                                        className="status-indicator"
                                        style={{ background: getStatusColor(project.status) }}
                                    />
                                    <StatusBadge status={project.status} />
                                </div>

                                {/* Project Info */}
                                <div className="project-card-body">
                                    <h3 className="project-card-title">{project.title}</h3>

                                    {project.description && (
                                        <p className="project-card-description">
                                            {project.description.length > 100
                                                ? `${project.description.substring(0, 100)}...`
                                                : project.description
                                            }
                                        </p>
                                    )}

                                    <div className="project-card-meta">
                                        <div className="meta-item-card">
                                            <svg className="meta-icon-card" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>{project.client.name}</span>
                                        </div>

                                        {project.contactPerson && (
                                            <div className="meta-item-card">
                                                <svg className="meta-icon-card" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                                </svg>
                                                <span>{project.contactPerson}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="project-card-footer">
                                    <div className="footer-info">
                                        <svg className="footer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{updateText}</span>
                                    </div>

                                    <div className="view-button">
                                        Bekijk Details
                                        <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProjectsOverview;