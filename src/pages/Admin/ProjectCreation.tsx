// src/pages/Admin/ProjectCreation.tsx

import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useProjects } from '../../contexts/ProjectContext';
import '../../styles/pages/ProjectCreation.css'; // Importeer de CSS

const ProjectCreation: React.FC = () => {
    const [title, setTitle] = useState('');
    const [clientId, setClientId] = useState(''); // Tijdelijk als string, wordt naar number geconverteerd
    const [contact, setContact] = useState('');
    const [stagingUrl, setStagingUrl] = useState('');
    const [description, setDescription] = useState('');
    const [timeline, setTimeline] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { createProject, isLoadingProjects } = useProjects();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!title || !clientId) {
            setError('Titel en Klant ID zijn verplicht.');
            return;
        }

        const clientNum = parseInt(clientId, 10);
        if (isNaN(clientNum)) {
            setError('Klant ID moet een geldig nummer zijn.');
            return;
        }

        try {
            await createProject({
                title,
                clientId: clientNum,
                contactPerson: contact,
                stagingUrl,
                description,
                timeline, // Voeg de tijdlijn toe aan de data
            });
            setSuccessMessage(`Project '${title}' succesvol aangemaakt!`);

            // Reset formulier
            setTitle('');
            setClientId('');
            setContact('');
            setStagingUrl('');
            setDescription('');
            setTimeline('');

        } catch (err: any) {
            setError(err.message || 'Fout bij het aanmaken van het project.');
        }
    };

    return (
        <div className="project-creation-container">
            <h1 className="page-title">Nieuw Project Aanmaken</h1>

            <form onSubmit={handleSubmit} className="project-creation-form">

                {successMessage && (
                    <div className="alert success-alert">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="alert error-alert">
                        {error}
                    </div>
                )}

                <h2>Basisgegevens</h2>
                <Input label="Project Titel" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <Input label="Klant ID (Tijdelijk)" type="number" value={clientId} onChange={(e) => setClientId(e.target.value)} required />
                <Input label="Contactpersoon Zomer Dev" type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Nick Zomer" />

                <h2>Details</h2>
                <Input label="Staging URL" type="url" value={stagingUrl} onChange={(e) => setStagingUrl(e.target.value)} placeholder="https://staging.voorbeeld.nl" />

                {/* Omschrijving */}
                <div className="input-group">
                    <label className="input-label">Omschrijving</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-field"
                        rows={4}
                    />
                </div>

                {/* Tijdlijn / Fasering */}
                <div className="input-group">
                    <label className="input-label">Tijdlijn / Fasering (per regel)</label>
                    <textarea
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="input-field"
                        rows={6}
                        placeholder="Fase 1: Ontwerp afronden&#10;Fase 2: Development start"
                    />
                </div>

                <Button type="submit" isLoading={isLoadingProjects} className="w-full">
                    Project Opslaan
                </Button>
            </form>
        </div>
    );
};

export default ProjectCreation;