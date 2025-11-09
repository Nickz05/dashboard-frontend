import { useState, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { User} from '../types/user';

interface UpdatePayload {
    name?: string;
    email?: string;
}

export const useProfile = () => {
    const { user} = useAuth(); // Assume setUser is available in AuthContext for local update
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);

    // Functie voor het updaten van de profielinformatie (Naam en E-mail)
    const updateProfile = useCallback(async (payload: UpdatePayload) => {
        if (!user) {
            setUpdateError("Gebruiker is niet ingelogd.");
            throw new Error("Niet ingelogd");
        }

        setIsUpdating(true);
        setUpdateError(null);

        try {
            // PUT call naar de backend
            const response = await api.put<User>('/user/profile', payload);

            // Lokale update van de AuthContext (cruciaal voor User Story I.3: Recht op Rectificatie)
            // Hiervoor moet de AuthContext wel een 'setUser' of 'updateUser' functie beschikbaar stellen.
            // Dit is een aanname; als je AuthContext geen 'setUser' heeft, moet je die nog toevoegen.
            // setUser({ ...user, ...response.data });

            // De AuthContext (user) moet worden bijgewerkt met de nieuwe data
            return response.data;
        } catch (err: any) {
            console.error("Fout bij profielupdate:", err);
            const message = err.response?.data?.message || 'Fout bij het bijwerken van de gegevens.';
            setUpdateError(message);
            throw new Error(message);
        } finally {
            setIsUpdating(false);
        }
    }, [user]);

    return {
        isUpdating,
        updateError,
        updateProfile
    };
};