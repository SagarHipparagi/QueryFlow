import { Link, useLocation } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import Avatar from '../ui/Avatar';

const pageTitles = {
    '/': 'Dashboard',
    '/queries': 'Query Builder',
    '/history': 'History',
    '/settings': 'Settings',
};

export default function Navbar() {
    const location = useLocation();
    const pageTitle = pageTitles[location.pathname] || '';

    return (
        <nav className="fixed top-0 left-0 right-0 h-12 z-50 glass-navbar">
            <div className="h-full px-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 min-w-[160px]">
                    <img
                        src="/logo.png"
                        alt="QueryFlow"
                        className="w-6 h-6 rounded-full"
                    />
                    <span className="text-[14px] font-medium tracking-tight text-[var(--text-primary)]">
                        QueryFlow
                    </span>
                </Link>

                {/* Center - Page Title */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                    <span className="text-[12px] font-medium text-[var(--text-secondary)] tracking-wide">
                        {pageTitle}
                    </span>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-1.5">
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center
                           text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]
                           hover:bg-[var(--bg-card)] transition-all duration-200 relative">
                        <Bell size={14} strokeWidth={1.5} />
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[var(--error)] rounded-full"></span>
                    </button>

                    <ThemeToggle />

                    <div className="w-px h-4 bg-[var(--border-color)] mx-1"></div>

                    <Link to="/settings">
                        <Avatar size="sm" />
                    </Link>

                    <Link
                        to="/login"
                        className="flex items-center gap-1 px-2 py-1 text-[12px] text-[var(--text-tertiary)]
                       hover:text-[var(--text-secondary)] transition-all duration-200 rounded-md
                       hover:bg-[var(--bg-card)]"
                    >
                        <LogOut size={13} strokeWidth={1.5} />
                        <span className="hidden sm:inline">Logout</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
