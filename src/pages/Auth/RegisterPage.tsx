// src/pages/Auth/RegisterPage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import '../../styles/pages/RegisterPage.css';

const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('Registratie is momenteel uitgeschakeld. Gebruikers worden handmatig aangemaakt door de beheerder.');
        setLoading(true); // Simulatie
        setTimeout(() => setLoading(false), 1500);
    };

    return (
        <div className="register-page-container">
            <div className="register-card">

                <h2 className="register-title">
                    Nieuwe Klant Registreren
                </h2>
                <p className="text-center text-gray-500">
                    Alleen voor klanten die nog geen account hebben.
                </p>

                <form onSubmit={handleSubmit} className="register-form">

                    <Input label="Naam" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input label="E-mailadres" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input label="Wachtwoord" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={loading}
                        variant="secondary"
                        disabled={true}
                    >
                        Registreren (Uitgeschakeld)
                    </Button>
                </form>

                <div className="register-login-link">
                    <Link to="/login">
                        Terug naar Inloggen
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;