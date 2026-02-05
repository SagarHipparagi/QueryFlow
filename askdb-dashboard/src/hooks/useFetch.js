import { useState, useEffect, useCallback } from 'react';

export function useFetch(fetchFn, options = {}) {
    const { immediate = true, initialData = null } = options;

    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchFn(...args);
            setData(result);
            return result;
        } catch (err) {
            setError(err.message || 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate, execute]);

    const refetch = useCallback(() => execute(), [execute]);

    return { data, loading, error, refetch, execute };
}

// For multiple parallel fetches
export function useMultiFetch(fetchFns, options = {}) {
    const { immediate = true } = options;

    const [data, setData] = useState({});
    const [loading, setLoading] = useState(immediate);
    const [errors, setErrors] = useState({});

    const execute = useCallback(async () => {
        setLoading(true);
        setErrors({});

        const results = {};
        const newErrors = {};

        await Promise.allSettled(
            Object.entries(fetchFns).map(async ([key, fn]) => {
                try {
                    results[key] = await fn();
                } catch (err) {
                    newErrors[key] = err.message;
                }
            })
        );

        setData(results);
        setErrors(newErrors);
        setLoading(false);
    }, [fetchFns]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate, execute]);

    return { data, loading, errors, refetch: execute };
}
