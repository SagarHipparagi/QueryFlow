import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function RecentQueries({ queries = [], loading = false, onRerun }) {
    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 animate-pulse">
                        <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[var(--text-quaternary)]/30" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-[var(--text-quaternary)]/30 rounded w-full" />
                            <div className="h-2 bg-[var(--text-quaternary)]/30 rounded w-16" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (queries.length === 0) {
        return (
            <p className="text-[12px] text-[var(--text-tertiary)] text-center py-4">
                No recent queries
            </p>
        );
    }

    return (
        <div className="space-y-0.5">
            {queries.map((item, i) => (
                <div
                    key={i}
                    className="group flex items-start gap-2.5 p-2.5 -mx-2.5 rounded-lg
                     hover:bg-[var(--bg-card)]/50 cursor-pointer transition-all duration-200"
                >
                    {/* Status Indicator */}
                    <div className={`w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0 ${item.status === 'success' ? 'bg-[var(--success-muted)]' : 'bg-[var(--error-muted)]'
                        }`} />

                    {/* Query Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[var(--text-primary)] truncate leading-snug">
                            {item.query}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-[var(--text-tertiary)]">
                                {item.time}
                            </span>
                            {item.executionTime && (
                                <>
                                    <span className="text-[var(--text-quaternary)]">·</span>
                                    <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-0.5">
                                        <Clock size={9} />
                                        {item.executionTime}ms
                                    </span>
                                </>
                            )}
                            {item.rows !== undefined && item.status === 'success' && (
                                <>
                                    <span className="text-[var(--text-quaternary)]">·</span>
                                    <span className="text-[10px] text-[var(--text-tertiary)]">
                                        {item.rows} rows
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Status Icon & Rerun Button */}
                    <div className="flex items-center gap-1">
                        {item.status === 'success' ? (
                            <CheckCircle size={12} className="text-[var(--success-muted)] opacity-60" />
                        ) : (
                            <XCircle size={12} className="text-[var(--error-muted)] opacity-60" />
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRerun?.(item.query);
                            }}
                            className="p-1 rounded opacity-0 group-hover:opacity-100
                         text-[var(--text-tertiary)] hover:text-[var(--accent)]
                         hover:bg-[var(--accent-soft)] transition-all duration-200"
                            title="Run again"
                        >
                            <Play size={10} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
