import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useJournal, type SyncStatus } from '../hooks/useJournal';
import { useCollections } from '../hooks/useCollections';
import { TipTapEditor } from '../components/editor/TipTapEditor';
import type { JournalEntry, EntryType, MoodType } from '../types/journal';
import {
  ArrowLeft,
  Check,
  Cloud,
  CloudOff,
  Loader2,
  Smile,
  Star,
  Archive,
  Trash2,
  Clock,
  Sparkles,
  FolderTree,
  Tag as TagIcon,
  X,
} from 'lucide-react';

export const EntryEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const { saveEntry, loadEntry, deleteEntry, toggleFavourite, toggleArchive } = useJournal();
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
      if (isCurrent) setTagsList(tags);
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

  const moods: { label: MoodType; icon: string }[] = [
    { label: 'Calm', icon: '🌿' },
    { label: 'Grateful', icon: '✨' },
    { label: 'Curious', icon: '🔍' },
    { label: 'Happy', icon: '☀️' },
    { label: 'Neutral', icon: '☕' },
    { label: 'Thoughtful' as MoodType, icon: '💭' },
    { label: 'Confused', icon: '❓' },
    { label: 'Frustrated', icon: '🌧️' },
    { label: 'Anxious', icon: '🌊' },
    { label: 'Sad', icon: '🍂' },
  ];

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(entryId);
      navigate('/journal');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28 animate-in fade-in duration-200">
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {localSyncStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-olive)]" />
                <span>Saving...</span>
              </>
            )}
            {localSyncStatus === 'saved' && (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400">Saved to cloud</span>
              </>
            )}
            {localSyncStatus === 'offline_saved' && (
              <>
                <Cloud className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-700 dark:text-amber-400">Offline — saved locally</span>
              </>
            )}
            {localSyncStatus === 'error' && (
              <>
                <CloudOff className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-rose-600">Saved locally (sync pending)</span>
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
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsFavourite(!isFavourite);
                toggleFavourite(entryId);
              }}
              title={isFavourite ? 'Unfavourite' : 'Add to favourites'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-rose-500 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Entry Type Selector */}
      <div className="flex items-center gap-2 select-none">
        {(['thought', 'journal', 'reflection'] as const).map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all cursor-pointer ${
              entryType === type
                ? 'bg-[var(--accent-olive)] text-white shadow-xs'
                : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {type}
          </button>
        ))}
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
        {/* Mood Selector */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 mr-1 shrink-0">
            <Smile className="w-3.5 h-3.5" />
            Mood:
          </span>
          {moods.map((m) => (
            <button
              key={m.label}
              onClick={() => handleMoodSelect(m.label)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                selectedMood === m.label
                  ? 'bg-[var(--accent-olive-soft)] border-[var(--accent-olive)] text-[var(--accent-olive-text)] font-medium'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
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
              <div className="absolute left-0 bottom-full mb-2 w-64 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg z-20 space-y-2 animate-in fade-in zoom-in-95 duration-100">
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
        <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] pt-1">
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{readingTime} min read</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
            <Sparkles className="w-3 h-3 text-[var(--accent-olive)]" />
            <span>Autosaves on every keystroke</span>
          </div>
        </div>
      </div>
    </div>
  );
};
