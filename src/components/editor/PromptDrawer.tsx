import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  X,
  Search,
  Shuffle,
  Sun,
  Moon,
  Compass,
  Lightbulb,
  Check,
  ChevronRight,
} from 'lucide-react';

interface PromptItem {
  id: string;
  category: 'daily' | 'evening' | 'clarity' | 'growth';
  prompt: string;
  subtitle?: string;
}

const PROMPT_COLLECTION: PromptItem[] = [
  // Daily Grounding
  {
    id: 'd1',
    category: 'daily',
    prompt: 'What is one intention guiding my heart today?',
    subtitle: 'Focus on posture and spirit rather than tasks',
  },
  {
    id: 'd2',
    category: 'daily',
    prompt: 'What am I grateful for in this quiet moment?',
    subtitle: 'Notice the ordinary details around you',
  },
  {
    id: 'd3',
    category: 'daily',
    prompt: 'Where can I bring more gentleness to myself today?',
    subtitle: 'Give yourself permission to breathe and pause',
  },
  {
    id: 'd4',
    category: 'daily',
    prompt: 'What is one meaningful thing I want to remember about today?',
  },

  // Evening Decompression
  {
    id: 'e1',
    category: 'evening',
    prompt: 'What was the most peaceful moment of my day?',
    subtitle: 'Revisit a sliver of calm or quiet connection',
  },
  {
    id: 'e2',
    category: 'evening',
    prompt: 'What challenged me today, and what did it reveal?',
    subtitle: 'Reflect without harsh judgment or criticism',
  },
  {
    id: 'e3',
    category: 'evening',
    prompt: 'What can I put down and release before sleep?',
    subtitle: 'Leave what is unresolved for tomorrow',
  },
  {
    id: 'e4',
    category: 'evening',
    prompt: 'What went better than expected today?',
  },

  // Clarity & Perspective
  {
    id: 'c1',
    category: 'clarity',
    prompt: 'What is occupying space in my mind right now?',
    subtitle: 'Empty your thoughts without needing to organise them yet',
  },
  {
    id: 'c2',
    category: 'clarity',
    prompt: 'If I stepped back from this, what would truly matter?',
    subtitle: 'View your current situation with long-term perspective',
  },
  {
    id: 'c3',
    category: 'clarity',
    prompt: 'What is within my control here, and what is beyond it?',
    subtitle: 'Anchor in agency, surrender the uncontrollable',
  },
  {
    id: 'c4',
    category: 'clarity',
    prompt: 'What is the simplest, most gentle next step?',
  },

  // Growth & Self-Inquiry
  {
    id: 'g1',
    category: 'growth',
    prompt: 'What is an assumption I have held about myself lately?',
    subtitle: 'Notice narratives that may no longer be true',
  },
  {
    id: 'g2',
    category: 'growth',
    prompt: 'What would my future self say about where I am today?',
    subtitle: 'Offer yourself the empathy of time',
  },
  {
    id: 'g3',
    category: 'growth',
    prompt: 'Where am I sensing resistance, and what is it trying to protect?',
  },
  {
    id: 'g4',
    category: 'growth',
    prompt: 'What truth have I been hesitant to put into words?',
  },
];

interface PromptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export const PromptDrawer: React.FC<PromptDrawerProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'daily' | 'evening' | 'clarity' | 'growth'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'daily', label: 'Daily', icon: Sun },
    { id: 'evening', label: 'Evening', icon: Moon },
    { id: 'clarity', label: 'Clarity', icon: Compass },
    { id: 'growth', label: 'Inquiry', icon: Lightbulb },
  ];

  const filteredPrompts = useMemo(() => {
    return PROMPT_COLLECTION.filter((p) => {
      if (activeCategory !== 'all' && p.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.prompt.toLowerCase().includes(q) ||
          p.subtitle?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  const handleRandomPrompt = () => {
    const list = filteredPrompts.length > 0 ? filteredPrompts : PROMPT_COLLECTION;
    if (list.length === 0) return;
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const randomIndex = array[0] % list.length;
    const random = list[randomIndex];
    if (random) {
      handleChoose(random);
    }
  };

  const handleChoose = (item: PromptItem) => {
    setCopiedId(item.id);
    onSelectPrompt(item.prompt);
    setTimeout(() => {
      setCopiedId(null);
      onClose();
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-end animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[420px] h-full bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-base)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-medium text-[var(--text-primary)] leading-tight">
                Reflection Prompts
              </h3>
              <p className="text-[11px] text-[var(--text-tertiary)] font-sans">
                A quiet spark when you are searching for words
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRandomPrompt}
              title="Pick a random prompt"
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-olive)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts or themes..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-olive)] transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent-olive)] text-white'
                      : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredPrompts.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-tertiary)] space-y-1">
              <p>No prompts matched your search.</p>
              <p className="text-[11px] opacity-70">Try a different keyword or category.</p>
            </div>
          ) : (
            filteredPrompts.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleChoose(item)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                    isCopied
                      ? 'border-[var(--accent-olive)] bg-[var(--accent-olive-soft)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-base)] hover:border-[var(--accent-olive)]/70 hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-olive)] transition-colors leading-relaxed">
                      {item.prompt}
                    </p>
                    {item.subtitle && (
                      <p className="text-[11px] text-[var(--text-secondary)] opacity-80 leading-normal">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="pt-0.5 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--accent-olive)] transition-colors">
                    {isCopied ? (
                      <Check className="w-4 h-4 text-[var(--accent-olive)]" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] text-center text-[11px] text-[var(--text-tertiary)]">
          <span>Click any prompt to insert it into your current reflection</span>
        </div>
      </div>
    </div>
  );
};
