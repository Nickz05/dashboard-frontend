// src/components/modals/ProjectEditModal.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../../types/user';
import '../../styles/pages/ProjectEditModal.css';
import Button from '../../components/ui/Button';
import {Client, ProjectStatus} from '../../types/project';

interface ProjectEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ProjectEditData) => Promise<void>;
    project: {
        status: ProjectStatus;
        id: number;
        title: string;
        description: string | null;
        client: Client;
        contactPerson: string | null;
        stagingUrl: string | null;
        timeline: string | null;
    };
    clients: User[];
}

export interface ProjectEditData {
    title: string;
    description: string;
    clientId: number;
    contactPerson: string;
    stagingUrl: string;
    timeline: string;
    status: ProjectStatus;

}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onSave,
                                                               project,
                                                               clients,
                                                           }) => {
    // Zorg dat de huidige klant in de lijst zit
    const clientsWithCurrent = useMemo(() => {
        const exists = clients.some((c) => c.id === project.client.id);
        if (exists) return clients;
        return [project.client, ...clients];
    }, [clients, project.client]);

    const [formData, setFormData] = useState<ProjectEditData>({
        title: project.title,
        description: project.description || '',
        clientId: project.client.id,
        contactPerson: project.contactPerson || '',
        stagingUrl: project.stagingUrl || '',
        timeline: project.timeline || '',
        status: project.status,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form bij openen
    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: project.title,
                description: project.description || '',
                clientId: project.client.id,
                contactPerson: project.contactPerson || '',
                stagingUrl: project.stagingUrl || '',
                timeline: project.timeline || '',
                status: project.status,
            });
            setError(null);
        }
    }, [
        isOpen,
        project.title,
        project.description,
        project.client.id,
        project.contactPerson,
        project.stagingUrl,
        project.timeline,
        project.status,
    ]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        let newValue: string | number = value;
        if (name === 'clientId') {
            newValue = value ? parseInt(value, 10) : 0;
        }

        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.title.trim()) {
            setError('Project titel is verplicht');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Er ging iets mis bij het opslaan');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="project-edit-overlay" onClick={onClose}>
            <div className="project-edit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="project-edit-header">
                    <h2 className="project-edit-title">Project Bewerken</h2>
                    <button className="project-edit-close" onClick={onClose}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="project-edit-form">
                    {error && <div className="project-edit-error">{error}</div>}

                    <div className="form-section">
                        <h3 className="section-title">Basisgegevens</h3>

                        <div className="form-group">
                            <label className="form-label">
                                Project Titel <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Klant <span className="required">*</span>
                            </label>
                            <select
                                name="clientId"
                                className="form-select"
                                value={String(formData.clientId)}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Selecteer een klant</option>
                                {clientsWithCurrent.map((client) => (
                                    <option key={client.id} value={client.id}>   {/* ← voeg deze key toe */}
                                        {client.name} ({client.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contactpersoon Zomer Dev</label>
                            <input
                                type="text"
                                name="contactPerson"
                                className="form-input"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                placeholder="Nick Zomer"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Details</h3>

                        <div className="form-group">
                            <label className="form-label">Beschrijving</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Korte beschrijving van het project..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Staging URL</label>
                            <input
                                type="url"
                                name="stagingUrl"
                                className="form-input"
                                value={formData.stagingUrl}
                                onChange={handleChange}
                                placeholder="https://staging.voorbeeld.nl"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tijdlijn / Planning</label>
                            <textarea
                                name="timeline"
                                className="form-textarea"
                                value={formData.timeline}
                                onChange={handleChange}
                                rows={6}
                                placeholder="Fase 1: Ontwerp&#10;Fase 2: Development&#10;Fase 3: Testing"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Project Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="CONCEPT">Concept</option>
                                <option value="IN_DESIGN">In Design</option>
                                <option value="WAITING_FOR_CONTENT">Wacht op content</option>
                                <option value="DEVELOPMENT">Development</option>
                                <option value="STAGING">Staging</option>
                                <option value="LIVE">Live</option>
                            </select>
                        </div>
                    </div>

                    <div className="project-edit-footer">
                        <button type="button" onClick={onClose} className="btn-cancel" disabled={isSaving}>
                            Annuleren
                        </button>
                        <Button type="submit" isLoading={isSaving} className="btn-save">
                            Wijzigingen Opslaan
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectEditModal;