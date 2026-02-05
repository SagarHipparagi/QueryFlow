// Check if API key is configured
export function isAPIConfigured() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiKey = import.meta.env.VITE_API_KEY;

    // If no API URL or key is set, we're in demo mode
    return !!(apiUrl && apiKey);
}

// Demo mode state
let demoMode = !isAPIConfigured();
let apiKeyValidated = false;

export function isDemoMode() {
    return demoMode;
}

export function setDemoMode(enabled) {
    demoMode = enabled;
}

export function isAPIKeyValidated() {
    return apiKeyValidated;
}

export function setAPIKeyValidated(validated) {
    apiKeyValidated = validated;
}

// Sample data for demo mode
export const DEMO_RESPONSES = {
    queries: {
        'nike': {
            sql: "SELECT * FROM t_shirts\nWHERE brand = 'Nike'\nORDER BY stock DESC;",
            results: [
                { id: 1, brand: 'Nike', color: 'White', size: 'M', price: '$25.99', stock: 150 },
                { id: 2, brand: 'Nike', color: 'Blue', size: 'S', price: '$22.99', stock: 234 },
                { id: 3, brand: 'Nike', color: 'Black', size: 'L', price: '$27.99', stock: 89 },
            ]
        },
        'stock': {
            sql: "SELECT brand, SUM(stock) as total_stock\nFROM t_shirts\nGROUP BY brand\nORDER BY total_stock DESC;",
            results: [
                { brand: 'Nike', total_stock: 473 },
                { brand: 'Adidas', total_stock: 312 },
                { brand: 'Puma', total_stock: 189 },
            ]
        },
        'revenue': {
            sql: "SELECT SUM(price * quantity) as revenue\nFROM orders\nWHERE date >= DATE_SUB(NOW(), INTERVAL 1 MONTH);",
            results: [
                { revenue: '$45,892.50' }
            ]
        },
        'default': {
            sql: "SELECT * FROM t_shirts\nLIMIT 5;",
            results: [
                { id: 1, brand: 'Nike', color: 'White', size: 'M', price: '$25.99', stock: 150 },
                { id: 2, brand: 'Adidas', color: 'Black', size: 'L', price: '$29.99', stock: 89 },
                { id: 3, brand: 'Puma', color: 'Red', size: 'XL', price: '$27.99', stock: 67 },
                { id: 4, brand: 'Levi', color: 'Navy', size: 'M', price: '$34.99', stock: 112 },
                { id: 5, brand: 'Nike', color: 'Blue', size: 'S', price: '$22.99', stock: 234 },
            ]
        }
    }
};

export function getDemoResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('nike')) return DEMO_RESPONSES.queries.nike;
    if (q.includes('stock') || q.includes('inventory')) return DEMO_RESPONSES.queries.stock;
    if (q.includes('revenue') || q.includes('sales')) return DEMO_RESPONSES.queries.revenue;

    return DEMO_RESPONSES.queries.default;
}
