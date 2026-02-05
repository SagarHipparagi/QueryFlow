/**
 * Utility functions for exporting query results
 */

/**
 * Convert query results to CSV format with professional formatting
 * @param {Array} data - Array of result objects
 * @param {string} query - The original query text
 * @returns {string} CSV formatted string
 */
export function exportToCSV(data, query = '') {
    if (!data || data.length === 0) {
        return '';
    }

    // Get headers from first row
    const headers = Object.keys(data[0]);

    // Create CSV header row
    const headerRow = headers.join(',');

    // Create data rows
    const dataRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];

            // Handle null/undefined
            if (value === null || value === undefined) {
                return '';
            }

            // Convert to string and escape quotes
            const stringValue = String(value);

            // Wrap in quotes if contains comma, newline, or quote
            if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }

            return stringValue;
        }).join(',');
    });

    // Combine all rows
    const csvContent = [headerRow, ...dataRows].join('\n');

    // Add metadata header
    const timestamp = new Date().toLocaleString();
    const metadata = [
        '# QueryFlow - Query Results Export',
        `# Generated: ${timestamp}`,
        `# Query: ${query}`,
        `# Total Rows: ${data.length}`,
        '',
    ].join('\n');

    return metadata + csvContent;
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name for the downloaded file
 */
export function downloadCSV(csvContent, filename = 'query_results.csv') {
    // Create blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 * @param {string} query - The query text
 * @returns {string} Formatted filename
 */
export function generateFilename(query = '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const queryPrefix = query.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `queryflow_${queryPrefix}_${timestamp}.csv`;
}

/**
 * Save query to favorites
 * @param {string} query - The query text
 * @param {string} name - Optional name for the query
 */
export function saveToFavorites(query, name = '') {
    const favorites = getFavorites();
    const newFavorite = {
        id: Date.now(),
        query,
        name: name || query.slice(0, 50),
        savedAt: new Date().toISOString(),
    };

    favorites.push(newFavorite);
    localStorage.setItem('queryflow_favorites', JSON.stringify(favorites));

    return newFavorite;
}

/**
 * Get all saved favorites
 * @returns {Array} Array of favorite queries
 */
export function getFavorites() {
    try {
        const stored = localStorage.getItem('queryflow_favorites');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Remove query from favorites
 * @param {number} id - Favorite ID
 */
export function removeFromFavorites(id) {
    const favorites = getFavorites();
    const updated = favorites.filter(fav => fav.id !== id);
    localStorage.setItem('queryflow_favorites', JSON.stringify(updated));
}

/**
 * Generate shareable URL with query
 * @param {string} query - The query text
 * @returns {string} Shareable URL
 */
export function generateShareableURL(query) {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({ q: query });
    return `${baseUrl}?${params.toString()}`;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback for older browsers
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        } catch {
            return false;
        }
    }
}
