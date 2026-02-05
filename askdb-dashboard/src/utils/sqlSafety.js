// Destructive SQL keywords to block
const DESTRUCTIVE_KEYWORDS = [
    'DELETE',
    'DROP',
    'UPDATE',
    'TRUNCATE',
    'ALTER',
    'INSERT',
    'CREATE',
    'REPLACE',
    'RENAME',
    'GRANT',
    'REVOKE',
];

export function isDestructiveQuery(sql) {
    if (!sql) return false;

    const upperSQL = sql.toUpperCase().trim();

    return DESTRUCTIVE_KEYWORDS.some(keyword => {
        // Check if keyword appears at start or after whitespace/parenthesis
        const regex = new RegExp(`(^|\\s|\\()${keyword}\\s`, 'i');
        return regex.test(upperSQL);
    });
}

export function getDestructiveKeyword(sql) {
    if (!sql) return null;

    const upperSQL = sql.toUpperCase().trim();

    for (const keyword of DESTRUCTIVE_KEYWORDS) {
        const regex = new RegExp(`(^|\\s|\\()${keyword}\\s`, 'i');
        if (regex.test(upperSQL)) {
            return keyword;
        }
    }

    return null;
}

export function sanitizeQuery(query) {
    // Basic sanitization - remove comments and extra whitespace
    return query
        .replace(/--.*$/gm, '')           // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\s+/g, ' ')             // Normalize whitespace
        .trim();
}
