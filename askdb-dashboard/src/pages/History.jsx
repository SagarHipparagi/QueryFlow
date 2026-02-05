import { useState } from 'react';
import { Search, Trash2, RefreshCw, CheckCircle, XCircle, Star, Play, Clock } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import useQueryHistory from '../hooks/useQueryHistory';
import { getFavorites, removeFromFavorites } from '../utils/exportUtils';
import { useNavigate } from 'react-router-dom';

export default function History() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('history'); // 'history' or 'saved'
    const { history, clearHistory, deleteEntry, getTimeAgo } = useQueryHistory();
    const [favorites, setFavorites] = useState(getFavorites());
    const navigate = useNavigate();

    // Refresh favorites
    const refreshFavorites = () => {
        setFavorites(getFavorites());
    };

    // Filter history
    const filteredHistory = history.filter(item => {
        const matchesSearch = item.query.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || item.status === filter;
        return matchesSearch && matchesFilter;
    });

    // Filter saved queries
    const filteredSaved = favorites.filter(item =>
        item.query.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle rerun query
    const handleRerun = (query) => {
        // Navigate to dashboard with query
        navigate('/', { state: { query } });
    };

    // Handle delete saved query
    const handleDeleteSaved = (id) => {
        removeFromFavorites(id);
        refreshFavorites();
    };

    return (
        <div className="space-y-5 animate-fadeInUp">
            {/* Page Header */}
            <div className="flex items-center justify-between mt-3 mb-8">
                <div>
                    <h1 className="text-[30px] font-medium text-[var(--text-primary)] tracking-[-0.025em]">
                        Query History
                    </h1>
                    <p className="text-[12px] text-[var(--text-tertiary)] mt-1.5 tracking-wide">
                        View and manage your past queries
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={refreshFavorites}>
                    <RefreshCw size={14} />
                    Refresh
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[var(--border-subtle)]">
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2.5 text-[12px] font-medium transition-all duration-200 relative
                        ${activeTab === 'history'
                            ? 'text-[var(--accent)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                >
                    <Clock size={14} className="inline mr-1.5" />
                    History ({history.length})
                    {activeTab === 'history' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`px-4 py-2.5 text-[12px] font-medium transition-all duration-200 relative
                        ${activeTab === 'saved'
                            ? 'text-[var(--accent)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                >
                    <Star size={14} className="inline mr-1.5" />
                    Saved Queries ({favorites.length})
                    {activeTab === 'saved' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />
                    )}
                </button>
            </div>

            {/* Filters */}
            <GlassCard hover={false}>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search queries..."
                                className="w-full pl-9 pr-4 py-2.5 text-[12px]
                           bg-[var(--bg-card-solid)] text-[var(--text-primary)]
                           border border-[var(--border-color)] rounded-xl
                           placeholder:text-[var(--text-tertiary)]
                           focus:outline-none focus:border-[var(--accent)]/50
                           transition-all duration-200"
                            />
                        </div>
                    </div>
                    {activeTab === 'history' && (
                        <div className="flex gap-2">
                            {['all', 'success', 'error'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-200
                  ${filter === f
                                            ? 'bg-[var(--accent)]/[0.08] text-[var(--accent)]'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                        <h3 className="text-[12px] font-medium text-[var(--text-primary)]">
                            {filteredHistory.length} queries
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[var(--error-muted)]"
                            onClick={clearHistory}
                            disabled={history.length === 0}
                        >
                            <Trash2 size={12} />
                            Clear all
                        </Button>
                    </div>

                    <div className="divide-y divide-[var(--border-subtle)]">
                        {filteredHistory.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <p className="text-[12px] text-[var(--text-tertiary)]">
                                    {searchTerm ? 'No queries match your search' : 'No query history yet'}
                                </p>
                            </div>
                        ) : (
                            filteredHistory.map((item) => (
                                <div
                                    key={item.id}
                                    className="px-6 py-4 hover:bg-[var(--accent-soft)]/30 transition-colors duration-200 group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] text-[var(--text-primary)] truncate">
                                                {item.query}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[10px] text-[var(--text-tertiary)]">
                                                    {getTimeAgo(item.timestamp)}
                                                </span>
                                                {item.executionTime && (
                                                    <span className="text-[10px] text-[var(--text-tertiary)]">
                                                        {item.executionTime}ms
                                                    </span>
                                                )}
                                                {item.rows > 0 && (
                                                    <span className="text-[10px] text-[var(--text-tertiary)]">
                                                        {item.rows} rows
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleRerun(item.query)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                                                    hover:bg-[var(--bg-card)] transition-all duration-200"
                                                title="Rerun query"
                                            >
                                                <Play size={12} className="text-[var(--accent)]" />
                                            </button>
                                            <button
                                                onClick={() => deleteEntry(item.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                                                    hover:bg-[var(--bg-card)] transition-all duration-200"
                                                title="Delete"
                                            >
                                                <Trash2 size={12} className="text-[var(--error-muted)]" />
                                            </button>
                                            {item.status === 'success' ? (
                                                <CheckCircle size={14} className="text-[var(--success-muted)]" />
                                            ) : (
                                                <XCircle size={14} className="text-[var(--error-muted)]" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Saved Queries Tab */}
            {activeTab === 'saved' && (
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
                        <h3 className="text-[12px] font-medium text-[var(--text-primary)]">
                            {filteredSaved.length} saved queries
                        </h3>
                    </div>

                    <div className="divide-y divide-[var(--border-subtle)]">
                        {filteredSaved.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <Star size={24} className="mx-auto text-[var(--text-quaternary)] mb-2" />
                                <p className="text-[12px] text-[var(--text-tertiary)]">
                                    {searchTerm ? 'No saved queries match your search' : 'No saved queries yet'}
                                </p>
                                <p className="text-[10px] text-[var(--text-quaternary)] mt-1">
                                    Save queries from the Dashboard using Quick Actions
                                </p>
                            </div>
                        ) : (
                            filteredSaved.map((item) => (
                                <div
                                    key={item.id}
                                    className="px-6 py-4 hover:bg-[var(--accent-soft)]/30 transition-colors duration-200 group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] text-[var(--text-primary)] truncate">
                                                {item.query}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[10px] text-[var(--text-tertiary)]">
                                                    Saved {getTimeAgo(item.savedAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleRerun(item.query)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                                                    hover:bg-[var(--bg-card)] transition-all duration-200"
                                                title="Run query"
                                            >
                                                <Play size={12} className="text-[var(--accent)]" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSaved(item.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                                                    hover:bg-[var(--bg-card)] transition-all duration-200"
                                                title="Delete"
                                            >
                                                <Trash2 size={12} className="text-[var(--error-muted)]" />
                                            </button>
                                            <Star size={14} className="text-[var(--warning)] fill-[var(--warning)]" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
