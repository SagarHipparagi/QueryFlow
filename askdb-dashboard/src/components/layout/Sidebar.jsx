import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Database,
    History,
    Settings,
    ChevronLeft,
    ChevronRight,
    HelpCircle
} from 'lucide-react';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/queries', icon: Database, label: 'Query Builder' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle, onOpenHelp }) {
    return (
        <aside
            className={`
        fixed left-0 top-12 h-[calc(100vh-3rem)] z-40
        glass-sidebar border-r border-[var(--border-subtle)]
        transition-all duration-300 ease-out flex flex-col
        ${collapsed ? 'w-14' : 'w-48'}
      `}
        >
            <nav className="flex-1 px-2 py-5 space-y-1">
                {navItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) => `
              flex items-center gap-2.5 px-3 py-2.5 rounded-xl
              text-[12px] font-medium transition-all duration-200
              ${isActive
                                ? 'bg-[var(--accent)]/[0.06] text-[var(--accent)] border border-[var(--accent)]/[0.08]'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]/60 hover:text-[var(--text-primary)]'
                            }
              ${collapsed ? 'justify-center px-2' : ''}
            `}
                        title={collapsed ? label : undefined}
                    >
                        <Icon size={16} strokeWidth={1.5} className="opacity-70" />
                        {!collapsed && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="px-2 py-4 border-t border-[var(--border-subtle)] space-y-1">
                <button
                    onClick={onOpenHelp}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                     text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]
                     hover:bg-[var(--bg-card)]/60 transition-all duration-200
                     ${collapsed ? 'justify-center px-2' : ''}`}
                >
                    <HelpCircle size={16} strokeWidth={1.5} className="opacity-50" />
                    {!collapsed && <span>Help</span>}
                </button>

                <button
                    onClick={onToggle}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                     text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]
                     hover:bg-[var(--bg-card)]/60 transition-all duration-200
                     ${collapsed ? 'justify-center px-2' : ''}`}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    {!collapsed && <span className="text-[12px]">Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
