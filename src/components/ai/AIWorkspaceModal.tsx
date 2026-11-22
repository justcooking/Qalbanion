import React, { useState } from 'react';
import type { JournalEntry } from '../../types/journal';
import { defaultAiProvider, type AiAnalysisResult } from '../../lib/ai/aiProvider';
import {
  Sparkles,
  X,
  CheckSquare,
  Square,
  ShieldCheck,
  Loader2,
  HelpCircle,
  Tag,
} from 'lucide-react';

interface AIWorkspaceModalProps {
  entries: JournalEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export const AIWorkspaceModal: React.FC<AIWorkspaceModalProps> = ({
  entries,
  isOpen,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === entries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entries.map((e) => e.id));
    }
  };

  const selectedEntries = entries.filter((e) => selectedIds.includes(e.id));
  const totalSelectedWords = selectedEntries.reduce((sum, e) => sum + (e.word_count || 0), 0);

  const handleRunAnalysis = async () => {
    if (selectedEntries.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await defaultAiProvider.analyzeSelectedEntries(selectedEntries);
      setAnalysisResult(result);
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
                AI Reflection Assistant
              </h3>
              <p className="text-xs text-[var(--text-tertiary)]">
                Selective, user-authorized cognitive discovery.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Privacy & Consent Notice */}
          <div className="p-4 rounded-xl bg-[var(--accent-olive-soft)]/50 border border-[var(--accent-olive)]/20 text-xs text-[var(--text-secondary)] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[var(--accent-olive-text)] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Strict Data Boundary (Part 11 Compliance)</span>
            </div>
            <p className="leading-relaxed">
              Qalbanion never scans your entire journal automatically. Only the specific entries you hand-select below will be inspected. Analysis is processed locally and privately on your device.
            </p>
          </div>

          {/* Entry Selection List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-primary)]">
                Select entries to include ({selectedIds.length} of {entries.length} selected · {totalSelectedWords} words)
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[var(--accent-olive)] hover:underline cursor-pointer"
              >
                {selectedIds.length === entries.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[var(--border-subtle)] rounded-xl p-2 bg-[var(--bg-base)]">
              {entries.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
                  No entries found to analyze.
                </p>
              ) : (
                entries.map((entry) => {
                  const isChecked = selectedIds.includes(entry.id);
                  return (
                    <div
                      key={entry.id}
                      onClick={() => toggleSelect(entry.id)}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] font-medium'
                          : 'hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[var(--accent-olive)] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                        )}
                        <span className="truncate">{entry.title || 'Untitled Thought'}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-[10px] text-[var(--text-tertiary)]">
                        <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>{entry.word_count || 0} w</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Trigger Button */}
          <div>
            <button
              onClick={handleRunAnalysis}
              disabled={selectedIds.length === 0 || isAnalyzing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-xs font-medium transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing perspectives...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze {selectedIds.length} Selected Entries</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h4 className="font-editorial text-xl font-medium text-[var(--text-primary)]">
                  Synthesis Summary
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {analysisResult.summary}
                </p>
              </div>

              {analysisResult.recurringThemes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-[var(--text-tertiary)] flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
                    Emerging Themes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.recurringThemes.map((theme) => (
                      <span
                        key={theme}
                        className="px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.suggestedQuestions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-[var(--text-tertiary)] flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
                    Deepening Questions:
                  </span>
                  <div className="space-y-1.5">
                    {analysisResult.suggestedQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-secondary)] flex items-start gap-2"
                      >
                        <span className="text-[var(--accent-olive)] font-bold">?</span>
                        <span className="italic">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-[10px] text-[var(--text-tertiary)] italic pt-2 border-t border-[var(--border-subtle)]">
                {analysisResult.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
