import { useState, useEffect } from 'react';
import { User, Shield, Bell, Palette, Save, Check } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTheme } from '../context/ThemeContext';

const SETTINGS_STORAGE_KEY = 'queryflow_user_settings';

export default function Settings() {
    const { theme, toggleTheme } = useTheme();

    // Load settings from localStorage
    const [settings, setSettings] = useState(() => {
        try {
            const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
            return stored ? JSON.parse(stored) : {
                displayName: 'John Doe',
                email: 'john@example.com',
                notifications: true
            };
        } catch {
            return {
                displayName: 'John Doe',
                email: 'john@example.com',
                notifications: true
            };
        }
    });

    const [displayName, setDisplayName] = useState(settings.displayName);
    const [email, setEmail] = useState(settings.email);
    const [notifications, setNotifications] = useState(settings.notifications);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    const [showSuccess, setShowSuccess] = useState(false);

    // Detect changes
    useEffect(() => {
        const changed =
            displayName !== settings.displayName ||
            email !== settings.email ||
            notifications !== settings.notifications;
        setHasChanges(changed);
        if (changed) setShowSuccess(false); // Reset success state when user types
    }, [displayName, email, notifications, settings]);

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaveChanges = () => {
        setIsSaving(true);

        // Simulate save delay for better UX
        setTimeout(() => {
            const newSettings = {
                displayName,
                email,
                notifications
            };

            // Save to localStorage
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
            setSettings(newSettings);
            setIsSaving(false);
            setHasChanges(false);
            setShowSuccess(true); // Show success state
            showToast('Settings saved successfully');

            // Reset success message after 2 seconds
            setTimeout(() => setShowSuccess(false), 2000);

            // Dispatch custom event to update Avatar
            window.dispatchEvent(new Event('settingsUpdated'));
        }, 800);
    };

    return (
        <div className="space-y-5 animate-fadeInUp">
            {/* Page Header */}
            <div className="flex items-center justify-between mt-3 mb-8">
                <div>
                    <h1 className="text-[30px] font-medium text-[var(--text-primary)] tracking-[-0.025em]">
                        Settings
                    </h1>
                    <p className="text-[12px] text-[var(--text-tertiary)] mt-1.5 tracking-wide">
                        Manage your preferences
                    </p>
                </div>
                <Button
                    size="sm"
                    onClick={handleSaveChanges}
                    disabled={!hasChanges || isSaving}
                    variant={showSuccess ? "outline" : "primary"}
                    className={showSuccess ? "border-green-500/50 text-green-500 hover:text-green-600 hover:border-green-500" : ""}
                >
                    {isSaving ? (
                        <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : showSuccess ? (
                        <>
                            <Check size={14} />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save size={14} />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            {/* Settings Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Profile Section */}
                <GlassCard hover={false}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-lg bg-[var(--bg-elevated)]">
                            <User size={16} className="text-[var(--text-tertiary)]" />
                        </div>
                        <h3 className="text-[14px] font-medium text-[var(--text-primary)]">
                            Profile
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <Input
                            label="Display Name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                        <Input
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                        />

                        {/* Read-only fields */}
                        <div className="pt-2 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] text-[var(--text-tertiary)]">Role</span>
                                <span className="text-[12px] text-[var(--text-primary)] font-medium">Analyst</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] text-[var(--text-tertiary)]">Access Level</span>
                                <span className="px-2 py-0.5 text-[10px] font-medium rounded-md
                                    bg-[var(--accent-soft)] text-[var(--accent)]">
                                    Read-only
                                </span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Data Source & Security Section */}
                <GlassCard hover={false}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-lg bg-[var(--bg-elevated)]">
                            <Shield size={16} className="text-[var(--text-tertiary)]" />
                        </div>
                        <h3 className="text-[14px] font-medium text-[var(--text-primary)]">
                            Data Source & Security
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[var(--text-tertiary)]">Data Source</span>
                            <span className="text-[12px] text-[var(--text-primary)] font-medium">Inventory Database</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[var(--text-tertiary)]">Query Access</span>
                            <span className="text-[12px] text-[var(--text-secondary)] font-medium">
                                Read-only
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[var(--text-tertiary)]">SQL Safety</span>
                            <span className="text-[12px] text-[var(--text-secondary)] font-medium">
                                Enabled (SELECT only)
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[var(--text-tertiary)]">Environment</span>
                            <span className="text-[12px] text-[var(--text-secondary)] font-medium">
                                Demo
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[var(--text-tertiary)]">AI Status</span>
                            <span className="text-[12px] text-[var(--text-secondary)] font-medium">
                                Disabled (Demo Mode)
                            </span>
                        </div>
                    </div>
                </GlassCard>

                {/* Appearance Section */}
                <GlassCard hover={false}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-lg bg-[var(--bg-elevated)]">
                            <Palette size={16} className="text-[var(--text-tertiary)]" />
                        </div>
                        <h3 className="text-[14px] font-medium text-[var(--text-primary)]">
                            Appearance
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[13px] text-[var(--text-primary)]">Dark Mode</p>
                                <p className="text-[11px] text-[var(--text-tertiary)]">Follows system preference</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-12 h-6 rounded-full transition-all duration-200 relative
                ${theme === 'dark' ? 'bg-[var(--accent)]' : 'bg-[var(--text-quaternary)]'}`}
                            >
                                <span className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all duration-200 shadow-sm
                ${theme === 'dark' ? 'left-6' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </div>
                </GlassCard>

                {/* Notifications Section */}
                <GlassCard hover={false}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-lg bg-[var(--bg-elevated)]">
                            <Bell size={16} className="text-[var(--text-tertiary)]" />
                        </div>
                        <h3 className="text-[14px] font-medium text-[var(--text-primary)]">
                            Notifications
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[13px] text-[var(--text-primary)]">Query Notifications</p>
                                <p className="text-[11px] text-[var(--text-tertiary)]">Notifies when query execution completes</p>
                            </div>
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className={`w-12 h-6 rounded-full transition-all duration-200 relative
                ${notifications ? 'bg-[var(--accent)]' : 'bg-[var(--text-quaternary)]'}`}
                            >
                                <span className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all duration-200 shadow-sm
                ${notifications ? 'left-6' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeInUp">
                    <div className={`px-4 py-3 rounded-xl shadow-lg backdrop-blur-xl border flex items-center gap-2
                        ${toast.type === 'success'
                            ? 'bg-[var(--success-soft)] border-[var(--success-muted)]/20 text-[var(--success-muted)]'
                            : 'bg-[var(--error-soft)] border-[var(--error-muted)]/20 text-[var(--error-muted)]'
                        }`}
                    >
                        {toast.type === 'success' && <Check size={16} />}
                        <span className="text-[13px] font-medium">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
