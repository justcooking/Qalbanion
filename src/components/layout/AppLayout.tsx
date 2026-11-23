import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isEditorPage =
    location.pathname === '/journal/new' ||
    (location.pathname.startsWith('/journal/') && location.pathname !== '/journal');

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Mobile Top Navigation & Bottom Tab Bar */}
      <MobileNav />

      {/* Desktop & Tablet Persistent Sidebar */}
      <Sidebar />

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
    </div>
  );
};
