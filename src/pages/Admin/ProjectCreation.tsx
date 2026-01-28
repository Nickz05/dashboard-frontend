import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useProjects } from '../../contexts/ProjectContext';
import { useUsers } from '../../contexts/userContext'; // 👈 IMPORT GEBRUIKEN
import { User } from '../../types/user'; // 👈 User type importeren (aangenomen dat deze bestaat)
import LoadingSpinner from '../../components/ui/LoadingSpinner'; // Optioneel, voor betere laadweergave
import '../../styles/pages/ProjectCreation.css';
import {useNavigate} from "react-router-dom";

const ProjectCreation: React.FC = () => {
    const [title, setTitle] = useState('');
    const [clientId, setClientId] = useState<number | ''>('');
    const [contact, setContact] = useState('');
    const [stagingUrl, setStagingUrl] = useState('');
    const [description, setDescription] = useState('');
    const [timeline, setTimeline] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 🎯 Gebruik de bestaande User Context
    const {
        users,
        fetchUsers,
        isLoadingUsers,
        error: usersError // Hernoem de error om conflict te vermijden
    } = useUsers();

    const { createProject, isLoadingProjects } = useProjects();

    // Roept de gebruikers op via de context bij het laden
    useEffect(() => {
        // Alleen ophalen als de lijst nog niet is geladen
        if (users.length === 0 && !isLoadingUsers) {
            fetchUsers();
        }
    }, [fetchUsers, users.length, isLoadingUsers]);

    // 💡 Filter de gebruikers om alleen 'CLIENT' rollen te tonen
    // Dit zorgt ervoor dat u geen Admins kunt selecteren als projectklant.
    const clientUsers: User[] = users.filter(user => user.role === 'CLIENT');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!title || clientId === '') {
            setError('Project Titel en Klant zijn verplicht.');
            return;
        }

        const clientNum = clientId as number;

        try {
            await createProject({
                title,
                clientId: clientNum,
                contactPerson: contact,
                stagingUrl,
                description,
                timeline,
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

    // --- LADEN EN FOUT AFHANDELING ---
    if (isLoadingUsers) {
        return <LoadingSpinner size="lg" />;
    }

    // Toon een duidelijke fout als de context faalde
    if (usersError) {
        return (
            <div className="project-creation-container">
                <h1 className="page-title">Nieuw Project Aanmaken</h1>
                <div className="alert error-alert">
                    Fout bij het laden van de klantenlijst: {usersError}
                </div>
            </div>
        );
    }

    if (clientUsers.length === 0) {
        return (
            <div className="project-creation-container">
                <h1 className="page-title">Nieuw Project Aanmaken</h1>
                <div className="alert error-alert">
                    Geen klanten beschikbaar. Er zijn geen gebruikers met de rol 'CLIENT'.
                </div>
            </div>
        );
    }
    // -----------------------------------
    const navigate = useNavigate(); // <-- De useNavigate hook is nodig

    return (
        <div className="project-creation-container">

            <Button
                variant="secondary"
                onClick={() => navigate(-1)}
                className="back-button"
            >
                ← Terug
            </Button>
            <h1 className="page-title">Nieuw Project Aanmaken</h1>

            <form onSubmit={handleSubmit} className="project-creation-form">

                {/* ... (Success en Error Alerts) ... */}
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

                {/* --- HET KLANT SELECTIEVELD --- */}
                <div className="input-group">
                    <label className="input-label">Klant *</label>
                    <select
                        value={clientId}
                        onChange={(e) => setClientId(parseInt(e.target.value))}
                        className="input-field"
                        required
                    >
                        <option value="" disabled>--- Selecteer een klant ---</option>
                        {clientUsers.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                </div>
                {/* -------------------------------------- */}

                <Input label="Contactpersoon Zomer Dev" type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Nick Zomer" />

                <h2>Details</h2>
                <Input label="Staging URL" type="url" value={stagingUrl} onChange={(e) => setStagingUrl(e.target.value)} placeholder="https://staging.voorbeeld.nl" />

                <div className="input-group">
                    <label className="input-label">Omschrijving</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-field"
                        rows={4}
                    />
                </div>

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