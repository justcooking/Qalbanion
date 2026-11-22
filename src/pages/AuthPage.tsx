import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Feather, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          navigate(from, { replace: true });
        }
      } else if (mode === 'signup') {
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          setIsSubmitting(false);
          return;
        }
        const { error } = await signUp(email, password, displayName);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Account created! Please check your email to confirm your account (if confirmation is required), or sign in.');
          setMode('signin');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Password reset link sent! Check your inbox.');
        }
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center border border-[var(--border-subtle)] group-hover:scale-105 transition-transform">
              <Feather className="w-5 h-5" />
            </div>
            <span className="font-editorial text-3xl font-medium tracking-tight text-[var(--text-primary)]">
              Qalbanion
            </span>
          </Link>
          <p className="text-sm text-[var(--text-secondary)] font-light">
            {mode === 'signin' && 'Sign in to access your synchronized journal.'}
            {mode === 'signup' && 'Create your private personal journal space.'}
            {mode === 'forgot' && 'Reset your journal password.'}
          </p>
        </div>

        {/* Card */}
        <div className="p-7 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs space-y-6">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Your Name or Pen Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Al-Katib"
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-olive)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-olive)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-colors"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[var(--accent-olive)] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-olive)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-sm font-medium transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Modes */}
          <div className="pt-2 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
            {mode === 'signin' && (
              <p>
                Don't have an account yet?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-[var(--accent-olive)] font-medium hover:underline cursor-pointer ml-1"
                >
                  Create one here
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-[var(--accent-olive)] font-medium hover:underline cursor-pointer ml-1"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p>
                Remembered your password?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-[var(--accent-olive)] font-medium hover:underline cursor-pointer ml-1"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Offline / Free writing link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            ← Continue writing offline without an account
          </Link>
        </div>
      </div>
    </div>
  );
};
