import { useState, useEffect } from 'react';
import { Play, Save, History, Code, Database, ChevronDown, AlertCircle, WifiOff } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import AlertBanner from '../components/ui/AlertBanner';
import { queryAPI, databaseAPI } from '../services/api';
import { isDestructiveQuery, getDestructiveKeyword } from '../utils/sqlSafety';

export default function QueryBuilder() {
    const [query, setQuery] = useState('');
    const [selectedTable, setSelectedTable] = useState('');
    const [tables, setTables] = useState([]);
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [executionTime, setExecutionTime] = useState(null);

    // Fetch tables on mount
    useEffect(() => {
        const fetchTables = async () => {
            try {
                const data = await databaseAPI.getTables();
                setTables(data.tables || []);
            } catch {
                // Fallback to default tables
                setTables(['t_shirts', 'customers', 'orders', 'inventory', 'suppliers']);
            }
        };
        fetchTables();
    }, []);

    // Handle table selection
    const handleTableSelect = async (table) => {
        setSelectedTable(table);
        setQuery(`SELECT * FROM ${table} LIMIT 10;`);
    };

    // Execute SQL query
    const handleExecute = async () => {
        console.log('=== Query Builder: Execute Started ===');
        console.log('Query:', query);

        if (!query.trim()) {
            setError('Please enter a SQL query');
            return;
        }

        // SQL Safety Check
        if (isDestructiveQuery(query)) {
            const keyword = getDestructiveKeyword(query);
            setError(`Query blocked: ${keyword} operations are not allowed in read-only mode.`);
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);
        setExecutionTime(null);

        const startTime = performance.now();

        try {
            console.log('Calling queryAPI.executeSQL...');
            const data = await queryAPI.executeSQL(query);
            console.log('API Response:', data);

            const execTime = Math.round(performance.now() - startTime);

            setResult(data.results || data);
            setExecutionTime(execTime);
            console.log('Success! Results:', data.results || data);
        } catch (err) {
            console.error('API Error:', err);
            console.error('Error message:', err.message);

            const execTime = Math.round(performance.now() - startTime);
            setExecutionTime(execTime);

            if (err.message === 'API_KEY_INVALID') {
                setError('Live responses are currently unavailable. API key is invalid or missing.');
            } else if (err.message === 'API_UNAVAILABLE') {
                setError('Backend server is not responding. Please ensure the server is running.');
            } else {
                setError(`Failed to execute query: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
            console.log('=== Query Builder: Execute Finished ===');
        }
    };

    return (
        <div className="space-y-5 animate-fadeInUp">
            {/* Page Header */}
            <div className="flex items-center justify-between mt-3 mb-8">
                <div>
                    <h1 className="text-[30px] font-medium text-[var(--text-primary)] tracking-[-0.025em]">
                        Query Builder
                    </h1>
                    <p className="text-[12px] text-[var(--text-tertiary)] mt-1.5 tracking-wide">
                        Build and execute SQL queries directly
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Sidebar - Tables */}
                <div className="lg:col-span-1">
                    <GlassCard hover={false}>
                        <h3 className="text-[12px] font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
                            <Database size={14} className="text-[var(--text-tertiary)]" />
                            Tables
                        </h3>
                        <div className="space-y-1">
                            {tables.map((table) => (
                                <button
                                    key={table}
                                    onClick={() => handleTableSelect(table)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-all duration-200
                    ${selectedTable === table
                                            ? 'bg-[var(--accent)]/[0.06] text-[var(--accent)] border border-[var(--accent)]/[0.08]'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]/60'
                                        }`}
                                >
                                    {table}
                                </button>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Query Editor */}
                    <GlassCard hover={false}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[12px] font-medium text-[var(--text-primary)] flex items-center gap-2">
                                <Code size={14} className="text-[var(--text-tertiary)]" />
                                SQL Editor
                            </h3>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setQuery('')}
                                >
                                    Clear
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleExecute}
                                    disabled={isLoading || !query.trim()}
                                >
                                    {isLoading ? (
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Play size={12} />
                                    )}
                                    {isLoading ? 'Running' : 'Run'}
                                </Button>
                            </div>
                        </div>
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="SELECT * FROM t_shirts WHERE brand = 'Nike'"
                            className="w-full h-40 px-4 py-3 text-[13px] font-mono
                         bg-[var(--bg-card-solid)] text-[var(--text-primary)]
                         border border-[var(--border-color)] rounded-xl
                         placeholder:text-[var(--text-tertiary)]
                         focus:outline-none focus:border-[var(--accent)]/50
                         focus:shadow-[0_0_0_3px_var(--accent-soft)]
                         transition-all duration-200 resize-none"
                        />

                        {/* Execution Stats */}
                        {executionTime && !error && (
                            <div className="mt-3 flex items-center gap-3 text-[10px] text-[var(--text-tertiary)]">
                                <span>Executed in {executionTime}ms</span>
                                {result && <span>• {result.length} rows returned</span>}
                            </div>
                        )}
                    </GlassCard>

                    {/* Error Message */}
                    {error && (
                        <AlertBanner type="error" className="flex items-start gap-2">
                            {error.includes('unavailable') ? (
                                <WifiOff size={14} className="mt-0.5 flex-shrink-0" />
                            ) : (
                                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                                <p className="font-medium">{error}</p>
                                {error.includes('unavailable') && (
                                    <p className="text-[11px] opacity-80 mt-0.5">
                                        Please check your API configuration and try again.
                                    </p>
                                )}
                            </div>
                        </AlertBanner>
                    )}

                    {/* Results */}
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[12px] font-medium text-[var(--text-primary)]">
                                    Query Results
                                </h3>
                                {result && result.length > 0 && (
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--success-soft)] text-[var(--success-muted)] font-medium uppercase tracking-wider">
                                        {result.length} rows
                                    </span>
                                )}
                            </div>
                        </div>

                        {isLoading ? (
                            <TableSkeleton rows={5} columns={6} />
                        ) : error ? (
                            <ErrorState
                                title="Query failed"
                                message="Please check your SQL syntax and try again."
                            />
                        ) : result && result.length > 0 ? (
                            <DataTable
                                columns={Object.keys(result[0]).map(key => ({
                                    header: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
                                    accessor: key,
                                    render: (val) => {
                                        if (key === 'stock' && typeof val === 'number') {
                                            return (
                                                <span className={`font-medium ${val < 100 ? 'text-[var(--warning)]' : 'text-[var(--success-muted)]'}`}>
                                                    {val}
                                                </span>
                                            );
                                        }
                                        return val;
                                    }
                                }))}
                                data={result}
                            />
                        ) : result && result.length === 0 ? (
                            <EmptyState
                                title="No results"
                                message="Your query returned no data."
                            />
                        ) : (
                            <EmptyState
                                title="No results yet"
                                message="Write a query and click Run to see results here."
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
