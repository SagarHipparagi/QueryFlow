import { useState, useEffect, useCallback } from 'react';
import { Database, CheckCircle, Zap, Activity, ArrowRight, RefreshCw, ShieldAlert, WifiOff, Download, Star, Share2, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import MetricCard from '../components/dashboard/MetricCard';
import QuerySection from '../components/dashboard/QuerySection';
import QueryStats from '../components/dashboard/QueryStats';
import SQLPanel from '../components/dashboard/SQLPanel';
import RecentQueries from '../components/dashboard/RecentQueries';
import GlassCard from '../components/ui/GlassCard';
import AlertBanner from '../components/ui/AlertBanner';
import DataTable from '../components/ui/DataTable';
import ReadOnlyBadge from '../components/ui/ReadOnlyBadge';
import { MetricCardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { queryAPI, databaseAPI } from '../services/api';
import { isDestructiveQuery, getDestructiveKeyword } from '../utils/sqlSafety';
import useSessionMetrics from '../hooks/useSessionMetrics';
import useQueryHistory from '../hooks/useQueryHistory';
import { exportToCSV, downloadCSV, generateFilename, saveToFavorites, generateShareableURL, copyToClipboard } from '../utils/exportUtils';

export default function Dashboard() {
    const location = useLocation();

    // Session-based metrics (honest demo analytics)
    const { totalQueries, successfulQueries, averageTime, recordQuery } = useSessionMetrics();

    // Query history tracking
    const { addToHistory } = useQueryHistory();

    // API availability state
    const [apiAvailable, setApiAvailable] = useState(true);
    const [apiError, setApiError] = useState(null);

    // Query results state
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [queryError, setQueryError] = useState(null);
    const [activeQuery, setActiveQuery] = useState('');

    // Query execution state
    const [generatedSQL, setGeneratedSQL] = useState('');
    const [executionTime, setExecutionTime] = useState(null);
    const [queryStatus, setQueryStatus] = useState(null);

    // Recent queries state
    const [recentQueries, setRecentQueries] = useState([]);
    const [recentLoading, setRecentLoading] = useState(true);

    // Database info state
    const [dbInfo, setDbInfo] = useState(null);

    // Toast notification state
    const [toast, setToast] = useState(null);

    // Example queries that match the t-shirt inventory database
    const EXAMPLE_QUERIES = [
        { query: 'How many Nike t-shirts are in stock?', time: '2 min ago', status: 'success', executionTime: 1450, rows: 15 },
        { query: 'Show all t-shirts under $30', time: '5 min ago', status: 'success', executionTime: 892, rows: 28 },
        { query: 'List all available colors for Adidas brand', time: '12 min ago', status: 'success', executionTime: 1203, rows: 8 },
        { query: 'What sizes are available for black t-shirts?', time: '1 hour ago', status: 'success', executionTime: 756, rows: 12 }
    ];

    // Removed fake metrics fetching - using session-based tracking instead

    // Fetch recent queries
    const fetchRecentQueries = useCallback(async () => {
        setRecentLoading(true);
        try {
            const data = await queryAPI.getRecentQueries();
            // Only use API data if it's valid and not empty
            if (data && data.length > 0) {
                setRecentQueries(data);
            } else {
                // Fallback to example queries
                setRecentQueries(EXAMPLE_QUERIES);
            }
        } catch {
            // Use example queries on error
            setRecentQueries(EXAMPLE_QUERIES);
        } finally {
            setRecentLoading(false);
        }
    }, []);

    // Fetch database info
    const fetchDbInfo = useCallback(async () => {
        try {
            const data = await databaseAPI.getInfo();
            setDbInfo(data);
        } catch {
            setDbInfo(MOCK_DATA.database);
        }
    }, []);

    // Handle query from location state (rerun from History)
    useEffect(() => {
        if (location.state?.query) {
            handleQuery(location.state.query);
            // Clear the state to prevent re-running on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);


    // Initial data load
    useEffect(() => {
        fetchRecentQueries();
        fetchDbInfo();
    }, [fetchRecentQueries, fetchDbInfo]);

    // Handle query submission
    const handleQuery = async (query) => {
        setIsLoading(true);
        setQueryError(null);
        setActiveQuery(query);
        setQueryStatus(null);
        setExecutionTime(null);
        setGeneratedSQL('');
        setResult(null);

        const startTime = performance.now();

        try {
            const data = await queryAPI.executeQuery(query);
            const execTime = Math.round(performance.now() - startTime);

            const sql = data.sql || '';
            setGeneratedSQL(sql);

            // SQL Safety Check
            if (isDestructiveQuery(sql)) {
                const keyword = getDestructiveKeyword(sql);
                setQueryError(`Query blocked: ${keyword} operations are not allowed in read-only mode.`);
                setQueryStatus('blocked');
                setExecutionTime(execTime);
                recordQuery(false, execTime); // Track failed query
                addToHistory(query, 'error', execTime, 0, sql); // Add to history
                addToRecentQueries(query, 'error', execTime);
            } else {
                setResult(data.results || data);
                setExecutionTime(execTime);
                setQueryStatus('success');
                setApiAvailable(true);
                recordQuery(true, execTime); // Track successful query
                addToHistory(query, 'success', execTime, data.results?.length || 0, sql); // Add to history
                addToRecentQueries(query, 'success', execTime, data.results?.length || 0);
            }
        } catch (error) {
            const execTime = Math.round(performance.now() - startTime);
            setExecutionTime(execTime);

            // Show clear error - NO fallback to demo data
            if (error.message === 'API_KEY_INVALID') {
                setQueryError('Live AI responses are currently unavailable. API key is invalid or missing.');
                setApiAvailable(false);
            } else if (error.message === 'API_UNAVAILABLE') {
                setQueryError('Live AI responses are currently unavailable. Backend server is not responding.');
                setApiAvailable(false);
            } else {
                setQueryError('Unable to process your query. Please try again.');
            }

            setQueryStatus('error');
            recordQuery(false, execTime); // Track failed query
            addToHistory(query, 'error', execTime, 0, ''); // Add to history
            addToRecentQueries(query, 'error', execTime);
        } finally {
            setIsLoading(false);
        }
    };

    // Add query to recent list
    const addToRecentQueries = (query, status, executionTime, rows) => {
        const newQuery = { query, time: 'Just now', status, executionTime, rows };
        setRecentQueries(prev => [newQuery, ...prev.slice(0, 9)]);
    };

    // Handle rerun from history
    const handleRerun = (query) => handleQuery(query);

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Quick Actions handlers
    const handleExportCSV = () => {
        if (!result || result.length === 0) return;

        try {
            const csv = exportToCSV(result, activeQuery);
            const filename = generateFilename(activeQuery);
            downloadCSV(csv, filename);
            showToast(`Exported ${result.length} rows to ${filename}`);
        } catch (error) {
            showToast('Failed to export results', 'error');
        }
    };

    const handleSaveQuery = () => {
        if (!activeQuery) return;

        try {
            saveToFavorites(activeQuery);
            showToast('Query saved to favorites');
        } catch (error) {
            showToast('Failed to save query', 'error');
        }
    };

    const handleShareReport = async () => {
        if (!activeQuery) return;

        try {
            const url = generateShareableURL(activeQuery);
            const success = await copyToClipboard(url);

            if (success) {
                showToast('Share link copied to clipboard');
            } else {
                showToast('Failed to copy link', 'error');
            }
        } catch (error) {
            showToast('Failed to generate share link', 'error');
        }
    };

    return (
        <div className="space-y-5 animate-fadeInUp">
            {/* Page Header */}
            <div className="flex items-center justify-between mt-3 mb-8">
                <div>
                    <h1 className="text-[30px] font-medium text-[var(--text-primary)] tracking-[-0.025em]">
                        Dashboard
                    </h1>
                    <p className="text-[12px] text-[var(--text-tertiary)] mt-1.5 tracking-wide">
                        Natural language database queries
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ReadOnlyBadge />
                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-tertiary)]">
                        <span className={`w-1.5 h-1.5 rounded-full ${apiAvailable ? 'bg-[var(--success-muted)]' : 'bg-[var(--error-muted)]'}`}></span>
                        {apiAvailable ? 'Connected' : 'Disconnected'}
                    </div>
                </div>
            </div>

            {/* API Error Banner */}
            {apiError && (
                <AlertBanner type="error" className="flex items-start gap-2">
                    <WifiOff size={14} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Live AI responses are currently unavailable</p>
                        <p className="text-[11px] opacity-80 mt-0.5">{apiError}</p>
                    </div>
                </AlertBanner>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                <MetricCard
                    title="Total Queries"
                    value={totalQueries}
                    icon={Database}
                    subtitle="Session count"
                />
                <MetricCard
                    title="Successful Queries"
                    value={successfulQueries}
                    icon={CheckCircle}
                    subtitle="No errors"
                />
                <MetricCard
                    title="Avg Query Time"
                    value={averageTime > 0 ? `${averageTime}ms` : '—'}
                    icon={Zap}
                    subtitle="Execution time"
                />
                <MetricCard
                    title="Demo Mode"
                    value="Active"
                    icon={Activity}
                    subtitle="Session analytics"
                />
            </div>

            {/* Helper text */}
            <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-2">
                Session-level demo metrics • Resets on browser close
            </p>

            {/* Section Divider */}
            <div className="h-px bg-[var(--border-subtle)] my-1"></div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <QuerySection onSubmit={handleQuery} isLoading={isLoading} />

                    {/* Query Stats */}
                    {queryStatus && !isLoading && queryStatus !== 'blocked' && queryStatus !== 'error' && (
                        <QueryStats
                            status={queryStatus}
                            executionTime={executionTime}
                            rowCount={result?.length}
                        />
                    )}

                    {/* Generated SQL Panel */}
                    {generatedSQL && <SQLPanel sql={generatedSQL} />}

                    {/* SQL Safety Error */}
                    {queryStatus === 'blocked' && (
                        <AlertBanner type="warning" className="flex items-start gap-2">
                            <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Query blocked for safety</p>
                                <p className="text-[11px] opacity-80 mt-0.5">
                                    Destructive operations (DELETE, DROP, UPDATE) are not allowed in read-only mode.
                                </p>
                            </div>
                        </AlertBanner>
                    )}

                    {/* Query Error */}
                    {queryError && queryStatus !== 'blocked' && (
                        <AlertBanner type="error" className="flex items-start gap-2">
                            <WifiOff size={14} className="mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">{queryError}</p>
                                {!apiAvailable && (
                                    <p className="text-[11px] opacity-80 mt-0.5">
                                        Please check your API configuration and try again.
                                    </p>
                                )}
                            </div>
                        </AlertBanner>
                    )}

                    {/* Results Panel */}
                    <div className="glass rounded-2xl overflow-hidden hover-lift">
                        <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-[12px] font-medium text-[var(--text-primary)]">
                                        Results
                                    </h3>
                                    {activeQuery && (
                                        <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 truncate max-w-sm">
                                            {activeQuery}
                                        </p>
                                    )}
                                </div>
                                {result && result.length > 0 && (
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--success-soft)] text-[var(--success-muted)] font-medium uppercase tracking-wider">
                                        {result.length} rows
                                    </span>
                                )}
                            </div>
                        </div>

                        {isLoading ? (
                            <TableSkeleton rows={5} columns={6} />
                        ) : queryStatus === 'blocked' ? (
                            <ErrorState
                                title="Query not executed"
                                message="This query was blocked because it contains destructive operations."
                            />
                        ) : queryStatus === 'error' ? (
                            <ErrorState
                                title="Query failed"
                                message={queryError || "We couldn't execute your query. Please try again."}
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
                                title="No matching results"
                                message="Your query returned no data. Try adjusting your search criteria."
                            />
                        ) : (
                            <EmptyState
                                title="Ready to query"
                                message="Enter a question in natural language to search your database."
                            />
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-4">
                    <GlassCard hover={false} className="hover-lift">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[12px] font-medium text-[var(--text-primary)]">
                                Recent Queries
                            </h3>
                            <button
                                onClick={fetchRecentQueries}
                                className="text-[10px] text-[var(--accent)] hover:underline"
                            >
                                Refresh
                            </button>
                        </div>
                        <RecentQueries
                            queries={recentQueries}
                            loading={recentLoading}
                            onRerun={handleRerun}
                        />
                    </GlassCard>

                    <div className="h-px bg-[var(--border-subtle)]/50"></div>

                    <GlassCard hover={false} className="hover-lift">
                        <h3 className="text-[12px] font-medium text-[var(--text-primary)] mb-3">
                            Quick Actions
                        </h3>
                        <div className="space-y-0.5">
                            <button
                                onClick={handleExportCSV}
                                disabled={!result || result.length === 0}
                                className="w-full flex items-center justify-between p-2.5 -mx-2.5 rounded-lg
                             hover:bg-[var(--bg-card)]/50 transition-all duration-200 text-left
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
                             press-effect"
                            >
                                <div className="flex items-center gap-2">
                                    <Download size={12} className="text-[var(--text-tertiary)]" />
                                    <div>
                                        <p className="text-[12px] text-[var(--text-primary)]">Export Results</p>
                                        <p className="text-[10px] text-[var(--text-tertiary)]">Download CSV</p>
                                    </div>
                                </div>
                                <ArrowRight size={11} className="text-[var(--text-quaternary)]" />
                            </button>

                            <button
                                onClick={handleSaveQuery}
                                disabled={!activeQuery}
                                className="w-full flex items-center justify-between p-2.5 -mx-2.5 rounded-lg
                             hover:bg-[var(--bg-card)]/50 transition-all duration-200 text-left
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
                             press-effect"
                            >
                                <div className="flex items-center gap-2">
                                    <Star size={12} className="text-[var(--text-tertiary)]" />
                                    <div>
                                        <p className="text-[12px] text-[var(--text-primary)]">Save Query</p>
                                        <p className="text-[10px] text-[var(--text-tertiary)]">Add to favorites</p>
                                    </div>
                                </div>
                                <ArrowRight size={11} className="text-[var(--text-quaternary)]" />
                            </button>
                        </div>
                    </GlassCard>

                    <div className="h-px bg-[var(--border-subtle)]/50"></div>

                    <GlassCard hover={false} className="hover-lift">
                        <h3 className="text-[12px] font-medium text-[var(--text-primary)] mb-3">
                            Data Overview
                        </h3>
                        <div className="space-y-2.5 text-[12px]">
                            <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Tables Available</span>
                                <span className="text-[var(--text-primary)] font-medium">2</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Total Records</span>
                                <span className="text-[var(--text-primary)] font-medium">63</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Data Scope</span>
                                <span className="text-[var(--text-primary)] font-medium">Inventory (Demo)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Access Mode</span>
                                <span className="text-[var(--text-primary)] font-medium">Read-only</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 animate-fadeInUp
                    glass rounded-xl px-4 py-3 shadow-lg flex items-center gap-2
                    ${toast.type === 'error' ? 'border-l-2 border-[var(--error)]' : 'border-l-2 border-[var(--success-muted)]'}`}>
                    <Check size={14} className={toast.type === 'error' ? 'text-[var(--error)]' : 'text-[var(--success-muted)]'} />
                    <p className="text-[12px] text-[var(--text-primary)]">{toast.message}</p>
                </div>
            )}
        </div>
    );
}
