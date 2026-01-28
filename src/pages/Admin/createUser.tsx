// src/pages/Admin/CreateUser.tsx

import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import '../../styles/pages/CreateUser.css';
import api from '../../api/api';
import { Role } from '../../types/user';
import { useNavigate } from "react-router-dom";
// Importeer je ErrorAlert component (aangenomen dat deze bestaat)
import ErrorAlert from '../../components/ui/ErrorAlert';

// NIEUW: Component voor Succesmelding (kan ook geïmporteerd worden als aparte file)
const SuccessAlert: React.FC<{ message: string }> = ({ message }) => {
    if (!message) return null;
    return (
        <div className="alert success-alert" role="alert">
            {message}
        </div>
    );
}

const CreateUser: React.FC = () => {
    const navigate = useNavigate();
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'CLIENT' });
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // NIEUW: States voor meldingen
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    // Functie om de meldingen na een tijdje te wissen
    const clearMessages = () => {
        setTimeout(() => {
            setActionError(null);
            setActionSuccess(null);
        }, 5000);
    }

    const handleCreateUser = async () => {
        setIsCreating(true);
        setGeneratedPassword(null);
        setActionError(null); // Wis vorige fouten
        setActionSuccess(null); // Wis vorige successen

        try {
            const response = await api.post('/auth/register', newUser);

            // ✅ Zorg dat je het wachtwoord correct uitleest
            const password = response.data.generatedPassword;

            if (password) {
                setGeneratedPassword(password);
                // VERVANG alert() door state-update
                setActionSuccess(`Gebruiker "${newUser.name}" succesvol aangemaakt.`);
            } else {
                // VERVANG alert() door state-update
                setActionError('Gebruiker aangemaakt, maar geen wachtwoord ontvangen.');
            }

            setNewUser({ name: '', email: '', role: 'CLIENT' });
            clearMessages(); // Start timer om het succes/foutbericht te wissen
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Onbekende fout';
            // VERVANG alert() door state-update
            setActionError(`Fout bij aanmaken gebruiker: ${errorMessage}`);
            clearMessages(); // Start timer om het foutbericht te wissen
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="create-user-container">

            <Button
                variant="secondary"
                onClick={() => navigate(-1)}
                className="back-button"
            >
                ← Terug
            </Button>
            <h1>Nieuwe Gebruiker Aanmaken</h1>

            {/* ERROR MELDING */}
            <ErrorAlert message={actionError || ''} />
            {/* SUCCES MELDING */}
            <SuccessAlert message={actionSuccess || ''} />

            <div className="create-user-form">
                <label>Naam</label>
                <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Naam"
                />

                <label>E-mail</label>
                <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="E-mailadres"
                />

                <label>Rol</label>
                <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                >
                    <option value="CLIENT">CLIENT</option>
                    <option value="ADMIN">ADMIN</option>
                </select>

                <Button variant="primary" onClick={handleCreateUser} disabled={isCreating}>
                    {isCreating ? 'Bezig met aanmaken...' : 'Gebruiker Aanmaken'}
                </Button>
            </div>

            {generatedPassword && (
                <div className="generated-password-box">
                    <strong>Gegenereerd wachtwoord:</strong>
                    <div className="password-display">{generatedPassword}</div>
                    <p className="note">Kopieer dit wachtwoord onmiddellijk! Het wordt niet opgeslagen.</p>
                </div>
            )}
        </div>
    );
};

export default CreateUser;