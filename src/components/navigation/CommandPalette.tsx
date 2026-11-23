import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../../hooks/useJournal';
import { useCollections } from '../../hooks/useCollections';
import { useTheme } from '../../contexts/ThemeContext';
import { exportToMarkdown, exportToPlainText, exportToJSON, downloadFile } from '../../utils/export';
import {
  Search,
  PenTool,
  Sparkles,
  BookOpen,
  FolderTree,
  BarChart2,
  Settings,
  Sun,
  Moon,
  Download,
  Keyboard,
  FileText,
  FileCode,
  X,
  Home,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShortcuts?: () => void;
}

interface PaletteAction {
  id: string;
  type: 'action';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  keywords: string[];
  perform: () => void;
}

interface PaletteEntry {
  id: string;
  type: 'entry';
  title: string;
  snippet: string;
  dateStr: string;
  entryType: 'thought' | 'journal' | 'reflection';
  mood?: string | null;
  entryId: string;
}

interface PaletteCollection {
  id: string;
  type: 'collection';
  name: string;
  description?: string | null;
  color: string;
  entryCount: number;
}

const CommandPaletteDialog: React.FC<{
  onClose: () => void;
  onOpenShortcuts?: () => void;
}> = ({ onClose, onOpenShortcuts }) => {
  const navigate = useNavigate();
  const { entries } = useJournal();
  const { collections, tags } = useCollections();
  const { theme, toggleTheme } = useTheme();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isMac = useMemo(() => {
    return typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
  }, []);
  const modKey = isMac ? '⌘' : 'Ctrl';

  // Core navigation and workflow actions
  const actions: PaletteAction[] = useMemo(
    () => [
      {
        id: 'new-thought',
        type: 'action',
        title: 'Write a thought',
        subtitle: 'Open the calm writing editor',
        icon: <PenTool className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['write', 'new', 'thought', 'journal', 'entry', 'compose'],
        perform: () => {
          navigate('/journal/new');
          onClose();
        },
      },
      {
        id: 'nav-home',
        type: 'action',
        title: 'Go to Home',
        subtitle: 'Overview, greeting & quick thoughts',
        icon: <Home className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['home', 'dashboard', 'overview'],
        perform: () => {
          navigate('/home');
          onClose();
        },
      },
      {
        id: 'nav-journal',
        type: 'action',
        title: 'Go to Journal',
        subtitle: 'Chronological timeline of all entries',
        icon: <BookOpen className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['journal', 'entries', 'feed', 'timeline', 'list', 'all'],
        perform: () => {
          navigate('/journal');
          onClose();
        },
      },
      {
        id: 'nav-reflections',
        type: 'action',
        title: 'Reflections & Prompts',
        subtitle: 'Guided contemplation frameworks',
        icon: <Sparkles className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['reflections', 'prompts', 'guided', 'templates', 'evening', 'review'],
        perform: () => {
          navigate('/reflections');
          onClose();
        },
      },
      {
        id: 'nav-collections',
        type: 'action',
        title: 'Go to Collections',
        subtitle: 'Thematic groups and streams',
        icon: <FolderTree className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['collections', 'folders', 'themes', 'streams', 'categories'],
        perform: () => {
          navigate('/collections');
          onClose();
        },
      },
      {
        id: 'nav-insights',
        type: 'action',
        title: 'Go to Insights',
        subtitle: 'Thought evolution & unresolved questions',
        icon: <BarChart2 className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['insights', 'evolution', 'stats', 'patterns', 'questions', 'metrics'],
        perform: () => {
          navigate('/insights');
          onClose();
        },
      },
      {
        id: 'nav-settings',
        type: 'action',
        title: 'Settings & Typography',
        subtitle: 'Aesthetic fonts, backups & privacy',
        icon: <Settings className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['settings', 'typography', 'fonts', 'preferences', 'export', 'theme'],
        perform: () => {
          navigate('/settings');
          onClose();
        },
      },
      {
        id: 'toggle-appearance',
        type: 'action',
        title: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`,
        subtitle: theme === 'light' ? 'Warm charcoal aesthetic' : 'Warm ivory editorial aesthetic',
        icon:
          theme === 'light' ? (
            <Moon className="w-4 h-4 text-[var(--accent-olive)]" />
          ) : (
            <Sun className="w-4 h-4 text-amber-300" />
          ),
        keywords: ['theme', 'dark', 'light', 'mode', 'appearance', 'color'],
        perform: () => {
          toggleTheme();
          onClose();
        },
      },
      {
        id: 'shortcuts-modal',
        type: 'action',
        title: 'Keyboard Shortcuts Guide',
        subtitle: 'Cheatsheet of all writing & flow shortcuts',
        icon: <Keyboard className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['shortcuts', 'keyboard', 'help', 'hotkeys', 'guide', 'keys'],
        perform: () => {
          onClose();
          if (onOpenShortcuts) onOpenShortcuts();
        },
      },
      {
        id: 'export-markdown',
        type: 'action',
        title: 'Export Journal as Markdown (.md)',
        subtitle: 'Download complete journal archive in readable text',
        icon: <Download className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['export', 'download', 'backup', 'markdown', 'md'],
        perform: () => {
          const md = exportToMarkdown(entries, collections, tags);
          const date = new Date().toISOString().split('T')[0];
          downloadFile(md, `qalbanion-journal-${date}.md`, 'text/markdown');
          onClose();
        },
      },
      {
        id: 'export-plaintext',
        type: 'action',
        title: 'Export Journal as Plain Text (.txt)',
        subtitle: 'Clean readable text export of all your entries',
        icon: <FileText className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['export', 'download', 'text', 'plain', 'txt'],
        perform: () => {
          const txt = exportToPlainText(entries);
          const date = new Date().toISOString().split('T')[0];
          downloadFile(txt, `qalbanion-journal-${date}.txt`, 'text/plain');
          onClose();
        },
      },
      {
        id: 'export-json',
        type: 'action',
        title: 'Export Complete Backup (.json)',
        subtitle: 'Full raw data backup including metadata and tags',
        icon: <FileCode className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['export', 'backup', 'json', 'archive', 'data'],
        perform: () => {
          const jsonStr = exportToJSON(entries, collections, tags);
          const date = new Date().toISOString().split('T')[0];
          downloadFile(jsonStr, `qalbanion-backup-${date}.json`, 'application/json');
          onClose();
        },
      },
    ],
    [navigate, onClose, onOpenShortcuts, theme, toggleTheme, entries, collections, tags]
  );

  // Filter items across actions, entries, and collections
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1. Matched actions
    const matchedActions = actions.filter((act) => {
      if (!q) return true;
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchSub = act.subtitle?.toLowerCase().includes(q);
      const matchKey = act.keywords.some((k) => k.toLowerCase().includes(q));
      return matchTitle || matchSub || matchKey;
    });

    // 2. Matched entries (search across active entries)
    const activeEntries = entries.filter((e) => e.status !== 'trashed');
    const matchedEntries: PaletteEntry[] = [];

    if (q) {
      for (const e of activeEntries) {
        const titleMatch = e.title?.toLowerCase().includes(q);
        const textMatch = e.content_text?.toLowerCase().includes(q);
        if (titleMatch || textMatch) {
          const d = new Date(e.created_at);
          matchedEntries.push({
            id: `entry-${e.id}`,
            type: 'entry',
            entryId: e.id,
            title: e.title || 'Untitled Thought',
            snippet: e.content_text || '',
            dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            entryType: e.entry_type,
            mood: e.mood,
          });
        }
        if (matchedEntries.length >= 8) break; // Limit search hits for responsiveness
      }
    } else {
      // If query is empty, show 3 most recent entries
      activeEntries.slice(0, 3).forEach((e) => {
        const d = new Date(e.created_at);
        matchedEntries.push({
          id: `entry-${e.id}`,
          type: 'entry',
          entryId: e.id,
          title: e.title || 'Untitled Thought',
          snippet: e.content_text || '',
          dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          entryType: e.entry_type,
          mood: e.mood,
        });
      });
    }

    // 3. Matched collections
    const matchedCollections: PaletteCollection[] = [];
    for (const c of collections) {
      if (!q || c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)) {
        matchedCollections.push({
          id: `col-${c.id}`,
          type: 'collection',
          name: c.name,
          description: c.description,
          color: c.color || '#5E6D55',
          entryCount: c.entry_count || 0,
        });
      }
      if (matchedCollections.length >= 4) break;
    }

    // Compose final list:
    // If user is searching, prioritize matched entries first, then collections, then actions
    if (q) {
      return [...matchedEntries, ...matchedCollections, ...matchedActions];
    }

    // When query is empty, show actions first, then recent entries, then collections
    return [...matchedActions.slice(0, 5), ...matchedEntries, ...matchedCollections];
  }, [actions, entries, collections, query]);

  // Autofocus input when opened
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard navigation (Escape, Up, Down, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const selectedItem = filteredItems[selectedIndex];
        if (!selectedItem) return;

        if (selectedItem.type === 'action') {
          selectedItem.perform();
        } else if (selectedItem.type === 'entry') {
          navigate(`/journal/${selectedItem.entryId}`);
          onClose();
        } else if (selectedItem.type === 'collection') {
          navigate('/collections');
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, navigate, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('[data-selected="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 select-none"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--border-subtle)] gap-3 bg-[var(--bg-base)]">
          <Search className="w-4 h-4 text-[var(--accent-olive)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search thoughts, collections, or type a command..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
              <kbd className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[10px]">
                Esc
              </kbd>
            </div>
          )}
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-tertiary)] space-y-1">
              <p>No results found for "{query}".</p>
              <p className="text-[11px] text-[var(--text-tertiary)] opacity-70">
                Try searching for a word in your journal or type "write" to create an entry.
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              if (item.type === 'action') {
                return (
                  <button
                    key={item.id}
                    data-selected={isSelected}
                    onClick={() => item.perform()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)]'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface-elevated)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="text-[11px] text-[var(--text-secondary)] truncate">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 pl-2">
                      Jump →
                    </span>
                  </button>
                );
              }

              if (item.type === 'entry') {
                return (
                  <button
                    key={item.id}
                    data-selected={isSelected}
                    onClick={() => {
                      navigate(`/journal/${item.entryId}`);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)]'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                      <div className="w-7 h-7 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center shrink-0">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                            {item.title}
                          </span>
                          <span className="capitalize px-1.5 py-0.2 rounded-full bg-[var(--bg-surface-elevated)] text-[10px] text-[var(--text-secondary)]">
                            {item.entryType}
                          </span>
                          {item.mood && (
                            <span className="text-[10px] text-[var(--text-secondary)]">
                              {item.mood}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] truncate line-clamp-1">
                          {item.snippet || 'No text snippet'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">
                      {item.dateStr}
                    </span>
                  </button>
                );
              }

              if (item.type === 'collection') {
                return (
                  <button
                    key={item.id}
                    data-selected={isSelected}
                    onClick={() => {
                      navigate('/collections');
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)]'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: item.color }}
                      >
                        <FolderTree className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] truncate">
                          {item.description || 'Collection stream'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">
                      {item.entryCount} {item.entryCount === 1 ? 'entry' : 'entries'}
                    </span>
                  </button>
                );
              }

              return null;
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2">
            <span>
              <kbd className="px-1 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[10px] ml-0.5">
                ↓
              </kbd>{' '}
              to navigate
            </span>
            <span>·</span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[10px]">
                ↵
              </kbd>{' '}
              to select
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Open anytime with</span>
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[10px] font-sans font-semibold">
              {modKey} K
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenShortcuts,
}) => {
  if (!isOpen) return null;

  return (
    <CommandPaletteDialog
      onClose={onClose}
      onOpenShortcuts={onOpenShortcuts}
    />
  );
};
