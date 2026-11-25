import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useJournal, type SyncStatus } from '../hooks/useJournal';
import { useCollections } from '../hooks/useCollections';
import { TipTapEditor } from '../components/editor/TipTapEditor';
import { KeyboardShortcutsModal } from '../components/editor/KeyboardShortcutsModal';
import { PromptDrawer } from '../components/editor/PromptDrawer';
import { useToast } from '../contexts/ToastContext';
import type { Editor } from '@tiptap/react';
import type { JournalEntry, EntryType, MoodType } from '../types/journal';
import {
  ArrowLeft,
  Check,
  Loader2,
  Smile,
  Star,
  Archive,
  Trash2,
  Clock,
  Compass,
  FolderTree,
  Tag as TagIcon,
  X,
  Maximize2,
  Minimize2,
  Copy,
  CheckCheck,
  Columns,
  AlignCenter,
  Keyboard,
  Zap,
  Leaf,
  Heart,
  Search,
  Sun,
  Coffee,
  MessageCircle,
  HelpCircle,
  CloudRain,
  Waves,
  Wind,
  Cloud,
  Scale,
  Flame,
} from 'lucide-react';

export const EntryEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const { saveEntry, loadEntry, moveToTrash, restoreEntry, toggleFavourite, toggleArchive } = useJournal();
  const { showToast } = useToast();
  const {
    collections,
    getEntryCollections,
    setEntryCollections,
    getEntryTags,
    setEntryTags,
  } = useCollections();

  const initialData = (location.state as {
    initialContent?: string;
    initialMood?: MoodType | null;
    initialTitle?: string;
    initialEntryType?: EntryType;
    initialContentJson?: Record<string, unknown>;
  }) || {};

  // Active Entry State
  const [entryId] = useState<string>(() => id || crypto.randomUUID());
  const [title, setTitle] = useState<string>(() => initialData.initialTitle || '');
  const [entryType, setEntryType] = useState<EntryType>(() => initialData.initialEntryType || 'journal');
  const [contentJson, setContentJson] = useState<Record<string, unknown>>(() => {
    if (initialData.initialContentJson) {
      return initialData.initialContentJson;
    }
    if (initialData.initialContent) {
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: initialData.initialContent }],
          },
        ],
      };
    }
    return {};
  });
  const [contentText, setContentText] = useState<string>(() => initialData.initialContent || '');
  const [wordCount, setWordCount] = useState<number>(() =>
    initialData.initialContent ? initialData.initialContent.trim().split(/\s+/).length : 0
  );
  const [selectedMood, setSelectedMood] = useState<MoodType | string | null>(initialData.initialMood || null);
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const [isArchived, setIsArchived] = useState<boolean>(false);
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());
  const [isReady, setIsReady] = useState<boolean>(!id);
  const [localSyncStatus, setLocalSyncStatus] = useState<SyncStatus>('saved');

  // Ref tracking latest entry state for immediate flush on exit/unmount
  const latestEntryRef = useRef<JournalEntry | null>(null);

  // Collections & Tags for this entry
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [isCollectionPickerOpen, setIsCollectionPickerOpen] = useState(false);

  // Gold-standard Zen / Focus mode & Canvas Width
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isWide, setIsWide] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Typewriter Scrolling & Shortcuts Guide States
  const [isTypewriterMode, setIsTypewriterMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('qalbanion_typewriter_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isPromptDrawerOpen, setIsPromptDrawerOpen] = useState<boolean>(false);
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null);
  const editorInstanceRef = useRef<Editor | null>(null);

  const handleToggleTypewriter = useCallback(() => {
    setIsTypewriterMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('qalbanion_typewriter_mode', String(next));
      } catch {
        // fallback
      }
      return next;
    });
  }, []);

  const handleCopyContent = useCallback(async () => {
    try {
      const fullContent = title ? `# ${title}\n\n${contentText}` : contentText;
      await navigator.clipboard.writeText(fullContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [title, contentText]);

  // Global Keyboard Shortcuts (Escape, Ctrl+/, Alt+T, Alt+Z, Alt+W, Alt+C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Shortcuts Modal Toggle: Ctrl+/ or Cmd+/
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // 2. Escape closes active modal or exits Zen mode
      if (e.key === 'Escape') {
        if (isShortcutsOpen) {
          setIsShortcutsOpen(false);
          return;
        }
        if (isFocusMode) {
          setIsFocusMode(false);
          return;
        }
      }

      // 3. Alt shortcuts
      if (e.altKey) {
        if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          handleToggleTypewriter();
        } else if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          setIsFocusMode((prev) => !prev);
        } else if (e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          setIsWide((prev) => !prev);
        } else if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          handleCopyContent();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, isShortcutsOpen, handleToggleTypewriter, handleCopyContent]);

  // Load existing entry if editing
  useEffect(() => {
    if (!id) return;
    let isCurrent = true;

    loadEntry(id).then((entry) => {
      if (!isCurrent) return;
      if (entry) {
        setTitle(entry.title || '');
        setEntryType(entry.entry_type);
        setContentJson(entry.content_json);
        setContentText(entry.content_text);
        setWordCount(entry.word_count);
        setSelectedMood(entry.mood);
        setIsFavourite(entry.is_favourite);
        setIsArchived(entry.status === 'archived');
        setCreatedAt(entry.created_at);
      }
      setIsReady(true);
    });

    // Load entry's collections & tags
    getEntryCollections(id).then((cols) => {
      if (isCurrent) setSelectedCollections(cols);
    });
    getEntryTags(id).then((tags) => {
      if (isCurrent) {
        setTagsList(tags);
        const energyTag = tags.find((t) => t.startsWith('energy:'));
        if (energyTag) {
          const raw = energyTag.replace('energy:', '');
          const match = ['low', 'gentle', 'centered', 'energized', 'radiant'].find((e) => e === raw);
          if (match) {
            setSelectedEnergy(match.charAt(0).toUpperCase() + match.slice(1));
          }
        }
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [id, loadEntry, getEntryCollections, getEntryTags]);

  // Debounced autosave
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushSave = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    if (latestEntryRef.current) {
      if (latestEntryRef.current.title || latestEntryRef.current.content_text) {
        saveEntry(latestEntryRef.current, true);
      }
    }
  }, [saveEntry]);

  // Ensure content is flushed immediately when navigating away or unmounting
  useEffect(() => {
    return () => {
      if (latestEntryRef.current) {
        if (latestEntryRef.current.title || latestEntryRef.current.content_text) {
          saveEntry(latestEntryRef.current, true);
        }
      }
    };
  }, [saveEntry]);

  const triggerAutosave = (updatedFields: Partial<JournalEntry>) => {
    setLocalSyncStatus('saving');

    const entryToSave: JournalEntry = {
      id: entryId,
      user_id: user?.id || 'local_guest',
      title: updatedFields.title !== undefined ? updatedFields.title : (title.trim() || null),
      content_json: updatedFields.content_json !== undefined ? updatedFields.content_json : contentJson,
      content_text: updatedFields.content_text !== undefined ? updatedFields.content_text : contentText,
      entry_type: updatedFields.entry_type || entryType,
      mood: updatedFields.mood !== undefined ? updatedFields.mood : selectedMood,
      status: (updatedFields.status || (isArchived ? 'archived' : 'active')),
      is_favourite: updatedFields.is_favourite !== undefined ? updatedFields.is_favourite : isFavourite,
      word_count: updatedFields.word_count !== undefined ? updatedFields.word_count : wordCount,
      client_updated_at: new Date().toISOString(),
      created_at: createdAt,
      updated_at: new Date().toISOString(),
    };

    latestEntryRef.current = entryToSave;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    // Fast 200ms debounce for in-memory & local-first persistence
    autosaveTimerRef.current = setTimeout(() => {
      saveEntry(entryToSave);
      setLocalSyncStatus(user && navigator.onLine ? 'saved' : 'offline_saved');
    }, 200);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    triggerAutosave({ title: val.trim() || null });
  };

  const handleEditorUpdate = (json: Record<string, unknown>, text: string, words: number) => {
    setContentJson(json);
    setContentText(text);
    setWordCount(words);
    triggerAutosave({ content_json: json, content_text: text, word_count: words });
  };

  const handleTypeChange = (type: EntryType) => {
    setEntryType(type);
    triggerAutosave({ entry_type: type });
  };

  const handleMoodSelect = (mood: MoodType) => {
    const next = selectedMood === mood ? null : mood;
    setSelectedMood(next);
    triggerAutosave({ mood: next });
  };

  // Toggle Collection Assignment
  const toggleCollection = (colId: string) => {
    const next = selectedCollections.includes(colId)
      ? selectedCollections.filter((c) => c !== colId)
      : [...selectedCollections, colId];
    setSelectedCollections(next);
    setEntryCollections(entryId, next);
  };

  // Add Tag
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^[#,]/, '');
      if (clean && !tagsList.includes(clean)) {
        const next = [...tagsList, clean];
        setTagsList(next);
        setEntryTags(entryId, next);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagName: string) => {
    const next = tagsList.filter((t) => t !== tagName);
    setTagsList(next);
    setEntryTags(entryId, next);
  };

  const moods: { label: MoodType; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Calm', icon: Leaf },
    { label: 'Grateful', icon: Heart },
    { label: 'Curious', icon: Search },
    { label: 'Happy', icon: Sun },
    { label: 'Neutral', icon: Coffee },
    { label: 'Thoughtful' as MoodType, icon: MessageCircle },
    { label: 'Confused', icon: HelpCircle },
    { label: 'Frustrated', icon: CloudRain },
    { label: 'Anxious', icon: Waves },
    { label: 'Sad', icon: Wind },
  ];

  const energyLevels: { label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Low', icon: Leaf },
    { label: 'Gentle', icon: Cloud },
    { label: 'Centered', icon: Scale },
    { label: 'Energized', icon: Zap },
    { label: 'Radiant', icon: Flame },
  ];

  const handleEnergySelect = (energy: string) => {
    const next = selectedEnergy === energy ? null : energy;
    setSelectedEnergy(next);
    const filtered = tagsList.filter((t) => !t.startsWith('energy:'));
    const nextTags = next ? [...filtered, `energy:${next.toLowerCase()}`] : filtered;
    setTagsList(nextTags);
    setEntryTags(entryId, nextTags);
    triggerAutosave({});
  };

  const handleSelectPrompt = (promptText: string) => {
    if (editorInstanceRef.current) {
      editorInstanceRef.current
        .chain()
        .focus()
        .insertContent(`<blockquote><p><em>${promptText}</em></p></blockquote><p></p>`)
        .run();
    }
  };

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleDelete = () => {
    moveToTrash(entryId);
    showToast({
      message: 'Thought moved to Trash',
      actionLabel: 'Undo',
      onAction: () => {
        restoreEntry(entryId);
      },
    });
    navigate('/journal');
  };

  return (
    <div
      className={`${
        isFocusMode
          ? 'fixed inset-0 z-50 bg-[var(--bg-base)] overflow-y-auto px-4 sm:px-8 py-10 flex flex-col items-center'
          : `${isWide ? 'max-w-4xl' : 'max-w-3xl'} mx-auto space-y-6 pb-28 animate-in fade-in duration-200`
      }`}
    >
      {/* Zen Mode Exit Floating Pill */}
      {isFocusMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5 bg-[var(--bg-surface)]/95 backdrop-blur-md p-1 rounded-full border border-[var(--border-subtle)] shadow-md select-none">
          <button
            type="button"
            onClick={handleToggleTypewriter}
            title={isTypewriterMode ? 'Typewriter Mode Active (Alt+T)' : 'Typewriter Scrolling (Alt+T)'}
            className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
              isTypewriterMode
                ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsShortcutsOpen(true)}
            title="Keyboard Shortcuts & Flow (Ctrl+/)"
            className="p-1.5 rounded-full text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-[var(--border-subtle)]" />
          <button
            type="button"
            onClick={() => setIsFocusMode(false)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer font-medium"
          >
            <Minimize2 className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
            <span>Exit Zen (Esc)</span>
          </button>
        </div>
      )}

      <div className={`w-full ${isFocusMode ? (isWide ? 'max-w-4xl' : 'max-w-3xl') : ''} space-y-6`}>
        {/* Top Header Bar */}
        <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] text-xs text-[var(--text-tertiary)] select-none">
          <button
            onClick={() => {
              flushSave();
              navigate('/journal');
            }}
            className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Journal</span>
          </button>

          {/* Sync Status Badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5">
              {localSyncStatus === 'saving' && (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-olive)]" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              )}
              {localSyncStatus === 'saved' && (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 hidden sm:inline">Saved</span>
                </>
              )}
              {localSyncStatus === 'offline_saved' && (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 hidden sm:inline">Saved</span>
                </>
              )}
              {localSyncStatus === 'error' && (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-amber-700 dark:text-amber-400 hidden sm:inline">Saved</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {new Date(createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Typewriter Scrolling Toggle */}
              <button
                type="button"
                onClick={handleToggleTypewriter}
                title={
                  isTypewriterMode
                    ? 'Typewriter Mode Active (Alt+T)'
                    : 'Typewriter Scrolling (Alt+T)'
                }
                className={`p-1.5 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  isTypewriterMode
                    ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] border border-[var(--accent-olive)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>

              {/* Shortcuts Modal Trigger */}
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(true)}
                title="Keyboard Shortcuts & Flow (Ctrl+/)"
                className="p-1.5 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <Keyboard className="w-3.5 h-3.5" />
              </button>

              {/* Width toggle (hidden on small phone screens) */}
              <button
                type="button"
                onClick={() => setIsWide(!isWide)}
                title={isWide ? 'Comfortable reading width' : 'Wide writing canvas (Alt+W)'}
                className="hidden sm:flex p-1.5 min-w-[34px] min-h-[34px] items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>

              {/* Quick Copy */}
              <button
                type="button"
                onClick={handleCopyContent}
                title="Copy markdown to clipboard (Alt+C)"
                className="p-1.5 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Zen Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsFocusMode(!isFocusMode)}
                title={isFocusMode ? 'Exit Zen Mode (Esc)' : 'Zen Focus Mode (Alt+Z)'}
                className="p-1.5 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {isFocusMode ? (
                  <Minimize2 className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => {
                  setIsFavourite(!isFavourite);
                  toggleFavourite(entryId);
                }}
                title={isFavourite ? 'Unfavourite' : 'Add to favourites'}
                className={`p-1.5 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  isFavourite
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Star className="w-4 h-4" fill={isFavourite ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={() => {
                  setIsArchived(!isArchived);
                  toggleArchive(entryId);
                }}
                title={isArchived ? 'Restore from archive' : 'Archive entry'}
                className={`p-1.5 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  isArchived
                    ? 'text-[var(--accent-olive)] bg-[var(--accent-olive-soft)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Archive className="w-4 h-4" />
              </button>

              <button
                onClick={handleDelete}
                title="Delete entry"
                className="p-1.5 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Type Selector & Prompts Trigger */}
      <div className="flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          {(['thought', 'journal', 'reflection'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                entryType === type
                  ? 'bg-[var(--accent-olive)] text-white'
                  : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsPromptDrawerOpen(true)}
          className="px-3 py-1 rounded-lg text-xs font-medium border border-[var(--accent-olive)]/30 bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] hover:bg-[var(--accent-olive)] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          title="Open reflection prompts"
        >
          <Compass className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Prompts</span>
        </button>
      </div>

      {/* Title Input (Optional) */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Title (optional)"
          className="w-full bg-transparent font-editorial text-3xl sm:text-4xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none tracking-tight font-medium"
        />
      </div>

      {/* Rich-Text TipTap Editor */}
      {isReady && (
        <TipTapEditor
          initialContent={contentJson}
          onChange={handleEditorUpdate}
          onEditorReady={(ed) => {
            editorInstanceRef.current = ed;
          }}
          isTypewriterMode={isTypewriterMode}
          onToggleTypewriter={handleToggleTypewriter}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          placeholder={
            entryType === 'thought'
              ? 'Capture a quick thought or idea without pressure...'
              : entryType === 'reflection'
              ? 'Deliberately examine this subject. What does it reveal to you?'
              : 'What is on your mind? Begin writing freely...'
          }
        />
      )}

      {/* Bottom Context Bar */}
      <div className="pt-6 border-t border-[var(--border-subtle)] space-y-4 select-none">
        {/* Mood & Energy Selectors */}
        <div className="space-y-3">
          {/* Mood Selector */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5 mr-1 shrink-0">
              <Smile className="w-3.5 h-3.5 stroke-[1.5]" />
              Mood
            </span>
            {moods.map((m) => {
              const MoodIcon = m.icon;
              return (
                <button
                  key={m.label}
                  onClick={() => handleMoodSelect(m.label)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    selectedMood === m.label
                      ? 'bg-[var(--accent-olive-soft)] border-[var(--accent-olive)] text-[var(--accent-olive-text)] font-medium'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  <MoodIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Energy Level Selector */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5 mr-1 shrink-0">
              <Zap className="w-3.5 h-3.5 stroke-[1.5]" />
              Energy
            </span>
            {energyLevels.map((en) => {
              const EnergyIcon = en.icon;
              return (
                <button
                  key={en.label}
                  type="button"
                  onClick={() => handleEnergySelect(en.label)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    selectedEnergy === en.label
                      ? 'bg-[var(--accent-olive-soft)] border-[var(--accent-olive)] text-[var(--accent-olive-text)] font-medium'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  <EnergyIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{en.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collections & Tags Row */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Collections Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCollectionPickerOpen(!isCollectionPickerOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-olive)] transition-colors cursor-pointer"
            >
              <FolderTree className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
              <span>
                {selectedCollections.length === 0
                  ? 'Assign to collection'
                  : `${selectedCollections.length} collection${selectedCollections.length > 1 ? 's' : ''}`}
              </span>
            </button>

            {isCollectionPickerOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-64 max-w-[calc(100vw-32px)] p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg z-20 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between text-xs font-medium text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
                  <span>Collections</span>
                  <button
                    onClick={() => setIsCollectionPickerOpen(false)}
                    className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {collections.length === 0 ? (
                  <p className="text-[11px] text-[var(--text-tertiary)] py-2 text-center">
                    No collections yet. Go to Collections page to create one.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {collections.map((col) => {
                      const isAssigned = selectedCollections.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => toggleCollection(col.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                            isAssigned
                              ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] font-medium'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
                          }`}
                        >
                          <span className="truncate">{col.name}</span>
                          {isAssigned && <Check className="w-3.5 h-3.5 text-[var(--accent-olive)] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags Inline Pills & Input */}
          <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-[200px]">
            <TagIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            {tagsList.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag (press Enter)..."
              className="bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none min-w-[120px]"
            />
          </div>
        </div>

        {/* Word Count & Read Time */}
        <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] pt-1 tabular-nums">
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{readingTime} min read</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
            <Check className="w-3.5 h-3.5 stroke-[1.5] text-[var(--accent-olive)]" />
            <span>Autosaved</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Companion HUD */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] shadow-lg select-none text-xs text-[var(--text-secondary)]">
        <span className="font-mono text-[11px] font-medium text-[var(--text-tertiary)] px-1">
          {wordCount}w · {readingTime}m
        </span>

        <div className="w-[1px] h-3.5 bg-[var(--border-subtle)] mx-0.5" />

        {/* Typewriter Toggle */}
        <button
          type="button"
          onClick={handleToggleTypewriter}
          title={isTypewriterMode ? 'Typewriter Scrolling Active (Alt+T)' : 'Typewriter Scrolling (Alt+T)'}
          className={`p-1 rounded-full transition-colors cursor-pointer ${
            isTypewriterMode
              ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        {/* Shortcuts Trigger */}
        <button
          type="button"
          onClick={() => setIsShortcutsOpen(true)}
          title="Keyboard Shortcuts Guide (Ctrl+/)"
          className="p-1 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>

        {/* Quick Markdown Copy */}
        <button
          type="button"
          onClick={handleCopyContent}
          title="Copy markdown to clipboard (Alt+C)"
          className="p-1 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          {isCopied ? (
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Zen Mode Toggle */}
        <button
          type="button"
          onClick={() => setIsFocusMode(!isFocusMode)}
          title={isFocusMode ? 'Exit Zen Mode (Esc)' : 'Zen Focus Retreat (Alt+Z)'}
          className={`p-1 rounded-full transition-colors cursor-pointer ${
            isFocusMode
              ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {isFocusMode ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Reflection Prompts Drawer */}
      <PromptDrawer
        isOpen={isPromptDrawerOpen}
        onClose={() => setIsPromptDrawerOpen(false)}
        onSelectPrompt={handleSelectPrompt}
      />
    </div>
  );
};
