import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  BookOpen,
  FolderTree,
  Sparkles,
  BarChart2,
  Settings,
  PenTool,
  Sun,
  Moon,
  Feather,
  Home,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/journal', label: 'Journal', icon: BookOpen },
    { to: '/collections', label: 'Collections', icon: FolderTree },
    { to: '/reflections', label: 'Reflections', icon: Sparkles },
    { to: '/insights', label: 'Insights', icon: BarChart2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleWriteClick = () => {
    setIsOpen(false);
    navigate('/journal/new');
  };

  return (
    <header className="md:hidden sticky top-0 z-40 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 py-3 select-none">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center border border-[var(--border-subtle)]">
            <Feather className="w-3.5 h-3.5" />
          </div>
          <span className="font-editorial text-xl font-medium tracking-tight text-[var(--text-primary)]">
            Qalbanion
          </span>
        </NavLink>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-300" />}
          </button>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-[57px] bg-[var(--bg-base)]/95 backdrop-blur-sm z-50 p-6 flex flex-col justify-between animate-in fade-in duration-150">
          <div className="space-y-4">
            <button
              onClick={handleWriteClick}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[var(--accent-olive)] text-white font-medium text-base shadow-sm cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>Write a thought</span>
            </button>

            <nav className="space-y-1.5 pt-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-[var(--border-subtle)] space-y-4">
            {/* User Account / Auth */}
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface-elevated)] text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-[var(--text-primary)]">
                    {profile?.display_name || user.email}
                  </span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="text-xs text-rose-500 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <NavLink
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-medium text-[var(--text-primary)]"
              >
                <LogIn className="w-4 h-4 text-[var(--accent-olive)]" />
                <span>Sign in to sync your journal</span>
              </NavLink>
            )}

            <div className="text-xs text-[var(--text-tertiary)] flex justify-between items-center">
              <span>A place to put your thoughts into words.</span>
              <span className="font-mono">v0.1.0</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
