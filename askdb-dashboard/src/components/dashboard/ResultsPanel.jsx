import GlassCard from '../ui/GlassCard';
import DataTable from '../ui/DataTable';

export default function ResultsPanel({ result, isLoading }) {
    if (isLoading) {
        return (
            <GlassCard hover={false}>
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
                </div>
            </GlassCard>
        );
    }

    if (!result) {
        return (
            <GlassCard hover={false}>
                <div className="text-center py-12">
                    <p className="text-[var(--text-tertiary)]">
                        Submit a query to see results
                    </p>
                </div>
            </GlassCard>
        );
    }

    // If result is a simple string/value
    if (typeof result === 'string' || typeof result === 'number') {
        return (
            <GlassCard hover={false}>
                <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">
                        Result
                    </h3>
                    <p className="text-lg text-[var(--text-primary)]">{result}</p>
                </div>
            </GlassCard>
        );
    }

    // If result is an array (table data)
    if (Array.isArray(result) && result.length > 0) {
        const columns = Object.keys(result[0]).map(key => ({
            header: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            accessor: key,
        }));

        return (
            <GlassCard hover={false} className="p-0 overflow-hidden">
                <div className="p-5 border-b border-[var(--border-color)]">
                    <h3 className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">
                        Query Results
                    </h3>
                </div>
                <DataTable columns={columns} data={result} />
            </GlassCard>
        );
    }

    return null;
}
