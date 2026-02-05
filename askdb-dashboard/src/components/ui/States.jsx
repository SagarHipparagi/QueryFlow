import { FileQuestion, AlertCircle, Database } from 'lucide-react';

export function EmptyState({
    icon: Icon = FileQuestion,
    title = 'No results',
    message = 'Try running a query to see results here.',
    className = ''
}) {
    return (
        <div className={`py-16 text-center ${className}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--bg-elevated)] mb-4">
                <Icon size={20} className="text-[var(--text-tertiary)]" strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-medium text-[var(--text-secondary)] mb-1">
                {title}
            </p>
            <p className="text-[12px] text-[var(--text-tertiary)] max-w-xs mx-auto">
                {message}
            </p>
        </div>
    );
}

export function ErrorState({
    title = 'Something went wrong',
    message = 'We couldn\'t complete your request. Please try again.',
    onRetry,
    className = ''
}) {
    return (
        <div className={`py-12 text-center ${className}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--error-soft)] mb-4">
                <AlertCircle size={20} className="text-[var(--error-muted)]" strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-medium text-[var(--text-secondary)] mb-1">
                {title}
            </p>
            <p className="text-[12px] text-[var(--text-tertiary)] max-w-xs mx-auto mb-4">
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="text-[12px] font-medium text-[var(--accent)] hover:underline"
                >
                    Try again
                </button>
            )}
        </div>
    );
}

export function ConnectionError({ onRetry }) {
    return (
        <div className="glass rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--warning)]/10 mb-4">
                <Database size={24} className="text-[var(--warning)]" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-medium text-[var(--text-primary)] mb-1">
                Database connection failed
            </p>
            <p className="text-[12px] text-[var(--text-tertiary)] max-w-sm mx-auto mb-5">
                We're having trouble connecting to the database. Check your connection settings or try again.
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 text-[12px] font-medium text-[var(--accent)] 
                     bg-[var(--accent-soft)] rounded-xl hover:bg-[var(--accent-muted)]
                     transition-colors duration-200"
                >
                    Retry connection
                </button>
            )}
        </div>
    );
}
