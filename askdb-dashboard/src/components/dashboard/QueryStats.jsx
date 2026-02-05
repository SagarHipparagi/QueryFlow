import { CheckCircle, XCircle, Clock, Rows3 } from 'lucide-react';

export default function QueryStats({ executionTime, rowCount, status }) {
    if (!status) return null;

    const isSuccess = status === 'success';

    return (
        <div className="flex items-center gap-4 px-1 animate-fadeInUp">
            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium
        ${isSuccess
                    ? 'bg-[var(--success-soft)] text-[var(--success-muted)]'
                    : 'bg-[var(--error-soft)] text-[var(--error-muted)]'
                }`}
            >
                {isSuccess ? <CheckCircle size={10} /> : <XCircle size={10} />}
                {isSuccess ? 'Success' : 'Failed'}
            </div>

            {/* Execution Time */}
            {executionTime && (
                <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                    <Clock size={10} />
                    <span>Executed in {executionTime}ms</span>
                </div>
            )}

            {/* Row Count */}
            {isSuccess && rowCount !== undefined && (
                <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                    <Rows3 size={10} />
                    <span>{rowCount} row{rowCount !== 1 ? 's' : ''} returned</span>
                </div>
            )}
        </div>
    );
}
