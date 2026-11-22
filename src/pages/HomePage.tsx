import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../hooks/useJournal';
import { useAuth } from '../contexts/AuthContext';
import type { JournalEntry } from '../types/journal';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
  Send,
  Smile,
  BookOpen,
  Calendar,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { entries, saveEntry } = useJournal();
  const [quickThought, setQuickThought] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const moods = [
    { label: 'Calm', icon: '🌿' },
    { label: 'Grateful', icon: '✨' },
    { label: 'Curious', icon: '🔍' },
    { label: 'Neutral', icon: '☕' },
    { label: 'Thoughtful', icon: '💭' },
  ];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickThought.trim()) return;

    const newId = crypto.randomUUID();
    const newEntry: JournalEntry = {
      id: newId,
      user_id: user?.id || 'local_guest',
      title: null,
      content_json: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: quickThought }],
          },
        ],
      },
      content_text: quickThought,
      entry_type: 'thought',
      mood: selectedMood,
      status: 'active',
      is_favourite: false,
      word_count: quickThought.trim().split(/\s+/).length,
      client_updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveEntry(newEntry, true);
    setQuickThought('');
    setSelectedMood(null);
    navigate(`/journal/${newId}`);
  };

  // Real recent entries (first 3 active entries)
  const recentEntries = entries.filter((e) => e.status === 'active').slice(0, 3);

  return (
    <div className="space-y-10 max-w-3xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* 1. Welcoming Editorial Header */}
      <section className="space-y-2">
        <h1 className="font-editorial text-4xl sm:text-5xl font-normal tracking-tight text-[var(--text-primary)]">
          {getGreeting()}.
        </h1>
        <p className="text-[var(--text-secondary)] text-base font-light">
          A place to put your thoughts into words, and understand what they reveal over time.
        </p>
      </section>

      {/* 2. Prominent Quick-Entry Area */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-xs transition-all">
        <form onSubmit={handleQuickSubmit} className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] font-medium">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
              Quick Thought
            </span>
            <span>No title or tags required</span>
          </div>

          <textarea
            value={quickThought}
            onChange={(e) => setQuickThought(e.target.value)}
            placeholder="What is occupying your mind right now? Write freely..."
            rows={3}
            className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none focus:outline-none font-sans text-base leading-relaxed"
          />

          {/* Quick Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-xs text-[var(--text-tertiary)] mr-1 flex items-center gap-1 shrink-0">
                <Smile className="w-3.5 h-3.5" />
                Mood:
              </span>
              {moods.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setSelectedMood(selectedMood === m.label ? null : m.label)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                    selectedMood === m.label
                      ? 'bg-[var(--accent-olive-soft)] border-[var(--accent-olive)] text-[var(--accent-olive-text)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() =>
                  navigate('/journal/new', {
                    state: { initialContent: quickThought, initialMood: selectedMood },
                  })
                }
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
              >
                Open full editor
              </button>

              <button
                type="submit"
                disabled={!quickThought.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                <span>Save</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 3. A Thought to Revisit & Prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Thought to Revisit */}
        <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--accent-olive)] flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              A thought to revisit
            </span>
            <p className="font-editorial text-lg text-[var(--text-primary)] italic leading-snug pt-1">
              "Clarity rarely comes from thinking more; it comes from putting thoughts onto paper where you can see them honestly."
            </p>
          </div>
          <span className="text-xs text-[var(--text-tertiary)]">Personal Note · 3 weeks ago</span>
        </div>

        {/* Reflection Prompt */}
        <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--accent-olive)] flex items-center gap-1.5">
              <Compass className="w-3 h-3" />
              Today's reflection prompt
            </span>
            <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed pt-1">
              What was one moment today that made you pause, and why did it catch your attention?
            </p>
          </div>
          <button
            onClick={() => navigate('/reflections')}
            className="text-xs text-[var(--accent-olive)] hover:underline flex items-center gap-1 font-medium w-fit cursor-pointer"
          >
            <span>Explore reflection templates</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 4. Recent Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-2xl font-normal text-[var(--text-primary)]">
            Recent writing
          </h2>
          <button
            onClick={() => navigate('/journal')}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentEntries.length === 0 ? (
          <div
            onClick={() => navigate('/journal/new')}
            className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
              <span className="font-medium text-[var(--accent-olive)] uppercase tracking-wider text-[11px]">
                Welcome
              </span>
              <span>Just now</span>
            </div>
            <h3 className="font-editorial text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-olive)] transition-colors">
              Begin your first journal entry
            </h3>
            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              Click here to write your first personal thought. It autosaves keystroke-by-keystroke to your local database and syncs securely to your cloud account.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => navigate(`/journal/${entry.id}`)}
                className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span>·</span>
                    <span className="capitalize px-1.5 py-0.5 rounded-full bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] font-medium text-[10px]">
                      {entry.entry_type}
                    </span>
                  </div>
                  {entry.mood && <span className="text-xs">{entry.mood}</span>}
                </div>

                <h3 className="font-editorial text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-olive)] transition-colors">
                  {entry.title || 'Untitled Thought'}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {entry.content_text || 'No text content.'}
                </p>

                <div className="flex items-center gap-2 pt-1 text-xs text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {entry.word_count || 0} words
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
