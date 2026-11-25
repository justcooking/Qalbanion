import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FolderTree,
  Compass,
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
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface SidebarProps {
  onNewEntry?: () => void;
  onOpenPalette?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewEntry, onOpenPalette }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { isInstallable, installApp } = usePWAInstall();
  const navigate = useNavigate();

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('qalbanion_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('qalbanion_sidebar_collapsed', String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

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
    { to: '/reflections', label: 'Reflections', icon: Compass },
    { to: '/insights', label: 'Insights', icon: BarChart2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] py-5 lg:py-6 select-none transition-[width,padding] duration-200 shrink-0 ${
        isCollapsed ? 'w-18 px-2.5' : 'w-18 lg:w-64 px-2.5 lg:px-4'
      }`}
    >
      {/* Brand Header */}
      <div className={`mb-6 flex items-center ${isCollapsed ? 'justify-center px-1' : 'justify-center lg:justify-between px-1 lg:px-3'}`}>
        <NavLink
          to="/home"
          className="flex items-center gap-2.5 min-w-0"
          title="Qalbanion — A companion for your heart"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center border border-[var(--border-subtle)] shrink-0">
            <Feather className="w-4 h-4 stroke-[1.5]" />
          </div>
          {!isCollapsed && (
            <div className="hidden lg:block min-w-0">
              <h1 className="font-editorial text-2xl font-medium tracking-tight text-[var(--text-primary)] leading-none truncate">
                Qalbanion
              </h1>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 font-sans truncate">
                A companion for your heart
              </p>
            </div>
          )}
        </NavLink>

        {!isCollapsed && (
          <button
            type="button"
            onClick={toggleCollapse}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="hidden lg:flex p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer shrink-0"
          >
            <PanelLeftClose className="w-4 h-4 stroke-[1.5]" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="hidden lg:flex justify-center mb-3">
          <button
            type="button"
            onClick={toggleCollapse}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="w-10 h-9 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
      )}

      {/* Primary Write Button */}
      <div className={`mb-3 flex justify-center ${isCollapsed ? '' : 'lg:px-1'}`}>
        <button
          onClick={handleQuickNew}
          title="Write a thought"
          className={`flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white font-medium text-sm transition-colors duration-150 active:scale-[0.98] cursor-pointer ${
            isCollapsed ? 'w-10 h-10' : 'w-10 h-10 lg:w-full lg:h-9 lg:px-4'
          }`}
        >
          <PenTool className="w-4 h-4 stroke-[1.5] shrink-0" />
          {!isCollapsed && <span className="hidden lg:inline whitespace-nowrap">Write a thought</span>}
        </button>
      </div>

      {/* Quick Search / Command Palette Trigger */}
      <div className={`mb-5 flex justify-center ${isCollapsed ? '' : 'lg:px-1'}`}>
        <button
          type="button"
          onClick={onOpenPalette}
          title={`Search (${modKey}+K)`}
          className={`flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:border-[var(--border-strong)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer group ${
            isCollapsed ? 'w-10 h-10 justify-center' : 'w-10 h-10 lg:w-full lg:h-9 lg:px-3'
          }`}
        >
          <div className={`flex items-center gap-2 ${isCollapsed ? 'mx-auto' : 'mx-auto lg:mx-0'}`}>
            <Search className="w-4 h-4 stroke-[1.5] text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors shrink-0" />
            {!isCollapsed && <span className="hidden lg:inline text-xs">Search</span>}
          </div>
          {!isCollapsed && (
            <kbd className="hidden lg:inline text-[11px] font-mono px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-tertiary)]">
              {modKey} K
            </kbd>
          )}
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
                `flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-sm font-medium transition-colors ${
                  isCollapsed ? 'justify-center' : 'justify-center lg:justify-start lg:px-3'
                } ${
                  isActive
                    ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]/60 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 stroke-[1.5] shrink-0" />
              {!isCollapsed && <span className="hidden lg:inline">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Area: User Account, Sync & Theme */}
      <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
        {/* User Account / Sign In Pill */}
        {user ? (
          <div className={`flex items-center p-1.5 rounded-xl bg-[var(--bg-surface-elevated)] text-xs ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-between lg:px-3 lg:py-2'}`}>
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-6 h-6 rounded-full bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center shrink-0"
                title={profile?.display_name || user.email || 'User Account'}
              >
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              {!isCollapsed && (
                <span className="hidden lg:inline font-medium text-[var(--text-primary)] truncate">
                  {profile?.display_name || user.email?.split('@')[0]}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={() => signOut()}
                className="hidden lg:block p-1 rounded text-[var(--text-tertiary)] hover:text-rose-500 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <NavLink
            to="/auth"
            title="Sign in to sync"
            className={`flex items-center p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:border-[var(--accent-olive)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-between lg:px-3 lg:py-2'}`}
          >
            <div className="flex items-center gap-2">
              <LogIn className="w-3.5 h-3.5 text-[var(--accent-olive)] shrink-0" />
              {!isCollapsed && <span className="hidden lg:inline">Sign in to sync</span>}
            </div>
            {!isCollapsed && <span className="hidden lg:inline text-[10px] text-[var(--text-tertiary)]">Optional</span>}
          </NavLink>
        )}

        {/* Install Desktop/Mobile Web App Button */}
        {isInstallable && (
          <button
            onClick={installApp}
            title="Install Qalbanion App"
            className={`w-full flex items-center p-2 rounded-lg bg-[var(--accent-olive-soft)] hover:bg-[var(--accent-olive)]/15 text-[var(--accent-olive)] border border-[var(--accent-olive)]/20 text-xs font-medium transition-colors cursor-pointer group ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-between lg:px-3 lg:py-2'}`}
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 stroke-[1.5] shrink-0" />
              {!isCollapsed && <span className="hidden lg:inline">Install Qalbanion</span>}
            </div>
            {!isCollapsed && <span className="hidden lg:inline text-[11px] font-mono opacity-75">App</span>}
          </button>
        )}

        {/* Status Pill */}
        <div
          title={user ? 'Synced' : 'Saved on this device'}
          className={`flex items-center p-2 rounded-lg bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-tertiary)] ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-between lg:px-3 lg:py-1.5'}`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] dark:bg-[#4cc38a] shrink-0" />
            {!isCollapsed && <span className="hidden lg:inline">{user ? 'Synced' : 'Saved'}</span>}
          </div>
          {!isCollapsed && <CloudCheck className="w-4 h-4 stroke-[1.5] shrink-0 hidden lg:inline" />}
        </div>

        {/* Theme Toggle */}
        <div className={`flex items-center px-1 ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-between lg:px-3'}`}>
          {!isCollapsed && <span className="hidden lg:inline text-xs text-[var(--text-tertiary)] font-medium">Appearance</span>}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 stroke-[1.5]" />
            ) : (
              <Sun className="w-4 h-4 stroke-[1.5]" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
