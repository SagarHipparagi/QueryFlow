import { Info, Sparkles } from 'lucide-react';

export function DemoModeBanner() {
    return (
        <div className="glass rounded-2xl p-4 border-l-2 border-[var(--warning)]">
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--warning-soft)]">
                    <Info size={16} className="text-[var(--warning)]" />
                </div>
                <div className="flex-1">
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">
                        Demo Mode Active
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                        Live AI responses are currently unavailable. You're viewing sample data for demonstration purposes.
                    </p>
                </div>
            </div>
        </div>
    );
}

export function SampleDataBadge() {
    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                    bg-[var(--warning-soft)] border border-[var(--warning)]/10
                    text-[10px] font-medium text-[var(--warning)]">
            <Sparkles size={10} />
            Sample Data
        </div>
    );
}

export function DemoModeNotice({ className = '' }) {
    return (
        <div className={`text-center py-3 ${className}`}>
            <p className="text-[10px] text-[var(--text-tertiary)]">
                Demo mode • Showing sample responses
            </p>
        </div>
    );
}
