// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Track API availability
let apiAvailable = null;

// Generic fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': API_KEY ? `Bearer ${API_KEY}` : '',
                ...options.headers,
            },
            ...options,
        });

        if (response.status === 401 || response.status === 403) {
            // API key is invalid
            apiAvailable = false;
            throw new Error('API_KEY_INVALID');
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        apiAvailable = true;
        return response.json();
    } catch (error) {
        if (error.message === 'API_KEY_INVALID') {
            throw error;
        }
        // Network error or API unavailable
        apiAvailable = false;
        throw new Error('API_UNAVAILABLE');
    }
}

// Check if API is available
export async function checkAPIHealth() {
    try {
        await fetchAPI('/health');
        return true;
    } catch {
        return false;
    }
}

export function isAPIAvailable() {
    return apiAvailable;
}

// Dashboard Metrics API
export const metricsAPI = {
    getTotalQueries: () => fetchAPI('/metrics/queries'),
    getActiveUsers: () => fetchAPI('/metrics/users'),
    getAvgResponseTime: () => fetchAPI('/metrics/response-time'),
    getUptime: () => fetchAPI('/metrics/uptime'),

    getAllMetrics: async () => {
        try {
            const [queries, users, responseTime, uptime] = await Promise.all([
                fetchAPI('/metrics/queries'),
                fetchAPI('/metrics/users'),
                fetchAPI('/metrics/response-time'),
                fetchAPI('/metrics/uptime'),
            ]);

            return { queries, users, responseTime, uptime };
        } catch (error) {
            throw error;
        }
    },
};

// Query API
export const queryAPI = {
    // Natural language query (uses AI)
    executeQuery: (query) => fetchAPI('/query', {
        method: 'POST',
        body: JSON.stringify({ query }),
    }),

    // Direct SQL execution (no AI)
    executeSQL: (sql) => fetchAPI('/execute-sql', {
        method: 'POST',
        body: JSON.stringify({ sql }),
    }),

    getRecentQueries: () => fetchAPI('/queries/recent'),

    getQueryHistory: (page = 1, limit = 20) =>
        fetchAPI(`/queries/history?page=${page}&limit=${limit}`),
};

// Database API
export const databaseAPI = {
    getInfo: () => fetchAPI('/database/info'),
    getTables: () => fetchAPI('/database/tables'),
    getTableSchema: (tableName) => fetchAPI(`/database/tables/${tableName}/schema`),
    sync: () => fetchAPI('/database/sync', { method: 'POST' }),
};

export default {
    metrics: metricsAPI,
    query: queryAPI,
    database: databaseAPI,
    checkHealth: checkAPIHealth,
    isAvailable: isAPIAvailable,
};
