import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers } from '../../contexts/userContext';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import '../../styles/pages/ProjectDetailPage.css';
import ProjectEditModal, {ProjectEditData} from './ProjectEditModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// NIEUW: Interface voor projectbestanden
interface ProjectFile {
    id: number;
    fileName: string;
    fileUrl: string; // Cloudinary URL
    uploadedBy: string; // Role of naam
    createdAt: string;
}

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    authorId: number;
    parentId?: number | null;
    author: {
        name: string;
        role: 'CLIENT' | 'ADMIN';
        email: string;
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

    const { user, token } = useAuth();
    const { currentProject, fetchProjectDetails, isLoadingProjects } = useProjects();
    const { users, fetchUsers } = useUsers();

    const navigate = useNavigate();

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [newFeatureTitle, setNewFeatureTitle] = useState('');
    const [newFeatureDescription, setNewFeatureDescription] = useState('');
    const [newFeaturePriority, setNewFeaturePriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // NIEUW: State voor projectbestanden
    const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);


    const isAdmin = user?.role === 'ADMIN';

    const getConfig = () => ({
        headers: { Authorization: `Bearer ${token}` },
    });

    // Functie om de voortgang te berekenen (opgelost: nu binnen de component)
    const getProgressPercentage = () => {
        if (features.length === 0) return 0;
        const completed = features.filter((f) => f.status === 'COMPLETED').length;
        return Math.round((completed / features.length) * 100);
    };

    // NIEUW: Functie om de bestanden op te halen
    const fetchProjectFiles = async () => {
        if (!projectId) return;
        try {
            // De URL gebruikt nu de '/list' suffix om de 404 in de nieuwe route te matchen.
            const { data } = await axios.get<ProjectFile[]>(`${API_URL}/files/projects/${projectId}`, getConfig());
            setProjectFiles(data);
        } catch (err) {
            console.error('Fout bij ophalen projectbestanden:', err);
            // Optionele fallback/gesimuleerde data bij fouten
            setProjectFiles([]);
        }
    };


    const fetchComments = async () => {
        if (!projectId) return;
        try {
            const { data } = await axios.get<Comment[]>(`${API_URL}/projects/${projectId}/comments`, getConfig());
            setComments(data);
        } catch (err) {
            console.error('Fout bij ophalen comments:', err);
        }
    };

    const fetchFeatures = async () => {
        if (!projectId) return;
        try {
            const { data } = await axios.get<{ features: Feature[] }>(`${API_URL}/projects/${projectId}`, getConfig());
            setFeatures(data.features || []);
        } catch (err) {
            console.error('Fout bij ophalen features:', err);
        }
    };

    useEffect(() => {
        if (!projectId) return;

        const load = async () => {
            await fetchProjectDetails(projectId);
            await fetchComments();
            await fetchFeatures();
            await fetchProjectFiles(); // <-- Bestanden ophalen
            if (isAdmin) await fetchUsers();
        };

        load();
    }, [projectId, fetchProjectDetails, fetchUsers, isAdmin]);

    const handleAddTopLevelComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !projectId) return;
        setIsSubmittingComment(true);
        try {
            await axios.post(
                `${API_URL}/projects/${projectId}/comments`,
                { content: newComment },
                getConfig()
            );
            setNewComment('');
            await fetchComments();
        } catch (err) {
            console.error('Fout bij top-level comment:', err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const deleteComment = async (commentId: number) => {
        if (!projectId) return;
        try {
            await axios.delete(`${API_URL}/projects/${projectId}/comments/${commentId}`, getConfig());
            await fetchComments();
        } catch (err) {
            console.error('Fout bij verwijderen comment:', err);
        } finally {
            setCommentToDelete(null);
        }
    };

    const handleAddFeature = async () => {
        if (!projectId || !newFeatureTitle.trim()) return;
        try {
            const { data } = await axios.post(
                `${API_URL}/projects/${projectId}/features`,
                { title: newFeatureTitle, description: newFeatureDescription, priority: newFeaturePriority },
                getConfig()
            );
            setFeatures((prev) => [...prev, data]);
            setNewFeatureTitle('');
            setNewFeatureDescription('');
        } catch (err) {
            console.error('Fout bij toevoegen feature:', err);
        }
    };

    const updateFeature = async (featureId: number, updates: Partial<Feature>) => {
        if (!projectId) return;
        try {
            const { data } = await axios.put(`${API_URL}/projects/${projectId}/features/${featureId}`, updates, getConfig());
            setFeatures((prev) => prev.map((f) => (f.id === featureId ? { ...f, ...data } : f)));
        } catch (err) {
            console.error('Fout bij updaten feature:', err);
        }
    };

    const deleteFeature = async (featureId: number) => {
        if (!projectId) return;
        try {
            await axios.delete(`${API_URL}/projects/${projectId}/features/${featureId}`, getConfig());
            setFeatures((prev) => prev.filter((f) => f.id !== featureId));
        } catch (err) {
            console.error('Fout bij verwijderen feature:', err);
        }
    };

    const handleDeleteProject = async () => {
        if (!projectId) return;
        try {
            await axios.delete(`${API_URL}/projects/${projectId}`, getConfig());
            navigate('/projects');
        } catch (err: any) {
            alert('Verwijderen mislukt: ' + (err.response?.data?.message || err.message));
        } finally {
            setProjectToDelete(null);
        }
    };

    const handleProjectUpdate = async (data: ProjectEditData) => {
        if (!projectId) return;

        try {
            await axios.put(`${API_URL}/projects/${projectId}`, data, getConfig());
            await fetchProjectDetails(projectId);
            setIsEditModalOpen(false);
        } catch (err: any) {
            console.error('Opslaan mislukt:', err);
            throw new Error(err.response?.data?.message || 'Fout bij updaten project');
        }
    };

    if (isLoadingProjects) {
        return (
            <div className="loading-container">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!currentProject) {
        return (
            <div className="error-container">
                <div className="error-card">
                    <h2>Project niet gevonden</h2>
                    <p>Dit project bestaat niet of je hebt geen toegang.</p>
                </div>
            </div>
        );
    }

    const progress = getProgressPercentage(); // Opgeroepen nadat de functie is gedefinieerd

    return (
        <div className="project-detail-page">
            <Button variant="secondary" onClick={() => navigate(-1)} className="back-button">
                ← Terug naar Projecten Overzicht
            </Button>

            <header className="project-header">
                <div className="project-header-content">
                    <div className="project-title-section">
                        <h1 className="project-title">{currentProject.title}</h1>
                        <StatusBadge status={currentProject.status} />
                        {isAdmin && (
                            <button className="project-edit-btn" onClick={() => setIsEditModalOpen(true)} title="Project bewerken">
                                ⚙️
                            </button>
                        )}
                    </div>

                    <div className="project-meta">
                        <div className="meta-item">
                            <span>{currentProject.client?.name}</span>
                        </div>
                        <div className="meta-item">
                            <span>{currentProject.client?.email}</span>
                        </div>
                        {currentProject.contactPerson && (
                            <div className="meta-item">
                                <span>Contact: {currentProject.contactPerson}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dit is het verplaatste element om rechts naast de content te staan */}
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
                    <section className="card features-card">
                        <h2 className="card-title">Features & Functionaliteiten</h2>
                        {isAdmin && (
                            <div className="add-feature-form">
                                <input
                                    type="text"
                                    placeholder="Titel"
                                    value={newFeatureTitle}
                                    onChange={(e) => setNewFeatureTitle(e.target.value)}
                                />
                                <textarea
                                    placeholder="Beschrijving"
                                    value={newFeatureDescription}
                                    onChange={(e) => setNewFeatureDescription(e.target.value)}
                                />
                                <select
                                    value={newFeaturePriority}
                                    onChange={(e) => setNewFeaturePriority(e.target.value as Feature['priority'])}
                                >
                                    <option value="LOW">Laag</option>
                                    <option value="MEDIUM">Normaal</option>
                                    <option value="HIGH">Hoog</option>
                                </select>
                                <Button onClick={handleAddFeature}>Feature toevoegen</Button>
                            </div>
                        )}

                        <div className="features-list">
                            {features.map((feature) => (
                                <div key={feature.id} className="feature-item">
                                    <div className="feature-header">
                                        <div className="feature-status">
                                            {feature.status === 'COMPLETED' && <span>✅</span>}
                                            {feature.status === 'IN_PROGRESS' && <span>🔄</span>}
                                            {feature.status === 'TODO' && <span>📝</span>}
                                        </div>
                                        <div className="feature-info">
                                            <h3 className="feature-title">{feature.title}</h3>
                                            <p className="feature-description">{feature.description}</p>
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <div className="feature-actions">
                                            <select
                                                value={feature.status}
                                                onChange={(e) => updateFeature(feature.id, { status: e.target.value as Feature['status'] })}
                                            >
                                                <option value="TODO">TODO</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="COMPLETED">Completed</option>
                                            </select>
                                            <select
                                                value={feature.priority}
                                                onChange={(e) => updateFeature(feature.id, { priority: e.target.value as Feature['priority'] })}
                                            >
                                                <option value="LOW">Laag</option>
                                                <option value="MEDIUM">Normaal</option>
                                                <option value="HIGH">Hoog</option>
                                            </select>
                                            <Button variant="danger" onClick={() => deleteFeature(feature.id)}>
                                                Verwijder
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* NIEUW: SECTIE VOOR GEDEELDE DOCUMENTEN */}
                    <section className="card files-card">
                        <h2 className="card-title">Gedeelde Documenten ({projectFiles.length})</h2>
                        <div className="files-list">
                            {projectFiles.length === 0 ? (
                                <p className="text-gray-500 text-sm p-2">Nog geen bestanden gedeeld voor dit project.</p>
                            ) : (
                                projectFiles.map((file) => (
                                    <div key={file.id} className="file-item">
                                        <div className="file-info">
                                            <span className="file-icon">📄</span>
                                            <p className="font-medium">{file.fileName}</p>
                                        </div>
                                        <div className="file-meta">
                                            <p className="text-sm text-gray-500">
                                                Door: {file.uploadedBy} op {new Date(file.createdAt).toLocaleDateString('nl-NL')}
                                            </p>
                                        </div>
                                        <a
                                            href={file.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="file-download-link"
                                        >
                                            Download
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link to="/files" className="text-yellow-600 hover:text-yellow-700 font-medium mt-4 block text-sm">
                            Naar Bestanden Upload Pagina →
                        </Link>
                    </section>


                    <section className="card details-card">
                        <h2 className="card-title">Project Informatie</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="detail-label">Beschrijving</span>
                                <p className="detail-value">{currentProject.description || 'Geen beschrijving beschikbaar'}</p>
                            </div>
                            {currentProject.stagingUrl && (
                                <div className="detail-item">
                                    <span className="detail-label">Preview URL</span>
                                    <a href={currentProject.stagingUrl} target="_blank" rel="noopener noreferrer" className="detail-link">
                                        {currentProject.stagingUrl}
                                    </a>
                                </div>
                            )}
                            <div className="detail-item">
                                <span className="detail-label">Start Datum</span>
                                <p className="detail-value">{new Date(currentProject.createdAt).toLocaleDateString('nl-NL')}</p>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Laatste Update</span>
                                <p className="detail-value">{new Date(currentProject.updatedAt).toLocaleDateString('nl-NL')}</p>
                            </div>
                            {isAdmin && (
                                <Button variant="danger" onClick={() => setProjectToDelete(currentProject.id)} className="deleteFinal-btn">
                                    Project Verwijderen
                                </Button>
                            )}
                        </div>
                    </section>
                </div>

                <div className="content-column-right">
                    {currentProject.timeline && (
                        <section className="card">
                            <h2 className="card-title">Project Planning</h2>
                            <div className="project-timeline-list">
                                {currentProject.timeline
                                    .split('\n')
                                    .filter((line) => line.trim())
                                    .map((phase, index) => (
                                        <div key={index} className="project-timeline-item">
                                            <div className="project-timeline-marker" />
                                            <div className="project-timeline-content">
                                                <p>{phase.trim()}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </section>
                    )}

                    <section className="card comments-card">
                        <h2 className="card-title">Communicatie ({comments.length})</h2>

                        <div className="comments-list">
                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className={`comment ${comment.author.role === 'ADMIN' ? 'comment-admin' : 'comment-client'}`}
                                >
                                    <div className="comment-header">
                                        <div className="comment-author">
                                            <span className="author-name">{comment.author.name}</span>
                                            <span className="comment-date">{new Date(comment.createdAt).toLocaleString('nl-NL')}</span>
                                        </div>
                                        <div className="comment-actions">
                                            {comment.author.role === 'ADMIN' && <span className="admin-badge">Zomer Dev</span>}
                                            {(comment.authorId === user?.id || isAdmin) && (
                                                <button
                                                    className="comment-delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCommentToDelete(comment.id);
                                                    }}
                                                >
                                                    Verwijder
                                                </button>
                                            )}

                                        </div>
                                    </div>
                                    <p className="comment-content">{comment.content}</p>


                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddTopLevelComment} className="comment-form">
              <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Stel een vraag of plaats een opmerking..."
                  rows={3}
                  required
              />
                            <Button type="submit" isLoading={isSubmittingComment} disabled={!newComment.trim()}>
                                Verstuur Bericht
                            </Button>
                        </form>
                    </section>
                </div>
            </div>

            <ConfirmDialog
                isOpen={commentToDelete !== null}
                title="Comment verwijderen?"
                message="Weet je zeker dat je deze comment wilt verwijderen?"
                confirmText="Verwijderen"
                cancelText="Annuleren"
                variant="danger"
                onConfirm={() => commentToDelete && deleteComment(commentToDelete)}
                onCancel={() => setCommentToDelete(null)}
            />

            <ConfirmDialog
                isOpen={projectToDelete !== null}
                title="Project verwijderen?"
                message="Deze actie kan niet ongedaan worden gemaakt."
                confirmText="Verwijderen"
                cancelText="Annuleren"
                variant="danger"
                onConfirm={handleDeleteProject}
                onCancel={() => setProjectToDelete(null)}
            />

            {currentProject && (
                <ProjectEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleProjectUpdate}
                    project={{
                        id: currentProject.id,
                        title: currentProject.title,
                        description: currentProject.description ?? '',
                        client: currentProject.client,
                        status: currentProject.status,
                        contactPerson: currentProject.contactPerson ?? '',
                        stagingUrl: currentProject.stagingUrl ?? '',
                        timeline: currentProject.timeline ?? '',
                    }}
                    clients={users.filter((u) => u.role === 'CLIENT')}
                />
            )}
        </div>
    );
};

export default ProjectDetailPage;