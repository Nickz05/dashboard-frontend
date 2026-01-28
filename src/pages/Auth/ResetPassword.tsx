import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ErrorAlert from '../../components/ui/ErrorAlert';
import api from '../../api/api';
import '../../styles/pages/ResetPasswordPage.css';
import companyLogo from '../../assets/images/logo_volledig.png';

const ResetPasswordPage: React.FC = () => {
    // Hooks worden altijd bovenaan de component aangeroepen
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validatie
        if (!newPassword || !confirmPassword) {
            setError('Vul alstublieft beide velden in');
            return;
        }

        if (newPassword.length < 8) {
            setError('Wachtwoord moet minimaal 8 karakters lang zijn');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Wachtwoorden komen niet overeen');
            return;
        }

        if (!token) {
            setError('Ongeldige reset link');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/reset-password', {
                token,
                newPassword,
            });

            setSuccess(true);

            // Redirect naar login na 3 seconden
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Er is een fout opgetreden';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Als er geen token is, wordt de component hier vroegtijdig teruggegeven (early return)
    if (!token) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-card">
                    <img src={companyLogo} alt="Company Logo" className="reset-password-logo" />
                    <h1 className="reset-password-title">Ongeldige Link</h1>
                    <p>Deze wachtwoord reset link is ongeldig of verlopen.</p>
                    <Button onClick={() => navigate('/login')} variant="primary">
                        Terug naar login
                    </Button>
                </div>
            </div>
        );
    }

    // Hoofd render
    return (
        <div className="reset-password-container">
            <div className="reset-password-card">
                <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="reset-password-logo"
                />

                <h1 className="reset-password-title">Nieuw Wachtwoord</h1>
                <p className="reset-password-subtitle">
                    Voer uw nieuwe wachtwoord in
                </p>

                {success ? (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h2>Wachtwoord Gereset!</h2>
                        <p>Uw wachtwoord is succesvol gewijzigd.</p>
                        <p className="redirect-message">
                            U wordt over 3 seconden doorgestuurd naar de login pagina...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="reset-password-form">
                        {error && <ErrorAlert message={error} />}

                        <Input
                            label="Nieuw Wachtwoord"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimaal 8 karakters"
                            required
                            disabled={isLoading}
                        />

                        <Input
                            label="Bevestig Wachtwoord"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Herhaal uw wachtwoord"
                            required
                            disabled={isLoading}
                        />

                        <div className="password-requirements">
                            <p>Wachtwoord vereisten:</p>
                            <ul>
                                <li className={newPassword.length >= 8 ? 'valid' : ''}>
                                    Minimaal 8 karakters
                                </li>
                                <li className={newPassword === confirmPassword && newPassword ? 'valid' : ''}>
                                    Wachtwoorden komen overeen
                                </li>
                            </ul>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}
                            variant="primary"
                        >
                            Wachtwoord Resetten
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;