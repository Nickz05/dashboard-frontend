import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ErrorAlert from '../../components/ui/ErrorAlert.tsx';
import '../../styles/pages/LoginPage.css';
import backgroundCompany from '../../assets/images/background_company.png';
import companyLogo from '../../assets/images/logo_volledig.png';


const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const handleAuthRedirect = () => {
        if (!isAuthenticated || !user) return;

        if (user.mustChangePassword) {
            navigate('/change-password', { replace: true });
        } else {
            navigate('/dashboard', { replace: true });
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            handleAuthRedirect();
        }
    }, [isAuthenticated, user?.mustChangePassword, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Reset foutmelding bij elke poging

        if (!email || !password) {
            setError('Vul alstublieft uw e-mailadres en wachtwoord in.');
            return;
        }

        setIsSubmitting(true);
        try {
            await login(email, password);
            // ✅ Bij succes wordt automatisch genavigeerd via useEffect
        } catch (err: any) {
            console.error("Login Error:", err);

            // De error die hier gevangen wordt, is de Error(message) die je uit de AuthProvider gooide.
            const errorMessage = err.message || 'Er is een onbekende fout opgetreden bij het inloggen.';

            // Stel de specifieke, menselijk leesbare foutmelding in
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ Redirect direct als al ingelogd (geen loading screen nodig)
    if (isAuthenticated) {
        return (
            <div className="login-page-container">
                <div className="login-content-wrapper">
                    <div className="login-form-side">
                        <h1>Je bent al ingelogd!</h1>
                        <p>Je wordt doorgestuurd...</p>
                        <Button onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}>
                            Of klik hier om uit te loggen
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // De tweedelige lay-out wordt hier gerenderd
    return (
        <div className="login-page-container">
            <div className="login-content-wrapper">
                {/* Linkerzijde: Login Formulier */}
                <div className="login-form-side">
                    <img
                        src={companyLogo}
                        alt="Zomer Dev Logo"
                        className="login-logo"
                    />
                    <h1 className="login-title">LOGIN</h1>
                    <p className="login-subtitle">Hoe start je met het beste project?</p>

                    <form onSubmit={handleSubmit} className="login-form">

                        {/* Toon de geweldige foutmelding met de ErrorAlert component */}
                        {error && <ErrorAlert message={error} />}

                        <Input
                            label="E-mailadres"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="uw@email.com"
                            required
                            disabled={isSubmitting}
                        />

                        <Input
                            label="Wachtwoord"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                            disabled={isSubmitting}
                        />

                        <Button
                            type="submit"
                            className="w-full login-main-button"
                            isLoading={isSubmitting}
                            variant="primary"
                        >
                            Inloggen
                        </Button>
                    </form>


                    <div className="login-forgot-password-link">
                        <Link to="/forgot-password">Wachtwoord vergeten?</Link>
                    </div>
                </div>

                <div className="login-illustration-side">
                    <div className="illustration-card">
                        <img
                            src={backgroundCompany}
                            alt="background Image company"
                            className="login-illustration-image"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;