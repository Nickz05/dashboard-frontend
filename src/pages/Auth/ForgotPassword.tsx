import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ErrorAlert from '../../components/ui/ErrorAlert';
import api from '../../api/api';
import '../../styles/pages/ForgotPasswordPage.css';
import companyLogo from '../../assets/images/logo_volledig.png';

const ForgotPasswordPage: React.FC = () => {
    // ✅ Alle Hooks worden hier aan het begin van de functie aangeroepen
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!email) {
            setError('Vul alstublieft uw e-mailadres in');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
            setEmail('');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Er is een fout opgetreden';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="forgot-password-logo"
                />

                <h1 className="forgot-password-title">Wachtwoord Vergeten</h1>
                <p className="forgot-password-subtitle">
                    Voer uw e-mailadres in en wij sturen u een link om uw wachtwoord te resetten.
                </p>

                {/* Voorwaardelijke rendering op basis van 'success' staat */}
                {success ? (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h2>Email Verzonden!</h2>
                        <p>
                            Als dit e-mailadres bij ons bekend is, ontvangt u binnen enkele minuten
                            een e-mail met instructies om uw wachtwoord te resetten.
                        </p>
                        <p className="success-note">
                            Controleer ook uw spam/ongewenste e-mail map.
                        </p>
                        <Link to="/login" className="back-to-login-link">
                            Terug naar login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="forgot-password-form">
                        {error && <ErrorAlert message={error} />}

                        <Input
                            label="E-mailadres"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="uw@email.com"
                            required
                            disabled={isLoading}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}
                            variant="primary"
                        >
                            Verstuur Reset Link
                        </Button>

                        <div className="back-to-login">
                            <Link to="/login">← Terug naar login</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;