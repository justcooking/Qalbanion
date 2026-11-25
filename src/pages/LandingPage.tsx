import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Feather,
  ArrowRight,
  ShieldCheck,
  HardDrive,
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
      <header className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center border border-[var(--border-subtle)]">
            <Feather className="w-4 h-4 stroke-[1.5]" />
          </div>
          <span className="font-editorial text-xl sm:text-2xl font-medium tracking-tight text-[var(--text-primary)]">
            Qalbanion
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 stroke-[1.5]" /> : <Sun className="w-4 h-4 stroke-[1.5]" />}
          </button>

          {user ? (
            <Link
              to="/home"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent-olive)] text-white text-xs font-medium hover:bg-[var(--accent-olive-hover)] transition-colors"
            >
              <span>Go to Your Journal</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                className="px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Sign in
              </Link>
              <button
                onClick={() => handleStartWriting()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent-olive)] text-white text-xs font-medium hover:bg-[var(--accent-olive-hover)] transition-colors cursor-pointer"
              >
                <span>Start writing</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-20 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[var(--text-primary)] leading-[1.06]">
              A place to put your thoughts into words
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] font-normal leading-relaxed max-w-lg">
              And a place to understand what those words reveal over time. No daily streaks, no guilt, no productivity pressure.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleStartWriting()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-sm font-medium transition-colors cursor-pointer"
              >
                <span>Start writing</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </button>
              <Link
                to={user ? '/home' : '/auth'}
                className="px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] text-sm font-medium text-[var(--text-primary)] transition-colors"
              >
                {user ? 'Open journal' : 'Sign in'}
              </Link>
            </div>
          </div>

          {/* Interactive Notebook Preview */}
          <div className="lg:col-span-6">
            <form
              onSubmit={handleStartWriting}
              className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-colors text-left space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-2">
                  <PenTool className="w-3.5 h-3.5 stroke-[1.5] text-[var(--accent-olive)]" />
                  Try writing a thought
                </span>
                <span className="text-xs font-mono text-[var(--text-tertiary)]">
                  New entry
                </span>
              </div>
              <textarea
                value={demoThought}
                onChange={(e) => setDemoThought(e.target.value)}
                placeholder="Write a thought"
                rows={6}
                className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none focus:outline-none font-body text-base leading-relaxed"
              />
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs">
                <span className="text-xs text-[var(--text-tertiary)]">
                  No account required to start
                </span>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <span>Begin journaling</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 3. The Four Core Principles */}
        <section className="space-y-6 pt-12 border-t border-[var(--border-subtle)]">
          <div className="text-center space-y-2">
            <h2 className="font-editorial text-3xl font-normal text-[var(--text-primary)]">
              Designed for introspection, not productivity
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Most apps turn journaling into a chore or a gamified habit. Qalbanion is built for quiet reflection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
                <Feather className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
                Effortless writing
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Open the app and type immediately. No mandatory titles, tags, or folders. A thought can be two words or two thousand.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
                <HardDrive className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
                Never lose a word
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Every word is automatically saved as you write. You can write offline without internet; your reflections sync quietly when you are back online.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
                <Compass className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
                Thought evolution and reflections
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Revisit past questions with On This Day moments, compare how your perspective on a subject has shifted over time, and explore guided prompts.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
                Private and yours
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                No advertising, no tracking, and no selling data. Export your entire journal anytime to keep your words forever, with full ownership.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Editorial Call To Action */}
        <section className="p-8 sm:p-12 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center space-y-6">
          <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-[var(--text-primary)]">
            Begin with a single sentence
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Writing clarifies what thinking alone cannot untangle. Your notebook is open.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleStartWriting()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white font-medium text-sm transition-colors cursor-pointer"
            >
              <PenTool className="w-4 h-4 stroke-[1.5]" />
              <span>Open Qalbanion</span>
            </button>
            <Link
              to="/auth"
              className="px-5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
            >
              Sign in to existing account
            </Link>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-8 max-w-5xl w-full mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
        <div className="flex items-center gap-2">
          <Feather className="w-4 h-4 text-[var(--accent-olive)]" />
          <span>Qalbanion — A companion for your heart.</span>
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
