// src/components/layout/Sidebar.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Sidebar.css'; // Importeer de CSS

const navItems = {
    ADMIN: [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Alle Projecten', path: '/projects' },
        { name: 'Klantenbeheer', path: '/admin/users' },
        { name: 'Nieuw Project', path: '/admin/create-project' },
    ],
    CLIENT: [
        { name: 'Mijn Dashboard', path: '/dashboard' },
        { name: 'Mijn Projecten', path: '/projects' },
        { name: 'Bestanden Uploaden', path: '/files' },
    ]
};

const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Bepaal welke navigatielinks getoond moeten worden
    const items = user?.role === 'ADMIN' ? navItems.ADMIN : navItems.CLIENT;

    return (
        <div className="sidebar-container">
            <div className="sidebar-logo">
                Zomer Dev
            </div>

            <nav className="sidebar-nav">
                {items.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* Juridische Naleving (AVG/GDPR - User Story V.2) */}
            <div className="sidebar-footer">
                <Link to="/privacy" className="footer-link">
                    Privacyverklaring
                </Link>
                <Link to="/terms" className="footer-link">
                    Algemene Voorwaarden
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;