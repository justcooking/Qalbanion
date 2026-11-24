import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Feather,
} from 'lucide-react';

interface GuidedReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  prompts: string[];
  onComplete: (
    reflectionTitle: string,
    completedAnswers: { prompt: string; answer: string }[]
  ) => void;
}

interface GuidedContentProps {
  onClose: () => void;
  title: string;
  prompts: string[];
  onComplete: (
    reflectionTitle: string,
    completedAnswers: { prompt: string; answer: string }[]
  ) => void;
}

const GuidedReflectionContent: React.FC<GuidedContentProps> = ({
  onClose,
  title,
  prompts,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => new Array(prompts.length).fill(''));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autofocus textarea when advancing steps
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const currentPrompt = prompts[currentStep] || '';
  const currentAnswer = answers[currentStep] || '';
  const totalSteps = prompts.length;
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);
  const isLastStep = currentStep === totalSteps - 1;

  const handleAnswerChange = (val: string) => {
    const updated = [...answers];
    updated[currentStep] = val;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinish = () => {
    const completed = prompts.map((prompt, index) => ({
      prompt,
      answer: answers[index]?.trim() || '',
    }));
    onComplete(title, completed);
  };

  const currentWordCount = currentAnswer
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-in zoom-in-95 duration-200 select-none"
      >
        {/* Top Progress & Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-base font-medium text-[var(--text-primary)]">
                {title}
              </h3>
              <p className="text-[11px] text-[var(--text-tertiary)] font-sans">
                Prompt {currentStep + 1} of {totalSteps}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-tertiary)] font-medium hidden sm:inline">
              {progressPercent}% completed
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Exit reflection"
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thin Calm Progress Bar */}
        <div className="w-full h-1 bg-[var(--border-subtle)] overflow-hidden">
          <div
            className="h-full bg-[var(--accent-olive)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Prompt Card & Input Area */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-5 bg-[var(--bg-surface)]">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--accent-olive)]">
              Reflection Inquiry
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-[var(--text-primary)] leading-snug">
              {currentPrompt}
            </h2>
          </div>

          <div className="pt-2">
            <textarea
              ref={textareaRef}
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Give your heart space to respond freely..."
              rows={7}
              className="w-full p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] font-sans text-base leading-relaxed resize-none focus:outline-none focus:border-[var(--accent-olive)] transition-colors shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] pt-1">
            <span>
              {currentWordCount} {currentWordCount === 1 ? 'word' : 'words'}
            </span>
            <span className="text-[11px] opacity-70">Take all the time you need</span>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {!isLastStep && (
              <button
                type="button"
                onClick={handleNext}
                className="px-3 py-2 rounded-xl text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
              >
                Skip
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-xs font-medium transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span>{isLastStep ? 'Complete Reflection' : 'Next Prompt'}</span>
              {isLastStep ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GuidedReflectionModal: React.FC<GuidedReflectionModalProps> = ({
  isOpen,
  onClose,
  title,
  prompts,
  onComplete,
}) => {
  if (!isOpen || prompts.length === 0) return null;

  return (
    <GuidedReflectionContent
      onClose={onClose}
      title={title}
      prompts={prompts}
      onComplete={onComplete}
    />
  );
};
