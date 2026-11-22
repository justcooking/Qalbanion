import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Download, ShieldCheck, HardDrive } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-8 max-w-2xl animate-in fade-in duration-200">
      <div>
        <h1 className="font-editorial text-4xl font-normal tracking-tight text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Preferences, theme, data ownership, and export tools.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <section className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-editorial text-xl font-medium text-[var(--text-primary)]">Appearance</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Toggle between warm ivory light mode and deep charcoal dark mode.</p>
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

        {/* Data Ownership & Export */}
        <section className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
          <div>
            <h2 className="font-editorial text-xl font-medium text-[var(--text-primary)]">Data Ownership & Export</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">You own 100% of your writing. Export your entire journal anytime without vendor lock-in.</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-elevated)]/80 text-xs font-medium text-[var(--text-primary)] transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Export as Markdown (.md)</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-elevated)]/80 text-xs font-medium text-[var(--text-primary)] transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Export as JSON</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-elevated)]/80 text-xs font-medium text-[var(--text-primary)] transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Export as Plain Text (.txt)</span>
            </button>
          </div>
        </section>

        {/* Local & Cloud Storage Status */}
        <section className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[var(--accent-olive)]" />
            <h2 className="font-editorial text-xl font-medium text-[var(--text-primary)]">Local Persistence</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            IndexedDB draft storage is active. Your entries are saved locally keystroke-by-keystroke to ensure no thought is ever lost even if you close the browser abruptly.
          </p>
        </section>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] pt-2">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-olive)]" />
          <span>Qalbanion never sells your data, runs ads, or forces AI analysis.</span>
        </div>
      </div>
    </div>
  );
};
