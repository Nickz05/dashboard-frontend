// src/pages/Admin/UserManagement.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Role, User } from '../../types/user';
import '../../styles/pages/UserManagement.css';
import { useUsers } from "../../contexts/userContext.tsx";
import api from "../../api/api.ts";

const UserManagement: React.FC = () => {
    const { users, fetchUsers, updateUserRole, isLoadingUsers, error } = useUsers();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (userId: number) => {
        if (!window.confirm(`Weet je zeker dat je gebruiker ${userId} wilt verwijderen?`)) return;
        try {
            await api.delete(`/user/${userId}`);
            alert(`Gebruiker ${userId} verwijderd.`);
            fetchUsers();
        } catch (err: any) {
            alert(`Fout bij verwijderen: ${err.message}`);
        }
    };

    const handleRoleChange = async (userId: number, currentRole: Role) => {
        if (!window.confirm(`Weet je zeker dat je de rol van gebruiker ${userId} wilt wijzigen naar ${currentRole === 'ADMIN' ? 'CLIENT' : 'ADMIN'}?`)) return;
        const newRole: Role = currentRole === 'ADMIN' ? 'CLIENT' : 'ADMIN';
        try {
            await updateUserRole(userId, newRole);
            alert(`Rol succesvol gewijzigd naar ${newRole}.`);
        } catch (e: any) {
            alert(`Fout bij rol wijzigen: ${e.message}`);
        }
    };

    if (isLoadingUsers) return <LoadingSpinner size="lg" />;
    if (error) return <div className="alert error-alert user-management-container">Fout bij laden van gebruikers: {error}</div>;

    return (
        <div className="user-management-container">
            <h1 className="page-title">Klanten- en Gebruikersbeheer</h1>

            <Button
                variant="primary"
                className="create-user-btn"
                onClick={() => navigate('/admin/create-user')}
            >
                Client toevoegen
            </Button>

            <div className="projects-overview-table-wrapper">
                <table className="projects-overview-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Naam</th>
                        <th>E-mail</th>
                        <th>Rol</th>
                        <th>Acties</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user: User) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <span className={`badge role-badge role-${user.role.toLowerCase()}`}>{user.role}</span>
                            </td>
                            <td>
                                <Button
                                    onClick={() => handleRoleChange(user.id, user.role)}
                                    variant={user.role === 'ADMIN' ? 'secondary' : 'danger'}
                                    className="action-link"
                                >
                                    {user.role === 'ADMIN' ? 'Degradeer naar CLIENT' : 'Promoveer naar ADMIN'}
                                </Button>
                                <Button
                                    onClick={() => handleDelete(user.id)}
                                    variant="danger"
                                    className="action-link delete-btn"
                                >
                                    Verwijder
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;