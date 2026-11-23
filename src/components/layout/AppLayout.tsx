import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { CommandPalette } from '../navigation/CommandPalette';
import { KeyboardShortcutsModal } from '../editor/KeyboardShortcutsModal';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const isEditorPage =
    location.pathname === '/journal/new' ||
    (location.pathname.startsWith('/journal/') && location.pathname !== '/journal');

  // Global Keydown Listeners for Command Palette (Ctrl+K) & Shortcuts (Ctrl+/)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ctrl+K or Cmd+K: Command Palette
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
        return;
      }

      // 2. Ctrl+/ or Cmd+/: Shortcuts Guide
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Mobile Top Navigation & Bottom Tab Bar */}
      <MobileNav
        onOpenPalette={() => setIsPaletteOpen(true)}
      />

      {/* Desktop & Tablet Persistent Sidebar */}
      <Sidebar
        onOpenPalette={() => setIsPaletteOpen(true)}
      />

      {/* Main Content Area: Responsive padding with safe-area spacing */}
      <main
        className={`flex-1 flex flex-col min-w-0 overflow-y-auto ${
          isEditorPage ? 'pb-8 md:pb-0' : 'pb-24 md:pb-0'
        }`}
      >
        <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-5 sm:py-8 lg:py-10">
          {children || <Outlet />}
        </div>
      </main>

      {/* Global Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onOpenShortcuts={() => {
          setIsPaletteOpen(false);
          setIsShortcutsOpen(true);
        }}
      />

      {/* Global Keyboard Shortcuts Guide (Cmd+/ / Ctrl+/) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
