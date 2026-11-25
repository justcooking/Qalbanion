import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../hooks/useJournal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { GuidedReflectionModal } from '../components/reflections/GuidedReflectionModal';
import type { JournalEntry } from '../types/journal';
import {
  PenTool,
  ArrowRight,
  Clock,
  Compass,
  Send,
  Smile,
  BookOpen,
  Calendar,
  Leaf,
  Heart,
  Search,
  Coffee,
  MessageCircle,
} from 'lucide-react';

const DAILY_PROMPTS = [
  'What was one moment today that made you pause, and why did it catch your attention?',
  'What is an unspoken expectation you can gently release today?',
  'What is something simple that brought ease or quiet delight into your day?',
  'If your mind was a room right now, what does it feel like inside?',
  'What is one small choice you made recently that honoured your peace?',
  'What truth has been asking for your honest attention lately?',
  'Where in your life would a little more patience change everything?',
  'What feeling are you carrying today that deserves to be acknowledged?',
  'What would feeling completely content with this moment look like?',
  'What is one thing you have learned about yourself this month?',
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { entries, saveEntry } = useJournal();
  const { showToast } = useToast();

  const [quickThought, setQuickThought] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isGuidedOpen, setIsGuidedOpen] = useState(false);
  const [currentDate] = useState(() => new Date());

  // Dynamic daily reflection prompt rotating by calendar day
  const [todayPrompt] = useState(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
  });

  const formattedDate = currentDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const moods = [
    { label: 'Calm', icon: Leaf },
    { label: 'Grateful', icon: Heart },
    { label: 'Curious', icon: Search },
    { label: 'Neutral', icon: Coffee },
    { label: 'Thoughtful', icon: MessageCircle },
  ];

  // Dynamic "On This Day / Past Memory" calculation
  const onThisDayData = useMemo(() => {
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    const currentYear = currentDate.getFullYear();

    const activeEntries = entries.filter((e) => e.status === 'active');
    if (activeEntries.length === 0) return null;

    // 1. Exact calendar match in a prior year (e.g. 1 year ago)
    const exactYearMatch = activeEntries.find((e) => {
      const d = new Date(e.created_at);
      return d.getMonth() === currentMonth && d.getDate() === currentDay && d.getFullYear() !== currentYear;
    });
    if (exactYearMatch) {
      const yearsAgo = currentYear - new Date(exactYearMatch.created_at).getFullYear();
      return {
        entry: exactYearMatch,
        badge: `On this day · ${yearsAgo} ${yearsAgo === 1 ? 'year' : 'years'} ago`,
        isExact: true,
      };
    }

    // 2. Exact day of month in prior month
    const sameDayPriorMonth = activeEntries.find((e) => {
      const d = new Date(e.created_at);
      const diffDays = Math.floor((currentDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      return d.getDate() === currentDay && diffDays >= 25 && diffDays <= 365;
    });
    if (sameDayPriorMonth) {
      const diffDays = Math.floor((currentDate.getTime() - new Date(sameDayPriorMonth.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const monthsAgo = Math.max(1, Math.round(diffDays / 30));
      return {
        entry: sameDayPriorMonth,
        badge: `On this day · ${monthsAgo} ${monthsAgo === 1 ? 'month' : 'months'} ago`,
        isExact: true,
      };
    }

    // 3. Fallback: Past memory from at least 7 days ago
    const olderEntries = activeEntries.filter((e) => {
      const d = new Date(e.created_at);
      const diffDays = (currentDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 7;
    });
    if (olderEntries.length > 0) {
      const pick = olderEntries[0];
      const diffDays = Math.floor((currentDate.getTime() - new Date(pick.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const timeStr = diffDays >= 30 ? `${Math.round(diffDays / 30)} months ago` : `${diffDays} days ago`;
      return {
        entry: pick,
        badge: `Past memory · ${timeStr}`,
        isExact: false,
      };
    }

    // 4. Default earliest entry
    if (activeEntries.length > 0) {
      return {
        entry: activeEntries[activeEntries.length - 1],
        badge: 'Early thought',
        isExact: false,
      };
    }

    return null;
  }, [entries, currentDate]);

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

  const handleGuidedComplete = async (
    reflectionTitle: string,
    answers: { prompt: string; answer: string }[]
  ) => {
    const docContent: Record<string, unknown>[] = [];
    answers.forEach(({ prompt, answer }) => {
      docContent.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: prompt }],
      });
      if (answer) {
        docContent.push({
          type: 'paragraph',
          content: [{ type: 'text', text: answer }],
        });
      }
    });

    const newId = crypto.randomUUID();
    const textContent = answers.map((a) => `## ${a.prompt}\n\n${a.answer}\n\n`).join('');
    const newEntry: JournalEntry = {
      id: newId,
      user_id: user?.id || 'local_guest',
      title: `${reflectionTitle} — ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
      content_json: { type: 'doc', content: docContent },
      content_text: textContent,
      entry_type: 'reflection',
      mood: 'Calm',
      status: 'active',
      is_favourite: false,
      word_count: textContent.trim().split(/\s+/).filter(Boolean).length,
      client_updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await saveEntry(newEntry, true);
    setIsGuidedOpen(false);
    showToast({ message: 'Guided reflection saved to your journal', type: 'success' });
    navigate(`/journal/${newId}`);
  };

  // Real recent entries (first 3 active entries)
  const recentEntries = entries.filter((e) => e.status === 'active').slice(0, 3);

  return (
    <div className="space-y-10 max-w-3xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* 1. Editorial Header */}
      <section className="space-y-2">
        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[var(--text-primary)]">
          {formattedDate}
        </h1>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base font-normal">
          A place to put your thoughts into words, and understand what they reveal over time.
        </p>
      </section>

      {/* 2. Prominent Quick-Entry Area */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-6 transition-colors">
        <form onSubmit={handleQuickSubmit} className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] font-medium">
            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
              <PenTool className="w-3.5 h-3.5 stroke-[1.5] text-[var(--accent-olive)]" />
              Quick thought
            </span>
            <span className="hidden sm:inline">No title or tags required</span>
          </div>

          <textarea
            value={quickThought}
            onChange={(e) => setQuickThought(e.target.value)}
            placeholder="Write a thought"
            rows={3}
            className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none focus:outline-none font-sans text-base leading-relaxed"
          />

          {/* Quick Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-scroll py-1">
              <span className="text-xs text-[var(--text-tertiary)] mr-1 flex items-center gap-1.5 shrink-0">
                <Smile className="w-3.5 h-3.5 stroke-[1.5]" />
                Mood
              </span>
              {moods.map((m) => {
                const MoodIcon = m.icon;
                return (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setSelectedMood(selectedMood === m.label ? null : m.label)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[32px] ${
                      selectedMood === m.label
                        ? 'bg-[var(--accent-olive-soft)] border-[var(--accent-olive)] text-[var(--accent-olive-text)]'
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
                    }`}
                  >
                    <MoodIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={() =>
                  navigate('/journal/new', {
                    state: { initialContent: quickThought, initialMood: selectedMood },
                  })
                }
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-9 px-3 rounded-lg hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer whitespace-nowrap"
              >
                Open full editor
              </button>

              <button
                type="submit"
                disabled={!quickThought.trim()}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                <span>Save</span>
                <Send className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 3. On This Day / Memory Revisit & Dynamic Reflection Prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* On This Day / Memory Revisit Card */}
        {onThisDayData ? (
          <div
            onClick={() => navigate(`/journal/${onThisDayData.entry.id}`)}
            className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-colors cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[var(--accent-olive-text)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
                {onThisDayData.badge}
              </span>
              <h3 className="font-editorial text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-olive)] transition-colors leading-snug">
                {onThisDayData.entry.title || 'Untitled Thought'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                {onThisDayData.entry.content_text || 'A quiet reflection.'}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
              <span className="text-[var(--text-tertiary)]">
                {new Date(onThisDayData.entry.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="text-[var(--accent-olive-text)] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Revisit</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
              </span>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[var(--accent-olive-text)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
                A thought for reflection
              </span>
              <p className="font-editorial text-base text-[var(--text-primary)] leading-snug pt-1">
                Clarity rarely comes from thinking more; it comes from putting thoughts onto paper where you can see them honestly.
              </p>
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">Personal note</span>
          </div>
        )}

        {/* Dynamic Reflection Prompt with Guided Flow */}
        <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-[var(--accent-olive-text)] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 stroke-[1.5]" />
              Today&apos;s reflection prompt
            </span>
            <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed pt-0.5">
              {todayPrompt}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setIsGuidedOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-[var(--accent-olive)] text-white text-xs font-medium hover:bg-[var(--accent-olive-hover)] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Guided reflection</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/reflections')}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer shrink-0"
              title="All reflection templates"
            >
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>
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
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>

        {recentEntries.length === 0 ? (
          <div
            onClick={() => navigate('/journal/new')}
            className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-colors cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
              <span className="font-medium text-[var(--accent-olive-text)] text-xs">
                First entry
              </span>
              <span>Just now</span>
            </div>
            <h3 className="font-editorial text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-olive)] transition-colors">
              Begin your first journal entry
            </h3>
            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              Click here to write your first personal thought. Your words are saved automatically as you write, keeping your journal safe and private.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => navigate(`/journal/${entry.id}`)}
                className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-colors cursor-pointer space-y-2 group"
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

      {/* Guided Reflection Modal */}
      <GuidedReflectionModal
        isOpen={isGuidedOpen}
        onClose={() => setIsGuidedOpen(false)}
        title="Today's Reflection"
        prompts={[todayPrompt]}
        onComplete={handleGuidedComplete}
      />
    </div>
  );
};
