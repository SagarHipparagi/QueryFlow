import { Shield } from 'lucide-react';

export default function ReadOnlyBadge() {
    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                    bg-[var(--accent-soft)] border border-[var(--accent)]/10
                    text-[10px] font-medium text-[var(--accent)]">
            <Shield size={10} />
            Read-only mode
        </div>
    );
}
