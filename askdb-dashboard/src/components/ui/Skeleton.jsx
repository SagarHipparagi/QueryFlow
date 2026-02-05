export default function Skeleton({ className = '', variant = 'text' }) {
    const variants = {
        text: 'h-4 rounded',
        title: 'h-8 rounded',
        circle: 'rounded-full',
        rect: 'rounded-2xl',
    };

    return (
        <div
            className={`
        animate-pulse bg-[var(--text-quaternary)]/30
        ${variants[variant]}
        ${className}
      `}
        />
    );
}

export function MetricCardSkeleton() {
    return (
        <div className="glass rounded-2xl p-6">
            <div className="space-y-3">
                <Skeleton variant="text" className="w-16 h-2.5" />
                <Skeleton variant="title" className="w-20 h-8" />
                <Skeleton variant="text" className="w-12 h-2.5 mt-2" />
            </div>
        </div>
    );
}

export function QueryInputSkeleton() {
    return (
        <div className="glass rounded-2xl p-6">
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Skeleton variant="text" className="w-24 h-3" />
                    <Skeleton variant="text" className="w-32 h-2" />
                </div>
                <div className="flex gap-3">
                    <Skeleton variant="rect" className="flex-1 h-12" />
                    <Skeleton variant="rect" className="w-28 h-12" />
                </div>
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5, columns = 6 }) {
    return (
        <div className="overflow-hidden">
            {/* Header */}
            <div className="flex gap-4 px-4 py-3 border-b border-[var(--border-subtle)]">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} variant="text" className="w-12 h-2.5" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="flex gap-4 px-4 py-3.5 border-t border-[var(--border-subtle)]"
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            variant="text"
                            className={`h-3 ${colIndex === 0 ? 'w-8' : 'w-14'}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton({ lines = 3 }) {
    return (
        <div className="glass rounded-2xl p-6 space-y-3">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    className={`h-3 ${i === 0 ? 'w-1/3' : i === lines - 1 ? 'w-1/2' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

export function RecentQueriesSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5">
                    <Skeleton variant="circle" className="w-1.5 h-1.5 mt-1.5" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton variant="text" className="w-full h-3" />
                        <Skeleton variant="text" className="w-16 h-2" />
                    </div>
                </div>
            ))}
        </div>
    );
}
