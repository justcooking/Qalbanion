import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../hooks/useJournal';
import {
  Search,
  Plus,
  Calendar,
  Archive,
  Star,
  PenTool,
  Clock,
  Sparkles,
} from 'lucide-react';

export const JournalPage: React.FC = () => {
  const navigate = useNavigate();
  const { entries, isLoading, toggleFavourite } = useJournal();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'thought' | 'journal' | 'reflection' | 'favourites' | 'archived'>('all');

  const tabs = [
    { id: 'all', label: 'All entries' },
    { id: 'thought', label: 'Thoughts' },
    { id: 'journal', label: 'Journals' },
    { id: 'reflection', label: 'Reflections' },
    { id: 'favourites', label: 'Favourites', icon: Star },
    { id: 'archived', label: 'Archived', icon: Archive },
  ];

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    // 1. Tab filter
    if (activeTab === 'favourites') {
      if (!entry.is_favourite || entry.status === 'trashed') return false;
    } else if (activeTab === 'archived') {
      if (entry.status !== 'archived') return false;
    } else {
      if (entry.status !== 'active') return false;
      if (activeTab !== 'all' && entry.entry_type !== activeTab) return false;
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = entry.title?.toLowerCase().includes(q);
      const matchContent = entry.content_text?.toLowerCase().includes(q);
      return matchTitle || matchContent;
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & New Entry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-4xl font-normal tracking-tight text-[var(--text-primary)]">
            Journal
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Chronological records of your thoughts, experiences, and observations.
          </p>
        </div>

        <button
          onClick={() => navigate('/journal/new')}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-sm font-medium shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New entry</span>
        </button>
      </div>

      {/* Search and Filter Controls */}
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

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] border border-[var(--accent-olive)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border border-transparent'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Entries List */}
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
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => navigate(`/journal/${entry.id}`)}
              className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all cursor-pointer space-y-2.5 group"
            >
              {/* Header meta */}
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

              {/* Title & Preview */}
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
      )}
    </div>
  );
};
