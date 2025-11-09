// src/pages/Projects/ProjectsOverview.tsx

import React, { useEffect } from 'react';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import '../../styles/pages/ProjectsOverview.css';
import Button from '../../components/ui/Button';

const ProjectsOverview: React.FC = () => {
    const { user } = useAuth();
    const { projects, fetchProjects, isLoadingProjects } = useProjects();

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    if (isLoadingProjects) {
        return <LoadingSpinner size="lg" />;
    }

    const title = user?.role === 'ADMIN' ? 'Alle Projecten Overzicht' : 'Mijn Projecten';

    return (
        <div className="projects-overview-container">
            <h1 className="page-title">{title}</h1>

            {user?.role === 'ADMIN' && (
                <div className="admin-actions mb-4">
                    <Link to="/admin/create-project">
                        <Button variant="primary">Nieuw Project +</Button>
                    </Link>
                </div>
            )}

            {projects.length === 0 ? (
                <div className="card empty-state-card">
                    <p className="text-lg">Er zijn momenteel geen actieve projecten gekoppeld aan dit account.</p>
                </div>
            ) : (
                <div className="projects-overview-table-wrapper">
                    <table className="projects-overview-table">
                        <thead>
                        <tr>
                            <th>Projectnaam</th>
                            <th>Status</th>
                            <th>Contactpersoon</th>
                            <th>Laatste Update</th>
                            <th className="text-right">Details</th>
                        </tr>
                        </thead>
                        <tbody>
                        {projects.map((project) => (
                            <tr key={project.id}>
                                <td>{project.title}</td>
                                <td><StatusBadge status={project.status} /></td>
                                <td>{project.contactPerson || '-'}</td>
                                <td>
                                    {new Date(project.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="text-right">
                                    <Link to={`/projects/${project.id}`} className="text-yellow-600 hover:text-yellow-900">
                                        Bekijk
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProjectsOverview;