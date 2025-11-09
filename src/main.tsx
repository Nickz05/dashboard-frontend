// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ProjectProvider } from './contexts/ProjectContext.tsx';
import { TaskProvider } from './contexts/TaskContext.tsx'; // Nodig voor feedback logica
import './index.css';
import {UserProvider} from "./contexts/userContext.tsx";
import {BrowserRouter} from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter basename="/">
        <AuthProvider>
            {/* Project en Task Providers kunnen hieronder */}
            <ProjectProvider>
                <TaskProvider>

                    <UserProvider>
                    <App />
                    </UserProvider>

                </TaskProvider>
            </ProjectProvider>
        </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
);