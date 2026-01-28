import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Role, User } from '../../types/user';
import '../../styles/pages/UserManagement.css';
import { useUsers } from "../../contexts/userContext.tsx";
import api from "../../api/api.ts";
import ErrorAlert from '../../components/ui/ErrorAlert.tsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.tsx';

// Type om de actie die moet worden bevestigd op te slaan
type PendingAction = {
    userId: number;
    userName: string;
    type: 'DELETE' | 'ROLE_CHANGE';
    currentRole?: Role; // Alleen nodig voor ROLE_CHANGE
} | null;

// Nieuwe component toevoegen voor Succesmelding
const SuccessAlert: React.FC<{ message: string }> = ({ message }) => {
    if (!message) return null;
    return (
        <div className="alert success-alert" role="alert">
            {message}
        </div>
    );
}

const UserManagement: React.FC = () => {
    const { users, fetchUsers, updateUserRole, isLoadingUsers, error } = useUsers();
    const navigate = useNavigate();
    const [actionError, setActionError] = useState<string | null>(null);
    // NIEUW: State voor succesberichten
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    // Nieuwe states voor ConfirmDialog
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Functie om de error/succes na een tijdje te wissen
    const clearMessages = () => {
        setTimeout(() => {
            setActionError(null);
            setActionSuccess(null); // Wis ook het succesbericht
        }, 5000);
    }

    // Functie om de dialoog te openen met de juiste actie
    const handleOpenConfirm = (user: User, type: 'DELETE' | 'ROLE_CHANGE') => {
        setActionError(null); // Wis berichten bij nieuwe actie
        setActionSuccess(null); // Wis berichten bij nieuwe actie
        setPendingAction({
            userId: user.id,
            userName: user.name,
            type: type,
            currentRole: user.role
        });
        setIsConfirmOpen(true);
    };

    const handleCancelConfirm = () => {
        setIsConfirmOpen(false);
        setPendingAction(null);
    };

    // Functie die wordt aangeroepen na bevestiging in de dialoog
    const handleConfirmAction = async () => {
        if (!pendingAction) return;

        setIsConfirmOpen(false); // Sluit de dialoog onmiddellijk
        setActionError(null); // Wis vorige fout
        setActionSuccess(null); // Wis vorige succes

        try {
            if (pendingAction.type === 'DELETE') {
                // DELETE LOGICA
                await api.delete(`/user/${pendingAction.userId}`);
                // VERVANG alert() door state-update
                setActionSuccess(`Gebruiker "${pendingAction.userName}" succesvol verwijderd.`);
                fetchUsers();
            } else if (pendingAction.type === 'ROLE_CHANGE' && pendingAction.currentRole) {
                // ROLE_CHANGE LOGICA
                const newRole: Role = pendingAction.currentRole === 'ADMIN' ? 'CLIENT' : 'ADMIN';
                await updateUserRole(pendingAction.userId, newRole);
                // VERVANG alert() door state-update
                setActionSuccess(`Rol van **${pendingAction.userName}** succesvol gewijzigd naar **${newRole}**.`);
            }
            clearMessages(); // Start timer om het succesbericht te wissen
        } catch (err: any) {
            const errorMessage = err.message || 'Onbekende fout';
            if (pendingAction.type === 'DELETE') {
                setActionError(`Fout bij verwijderen van ${pendingAction.userName}: ${errorMessage}`);
            } else {
                setActionError(`Fout bij rol wijzigen van ${pendingAction.userName}: ${errorMessage}`);
            }
            clearMessages(); // Start timer om het foutbericht te wissen
        } finally {
            setPendingAction(null); // Reset de actie
        }
    };

    // Pas de handlers aan om de ConfirmDialog te openen
    const handleDelete = (user: User) => {
        handleOpenConfirm(user, 'DELETE');
    };

    const handleRoleChange = (user: User) => {
        handleOpenConfirm(user, 'ROLE_CHANGE');
    };

    // Hulplogica voor de ConfirmDialog weergave
    const dialogTitle = pendingAction
        ? pendingAction.type === 'DELETE'
            ? 'Gebruiker Verwijderen'
            : 'Rol Wijzigen'
        : '';

    const dialogMessage = pendingAction
        ? pendingAction.type === 'DELETE'
            ? `Weet je zeker dat je gebruiker ${pendingAction.userName} wilt verwijderen? Dit kan niet ongedaan gemaakt worden.`
            : `Weet je zeker dat je de rol van ${pendingAction.userName} wilt wijzigen naar ${pendingAction.currentRole === 'ADMIN' ? 'CLIENT' : 'ADMIN'}?`
        : '';

    // Gebruik de 'danger' of 'warning' varianten die in ConfirmDialog zijn gedefinieerd.
    const dialogVariant = pendingAction?.type === 'DELETE' ? 'danger' : 'warning';


    if (isLoadingUsers) return <LoadingSpinner size="lg" />;
    if (error) return <div className="alert error-alert user-management-container">Fout bij laden van gebruikers: {error}</div>;

    return (
        <div className="user-management-container">
            <h1 className="page-title">Klanten- en Gebruikersbeheer</h1>

            {/* ERROR MELDING */}
            <ErrorAlert message={actionError || ''} />
            {/* NIEUW: SUCCES MELDING */}
            <SuccessAlert message={actionSuccess || ''} />

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
                                    onClick={() => handleRoleChange(user)}
                                    // Opgelost: Gebruik 'primary' i.p.v. de ongeldige 'warning' om de TS-fout op te lossen.
                                    variant={user.role === 'ADMIN' ? 'secondary' : 'primary'}
                                    className="action-link"
                                >
                                    {user.role === 'ADMIN' ? 'Degradeer naar CLIENT' : 'Promoveer naar ADMIN'}
                                </Button>
                                <Button
                                    onClick={() => handleDelete(user)}
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

            {/* De ConfirmDialog component */}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                title={dialogTitle}
                message={dialogMessage}
                confirmText={pendingAction?.type === 'DELETE' ? 'Ja, Verwijderen' : 'Ja, Wijzigen'}
                onConfirm={handleConfirmAction}
                onCancel={handleCancelConfirm}
                variant={dialogVariant}
            />
        </div>
    );
};

export default UserManagement;