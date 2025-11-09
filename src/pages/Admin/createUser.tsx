// src/pages/Admin/CreateUser.tsx

import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import '../../styles/pages/CreateUser.css';
import api from '../../api/api';
import { Role } from '../../types/user';

const CreateUser: React.FC = () => {
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'CLIENT' });
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateUser = async () => {
        setIsCreating(true);
        setGeneratedPassword(null);
        try {
            const response = await api.post('/auth/register', newUser);

            // ✅ Zorg dat je het wachtwoord correct uitleest
            const password = response.data.generatedPassword;
            if (password) {
                setGeneratedPassword(password);
                alert('Gebruiker succesvol aangemaakt.');
            } else {
                alert('Gebruiker aangemaakt, maar geen wachtwoord ontvangen.');
            }

            setNewUser({ name: '', email: '', role: 'CLIENT' });
        } catch (err: any) {
            alert(`Fout bij aanmaken gebruiker: ${err.message}`);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="create-user-container">
            <h1>Nieuwe Gebruiker Aanmaken</h1>

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
                </div>
            )}
        </div>
    );
};

export default CreateUser;