import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../hooks/useJournal';
import { useCollections } from '../hooks/useCollections';
import {
  BarChart2,
  Tag,
  HelpCircle,
  Sparkles,
  ArrowRight,
  GitCompare,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const { entries } = useJournal();
  const { collections, tags } = useCollections();

  const [activeTab, setActiveTab] = useState<'patterns' | 'evolution' | 'unresolved'>('patterns');

  // Thought evolution selection state
  const [selectedEntryAId, setSelectedEntryAId] = useState<string>('');
  const [selectedEntryBId, setSelectedEntryBId] = useState<string>('');

  // 1. Activity Metrics
  const activeEntries = useMemo(() => entries.filter((e) => e.status !== 'trashed'), [entries]);

  const totalEntries = activeEntries.length;
  const totalWords = activeEntries.reduce((sum, e) => sum + (e.word_count || 0), 0);
  const avgWords = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

  // Breakdown by entry type
  const typeCounts = useMemo(() => {
    const counts = { thought: 0, journal: 0, reflection: 0 };
    activeEntries.forEach((e) => {
      if (counts[e.entry_type] !== undefined) counts[e.entry_type]++;
    });
    return counts;
  }, [activeEntries]);

  // Breakdown by month (last 6 months)
  const monthlyActivity = useMemo(() => {
    const months: { [key: string]: number } = {};
    activeEntries.forEach((e) => {
      const d = new Date(e.created_at);
      const key = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).slice(-6);
  }, [activeEntries]);

  // Unresolved thoughts filter
  const [unresolvedFilter, setUnresolvedFilter] = useState<string>('all');

  const unresolvedEntries = useMemo(() => {
    // Thoughts or entries that contain questions (?) or have specific tags
    return activeEntries.filter((e) => {
      const hasQuestion = e.content_text?.includes('?') || e.title?.includes('?');
      if (unresolvedFilter === 'questions') return hasQuestion;
      if (unresolvedFilter === 'reflections') return e.entry_type === 'reflection';
      return hasQuestion || e.entry_type === 'reflection';
    });
  }, [activeEntries, unresolvedFilter]);

  // Entries for Evolution Comparison
  const entryA = activeEntries.find((e) => e.id === selectedEntryAId);
  const entryB = activeEntries.find((e) => e.id === selectedEntryBId);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text-primary)]">
          Insights
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Patterns, recurring themes, and the evolution of your thinking over time.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-medium select-none overflow-x-auto no-scrollbar touch-scroll whitespace-nowrap">
        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 min-h-[34px] ${
            activeTab === 'patterns'
              ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] font-semibold shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Activity & Themes</span>
        </button>

        <button
          onClick={() => setActiveTab('evolution')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 min-h-[34px] ${
            activeTab === 'evolution'
              ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] font-semibold shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Thought Evolution</span>
        </button>

        <button
          onClick={() => setActiveTab('unresolved')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 min-h-[34px] ${
            activeTab === 'unresolved'
              ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] font-semibold shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Unresolved Questions ({unresolvedEntries.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVITY & THEMES */}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
                Total entries
              </span>
              <p className="font-editorial text-3xl font-medium text-[var(--text-primary)] mt-1">
                {totalEntries}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
                Total words written
              </span>
              <p className="font-editorial text-3xl font-medium text-[var(--text-primary)] mt-1">
                {totalWords.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
                Avg. entry length
              </span>
              <p className="font-editorial text-3xl font-medium text-[var(--text-primary)] mt-1">
                {avgWords} <span className="text-sm font-sans text-[var(--text-tertiary)]">words</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
                Collections
              </span>
              <p className="font-editorial text-3xl font-medium text-[var(--text-primary)] mt-1">
                {collections.length}
              </p>
            </div>
          </div>

          {/* Activity Over Time & Type Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type Breakdown */}
            <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--accent-olive)]" />
                <h3 className="font-editorial text-xl font-medium text-[var(--text-primary)]">
                  Writing Distribution
                </h3>
              </div>
              <div className="space-y-3 pt-1">
                {(['journal', 'thought', 'reflection'] as const).map((type) => {
                  const count = typeCounts[type];
                  const percent = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                        <span className="capitalize font-medium">{type}s</span>
                        <span>{count} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--accent-olive)] transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--accent-olive)]" />
                <h3 className="font-editorial text-xl font-medium text-[var(--text-primary)]">
                  Recent Activity Trend
                </h3>
              </div>
              {monthlyActivity.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] py-6 text-center">
                  Start writing entries to view your monthly activity.
                </p>
              ) : (
                <div className="flex items-end justify-between gap-2 h-32 pt-4 px-2">
                  {monthlyActivity.map(([month, count]) => {
                    const max = Math.max(...monthlyActivity.map(([, c]) => c), 1);
                    const heightPercent = Math.round((count / max) * 100);
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] text-[var(--text-tertiary)] font-mono">{count}</span>
                        <div className="w-full max-w-[28px] h-20 bg-[var(--bg-surface-elevated)] rounded-t-md flex items-end overflow-hidden">
                          <div
                            className="w-full bg-[var(--accent-olive)] rounded-t-md transition-all duration-300"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[var(--text-secondary)]">{month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Frequent Themes (Tags & Collections) */}
          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[var(--accent-olive)]" />
              <h3 className="font-editorial text-xl font-medium text-[var(--text-primary)]">
                Assigned Tags & Thematic Streams
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Explicit subjects you have attached to your entries.
            </p>
            {tags.length === 0 && collections.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
                No tags or collections assigned yet. Tag entries in the editor to track themes over time.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2">
                {collections.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                    style={{
                      borderColor: c.color,
                      backgroundColor: `${c.color}15`,
                      color: c.color,
                    }}
                  >
                    <span>📁 {c.name}</span>
                    <span className="text-[10px] opacity-70">({c.entry_count || 0})</span>
                  </span>
                ))}
                {tags.map((t) => (
                  <span
                    key={t.id}
                    className="px-2.5 py-1 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] text-xs border border-[var(--border-subtle)]"
                  >
                    #{t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: THOUGHT EVOLUTION COMPARISON */}
      {activeTab === 'evolution' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-[var(--accent-olive)]" />
              <h3 className="font-editorial text-xl font-medium text-[var(--text-primary)]">
                Compare Perspectives Over Time
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Select two entries written during different moments to observe how your thoughts, concerns, decisions, or opinions have shifted.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Entry A (e.g. Past Perspective)
                </label>
                <select
                  value={selectedEntryAId}
                  onChange={(e) => setSelectedEntryAId(e.target.value)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-olive)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="">Select an entry...</option>
                  {activeEntries.map((e) => (
                    <option key={e.id} value={e.id}>
                      {new Date(e.created_at).toLocaleDateString()} — {e.title || 'Untitled'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Entry B (e.g. Recent Perspective)
                </label>
                <select
                  value={selectedEntryBId}
                  onChange={(e) => setSelectedEntryBId(e.target.value)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-olive)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="">Select an entry...</option>
                  {activeEntries.map((e) => (
                    <option key={e.id} value={e.id}>
                      {new Date(e.created_at).toLocaleDateString()} — {e.title || 'Untitled'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Side by side comparison display */}
          {entryA && entryB ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] border-b border-[var(--border-subtle)] pb-2">
                  <span className="font-medium text-[var(--accent-olive)]">Past Thought</span>
                  <span>{new Date(entryA.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <h4 className="font-editorial text-2xl text-[var(--text-primary)]">
                  {entryA.title || 'Untitled Thought'}
                </h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {entryA.content_text}
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] border-b border-[var(--border-subtle)] pb-2">
                  <span className="font-medium text-[var(--accent-olive)]">Later Perspective</span>
                  <span>{new Date(entryB.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <h4 className="font-editorial text-2xl text-[var(--text-primary)]">
                  {entryB.title || 'Untitled Thought'}
                </h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {entryB.content_text}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-tertiary)]">
              Choose two entries above to compare them side-by-side.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UNRESOLVED THOUGHTS */}
      {activeTab === 'unresolved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--text-secondary)]">
              Entries containing inquiries or open questions to ponder over time.
            </p>
            <div className="flex items-center gap-1.5 text-xs select-none">
              <button
                onClick={() => setUnresolvedFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  unresolvedFilter === 'all'
                    ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] font-medium'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setUnresolvedFilter('questions')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  unresolvedFilter === 'questions'
                    ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] font-medium'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Questions only
              </button>
            </div>
          </div>

          {unresolvedEntries.length === 0 ? (
            <div className="p-10 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-tertiary)] space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/70" />
              <p>No unresolved questions currently identified.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unresolvedEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => navigate(`/journal/${entry.id}`)}
                  className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all cursor-pointer flex items-start justify-between gap-4 group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                      <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-xs">
                        ?
                      </span>
                      <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="capitalize">{entry.entry_type}</span>
                    </div>

                    <h4 className="font-editorial text-xl font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-olive)] transition-colors">
                      {entry.title || 'Untitled Thought'}
                    </h4>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {entry.content_text}
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:translate-x-0.5 transition-transform shrink-0 mt-2" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Insight Integrity Banner */}
      <div className="pt-6 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-tertiary)] flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[var(--accent-olive)] shrink-0" />
        <span>
          <strong>Insight Integrity</strong>: All statistics are directly computed from your personal journal entries. Qalbanion never fabricates insights or infers psychological diagnoses.
        </span>
      </div>
    </div>
  );
};
