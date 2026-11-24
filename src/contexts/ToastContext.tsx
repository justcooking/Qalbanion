import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { RotateCcw, X, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
  type?: 'info' | 'success' | 'warning';
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    setIsVisible(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setTimeout(() => {
      setToast(null);
    }, 200);
  }, []);

  const showToast = useCallback(
    ({ message, actionLabel, onAction, duration = 6000, type = 'info' }: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setToast({ message, actionLabel, onAction, duration, type });
      setIsVisible(true);

      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Floating Serene Toast Pill */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/95 text-[var(--text-primary)] shadow-2xl backdrop-blur-md transition-all duration-200 select-none max-w-sm w-[calc(100vw-32px)] sm:w-auto ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-olive)] shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-[var(--accent-olive)] shrink-0" />
          )}

          <span className="text-xs font-medium text-[var(--text-primary)] truncate flex-1">
            {toast.message}
          </span>

          {toast.actionLabel && toast.onAction && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                hideToast();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--accent-olive)] text-white hover:bg-[var(--accent-olive)]/90 text-xs font-medium cursor-pointer transition-transform active:scale-95 shrink-0 shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{toast.actionLabel}</span>
            </button>
          )}

          <button
            type="button"
            onClick={hideToast}
            aria-label="Close notification"
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-md transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
