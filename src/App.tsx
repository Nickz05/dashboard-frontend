// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Beveiliging
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pagina's
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProjectsOverview from './pages/Projects/ProjectsOverview';
import ProjectDetailPage from './pages/Projects/ProjectDetailPage';
import FileManagementPage from './pages/Files/FileManagementPage';
import InvoiceView from './pages/Files/InvoiceView';

// Admin Pagina's
import UserManagement from './pages/Admin/UserManagement';
import ProjectCreation from './pages/Admin/ProjectCreation';

import './index.css';
import CreateUser from "./pages/Admin/createUser.tsx";
import ChangePasswordPage from "./pages/Auth/changePassword.tsx";
import ResetPasswordPage from "./pages/Auth/ResetPassword.tsx";
import ForgotPasswordPage from "./pages/Auth/ForgotPassword.tsx";

const App: React.FC = () => {
    return (
        <BrowserRouter basename="/">
            <Routes>
                {/* ✅ Publieke routes - GEEN authenticatie nodig */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* ✅ Beveiligde routes - WEL authenticatie nodig */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/projects" element={<ProjectsOverview />} />
                        <Route path="/projects/:id" element={<ProjectDetailPage />} />
                        <Route path="/files" element={<FileManagementPage />} />
                        <Route path="/invoice/:id" element={<InvoiceView />} />
                        <Route path="/change-password" element={<ChangePasswordPage />} />

                        {/* Alleen voor ADMIN */}
                        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                            <Route path="/admin/users" element={<UserManagement />} />
                            <Route path="/admin/create-project" element={<ProjectCreation />} />
                            <Route path="/admin/create-user" element={<CreateUser />} />
                        </Route>

                        {/* Statische pagina's */}
                        <Route path="/privacy" element={<div>Privacyverklaring - TO BE IMPLEMENTED</div>} />
                        <Route path="/terms" element={<div>Algemene Voorwaarden - TO BE IMPLEMENTED</div>} />
                    </Route>
                </Route>

                {/* 404 fallback */}
                <Route path="*" element={<div>404 - Pagina niet gevonden</div>} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;