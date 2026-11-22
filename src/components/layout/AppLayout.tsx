import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Mobile Top Navigation */}
      <MobileNav />

      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
