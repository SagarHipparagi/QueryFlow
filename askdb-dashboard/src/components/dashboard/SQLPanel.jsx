import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

export default function SQLPanel({ sql, isOpen = false }) {
    const [open, setOpen] = useState(isOpen);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(sql);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!sql) return null;

    return (
        <div className="glass rounded-2xl overflow-hidden animate-fadeInUp">
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-5 py-3.5 flex items-center justify-between
                   text-left hover:bg-[var(--bg-card)]/50 transition-colors duration-200"
            >
                <span className="text-[12px] font-medium text-[var(--text-secondary)] flex items-center gap-2">
                    {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    Generated SQL
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)]">
                    {open ? 'Click to collapse' : 'Click to expand'}
                </span>
            </button>

            {open && (
                <div className="border-t border-[var(--border-subtle)]">
                    <div className="relative">
                        <pre className="px-5 py-4 text-[12px] font-mono text-[var(--text-primary)] 
                           bg-[var(--bg-card-solid)]/50 overflow-x-auto leading-relaxed">
                            {sql}
                        </pre>
                        <button
                            onClick={handleCopy}
                            className="absolute top-3 right-3 p-1.5 rounded-lg
                         text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]
                         hover:bg-[var(--bg-elevated)] transition-all duration-200"
                            title="Copy to clipboard"
                        >
                            {copied ? (
                                <Check size={14} className="text-[var(--success-muted)]" />
                            ) : (
                                <Copy size={14} />
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
