import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../hooks/useJournal';
import { useCollections } from '../hooks/useCollections';
import { exportToMarkdown, exportToPlainText, exportToJSON, downloadFile } from '../utils/export';
import { AIWorkspaceModal } from '../components/ai/AIWorkspaceModal';
import { TypographySettings } from '../components/settings/TypographySettings';
import {
  Sun,
  Moon,
  Download,
  ShieldCheck,
  HardDrive,
  Sparkles,
  User as UserIcon,
  LogOut,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { entries } = useJournal();
  const { collections, tags } = useCollections();

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportMarkdown = () => {
    const md = exportToMarkdown(entries, collections, tags);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(md, `qalbanion-journal-${date}.md`, 'text/markdown');
    showNotice('Exported journal as Markdown (.md)');
  };

  const handleExportTxt = () => {
    const txt = exportToPlainText(entries);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(txt, `qalbanion-journal-${date}.txt`, 'text/plain');
    showNotice('Exported journal as Plain Text (.txt)');
  };

  const handleExportJson = () => {
    const json = exportToJSON(entries, collections, tags);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(json, `qalbanion-backup-${date}.json`, 'application/json');
    showNotice('Exported full archive as JSON');
  };

  const showNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-2xl animate-in fade-in duration-200 pb-16">
      <div>
        <h1 className="font-editorial text-4xl font-normal tracking-tight text-[var(--text-primary)]">
          Settings & Data Ownership
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Preferences, export controls, and account management.
        </p>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Account Section */}
        <section className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-editorial text-xl font-medium text-[var(--text-primary)]">
                User Account
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {user ? `Logged in as ${profile?.display_name || user.email}` : 'Using local guest mode.'}
              </p>
            </div>
            {user ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <a
                href="/auth"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-olive)] text-white text-xs font-medium cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In to Sync</span>
              </a>
            )}
          </div>
        </section>

        {/* Appearance */}
        <section className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-editorial text-xl font-medium text-[var(--text-primary)]">
                Appearance
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Toggle between warm ivory light mode and deep charcoal dark mode.
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent-olive)] transition-colors cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span>Light mode</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Typography & Aesthetic Font Customizer */}
        <TypographySettings />

        {/* Optional AI Assistant */}
        <section className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--accent-olive)]" />
                <h2 className="font-editorial text-xl font-medium text-[var(--text-primary)]">
                  Optional AI Assistant
                </h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Explore patterns and reflection prompts across hand-selected entries.
              </p>
            </div>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open AI Workspace</span>
            </button>
          </div>
        </section>

        {/* Data Ownership & Export */}
        <section className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
          <div>
            <h2 className="font-editorial text-xl font-medium text-[var(--text-primary)]">
              Complete Data Ownership & Export
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              You own 100% of your writing. Export your entire journal archive anytime with zero lock-in.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-elevated)]/80 text-xs font-medium text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
              <span>Export Markdown (.md)</span>
            </button>

            <button
              onClick={handleExportTxt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-elevated)]/80 text-xs font-medium text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
              <span>Export Plain Text (.txt)</span>
            </button>

            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-elevated)]/80 text-xs font-medium text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
              <span>Export Complete JSON Backup</span>
            </button>
          </div>
        </section>

        {/* Local Persistence Status */}
        <section className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[var(--accent-olive)]" />
            <h2 className="font-editorial text-xl font-medium text-[var(--text-primary)]">
              Local Persistence & Offline Cache
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            IndexedDB storage is active. Your journal is cached locally so you can read and write without an internet connection. Changes sync to Supabase when reconnected.
          </p>
        </section>

        {/* Privacy Declaration */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] pt-2">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-olive)] shrink-0" />
          <span>
            Qalbanion enforces strict multi-tenant Row Level Security (RLS) on all user data.
          </span>
        </div>
      </div>

      {/* AI Workspace Modal */}
      <AIWorkspaceModal
        entries={entries}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
};
