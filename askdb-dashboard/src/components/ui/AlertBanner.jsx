import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const variants = {
    error: {
        bg: 'bg-[var(--error-soft)]',
        border: 'border-l-[var(--error)]',
        icon: AlertCircle,
        iconColor: 'text-[var(--error)]',
    },
    success: {
        bg: 'bg-[var(--success-soft)]',
        border: 'border-l-[var(--success)]',
        icon: CheckCircle,
        iconColor: 'text-[var(--success)]',
    },
    warning: {
        bg: 'bg-orange-500/10',
        border: 'border-l-[var(--warning)]',
        icon: AlertTriangle,
        iconColor: 'text-[var(--warning)]',
    },
    info: {
        bg: 'bg-[var(--accent-soft)]',
        border: 'border-l-[var(--accent)]',
        icon: Info,
        iconColor: 'text-[var(--accent)]',
    },
};

export default function AlertBanner({ type = 'info', children, className = '' }) {
    const config = variants[type];
    const Icon = config.icon;

    return (
        <div
            className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        ${config.bg} border-l-[3px] ${config.border}
        text-[13px] text-[var(--text-primary)]
        ${className}
      `}
        >
            <Icon size={15} className={config.iconColor} strokeWidth={1.5} />
            <span>{children}</span>
        </div>
    );
}
