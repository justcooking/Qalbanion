import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../hooks/useJournal';
import { useCollections } from '../hooks/useCollections';
import {
  Search,
  Plus,
  Calendar,
  Archive,
  Star,
  PenTool,
  Clock,
  Sparkles,
  Layers,
  History,
  FolderTree,
  X,
} from 'lucide-react';

export const JournalPage: React.FC = () => {
  const navigate = useNavigate();
  const { entries, isLoading, toggleFavourite } = useJournal();
  const { collections } = useCollections();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'thought' | 'journal' | 'reflection' | 'favourites' | 'archived'>('all');
  const [viewMode, setViewMode] = useState<'feed' | 'timeline'>('feed');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const tabs = [
    { id: 'all', label: 'All entries' },
    { id: 'thought', label: 'Thoughts' },
    { id: 'journal', label: 'Journals' },
    { id: 'reflection', label: 'Reflections' },
    { id: 'favourites', label: 'Favourites', icon: Star },
    { id: 'archived', label: 'Archived', icon: Archive },
  ];

  // "On This Day" Detection: check if any entry was written on today's month and day (MM-DD)
  const onThisDayEntry = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    const currentYear = today.getFullYear();

    return entries.find((e) => {
      const entryDate = new Date(e.created_at);
      return (
        entryDate.getMonth() === currentMonth &&
        entryDate.getDate() === currentDate &&
        entryDate.getFullYear() !== currentYear &&
        e.status === 'active'
      );
    });
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Tab filter
      if (activeTab === 'favourites') {
        if (!entry.is_favourite || entry.status === 'trashed') return false;
      } else if (activeTab === 'archived') {
        if (entry.status !== 'archived') return false;
      } else {
        if (entry.status !== 'active') return false;
        if (activeTab !== 'all' && entry.entry_type !== activeTab) return false;
      }

      // 2. Collection filter
      if (selectedCollectionId && (!entry.collections || !entry.collections.includes(selectedCollectionId))) {
        // Fallback check in local map if collections aren't embedded
        const map = JSON.parse(localStorage.getItem('qalbanion_entry_collections') || '{}');
        const assignedCols: string[] = map[entry.id] || [];
        if (!assignedCols.includes(selectedCollectionId)) return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = entry.title?.toLowerCase().includes(q);
        const matchContent = entry.content_text?.toLowerCase().includes(q);
        return matchTitle || matchContent;
      }

      return true;
    });
  }, [entries, activeTab, selectedCollectionId, searchQuery]);

  // Group entries by Year & Month for Timeline view
  const timelineGroups = useMemo(() => {
    const groups: { [key: string]: typeof filteredEntries } = {};

    for (const entry of filteredEntries) {
      const d = new Date(entry.created_at);
      const key = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    }

    return Object.entries(groups).map(([monthYear, items]) => ({
      monthYear,
      items,
    }));
  }, [filteredEntries]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text-primary)]">
            Journal
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Chronological records of your thoughts, experiences, and observations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs select-none">
            <button
              onClick={() => setViewMode('feed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'feed'
                  ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] font-medium shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Feed</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] font-medium shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
          </div>

          <button
            onClick={() => navigate('/journal/new')}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New entry</span>
          </button>
        </div>
      </div>

      {/* On This Day Card (Subtle & Calming) */}
      {onThisDayEntry && (
        <div
          onClick={() => navigate(`/journal/${onThisDayEntry.id}`)}
          className="p-5 rounded-2xl border border-[var(--accent-olive)]/30 bg-[var(--accent-olive-soft)]/50 hover:bg-[var(--accent-olive-soft)] transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-xs text-[var(--accent-olive-text)] font-medium">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              On This Day · {new Date(onThisDayEntry.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="group-hover:translate-x-0.5 transition-transform text-xs">Revisit →</span>
          </div>
          <h4 className="font-editorial text-xl font-medium text-[var(--text-primary)]">
            {onThisDayEntry.title || 'Untitled Thought'}
          </h4>
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
            {onThisDayEntry.content_text}
          </p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries by title, text, or topic..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent-olive)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Pills & Collection Filter */}
        <div className="flex items-center gap-2 select-none overflow-x-auto no-scrollbar touch-scroll pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 min-h-[34px] ${
                  isActive
                    ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] border border-[var(--accent-olive)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border border-transparent'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Optional Collection filter badge */}
          {collections.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto py-1 pl-2 border-l border-[var(--border-subtle)]">
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setSelectedCollectionId(selectedCollectionId === col.id ? null : col.id)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                    selectedCollectionId === col.id
                      ? 'bg-[var(--accent-olive-soft)] border-[var(--accent-olive)] text-[var(--accent-olive-text)] font-medium'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  <FolderTree className="w-3 h-3" />
                  <span>{col.name}</span>
                  {selectedCollectionId === col.id && <X className="w-3 h-3 ml-0.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading or Empty State */}
      {isLoading ? (
        <div className="py-16 text-center space-y-2 text-[var(--text-tertiary)]">
          <Clock className="w-6 h-6 animate-pulse mx-auto" />
          <p className="text-sm">Loading your journal...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center mx-auto">
            <PenTool className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
              No entries found
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
              {searchQuery
                ? 'No thoughts match your current search query.'
                : 'Your journal is ready. Start by capturing a spontaneous observation or an open question.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/journal/new')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-olive)] text-white text-xs font-medium shadow-xs hover:bg-[var(--accent-olive-hover)] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Write your first entry</span>
          </button>
        </div>
      ) : viewMode === 'feed' ? (
        /* Feed View */
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => navigate(`/journal/${entry.id}`)}
              className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all cursor-pointer space-y-2.5 group"
            >
              <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(entry.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span>·</span>
                  <span className="capitalize px-2 py-0.5 rounded-full bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] font-medium text-[11px]">
                    {entry.entry_type}
                  </span>
                  {entry.mood && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[11px]">
                      {entry.mood}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavourite(entry.id);
                  }}
                  className={`p-1 rounded transition-colors ${
                    entry.is_favourite ? 'text-amber-500' : 'text-[var(--text-tertiary)] hover:text-amber-500'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" fill={entry.is_favourite ? 'currentColor' : 'none'} />
                </button>
              </div>

              <h3 className="font-editorial text-2xl text-[var(--text-primary)] group-hover:text-[var(--accent-olive)] transition-colors">
                {entry.title || 'Untitled Thought'}
              </h3>

              <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                {entry.content_text || 'No text content.'}
              </p>

              <div className="flex items-center gap-3 pt-1 text-xs text-[var(--text-tertiary)]">
                <span>{entry.word_count || 0} words</span>
                <span>·</span>
                <span>{Math.max(1, Math.ceil((entry.word_count || 0) / 200))} min read</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Timeline View */
        <div className="space-y-8">
          {timelineGroups.map((group) => (
            <div key={group.monthYear} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-olive)]" />
                <h3 className="font-editorial text-2xl font-normal text-[var(--text-primary)]">
                  {group.monthYear}
                </h3>
                <span className="text-xs text-[var(--text-tertiary)] ml-auto">
                  {group.items.length} {group.items.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              <div className="space-y-2 pl-4 border-l border-[var(--border-subtle)] ml-1">
                {group.items.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => navigate(`/journal/${entry.id}`)}
                    className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                        <span>
                          {new Date(entry.created_at).toLocaleDateString(undefined, {
                            weekday: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>·</span>
                        <span className="capitalize text-[11px] font-medium text-[var(--accent-olive)]">
                          {entry.entry_type}
                        </span>
                        {entry.mood && <span>· {entry.mood}</span>}
                      </div>
                      <h4 className="font-editorial text-xl font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-olive)] transition-colors truncate">
                        {entry.title || 'Untitled Thought'}
                      </h4>
                    </div>

                    <span className="text-xs text-[var(--text-tertiary)] shrink-0">
                      {entry.word_count || 0} words
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
