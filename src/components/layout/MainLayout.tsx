// src/components/layout/MainLayout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../styles/MainLayout.css'; // Importeer de CSS

interface MainLayoutProps {
    // We kunnen hier optioneel een 'role' of 'user' prop toevoegen voor contextuele layout
}

const MainLayout: React.FC<MainLayoutProps> = () => {
    return (
        <div className="main-layout-container">
            {/* 1. Sidebar */}
            <Sidebar />

            <div className="content-area">
                {/* 2. Header */}
                <Header />

                {/* 3. Main Content Area */}
                <main className="main-content">
                    {/* Outlet rendert de pagina-component (bijv. DashboardPage) */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;