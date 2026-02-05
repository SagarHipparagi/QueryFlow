import { X, Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-[var(--bg-elevated)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden scale-in-center">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)]/50">
                    <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                        Help & Support
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-[var(--bg-card-solid)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-3">
                            <MessageCircle size={24} className="text-[var(--accent)]" />
                        </div>
                        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                            Have questions or need assistance? <br />
                            Reach out to our support team directly.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="group p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-all duration-200">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-[var(--bg-base)] text-[var(--text-secondary)]">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">Phone Support</p>
                                    <a href="tel:+919380452790" className="text-[14px] text-[var(--text-primary)] font-medium hover:text-[var(--accent)] transition-colors">
                                        +91 93804 52790
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="group p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-all duration-200">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-[var(--bg-base)] text-[var(--text-secondary)]">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">Email Support</p>
                                    <a href="mailto:gajulapavan29@gmail.com" className="text-[14px] text-[var(--text-primary)] font-medium hover:text-[var(--accent)] transition-colors">
                                        gajulapavan29@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium transition-all shadow-lg shadow-[var(--accent)]/20 active:scale-[0.98]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
