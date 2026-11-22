import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Feather,
  ArrowRight,
  ShieldCheck,
  HardDrive,
  Sparkles,
  Compass,
  Sun,
  Moon,
  PenTool,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [demoThought, setDemoThought] = React.useState('');

  const handleStartWriting = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (demoThought.trim()) {
      navigate('/journal/new', { state: { initialContent: demoThought } });
    } else {
      navigate('/journal/new');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200 flex flex-col justify-between selection:bg-[var(--accent-olive)]/20">
      {/* 1. Header Navigation */}
      <header className="max-w-5xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center border border-[var(--border-subtle)] group-hover:scale-105 transition-transform">
            <Feather className="w-4 h-4" />
          </div>
          <span className="font-editorial text-2xl font-medium tracking-tight text-[var(--text-primary)]">
            Qalbanion
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-300" />}
          </button>

          {user ? (
            <Link
              to="/home"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-olive)] text-white text-xs font-medium hover:bg-[var(--accent-olive-hover)] transition-all shadow-xs"
            >
              <span>Go to Your Journal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                className="px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Sign In
              </Link>
              <button
                onClick={() => handleStartWriting()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-olive)] text-white text-xs font-medium hover:bg-[var(--accent-olive-hover)] transition-all shadow-xs cursor-pointer"
              >
                <span>Start Writing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 sm:py-20 space-y-16 flex-1">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-olive-soft)] border border-[var(--accent-olive)]/30 text-[var(--accent-olive-text)] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>A Quiet, Personal Space for Your Mind</span>
          </div>

          <h1 className="font-editorial text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight text-[var(--text-primary)] leading-[1.1]">
            A place to put your thoughts into words.
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed max-w-xl mx-auto">
            And a place to understand what those words reveal over time. No daily streaks, no guilt, no productivity pressure. Just effortless writing.
          </p>

          {/* Interactive Quick-Start Input Box right on the Landing Page */}
          <div className="pt-4 max-w-lg mx-auto">
            <form
              onSubmit={handleStartWriting}
              className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg hover:border-[var(--accent-olive)]/60 transition-all text-left space-y-3"
            >
              <span className="text-[11px] uppercase tracking-wider text-[var(--accent-olive)] font-medium flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5" />
                Try writing a thought right now:
              </span>
              <textarea
                value={demoThought}
                onChange={(e) => setDemoThought(e.target.value)}
                placeholder="What is occupying your mind today? Write freely..."
                rows={3}
                className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none focus:outline-none text-sm leading-relaxed"
              />
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  No account or login required to start
                </span>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
                >
                  <span>Begin Journaling</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 3. The Four Core Principles */}
        <section className="space-y-6 pt-12 border-t border-[var(--border-subtle)]">
          <div className="text-center space-y-2">
            <h2 className="font-editorial text-3xl font-normal text-[var(--text-primary)]">
              Designed for Introspection, Not Productivity
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Most apps turn journaling into a chore or a gamified habit. Qalbanion is built around human peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
                <Feather className="w-4 h-4" />
              </div>
              <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
                1. Effortless Writing
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Open the app and type immediately. No mandatory titles, tags, or folders. A thought can be two words or two thousand.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
                2. Never Lose a Word
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Keystroke-level offline autosave via your browser's local IndexedDB database. Write without internet; your changes sync quietly when reconnected.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
                3. Thought Evolution & Reflections
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Revisit past questions with "On This Day" moments, compare how your perspective on a subject has shifted over time, and explore guided reflection prompts.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
                4. Private & Truly Yours
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                No advertising, no tracking, no selling data. Export your entire journal anytime to Markdown, Plain Text, or JSON with zero vendor lock-in.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Editorial Call To Action */}
        <section className="p-8 sm:p-12 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center space-y-6">
          <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-[var(--text-primary)]">
            Begin with a single sentence.
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Writing clarifies what thinking alone cannot untangle. Your notebook is open.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleStartWriting()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white font-medium text-sm shadow-sm transition-all cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>Open Qalbanion</span>
            </button>
            <Link
              to="/auth"
              className="px-5 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent-olive)] transition-colors"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-8 max-w-5xl w-full mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
        <div className="flex items-center gap-2">
          <Feather className="w-4 h-4 text-[var(--accent-olive)]" />
          <span>Qalbanion — A place to put your thoughts into words.</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/justcooking/Qalbanion"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            GitHub
          </a>
          <span>·</span>
          <span>Open Source</span>
        </div>
      </footer>
    </div>
  );
};
