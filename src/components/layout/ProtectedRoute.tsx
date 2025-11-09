import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// Importeer de laadspinner, die we ook in de AuthProvider gebruiken
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
    allowedRoles?: Array<'ADMIN' | 'CLIENT'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    // FIX: Haal isLoading op
    const { isAuthenticated, user, isLoading } = useAuth();

    // 1. Wacht op initialisatie. Dit voorkomt de redirect-lus.
    if (isLoading) {
        return (
            <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // 2. Controleer authenticatie
    if (!isAuthenticated) {
        // Gebruiker is niet ingelogd, stuur naar login
        return <Navigate to="/login" replace />;
    }

    // 3. Controleer autorisatie (rol-gebaseerd)
    if (allowedRoles && user && !allowedRoles.includes(user.role as 'ADMIN' | 'CLIENT')) {
        // Ingelogd, maar heeft niet de juiste rol
        return <Navigate to="/dashboard" replace />;
    }

    // Gebruiker is ingelogd en geautoriseerd, render de kind-route
    return <Outlet />;
};

export default ProtectedRoute;
