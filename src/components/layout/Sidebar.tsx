import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FolderTree,
  Sparkles,
  BarChart2,
  Settings,
  PenTool,
  Sun,
  Moon,
  Feather,
  CloudCheck,
  Home,
  LogIn,
  LogOut,
  User as UserIcon,
  Download,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface SidebarProps {
  onNewEntry?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewEntry }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { isInstallable, installApp } = usePWAInstall();
  const navigate = useNavigate();

  const handleQuickNew = () => {
    if (onNewEntry) {
      onNewEntry();
    } else {
      navigate('/journal/new');
    }
  };

  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/journal', label: 'Journal', icon: BookOpen },
    { to: '/collections', label: 'Collections', icon: FolderTree },
    { to: '/reflections', label: 'Reflections', icon: Sparkles },
    { to: '/insights', label: 'Insights', icon: BarChart2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col md:w-18 lg:w-64 h-screen sticky top-0 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] px-2.5 lg:px-4 py-5 lg:py-6 select-none transition-all duration-200 shrink-0">
      {/* Brand Header */}
      <div className="px-1 lg:px-3 mb-6">
        <NavLink
          to="/home"
          className="group flex items-center justify-center lg:justify-start gap-2.5"
          title="Qalbanion — A companion for your heart"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center border border-[var(--border-subtle)] group-hover:scale-105 transition-transform shrink-0 shadow-xs">
            <Feather className="w-4 h-4" />
          </div>
          <div className="hidden lg:block min-w-0">
            <h1 className="font-editorial text-2xl font-medium tracking-tight text-[var(--text-primary)] leading-none truncate">
              Qalbanion
            </h1>
            <p className="text-[11px] text-[var(--text-tertiary)] tracking-wide mt-1 font-sans truncate">
              A companion for your heart
            </p>
          </div>
        </NavLink>
      </div>

      {/* Primary Write Button */}
      <div className="mb-6 flex justify-center lg:px-1">
        <button
          onClick={handleQuickNew}
          title="Write a thought"
          className="w-10 h-10 lg:w-full lg:h-auto flex items-center justify-center gap-2.5 lg:px-4 lg:py-2.5 rounded-xl bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white font-medium text-sm transition-all duration-150 shadow-sm active:scale-[0.98] cursor-pointer"
        >
          <PenTool className="w-4 h-4 shrink-0" />
          <span className="hidden lg:inline">Write a thought</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/home'}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center justify-center lg:justify-start gap-3 px-2.5 lg:px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--bg-surface-elevated)] text-[var(--accent-olive-text)] lg:text-[var(--text-primary)] font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]/60'
                }`
              }
            >
              <Icon className="w-4 h-4 stroke-[1.8] shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Area: User Account, Sync & Theme */}
      <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
        {/* User Account / Sign In Pill */}
        {user ? (
          <div className="flex items-center justify-center lg:justify-between p-1.5 lg:px-3 lg:py-2 rounded-xl bg-[var(--bg-surface-elevated)] text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-6 h-6 rounded-full bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center shrink-0"
                title={profile?.display_name || user.email || 'User Account'}
              >
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <span className="hidden lg:inline font-medium text-[var(--text-primary)] truncate">
                {profile?.display_name || user.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="hidden lg:block p-1 rounded text-[var(--text-tertiary)] hover:text-rose-500 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <NavLink
            to="/auth"
            title="Sign in to sync"
            className="flex items-center justify-center lg:justify-between p-2 lg:px-3 lg:py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:border-[var(--accent-olive)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <LogIn className="w-3.5 h-3.5 text-[var(--accent-olive)] shrink-0" />
              <span className="hidden lg:inline">Sign in to sync</span>
            </div>
            <span className="hidden lg:inline text-[10px] text-[var(--text-tertiary)]">Optional</span>
          </NavLink>
        )}

        {/* Install Desktop/Mobile Web App Button */}
        {isInstallable && (
          <button
            onClick={installApp}
            title="Install Qalbanion App"
            className="w-full flex items-center justify-center lg:justify-between p-2 lg:px-3 lg:py-2 rounded-xl bg-[var(--accent-olive-soft)] hover:bg-[var(--accent-olive)]/15 text-[var(--accent-olive)] border border-[var(--accent-olive)]/20 text-xs font-medium transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5 shrink-0" />
              <span className="hidden lg:inline">Install Qalbanion</span>
            </div>
            <span className="hidden lg:inline text-[10px] uppercase font-semibold tracking-wider opacity-70">App</span>
          </button>
        )}

        {/* Status Pill */}
        <div
          title={user ? 'Synced' : 'Saved on this device'}
          className="flex items-center justify-center lg:justify-between p-2 lg:px-3 lg:py-1.5 rounded-lg bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-tertiary)]"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span className="hidden lg:inline">{user ? 'Synced' : 'Saved'}</span>
          </div>
          <CloudCheck className="w-3.5 h-3.5 shrink-0 hidden lg:inline" />
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-center lg:justify-between px-1 lg:px-3">
          <span className="hidden lg:inline text-xs text-[var(--text-tertiary)] font-medium">Appearance</span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-300" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
