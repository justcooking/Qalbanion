import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  BookOpen,
  FolderTree,
  Compass,
  BarChart2,
  Settings,
  PenTool,
  Sun,
  Moon,
  Feather,
  Home,
  LogIn,
  LogOut,
  User as UserIcon,
  Download,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface MobileNavProps {
  onOpenPalette?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenPalette }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { isInstallable, installApp } = usePWAInstall();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we are currently inside the editor page
  const isEditorPage =
    location.pathname === '/journal/new' ||
    (location.pathname.startsWith('/journal/') && location.pathname !== '/journal');

  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/journal', label: 'Journal', icon: BookOpen },
    { to: '/collections', label: 'Collections', icon: FolderTree },
    { to: '/reflections', label: 'Reflections', icon: Compass },
    { to: '/insights', label: 'Insights', icon: BarChart2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleWriteClick = () => {
    setIsOpen(false);
    navigate('/journal/new');
  };

  return (
    <>
      {/* 1. TOP MOBILE HEADER (< md) */}
      <header className="md:hidden sticky top-0 z-30 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 py-2.5 select-none transition-colors">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <NavLink
            to="/home"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center border border-[var(--border-subtle)]">
              <Feather className="w-4 h-4 stroke-[1.5]" />
            </div>
            <span className="font-editorial text-xl font-medium tracking-tight text-[var(--text-primary)]">
              Qalbanion
            </span>
          </NavLink>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenPalette}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
              aria-label="Search"
              title="Search"
            >
              <Search className="w-4 h-4 stroke-[1.5]" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 stroke-[1.5]" /> : <Sun className="w-4 h-4 stroke-[1.5]" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
              aria-label="Open menu"
            >
              {isOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Menu className="w-5 h-5 stroke-[1.5]" />}
            </button>
          </div>
        </div>

        {/* Full-Screen Drawer / Slide-Over Menu */}
        {isOpen && (
          <div className="fixed inset-0 top-[53px] bg-[var(--bg-base)] z-50 p-5 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-150">
            <div className="space-y-4">
              <div className="space-y-2">
                <button
                  onClick={handleWriteClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--accent-olive)] text-white font-medium text-base cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <PenTool className="w-4 h-4 stroke-[1.5]" />
                  <span>Write a thought</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (onOpenPalette) onOpenPalette();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4 stroke-[1.5] text-[var(--text-tertiary)]" />
                  <span>Search</span>
                </button>
              </div>

              <nav className="space-y-1 pt-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/home'}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]/60 border border-transparent'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 stroke-[1.5]" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-5 border-t border-[var(--border-subtle)] space-y-3 pb-8">
              {isInstallable && (
                <button
                  onClick={() => {
                    installApp();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] text-xs font-medium border border-[var(--accent-olive)]/20 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Install Qalbanion App</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">PWA</span>
                </button>
              )}

              {/* User Account / Auth */}
              {user ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface-elevated)] text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-[var(--text-primary)] truncate">
                      {profile?.display_name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="text-xs text-rose-500 font-medium flex items-center gap-1 cursor-pointer p-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs font-medium text-[var(--text-primary)]"
                >
                  <LogIn className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
                  <span>Sign in to sync your journal</span>
                </NavLink>
              )}

              <div className="text-[11px] text-[var(--text-tertiary)] text-center px-1">
                <span>A companion for your heart.</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 2. FIXED BOTTOM TAB BAR (< md) */}
      {!isEditorPage && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-lg border-t border-[var(--border-subtle)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 select-none shadow-lg transition-colors"
        >
          <div className="flex items-center justify-around max-w-lg mx-auto">
            {/* Home */}
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-colors ${
                  isActive
                    ? 'text-[var(--accent-olive)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <Home className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[10px] mt-0.5">Home</span>
            </NavLink>

            {/* Journal */}
            <NavLink
              to="/journal"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-colors ${
                  isActive
                    ? 'text-[var(--accent-olive)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <BookOpen className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[10px] mt-0.5">Journal</span>
            </NavLink>

            {/* Write Button (Prominent Center Action) */}
            <button
              onClick={handleWriteClick}
              aria-label="Write a thought"
              className="flex items-center justify-center w-11 h-11 -mt-3 rounded-full bg-[var(--accent-olive)] text-white shadow-md active:scale-95 transition-transform cursor-pointer border-2 border-[var(--bg-surface)]"
            >
              <PenTool className="w-5 h-5" />
            </button>

            {/* Collections */}
            <NavLink
              to="/collections"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-colors ${
                  isActive
                    ? 'text-[var(--accent-olive)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <FolderTree className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[10px] mt-0.5">Collections</span>
            </NavLink>

            {/* More Drawer Trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="More navigation options"
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-colors cursor-pointer ${
                isOpen
                  ? 'text-[var(--accent-olive)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <MoreHorizontal className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[10px] mt-0.5">More</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
};
