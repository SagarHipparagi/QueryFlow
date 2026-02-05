import { useState, useEffect } from 'react';

const SETTINGS_STORAGE_KEY = 'queryflow_user_settings';

export default function Avatar({ src, alt, size = 'md', className = '' }) {
    const [displayName, setDisplayName] = useState('John Doe');

    // Load display name from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (stored) {
                const settings = JSON.parse(stored);
                setDisplayName(settings.displayName || 'John Doe');
            }
        } catch {
            setDisplayName('John Doe');
        }

        // Listen for storage changes
        const handleStorageChange = () => {
            try {
                const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
                if (stored) {
                    const settings = JSON.parse(stored);
                    setDisplayName(settings.displayName || 'John Doe');
                }
            } catch {
                setDisplayName('John Doe');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        // Also listen for custom event for same-tab updates
        window.addEventListener('settingsUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('settingsUpdated', handleStorageChange);
        };
    }, []);

    const sizes = {
        sm: 'w-7 h-7 text-[10px]',
        md: 'w-8 h-8 text-[11px]',
        lg: 'w-10 h-10 text-[13px]',
    };

    const name = alt || displayName;
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div
            className={`
        ${sizes[size]} rounded-full overflow-hidden
        bg-[var(--bg-secondary)]
        flex items-center justify-center text-[var(--text-secondary)] font-medium
        ring-1 ring-[var(--border-color)]
        ${className}
      `}
        >
            {src ? (
                <img src={src} alt={name} className="w-full h-full object-cover" />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
}
