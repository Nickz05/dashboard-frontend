// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Sidebar.css';
import companyLogo from '../../assets/images/Logo_small_zomerdev-wit-trans.png';

/* ----------  HULPER: SVG-ICONEN  ---------- */
const ICONS: Record<string, React.ReactNode> = {
    Dashboard: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6m-6 0h-2a1 1 0 00-1 1v-4a1 1 0 011-1h2m-4-7h-3a1 1 0 00-1 1v4a1 1 0 011 1h3m-6 0h6" />
        </svg>
    ),
    'Mijn Dashboard': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6m-6 0h-2a1 1 0 00-1 1v-4a1 1 0 011-1h2m-4-7h-3a1 1 0 00-1 1v4a1 1 0 011 1h3m-6 0h6" />
        </svg>
    ),
    'Alle Projecten': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    'Mijn Projecten': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    Klantenbeheer: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    'Nieuw Project': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    'Bestanden Uploaden': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
    ),
};

/* ----------  NAVITEMS  ---------- */
const navItems = {
    ADMIN: [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Alle Projecten', path: '/projects' },
        { name: 'Klantenbeheer', path: '/admin/users' },
        { name: 'Nieuw Project', path: '/admin/create-project' },
        { name: 'Bestanden Uploaden', path: '/files' }
    ],
    CLIENT: [
        { name: 'Mijn Dashboard', path: '/dashboard' },
        { name: 'Mijn Projecten', path: '/projects' },
        { name: 'Bestanden Uploaden', path: '/files' },
    ],
};

/* ----------  SIDEBAR  ---------- */
const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);

    const items = user?.role === 'ADMIN' ? navItems.ADMIN : navItems.CLIENT;

    return (
        <div className={`sidebar-container ${!isOpen ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <img src={companyLogo} alt="Logo" />
                    </div>
                    {isOpen && <span className="logo-text">Zomer Dev</span>}
                </div>

                <button className="toggle-button" onClick={() => setIsOpen((v) => !v)}>
                    <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24">
                        {isOpen ? <path d="M15 19l-7-7 7-7" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                    </svg>
                </button>
            </div>

            <nav className="sidebar-nav">
                {items.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        title={!isOpen ? item.name : undefined}
                    >
                        <span className="nav-icon">{ICONS[item.name]}</span>
                        {isOpen && <span className="nav-item-text">{item.name}</span>}
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                {isOpen ? (
                    <>
                        <Link to="/privacy" className="footer-link">Privacy</Link>
                        <Link to="/terms" className="footer-link">Voorwaarden</Link>
                    </>
                ) : (
                    <div className="footer-collapsed-icons">
                        <Link to="/privacy" title="Privacy">P</Link>
                        <Link to="/terms" title="Voorwaarden">V</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;