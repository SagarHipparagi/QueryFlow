import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="w-7 h-7 rounded-lg flex items-center justify-center
                 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]
                 hover:bg-[var(--bg-card)]
                 transition-all duration-200 ease-out"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun size={14} strokeWidth={1.5} />
            ) : (
                <Moon size={14} strokeWidth={1.5} />
            )}
        </button>
    );
}
