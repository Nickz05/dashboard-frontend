import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/FileManagementPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FileData {
    id: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedBy: string;
    createdAt: string;
    uploader?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

interface ProjectFile {
    id: number;
    title: string;
    description?: string;
}

const FileManagementPage: React.FC = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [files, setFiles] = useState<FileData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [projects, setProjects] = useState<ProjectFile[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const { token } = useAuth();

    // Haal alle projecten op bij mount
    useEffect(() => {
        void fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Haal bestanden op als project geselecteerd wordt
    useEffect(() => {
        if (selectedProjectId) {
            void fetchFiles();
        } else {
            setFiles([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProjectId]);

    const fetchProjects = async () => {
        if (!token) {
            console.log('Geen token, kan projecten niet ophalen');
            setIsLoadingProjects(false);
            return;
        }

        try {
            console.log('📋 Projecten ophalen...');
            const response = await axios.get(
                `${API_URL}/projects`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log('✅ Projecten opgehaald:', response.data.length, 'projecten');
            setProjects(response.data);

            // Auto-select eerste project als er maar 1 is
            if (response.data.length === 1) {
                setSelectedProjectId(response.data[0].id);
            }
        } catch (error: any) {
            console.error('❌ Fout bij ophalen projecten:', error);
            setProjects([]);
        } finally {
            setIsLoadingProjects(false);
        }
    };

    const fetchFiles = async () => {
        if (!token || !selectedProjectId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            console.log('📥 Bestanden ophalen voor project:', selectedProjectId);
            const response = await axios.get(
                `${API_URL}/files/projects/${selectedProjectId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log('✅ Bestanden opgehaald:', response.data.length, 'bestanden');
            setFiles(response.data);
        } catch (error: any) {
            console.error('❌ Fout bij ophalen bestanden:', error);
            setFiles([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) {
            alert("Selecteer eerst een bestand.");
            return;
        }

        if (!token) {
            alert("Je moet ingelogd zijn om bestanden te uploaden.");
            return;
        }

        if (!selectedProjectId) {
            alert("Selecteer eerst een project!");
            return;
        }

        const file = fileList[0];

        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            alert(`Bestand is te groot (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum is 50MB.`);
            return;
        }

        console.log('📤 Start upload naar project', selectedProjectId, ':', file.name);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', selectedProjectId.toString());

        setIsUploading(true);

        try {
            await axios.post(
                `${API_URL}/files/projects/${selectedProjectId}/upload`,
                formData,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            console.log('✅ Upload succesvol naar project', selectedProjectId);
            alert(`Bestand ${file.name} is geüpload naar project!`);
            await fetchFiles();

        } catch (error: any) {
            console.error('❌ Upload fout:', error);

            let errorMessage = 'Er ging iets mis bij het uploaden.';
            if (error.response) {
                errorMessage = error.response.data?.message || `Error ${error.response.status}`;
            }
            alert(`Upload mislukt: ${errorMessage}`);
        } finally {
            setIsUploading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('nl-NL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getFileTypeLabel = (fileType: string | undefined, fileName: string) => {
        if (!fileType) {
            if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return 'Afbeelding';
            if (fileName.match(/\.pdf$/i)) return 'PDF';
            if (fileName.match(/\.(doc|docx)$/i)) return 'Document';
            if (fileName.match(/\.(xls|xlsx)$/i)) return 'Spreadsheet';
            return 'Bestand';
        }

        if (fileType.includes('image')) return 'Afbeelding';
        if (fileType.includes('pdf')) return 'PDF';
        if (fileType.includes('document') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) return 'Document';
        if (fileType.includes('spreadsheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return 'Spreadsheet';
        return 'Bestand';
    };

    const getSelectedProject = () => {
        return projects.find(p => p.id === selectedProjectId);
    };

    return (
        <div className="file-management-container">
            {/* Page Header - Altijd zichtbaar */}
            <div className="page-header">
                <h1 className="main-page-title">📂 Bestanden & Content Beheer</h1>
            </div>

            {/* Project Selector */}
            <div className="project-selector-card">
                <h2 className="selector-title">Kies een Project</h2>

                {isLoadingProjects ? (
                    <p className="loading-text">Projecten laden...</p>
                ) : projects.length === 0 ? (
                    <p className="no-projects-text">Geen projecten beschikbaar</p>
                ) : (
                    <div className="selector-content">
                        <select
                            value={selectedProjectId || ''}
                            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                            className="project-select"
                        >
                            <option value="">-- Selecteer een project --</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.title}
                                </option>
                            ))}
                        </select>

                        {selectedProjectId && getSelectedProject() && (
                            <div className="selected-project-info">
                                <span className="info-icon">📁</span>
                                <div>
                                    <p className="project-info-name">{getSelectedProject()?.title}</p>
                                    {getSelectedProject()?.description && (
                                        <p className="project-info-desc">{getSelectedProject()?.description}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Upload Zone - alleen tonen als project geselecteerd */}
            {selectedProjectId ? (
                <>
                    {/* Project Header */}
                    <div className="current-project-header">
                        <div>
                            <h2 className="current-project-title">
                                📁 {getSelectedProject()?.title}
                            </h2>
                            {getSelectedProject()?.description && (
                                <p className="current-project-desc">
                                    {getSelectedProject()?.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div
                        className={`dropzone ${isUploading ? 'is-uploading' : ''}`}
                        onDrop={(e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => document.getElementById('fileInput')?.click()}
                    >
                        {isUploading ? (
                            <p>Bezig met uploaden naar {getSelectedProject()?.title}...</p>
                        ) : (
                            <>
                                <p className="font-semibold text-lg">Sleep bestanden hierheen of klik om te uploaden.</p>
                                <p className="text-sm text-gray-500">Max. 50MB per bestand (Logo's, teksten, afbeeldingen)</p>
                            </>
                        )}
                        <input
                            type="file"
                            id="fileInput"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload(e.target.files)}
                        />
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold outside-color">
                            Geleverde Bestanden ({files.length})
                        </h2>
                        <button
                            onClick={fetchFiles}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Laden...' : '🔄 Ververs'}
                        </button>
                    </div>

                    {isLoading && (
                        <div className="text-center py-8">
                            <p>Bestanden laden...</p>
                        </div>
                    )}

                    {!isLoading && files.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500 mb-2">Nog geen bestanden geüpload voor dit project</p>
                            <p className="text-sm text-gray-400">Upload je eerste bestand hierboven</p>
                        </div>
                    )}

                    {!isLoading && files.length > 0 && (
                        <div className="file-grid">
                            {files.map(file => (
                                <div key={file.id} className="file-card">
                                    <div>
                                        <p className="font-medium">{file.fileName}</p>
                                        <p className="text-sm text-gray-500">
                                            {getFileTypeLabel(file.fileType, file.fileName)}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {file.uploader ? (
                                                <>Door: {file.uploader.name} ({file.uploader.role})</>
                                            ) : (
                                                <>Door: {file.uploadedBy}</>
                                            )}
                                            {' op '}
                                            {formatDate(file.createdAt)}
                                        </p>
                                    </div>
                                    <a
                                        href={file.fileUrl}
                                        download={file.fileName}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Download
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="no-selection-message">
                    <p className="message-text">Selecteer eerst een project om bestanden te beheren</p>
                </div>
            )}
        </div>
    );
};

export default FileManagementPage;