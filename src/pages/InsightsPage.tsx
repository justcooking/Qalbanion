import React from 'react';
import { Tag, HelpCircle } from 'lucide-react';

export const InsightsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="font-editorial text-4xl font-normal tracking-tight text-[var(--text-primary)]">
          Insights
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Patterns, recurring themes, and the evolution of your thoughts over time.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">Total entries</span>
          <p className="font-editorial text-3xl font-medium text-[var(--text-primary)] mt-1">12</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">Collections</span>
          <p className="font-editorial text-3xl font-medium text-[var(--text-primary)] mt-1">3</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">Avg. Length</span>
          <p className="font-editorial text-3xl font-medium text-[var(--text-primary)] mt-1">180 w</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">Unresolved</span>
          <p className="font-editorial text-3xl font-medium text-[var(--text-primary)] mt-1">2</p>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recurring Themes */}
        <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <Tag className="w-4 h-4 text-[var(--accent-olive)]" />
            <h2 className="font-editorial text-xl font-medium">Frequent Themes</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Subject areas derived from your user tags and collections.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {['Patience', 'Deep Work', 'Architecture', 'Habits', 'Philosophy', 'Family'].map((theme) => (
              <span
                key={theme}
                className="px-2.5 py-1 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] text-xs font-medium border border-[var(--border-subtle)]"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>

        {/* Unresolved Thoughts */}
        <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <HelpCircle className="w-4 h-4 text-[var(--accent-olive)]" />
            <h2 className="font-editorial text-xl font-medium">Unresolved Questions</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Thoughts marked as open questions to explore rather than tasks to check off.
          </p>
          <div className="space-y-2 pt-1 text-xs text-[var(--text-secondary)]">
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] flex items-start gap-2">
              <span className="text-[var(--accent-olive)] font-bold">?</span>
              <span>How do I best balance depth of craft with broad exploration?</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
