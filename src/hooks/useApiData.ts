import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

/**
 * Custom hook voor het ophalen van data met caching en loading state.
 * @param endpoint De API route (e.g., '/projects').
 * @param dependencies Een array van waarden die de fetch triggeren.
 */
export const useApiData = <T,>(endpoint: string, dependencies: React.DependencyList = []) => {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<T>(endpoint);
            setData(response.data);
        } catch (err: any) {
            console.error(`Fout bij fetching ${endpoint}:`, err);
            setError(err.response?.data?.message || 'Fout bij het laden van data');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [endpoint, ...dependencies]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Biedt de mogelijkheid om handmatig de data te herladen
    return { data, isLoading, error, refetch: fetchData };
};