import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Button from '../../components/ui/Button';
import '../../styles/pages/ChangePasswordPage.css';

const ChangePasswordPage: React.FC = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!newPassword || !confirmPassword) {
            setError('Vul beide velden in.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Wachtwoorden komen niet overeen.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/auth/change-password', {
                newPassword,
                confirmPassword
            });

            alert('Wachtwoord succesvol gewijzigd.');
            navigate('/dashboard'); // Redirect na succes
        } catch (err: any) {
            setError(err.response?.data?.message || 'Fout bij wijzigen wachtwoord.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="change-password-container">
            <h1>Nieuw wachtwoord instellen</h1>
            <form onSubmit={handleSubmit} className="change-password-form">
                <label>Nieuw wachtwoord</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />

                <label>Bevestig wachtwoord</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                {error && <p className="error-message">{error}</p>}

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Bezig...' : 'Wachtwoord wijzigen'}
                </Button>
            </form>
        </div>
    );
};

export default ChangePasswordPage;