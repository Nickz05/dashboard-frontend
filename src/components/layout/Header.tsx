import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/Header.css';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const title = user?.role === 'ADMIN'
        ? 'Zomer Dev Admin Dashboard'
        : 'Mijn Project Dashboard';

    // FIX: Gebruik de meest simpele fallback: naam, anders e-mail.
    // Omdat de database de naam nu correct bevat, zal deze getoond worden.
    const displayName = user?.name
        ? user.name
        : user?.email;

    return (
        <header className="header-container">
            <div className="header-title">
                {title}
            </div>

            <div className="header-actions">
                <span className="welcome-text">
                    Welkom, {displayName}
                </span>

                <button
                    onClick={handleLogout}
                    className="logout-button"
                >
                    Uitloggen
                </button>
            </div>
        </header>
    );
};

export default Header;