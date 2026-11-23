import React, { useState, useEffect, useMemo } from 'react';
import {
  Keyboard,
  X,
  Search,
} from 'lucide-react';

interface ShortcutItem {
  id: string;
  name: string;
  description: string;
  keys: string[];
  markdownAlternative?: string;
  category: 'flow' | 'formatting' | 'structure' | 'history';
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const isMac = useMemo(() => {
    return typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
  }, []);

  const modKey = isMac ? '⌘' : 'Ctrl';
  const altKey = isMac ? '⌥' : 'Alt';

  const shortcuts: ShortcutItem[] = useMemo(
    () => [
      // Flow & Sanctuary
      {
        id: 'typewriter',
        name: 'Typewriter Scrolling',
        description: 'Keeps the line you are typing vertically centered at eye level',
        keys: [altKey, 'T'],
        category: 'flow',
      },
      {
        id: 'zen',
        name: 'Zen Focus Retreat',
        description: 'Hides all menus and toolbars for pure writing flow',
        keys: [altKey, 'Z'],
        markdownAlternative: 'Escape to exit',
        category: 'flow',
      },
      {
        id: 'width',
        name: 'Toggle Canvas Width',
        description: 'Switches between comfortable reading width and wide canvas',
        keys: [altKey, 'W'],
        category: 'flow',
      },
      {
        id: 'copy',
        name: 'Quick Copy to Clipboard',
        description: 'Copies entire entry formatted as Markdown',
        keys: [altKey, 'C'],
        category: 'flow',
      },
      {
        id: 'slash',
        name: 'Block Command Palette',
        description: 'Quickly insert headings, lists, quotes, or dividers',
        keys: ['/'],
        markdownAlternative: 'on a new line',
        category: 'flow',
      },
      {
        id: 'shortcuts-guide',
        name: 'Open Shortcuts Guide',
        description: 'Toggles this keyboard shortcuts helper anytime',
        keys: [modKey, '/'],
        category: 'flow',
      },

      // Text Formatting
      {
        id: 'bold',
        name: 'Bold',
        description: 'Emphasize text with strong weight',
        keys: [modKey, 'B'],
        markdownAlternative: '**text**',
        category: 'formatting',
      },
      {
        id: 'italic',
        name: 'Italic',
        description: 'Slanted text for gentle emphasis or internal monologue',
        keys: [modKey, 'I'],
        markdownAlternative: '*text*',
        category: 'formatting',
      },
      {
        id: 'underline',
        name: 'Underline',
        description: 'Underline selected phrase',
        keys: [modKey, 'U'],
        category: 'formatting',
      },
      {
        id: 'strike',
        name: 'Strikethrough',
        description: 'Cross out text to indicate discarded thoughts',
        keys: [modKey, 'Shift', 'X'],
        markdownAlternative: '~~text~~',
        category: 'formatting',
      },
      {
        id: 'code',
        name: 'Inline Code',
        description: 'Monospace font styling for exact references',
        keys: [modKey, 'E'],
        markdownAlternative: '`code`',
        category: 'formatting',
      },
      {
        id: 'link',
        name: 'Insert Link',
        description: 'Attach a web address to the selected text',
        keys: [modKey, 'K'],
        category: 'formatting',
      },

      // Structure & Blocks
      {
        id: 'h1',
        name: 'Heading 1',
        description: 'Major section heading or overarching essay title',
        keys: [modKey, altKey, '1'],
        markdownAlternative: '# + Space',
        category: 'structure',
      },
      {
        id: 'h2',
        name: 'Heading 2',
        description: 'Section subtitle or reflective theme heading',
        keys: [modKey, altKey, '2'],
        markdownAlternative: '## + Space',
        category: 'structure',
      },
      {
        id: 'h3',
        name: 'Heading 3',
        description: 'Sub-topic or focal point heading',
        keys: [modKey, altKey, '3'],
        markdownAlternative: '### + Space',
        category: 'structure',
      },
      {
        id: 'bullet',
        name: 'Bulleted List',
        description: 'Create an unnumbered list for floating thoughts',
        keys: [modKey, 'Shift', '8'],
        markdownAlternative: '- + Space',
        category: 'structure',
      },
      {
        id: 'ordered',
        name: 'Numbered List',
        description: 'Sequential order of steps or priority items',
        keys: [modKey, 'Shift', '7'],
        markdownAlternative: '1. + Space',
        category: 'structure',
      },
      {
        id: 'quote',
        name: 'Pull Quote / Callout',
        description: 'Editorial blockquote with accent olive rail',
        keys: [modKey, 'Shift', 'B'],
        markdownAlternative: '> + Space',
        category: 'structure',
      },
      {
        id: 'divider',
        name: '3-Dot Literary Divider',
        description: 'Inserts classic novel section break (•  •  •)',
        keys: ['---', 'Enter'],
        markdownAlternative: '---',
        category: 'structure',
      },

      // History & Edits
      {
        id: 'undo',
        name: 'Undo',
        description: 'Revert the last change or typing stroke',
        keys: [modKey, 'Z'],
        category: 'history',
      },
      {
        id: 'redo',
        name: 'Redo',
        description: 'Reapply the reverted change',
        keys: isMac ? [modKey, 'Shift', 'Z'] : [modKey, 'Y'],
        category: 'history',
      },
    ],
    [modKey, altKey, isMac]
  );

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const categories = [
    { id: 'all', label: 'All Shortcuts' },
    { id: 'flow', label: 'Flow & Zen' },
    { id: 'formatting', label: 'Text Styling' },
    { id: 'structure', label: 'Blocks & Headings' },
    { id: 'history', label: 'History' },
  ];

  const filteredShortcuts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shortcuts.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchKeys = item.keys.some((k) => k.toLowerCase().includes(q));
      const matchAlt = item.markdownAlternative?.toLowerCase().includes(q);
      return matchName || matchDesc || matchKeys || matchAlt;
    });
  }, [shortcuts, search, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center border border-[var(--border-subtle)] shadow-xs">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-2xl font-medium tracking-tight text-[var(--text-primary)]">
                Keyboard Shortcuts & Flow
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Effortless writing gestures to keep your hands on the keys.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            aria-label="Close shortcuts modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="px-6 pt-4 pb-2 space-y-3 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/50">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shortcuts (e.g. bold, typewriter, heading, zen)..."
              autoFocus
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent-olive)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-scroll pb-1 select-none">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  activeCategory === c.id
                    ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] border border-[var(--accent-olive)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border border-transparent'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {filteredShortcuts.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-tertiary)] space-y-1">
              <p>No shortcuts match "{search}".</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setActiveCategory('all');
                }}
                className="text-[var(--accent-olive)] underline cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          ) : (
            filteredShortcuts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface-elevated)]/60 transition-colors"
              >
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {item.name}
                    </span>
                    {item.markdownAlternative && (
                      <span className="text-[10px] text-[var(--text-tertiary)] font-mono bg-[var(--bg-surface-elevated)] px-1.5 py-0.5 rounded">
                        {item.markdownAlternative}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {item.keys.map((k, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-[10px] text-[var(--text-tertiary)]">+</span>}
                      <kbd className="px-2 py-1 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] text-[11px] font-sans font-semibold text-[var(--text-primary)] shadow-2xs min-w-[24px] text-center">
                        {k}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[10px]">
                Esc
              </kbd>
              <span>to dismiss</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[10px]">
                {modKey}
              </kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[10px]">
                /
              </kbd>
              <span>toggles anytime</span>
            </span>
          </div>
          <span className="italic">A companion for your heart</span>
        </div>
      </div>
    </div>
  );
};
