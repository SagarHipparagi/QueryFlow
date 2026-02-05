import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, change, changeType = 'increase', icon: Icon, subtitle }) {
    const isPositive = changeType === 'increase';

    return (
        <div className="glass rounded-2xl p-6
                    transition-all duration-200 ease-out
                    hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5
                    animate-fadeInUp relative overflow-hidden">
            {/* Ghost Icon - More faded */}
            {Icon && (
                <div className="absolute top-5 right-5 opacity-[0.03]">
                    <Icon size={48} strokeWidth={0.8} />
                </div>
            )}

            <div className="relative space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-quaternary)] font-medium">
                    {title}
                </p>
                <p className="text-[34px] font-medium text-[var(--text-primary)] tracking-tight leading-none">
                    {value}
                </p>
                {subtitle && (
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5">
                        {subtitle}
                    </p>
                )}
                {change && !subtitle && (
                    <p className={`flex items-center gap-1 text-[10px] mt-2.5 font-medium ${isPositive ? 'text-[var(--success-muted)]' : 'text-[var(--error-muted)]'
                        }`}>
                        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        <span>{change}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
