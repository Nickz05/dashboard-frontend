// src/pages/Dashboard/DashboardPage.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import '../../styles/pages/DashboardPage.css';

// ============= TYPES =============
interface ProjectComment {
    id: string | number;
    content: string;
    userId?: string;
    userName?: string;
    author?: {
        name: string;
    };
    createdAt: string;
    parentId?: string | number | null;
}

interface Activity {
    id: string | number;
    type?: 'comment' | 'feature_update' | 'status_change' | 'milestone' | 'title_changed' | 'timeline_updated' | 'feature_added' | 'feature_updated' | 'feature_deleted' | 'status_changed';
    description?: string;
    content?: string;
    timestamp?: string;
    createdAt?: string;
    userName?: string;
    author?: {
        name: string;
    };
}
interface ProjectStats {
    totalFeatures: number;
    completedFeatures: number;
    inProgressFeatures: number;
    todoFeatures: number;
    recentComments: ProjectComment[];
    recentActivities: Activity[];
}

// ============= COMPONENT =============
const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const {
        projects,
        currentProject,
        fetchProjects,
        fetchCurrentProject,
        isLoadingProjects,
        error
    } = useProjects();

    const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    // NIEUW: State voor log export
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    // Fetch projects & current project
    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchProjects();
        } else {
            fetchCurrentProject();
        }
    }, [fetchProjects, fetchCurrentProject, user]);

    // Fetch project statistics and activities
    useEffect(() => {
        const fetchProjectStats = async () => {
            if (!currentProject?.id && user?.role !== 'ADMIN') return;

            setIsLoadingStats(true);
            try {
                const endpoint =
                    user?.role === 'ADMIN'
                        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/dashboard/admin-stats`
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/${currentProject?.id}/stats`;

                const response = await fetch(endpoint, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const data: ProjectStats = await response.json();
                    setProjectStats(data);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchProjectStats();
        const interval = setInterval(fetchProjectStats, 30000);
        return () => clearInterval(interval);
    }, [currentProject, user]);

    // NIEUW: Functie voor downloaden van logs
    const handleDownloadLog = async () => {
        if (isDownloading) return;

        if (!startDate || !endDate) {
            alert("Selecteer een start- en einddatum.");
            return;
        }

        setIsDownloading(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/admin/activity-log?startDate=${startDate}&endDate=${endDate}`;

            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Fout bij ophalen van de log data.');
            }

            const logData = await response.json();

            if (logData.length === 0) {
                alert("Geen activiteiten gevonden in de geselecteerde periode.");
                return;
            }

            // --- SVG/JSON/CSV Export Logica ---
            // Voor nu downloaden we de ruwe JSON data.
            // Opmerking: Om een daadwerkelijke SVG-visualisatie te genereren, is een externe library nodig.
            const jsonString = JSON.stringify(logData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `admin_activity_log_${startDate}_to_${endDate}.json`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
            // --- Einde Export Logica ---

        } catch (err) {
            console.error('Error fetching/downloading log:', err);
            alert(`Download mislukt: ${err instanceof Error ? err.message : 'Onbekende fout'}`);
        } finally {
            setIsDownloading(false);
        }
    };

    // Helpers
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return diffInMinutes < 1 ? 'Zojuist' : `${diffInMinutes} minuten geleden`;
        }
        if (diffInHours < 24) return `${diffInHours} uur geleden`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return 'Gisteren';
        if (diffInDays < 7) return `${diffInDays} dagen geleden`;
        return `${Math.floor(diffInDays / 7)} weken geleden`;
    };

    const getStatusColor = (status: string | undefined) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE':
            case 'ACTIEF':
                return 'status-active';
            case 'PAUSED':
            case 'GEPAUZEERD':
                return 'status-paused';
            case 'COMPLETED':
            case 'AFGEROND':
                return 'status-completed';
            case 'LIVE': // Voeg LIVE status toe voor Client Dashboard
                return 'status-active';
            default:
                return 'status-concept';
        }
    };

    const getStatusText = (status: string | undefined) => {
        switch (status?.toUpperCase()) {
            case 'CONCEPT':
                return 'In Concept';
            case 'IN_DESIGN':
                return 'In Design';
            case 'WAITING_FOR_CONTENT':
                return 'Wacht op Content';
            case 'DEVELOPMENT':
                return 'In Ontwikkeling';
            case 'STAGING':
                return 'Staging';
            case 'LIVE':
                return 'Live';
            default:
                return status || 'Onbekend';
        }
    };

    const calculateProgress = () => {
        if (!projectStats) return 0;
        const total = projectStats.totalFeatures;
        return total === 0 ? 0 : Math.round((projectStats.completedFeatures / total) * 100);
    };

    // Loading & Error
    if (isLoadingProjects) {
        return (
            <div className="dashboard-loading">
                <LoadingSpinner size="lg" />
                <p>Dashboard wordt geladen...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="error-card">
                    <span className="error-icon">⚠️</span>
                    <h2>Er ging iets mis</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-button">
                        Probeer opnieuw
                    </button>
                </div>
            </div>
        );
    }

    // ============= ADMIN DASHBOARD =============
    if (user?.role === 'ADMIN') {
        const openComments = (projectStats as any)?.openCommentsCount || 0;
        const activeProjects = projects?.filter(p => p.status !== 'CONCEPT').length || 0;
        const totalClients = new Set(projects?.map(p => typeof p.client === 'string' ? p.client : (p.client as any)?.name || 'Unknown')).size || 0;
        const totalFeatures = projects?.reduce((acc, p) => acc + ((p as any).features?.length || 0), 0) || 0;

        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Dashboard Overzicht</h1>
                        <p className="dashboard-subtitle">Welkom terug, {user?.name || 'Admin'}</p>
                    </div>
                    <Link to="/admin/create-project" className="create-button">
                        ➕ Nieuw Project
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue">📊</div>
                        <div className="stat-info">
                            <p className="stat-label">Actieve Projecten</p>
                            <h3 className="stat-value">{activeProjects}</h3>
                            <span className="stat-change">Momenteel actief</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon green">👥</div>
                        <div className="stat-info">
                            <p className="stat-label">Klanten</p>
                            <h3 className="stat-value">{totalClients}</h3>
                            <span className="stat-change">Unieke klanten</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon purple">💬</div>
                        <div className="stat-info">
                            <p className="stat-label">Open Reacties</p>
                            <h3 className="stat-value">{openComments}</h3>
                            <span className="stat-change">Wacht op antwoord</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon yellow">✨</div>
                        <div className="stat-info">
                            <p className="stat-label">Features</p>
                            <h3 className="stat-value">{totalFeatures}</h3>
                            <span className="stat-change">Totaal in alle projecten</span>
                        </div>
                    </div>
                </div>

                {/* Projects & Activity */}
                <div className="dashboard-sections">
                    <div className="section-card">
                        <h2 className="section-title">📋 Recente Projecten</h2>
                        <div>
                            {projects && projects.length > 0 ? (
                                projects.slice(0, 5).map(project => (
                                    <Link
                                        key={project.id}
                                        to={`/admin/projects/${project.id}`}
                                        className="project-list-item"
                                    >
                                        <div>
                                            <div className="project-name">{project.title}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                                                {typeof project.client === 'string' ? project.client : (project.client as any)?.name || 'Geen client'}
                                            </div>
                                        </div>
                                        <span className={`project-status ${getStatusColor(project.status)}`}>
                                            {getStatusText(project.status)}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '2rem' }}>
                                    Geen projecten gevonden
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="section-card">
                        <h2 className="section-title">🕐 Recente Activiteit</h2>
                        <div>
                            {!isLoadingStats && projectStats?.recentActivities && projectStats.recentActivities.length > 0 ? (
                                projectStats.recentActivities.slice(0, 5).map(activity => {
                                    const getActivityIcon = (type?: string) => {
                                        switch(type) {
                                            case 'comment': return '💬';
                                            case 'feature_update': case 'feature_added': case 'feature_updated': return '✨';
                                            case 'status_change': case 'status_changed': return '🔄';
                                            case 'title_changed': return '📝';
                                            case 'timeline_updated': return '📅';
                                            case 'feature_deleted': return '🗑️';
                                            default: return '📌';
                                        }
                                    };

                                    const description = activity.description ||
                                        (activity.content ? `${activity.author?.name || activity.userName || 'Gebruiker'} plaatste een opmerking: "${activity.content.substring(0, 50)}${activity.content.length > 50 ? '...' : ''}"` : '');

                                    return (
                                        <div key={activity.id} className="activity-timeline-item">
                                            <div className="activity-timeline-marker">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="activity-timeline-content">
                                                <p className="activity-timeline-description">{description}</p>
                                                <span className="activity-timeline-time">
                                                    {formatTimeAgo(activity.createdAt || activity.timestamp || '')}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '2rem' }}>
                                    Geen recente activiteit
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-bar">
                    <h3>Snelle Acties</h3>
                    <div className="action-buttons">
                        <Link to="/admin/create-project" className="action-btn primary">
                            ➕ Nieuw Project
                        </Link>
                        <Link to="/admin/users" className="action-btn">
                            👤 Gebruikers
                        </Link>
                        <Link to="/projects" className="action-btn">
                            📋 Alle Projecten
                        </Link>
                        <Link to="/files" className="action-btn">
                            📁 Bestanden
                        </Link>
                    </div>
                </div>

                {/* ============= SVG Log Export Sectie (NIEUW) ============= */}
                <div className="quick-actions-bar" style={{ marginTop: '2.5rem' }}>
                    <h3>📊 Log Export & Audit</h3>
                    <p style={{ color: 'var(--gray-600)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        Download alle administratieve activiteiten (incl. Titel, Features, Status) tussen de gekozen datums als ruwe JSON data.
                    </p>
                    <div className="action-buttons" style={{ gap: '0.5rem' }}>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ padding: '0.9rem', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-sm)' }}
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ padding: '0.9rem', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-sm)' }}
                        />
                        <button
                            className="action-btn primary"
                            onClick={handleDownloadLog}
                            disabled={isDownloading || !startDate || !endDate}
                        >
                            {isDownloading ? 'Bezig met downloaden...' : '⬇️ Download Log (JSON)'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============= CLIENT DASHBOARD =============
    const project = currentProject;

    if (!project) {
        return (
            <div className="dashboard-container">
                <div className="welcome-card">
                    <h1 className="dashboard-title">Welkom, {user?.name || 'Klant'}</h1>
                    <p className="welcome-message">Er is momenteel geen actief project gekoppeld aan uw account.</p>
                    <p className="welcome-submessage">Neem contact op met Zomer Development voor meer informatie.</p>
                    <a href="mailto:info@zomerdevelopment.nl" className="contact-button">
                        📧 Contact Opnemen
                    </a>
                </div>
            </div>
        );
    }

    const progressPercentage = (project as any).progress || calculateProgress();

    return (
        <div className="dashboard-container">
            {/* Hero Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Welkom terug, {user?.name}! 👋</h1>
                    <p className="dashboard-subtitle">Hier is het laatste nieuws over {project.title}</p>
                </div>
                <div className={`status-badge ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                </div>
            </div>

            {/* Main Project Card */}
            <div className="main-project-card">
                <div className="project-header">
                    <h2 className="project-title">{project.title}</h2>
                    <Link to={`/projects/${project.id}`} className="view-details-link">
                        Bekijk Details →
                    </Link>
                </div>

                <div className="progress-section1">
                    <div className="progress-header1">
                        <span className="progress-label1">Project Voortgang</span>
                        <span className="progress-percentage">{progressPercentage}%</span>
                    </div>
                    <div className="progress-bar1">
                        <div className="progress-fill" style={{ width: `${progressPercentage}%` }}>
                            {progressPercentage > 5 && <span className="progress-indicator"></span>}
                        </div>
                    </div>

                    {!isLoadingStats && projectStats && (
                        <div className="feature-stats">
                            <span className="stat-item">
                                <span className="stat-icon">✅</span>
                                {projectStats.completedFeatures} Afgerond
                            </span>
                            <span className="stat-item">
                                <span className="stat-icon">🔄</span>
                                {projectStats.inProgressFeatures} In Progress
                            </span>
                            <span className="stat-item">
                                <span className="stat-icon">📝</span>
                                {projectStats.todoFeatures} Te Doen
                            </span>
                        </div>
                    )}
                </div>

                <div className="project-info-grid">
                    <div className="info-item">
                        <span className="info-label">Contactpersoon</span>
                        <span className="info-value">{project.contactPerson || 'Nick Zomer'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Start Datum</span>
                        <span className="info-value">
                            {project.createdAt ? new Date(project.createdAt).toLocaleDateString('nl-NL') : 'Niet bekend'}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Laatste Update</span>
                        <span className="info-value">
                            {project.updatedAt ? formatTimeAgo(project.updatedAt) : 'Niet bekend'}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Status</span>
                        <span className="info-value">{getStatusText(project.status)}</span>
                    </div>
                </div>
            </div>

            {/* Activities Feed - NU PROMINENTER GEPLAATST */}
            {!isLoadingStats && projectStats?.recentActivities && projectStats.recentActivities.length > 0 && (
                <div className="activities-section" style={{ marginBottom: '2.5rem' }}>
                    <h2 className="section-title">🕐 Project Activiteit</h2>
                    <div className="activities-timeline">
                        {projectStats.recentActivities.map(activity => {
                            const getActivityIcon = (type?: string) => {
                                switch(type) {
                                    case 'comment': return '💬';
                                    case 'feature_update': case 'feature_added': case 'feature_updated': return '✨';
                                    case 'status_change': case 'status_changed': return '🔄';
                                    case 'title_changed': return '📝';
                                    case 'timeline_updated': return '📅';
                                    case 'feature_deleted': return '🗑️';
                                    default: return '📌';
                                }
                            };

                            const description = activity.description ||
                                (activity.content ? `${activity.author?.name || activity.userName || 'Gebruiker'} plaatste een opmerking: "${activity.content.substring(0, 50)}${activity.content.length > 50 ? '...' : ''}"` : '');

                            return (
                                <div key={activity.id} className="activity-timeline-item">
                                    <div className="activity-timeline-marker">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="activity-timeline-content">
                                        <p className="activity-timeline-description">{description}</p>
                                        <span className="activity-timeline-time">
                                            {formatTimeAgo(activity.createdAt || activity.timestamp || '')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent Comments - Nu op de tweede plaats */}
            {!isLoadingStats && projectStats?.recentComments &&
                projectStats.recentComments.filter(c => c.parentId === null || c.parentId === undefined).length > 0 && (
                    <div className="activities-section" style={{ marginBottom: '2.5rem' }}>
                        <h2 className="section-title">💬 Recente Opmerkingen</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {projectStats.recentComments
                                .filter(c => c.parentId === null || c.parentId === undefined)
                                .slice(0, 3)
                                .map(comment => (
                                    <div key={comment.id} className="comment-card">
                                        <div className="comment-header">
                                            <span className="comment-author">{comment.author?.name || comment.userName || 'Anoniem'}</span>
                                            <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                                        </div>
                                        <p className="comment-content">{comment.content}</p>
                                        <Link to={`/projects/${project.id}`} className="comment-link">
                                            Bekijk & Reageer →
                                        </Link>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

            {/* Action Cards - Nu op de laatste plaats */}
            <div className="action-cards-grid">
                <Link to={`/projects/${project.id}`} className="action-card">
                    <div className="action-card-icon">📋</div>
                    <h3>Project Details</h3>
                    <p>Bekijk alle features, tijdlijn en plaats opmerkingen</p>
                </Link>

                {project.stagingUrl && (
                    <a
                        href={project.stagingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-card"
                    >
                        <div className="action-card-icon">🚀</div>
                        <h3>Test Omgeving</h3>
                        <p>Bekijk de laatste versie van uw project live</p>
                    </a>
                )}

                <Link to="/files" className="action-card">
                    <div className="action-card-icon">📁</div>
                    <h3>Bestanden</h3>
                    <p>Upload en beheer project documenten en assets</p>
                </Link>

                <div className="action-card support">
                    <div className="action-card-icon">💬</div>
                    <h3>Hulp Nodig?</h3>
                    <p>Direct contact met {project.contactPerson || 'ons team'}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;