import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // 'Link' verwijderd om TS6133 op te lossen
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ProjectEditModal, { ProjectEditData } from './ProjectEditModal';
import '../../styles/pages/ProjectDetailPage.css';
import {useUsers} from "../../contexts/userContext.tsx";

// --- Types ---
interface ProjectFile {
    id: number;
    fileName: string;
    fileUrl: string;
    uploadedBy: string;
    createdAt: string;
}

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    authorId: number;
    author: {
        name: string;
        role: 'CLIENT' | 'ADMIN';
    };
}

interface Feature {
    id: number;
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

const ProjectDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const projectId = id ? parseInt(id) : null;
    const navigate = useNavigate();

    const { user } = useAuth();
    const { currentProject, fetchProjectDetails, isLoadingProjects } = useProjects();
    const { users, fetchUsers } = useUsers();

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const [features, setFeatures] = useState<Feature[]>([]);
    const [newFeatureTitle, setNewFeatureTitle] = useState('');
    const [newFeatureDescription, setNewFeatureDescription] = useState('');
    const [newFeaturePriority, setNewFeaturePriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

    const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const isAdmin = user?.role === 'ADMIN';

    // --- Data Fetching ---
    const fetchComments = async () => {
        if (!projectId) return;
        try {
            const { data } = await api.get<Comment[]>(`/projects/${projectId}/comments`);
            setComments(data);
        } catch (err) { console.error(err); }
    };

    const fetchFeatures = async () => {
        if (!projectId) return;
        try {
            const { data } = await api.get<{ features: Feature[] }>(`/projects/${projectId}`);
            setFeatures(data.features || []);
        } catch (err) { console.error(err); }
    };

    const fetchProjectFiles = async () => {
        if (!projectId) return;
        try {
            const { data } = await api.get<ProjectFile[]>(`/files/projects/${projectId}`);
            setProjectFiles(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (!projectId) return;
        const load = async () => {
            await fetchProjectDetails(projectId);
            fetchComments();
            fetchFeatures();
            fetchProjectFiles();
            if (isAdmin) fetchUsers();
        };
        load();
    }, [projectId, isAdmin, fetchProjectDetails, fetchUsers]);

    // --- Handlers ---
    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !projectId) return;
        setIsSubmittingComment(true);
        try {
            await api.post(`/projects/${projectId}/comments`, { content: newComment });
            setNewComment('');
            fetchComments();
        } catch (err) { console.error(err); } finally { setIsSubmittingComment(false); }
    };

    const deleteComment = async (commentId: number) => {
        try {
            await api.delete(`/projects/${projectId}/comments/${commentId}`);
            fetchComments();
        } catch (err) { console.error(err); } finally { setCommentToDelete(null); }
    };

    const handleAddFeature = async () => {
        if (!projectId || !newFeatureTitle.trim()) return;
        try {
            const { data } = await api.post(`/projects/${projectId}/features`, {
                title: newFeatureTitle, description: newFeatureDescription, priority: newFeaturePriority
            });
            setFeatures(prev => [...prev, data]);
            setNewFeatureTitle(''); setNewFeatureDescription('');
        } catch (err) { console.error(err); }
    };

    const updateFeature = async (fId: number, updates: Partial<Feature>) => {
        try {
            const { data } = await api.put(`/projects/${projectId}/features/${fId}`, updates);
            setFeatures(prev => prev.map(f => f.id === fId ? { ...f, ...data } : f));
        } catch (err) { console.error(err); }
    };

    const deleteFeature = async (fId: number) => {
        try {
            await api.delete(`/projects/${projectId}/features/${fId}`);
            setFeatures(prev => prev.filter(f => f.id !== fId));
        } catch (err) { console.error(err); }
    };

    const handleDeleteProject = async () => {
        if (!projectId) return;
        try {
            await api.delete(`/projects/${projectId}`);
            navigate('/projects');
        } catch (err: any) { alert(err.message); }
    };

    const handleProjectUpdate = async (data: ProjectEditData) => {
        if (!projectId) return;
        try {
            await api.put(`/projects/${projectId}`, data);
            await fetchProjectDetails(projectId);
            setIsEditModalOpen(false);
        } catch (err: any) { console.error(err); }
    };

    if (isLoadingProjects) return <div className="loading-container"><LoadingSpinner size="lg" /></div>;
    if (!currentProject) return <div className="error-container"><h2>Project niet gevonden</h2></div>;

    const completed = features.filter(f => f.status === 'COMPLETED').length;
    const progress = features.length > 0 ? Math.round((completed / features.length) * 100) : 0;

    return (
        <div className="project-detail-page">
            <div className="back-button">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    ← Terug naar Projecten
                </Button>
            </div>

            <header className="project-header">
                <div className="project-header-content">
                    <div className="project-title-section">
                        <h1 className="project-title">{currentProject.title}</h1>
                        <StatusBadge status={currentProject.status} />
                        {isAdmin && (
                            <button className="project-edit-btn" onClick={() => setIsEditModalOpen(true)}>⚙️</button>
                        )}
                    </div>
                    <div className="project-meta">
                        <div className="meta-item"><span>{currentProject.client?.name || 'Geen klant'}</span></div>
                        <div className="meta-item"><span>{currentProject.contactPerson || 'Geen contactpersoon'}</span></div>
                    </div>
                </div>

                <div className="progress-section">
                    <div className="progress-header">
                        <span className="progress-label">Project Voortgang</span>
                        <span className="progress-percentage">{progress}%</span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </header>

            <div className="project-content-grid">
                <div className="content-column-left">
                    <section className="card">
                        <h2 className="card-title">Features & Functionaliteiten</h2>
                        {isAdmin && (
                            <div className="add-feature-form">
                                <input className="input" type="text" placeholder="Titel" value={newFeatureTitle} onChange={e => setNewFeatureTitle(e.target.value)} />
                                <textarea className="textarea" placeholder="Beschrijving" value={newFeatureDescription} onChange={e => setNewFeatureDescription(e.target.value)} />
                                <select className="select" value={newFeaturePriority} onChange={e => setNewFeaturePriority(e.target.value as any)}>
                                    <option value="LOW">Laag</option>
                                    <option value="MEDIUM">Normaal</option>
                                    <option value="HIGH">Hoog</option>
                                </select>
                                <Button variant="primary" onClick={handleAddFeature}>Feature toevoegen</Button>
                            </div>
                        )}
                        <div className="features-list">
                            {features.map(f => (
                                <div key={f.id} className="feature-item">
                                    <div className="feature-header">
                                        <div className={`status-icon ${f.status.toLowerCase().replace('_', '-')}`}>
                                            {f.status === 'COMPLETED' ? '✅' : f.status === 'IN_PROGRESS' ? '🔄' : '📝'}
                                        </div>
                                        <div className="feature-info">
                                            <h3 className="feature-title">{f.title}</h3>
                                            <p className="feature-description">{f.description}</p>
                                        </div>
                                        <span className={`priority-badge priority-${f.priority.toLowerCase()}`}>{f.priority}</span>
                                    </div>
                                    {isAdmin && (
                                        <div className="feature-actions">
                                            <select className="select small" value={f.status} onChange={e => updateFeature(f.id, { status: e.target.value as any })}>
                                                <option value="TODO">TODO</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="COMPLETED">Completed</option>
                                            </select>
                                            <Button variant="danger" onClick={() => deleteFeature(f.id)}>Verwijder</Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="card files-card">
                        <h2 className="card-title">Gedeelde Documenten ({projectFiles.length})</h2>
                        <div className="files-list">
                            {projectFiles.map(file => (
                                <div key={file.id} className="file-item">
                                    <div className="file-info">
                                        <span className="file-icon">📄</span>
                                        <div>
                                            <p className="font-medium">{file.fileName}</p>
                                            <p className="text-sm text-gray-500">{new Date(file.createdAt).toLocaleDateString('nl-NL')}</p>
                                        </div>
                                    </div>
                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="file-download-link">Download</a>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="content-column-right">
                    <section className="card">
                        <h2 className="card-title">Communicatie ({comments.length})</h2>
                        <div className="comments-list">
                            {comments.map(c => (
                                <div key={c.id} className={`comment ${c.author.role === 'ADMIN' ? 'comment-admin' : 'comment-client'}`}>
                                    <div className="comment-header">
                                        <div className="comment-author">
                                            <span className="author-name">{c.author.name}</span>
                                            <span className="comment-date">{new Date(c.createdAt).toLocaleString('nl-NL')}</span>
                                        </div>
                                        {isAdmin && (
                                            <button className="comment-delete-btn" onClick={() => setCommentToDelete(c.id)}>Verwijder</button>
                                        )}
                                    </div>
                                    <p className="comment-content">{c.content}</p>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleAddComment} className="comment-form">
                            <textarea className="comment-input" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Stel een vraag..." rows={3} required />
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="primary" type="submit" isLoading={isSubmittingComment} disabled={!newComment.trim()}>
                                    Verstuur Bericht
                                </Button>
                            </div>
                        </form>
                    </section>

                    {isAdmin && (
                        <div style={{ marginTop: '2rem' }}>
                            <Button variant="danger" onClick={() => setProjectToDelete(currentProject.id)} className="deleteFinal-btn" style={{ width: '100%' }}>
                                Project Verwijderen
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Oplossing voor TS2741: 'message' prop toegevoegd aan ConfirmDialog */}
            <ConfirmDialog
                isOpen={commentToDelete !== null}
                title="Comment verwijderen?"
                message="Weet je zeker dat je deze reactie wilt verwijderen?"
                onConfirm={() => commentToDelete && deleteComment(commentToDelete)}
                onCancel={() => setCommentToDelete(null)}
                variant="danger"
            />

            <ConfirmDialog
                isOpen={projectToDelete !== null}
                title="Project verwijderen?"
                message="Weet je zeker dat je dit hele project wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
                onConfirm={handleDeleteProject}
                onCancel={() => setProjectToDelete(null)}
                variant="danger"
            />

            {isEditModalOpen && (
                <ProjectEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleProjectUpdate}
                    project={{
                        ...currentProject,
                        description: currentProject.description || '',
                        timeline: currentProject.timeline || '',
                        contactPerson: currentProject.contactPerson || '',
                        stagingUrl: currentProject.stagingUrl || ''
                    }}
                    clients={users.filter(u => u.role === 'CLIENT')}
                />
            )}
        </div>
    );
};

export default ProjectDetailPage;