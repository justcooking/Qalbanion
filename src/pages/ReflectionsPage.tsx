import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReflections } from '../hooks/useReflections';
import { useJournal } from '../hooks/useJournal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { GuidedReflectionModal } from '../components/reflections/GuidedReflectionModal';
import type { ReflectionTemplate, JournalEntry } from '../types/journal';
import {
  Calendar,
  Compass,
  HelpCircle,
  ArrowRight,
  Plus,
  Trash2,
  X,
  BookOpen,
} from 'lucide-react';

export const ReflectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { templates, isLoading, createTemplate, deleteTemplate } = useReflections();
  const { saveEntry } = useJournal();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompts, setPrompts] = useState<string[]>(['', '']);
  const [guidedTemplate, setGuidedTemplate] = useState<ReflectionTemplate | null>(null);

  const getTemplateIcon = (title: string) => {
    if (title.toLowerCase().includes('daily')) return Calendar;
    if (title.toLowerCase().includes('weekly')) return Compass;
    if (title.toLowerCase().includes('decision')) return HelpCircle;
    return BookOpen;
  };

  const handleStartReflection = (tpl: ReflectionTemplate) => {
    const today = new Date().toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Build structured TipTap doc with each prompt as an H2 and empty paragraph underneath
    const docContent: Record<string, unknown>[] = [];
    tpl.prompts.forEach((prompt) => {
      docContent.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: prompt }],
      });
      docContent.push({
        type: 'paragraph',
        content: [],
      });
    });

    navigate('/journal/new', {
      state: {
        initialTitle: `${tpl.name} — ${today}`,
        initialEntryType: 'reflection',
        initialContentJson: {
          type: 'doc',
          content: docContent,
        },
        initialContent: tpl.prompts.map((p) => `## ${p}\n\n`).join(''),
      },
    });
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
      title: `${reflectionTitle} — ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
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
    setGuidedTemplate(null);
    showToast({ message: 'Guided reflection completed and saved to your journal', type: 'success' });
    navigate(`/journal/${newId}`);
  };

  const handleAddPromptField = () => {
    setPrompts([...prompts, '']);
  };

  const handlePromptChange = (index: number, val: string) => {
    const updated = [...prompts];
    updated[index] = val;
    setPrompts(updated);
  };

  const handleRemovePromptField = (index: number) => {
    if (prompts.length <= 1) return;
    setPrompts(prompts.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createTemplate(name.trim(), description.trim(), prompts);
    setIsModalOpen(false);
    setName('');
    setDescription('');
    setPrompts(['', '']);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text-primary)]">
            Reflections
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Deliberate prompt structures to examine choices, patterns, and questions. Never mandatory.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-xs font-medium transition-colors self-start sm:self-auto cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>New framework</span>
        </button>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[var(--text-tertiary)]">
          Loading reflection frameworks...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tpl) => {
            const Icon = getTemplateIcon(tpl.name);
            const isCustom = !tpl.is_default;

            return (
              <div
                key={tpl.id}
                className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between space-y-4 group shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>

                    {isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this template?')) {
                            deleteTemplate(tpl.id);
                          }
                        }}
                        className="p-1 rounded text-[var(--text-tertiary)] hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete custom template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-olive)] transition-colors">
                      {tpl.name}
                    </h3>
                    {tpl.description && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                        {tpl.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2">
                    {tpl.prompts.map((prompt, idx) => (
                      <div key={idx} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="text-[var(--accent-olive)] font-bold">•</span>
                        <span className="italic leading-snug">{prompt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setGuidedTemplate(tpl)}
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-[var(--accent-olive)] text-white text-xs font-medium hover:bg-[var(--accent-olive-hover)] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Compass className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>Guided flow</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartReflection(tpl)}
                    className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer whitespace-nowrap"
                    title="Open directly in full editor"
                  >
                    <BookOpen className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span className="hidden sm:inline">Editor</span>
                    <ArrowRight className="w-3 h-3 stroke-[1.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Custom Reflection Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
                Create Reflection Template
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Monthly Perspective Shift, Creative Project Audit"
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-olive)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly state when this reflection is useful"
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-olive)] rounded-xl px-3.5 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-[var(--text-secondary)]">
                  Prompt Questions
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {prompts.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-tertiary)] w-4 text-right">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        required
                        value={p}
                        onChange={(e) => handlePromptChange(idx, e.target.value)}
                        placeholder="e.g. What unexpected insight surfaced recently?"
                        className="flex-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-olive)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
                      />
                      {prompts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePromptField(idx)}
                          className="p-1 text-[var(--text-tertiary)] hover:text-rose-500 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddPromptField}
                  className="text-xs text-[var(--accent-olive)] hover:underline flex items-center gap-1 font-medium pt-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another question</span>
                </button>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  Create template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guided Reflection Modal */}
      {guidedTemplate && (
        <GuidedReflectionModal
          isOpen={!!guidedTemplate}
          onClose={() => setGuidedTemplate(null)}
          title={guidedTemplate.name}
          prompts={guidedTemplate.prompts}
          onComplete={handleGuidedComplete}
        />
      )}
    </div>
  );
};
