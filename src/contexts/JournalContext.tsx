import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  saveLocalDraft,
  getLocalDraft,
  deleteLocalDraft,
  cacheEntriesLocally,
  getCachedEntriesLocally,
  deleteCachedEntryLocally,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
} from '../lib/indexeddb';
import type { JournalEntry } from '../types/journal';

export type SyncStatus = 'saved' | 'saving' | 'offline_saved' | 'error';

interface JournalContextType {
  entries: JournalEntry[];
  isLoading: boolean;
  isOnline: boolean;
  syncStatus: SyncStatus;
  saveEntry: (entry: JournalEntry, immediate?: boolean) => Promise<void>;
  loadEntry: (id: string) => Promise<JournalEntry | null>;
  deleteEntry: (id: string) => Promise<void>;
  moveToTrash: (id: string) => Promise<void>;
  restoreEntry: (id: string) => Promise<void>;
  permanentlyDeleteEntry: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  toggleFavourite: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  fetchEntries: () => Promise<JournalEntry[]>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

const LOCAL_STORAGE_CACHE_KEY = 'qalbanion_entries_cache';

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved');

  // Synchronous initial state from localStorage mirror to eliminate ANY route-switch flicker
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      /* ignore */
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to sync state to fast local storage mirror
  const updateLocalMirror = (newEntries: JournalEntry[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(newEntries));
    } catch (e) {
      console.warn('Failed to update local entries mirror:', e);
    }
  };

  // Flush pending offline changes to Supabase
  const flushSyncQueue = useCallback(async () => {
    if (!user || !navigator.onLine) return;
    try {
      const queue = await getSyncQueue();
      for (const item of queue) {
        if (item.action === 'upsert') {
          await supabase.from('journal_entries').upsert(item.entry);
        } else if (item.action === 'delete') {
          await supabase.from('journal_entries').delete().eq('id', item.entry.id);
        }
        await removeFromSyncQueue(item.id);
      }
    } catch (err) {
      console.warn('Sync queue flush notice:', err);
    }
  }, [user]);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      flushSyncQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [flushSyncQueue]);

  // Fetch all entries (Supabase if online & table exists, fallback to IndexedDB)
  const fetchEntries = useCallback(async (): Promise<JournalEntry[]> => {
    setIsLoading(true);
    try {
      // 1. Try Supabase if user is logged in and online
      if (user && isOnline) {
        try {
          const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const formatted = data as JournalEntry[];
            setEntries(formatted);
            updateLocalMirror(formatted);
            await cacheEntriesLocally(formatted);
            setIsLoading(false);
            return formatted;
          }
        } catch (supabaseErr) {
          console.warn('Supabase query notice (using local-first store):', supabaseErr);
        }
      }

      // 2. Load from IndexedDB (drafts + cached)
      const localCached = await getCachedEntriesLocally(user?.id);
      if (localCached && localCached.length > 0) {
        setEntries(localCached);
        updateLocalMirror(localCached);
        setIsLoading(false);
        return localCached;
      }

      // 3. Fallback to localStorage mirror
      try {
        const mirror = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
        if (mirror) {
          const parsed = JSON.parse(mirror);
          setEntries(parsed);
          setIsLoading(false);
          return parsed;
        }
      } catch {
        /* ignore */
      }

      setIsLoading(false);
      return [];
    } catch (err) {
      console.error('Failed to load entries:', err);
      const localCached = await getCachedEntriesLocally(user?.id);
      setEntries(localCached);
      updateLocalMirror(localCached);
      setIsLoading(false);
      return localCached;
    }
  }, [user, isOnline]);

  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntries().then((res) => {
      if (!isMounted) return;
      if (res && res.length > 0) {
        setEntries(res);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [fetchEntries]);

  // Save Entry (Guaranteed Instant Persistence in Memory + IndexedDB)
  const saveEntry = useCallback(
    async (entry: JournalEntry, immediate = false): Promise<void> => {
      // 1. IMMEDIATELY update React state in-memory so every route sees it with 0ms latency
      setEntries((prev) => {
        const index = prev.findIndex((e) => e.id === entry.id);
        const updated = index >= 0 ? [...prev] : [entry, ...prev];
        if (index >= 0) {
          updated[index] = entry;
        }
        updateLocalMirror(updated);
        return updated;
      });

      // 2. IMMEDIATELY persist to IndexedDB (both drafts & cached_entries)
      try {
        await saveLocalDraft(entry);
      } catch (idbErr) {
        console.warn('IndexedDB write notice:', idbErr);
      }

      setSyncStatus('saving');

      // 3. Remote Cloud Sync (debounced or immediate)
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      const syncRemote = async () => {
        if (user && navigator.onLine) {
          try {
            const { error } = await supabase.from('journal_entries').upsert({
              id: entry.id,
              user_id: user.id,
              title: entry.title,
              content_json: entry.content_json,
              content_text: entry.content_text,
              entry_type: entry.entry_type,
              mood: entry.mood,
              status: entry.status,
              is_favourite: entry.is_favourite,
              word_count: entry.word_count,
              client_updated_at: entry.client_updated_at,
              updated_at: new Date().toISOString(),
            });

            if (error) {
              console.warn('Cloud sync notice, queued locally:', error.message);
              await addToSyncQueue(entry, 'upsert');
              setSyncStatus('offline_saved');
            } else {
              setSyncStatus('saved');
            }
          } catch {
            await addToSyncQueue(entry, 'upsert');
            setSyncStatus('offline_saved');
          }
        } else {
          await addToSyncQueue(entry, 'upsert');
          setSyncStatus('offline_saved');
        }
      };

      if (immediate) {
        await syncRemote();
      } else {
        autosaveTimerRef.current = setTimeout(syncRemote, 500);
      }
    },
    [user]
  );

  // Load a single entry
  const loadEntry = useCallback(
    async (id: string): Promise<JournalEntry | null> => {
      // Check in-memory entries first
      const inMemory = entries.find((e) => e.id === id);
      if (inMemory) return inMemory;

      // Check local draft / indexedDB
      const draft = await getLocalDraft(id);
      if (draft) return draft;

      // Check cloud if online
      if (user && isOnline) {
        try {
          const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('id', id)
            .single();

          if (!error && data) {
            return data as JournalEntry;
          }
        } catch {
          /* ignore */
        }
      }

      return null;
    },
    [entries, user, isOnline]
  );

  // Soft delete: Move an entry to Trash with 30-day retention
  const moveToTrash = useCallback(
    async (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      const updated: JournalEntry = {
        ...entry,
        status: 'trashed',
        client_updated_at: new Date().toISOString(),
      };
      await saveEntry(updated, true);
    },
    [entries, saveEntry]
  );

  // Restore a trashed entry back to active status
  const restoreEntry = useCallback(
    async (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      const updated: JournalEntry = {
        ...entry,
        status: 'active',
        client_updated_at: new Date().toISOString(),
      };
      await saveEntry(updated, true);
    },
    [entries, saveEntry]
  );

  // Permanently delete an entry from local state, IndexedDB cache, and cloud
  const permanentlyDeleteEntry = useCallback(
    async (id: string) => {
      // 1. Immediately remove from React state & local mirror
      setEntries((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        updateLocalMirror(updated);
        return updated;
      });

      // 2. Remove from IndexedDB
      await deleteLocalDraft(id);
      await deleteCachedEntryLocally(id);

      // 3. Remove from cloud
      if (user && navigator.onLine) {
        try {
          const { error } = await supabase.from('journal_entries').delete().eq('id', id);
          if (error) {
            await addToSyncQueue({ id } as JournalEntry, 'delete');
          }
        } catch {
          await addToSyncQueue({ id } as JournalEntry, 'delete');
        }
      }
    },
    [user]
  );

  // Empty all trashed entries
  const emptyTrash = useCallback(async () => {
    const trashed = entries.filter((e) => e.status === 'trashed');
    for (const e of trashed) {
      await permanentlyDeleteEntry(e.id);
    }
  }, [entries, permanentlyDeleteEntry]);

  // Backward-compatible deleteEntry now safely routes to moveToTrash
  const deleteEntry = useCallback(
    async (id: string) => {
      await moveToTrash(id);
    },
    [moveToTrash]
  );

  // Toggle Favourite
  const toggleFavourite = useCallback(
    async (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      const updated: JournalEntry = {
        ...entry,
        is_favourite: !entry.is_favourite,
        client_updated_at: new Date().toISOString(),
      };
      await saveEntry(updated, true);
    },
    [entries, saveEntry]
  );

  // Toggle Archive
  const toggleArchive = useCallback(
    async (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      const updated: JournalEntry = {
        ...entry,
        status: entry.status === 'archived' ? 'active' : 'archived',
        client_updated_at: new Date().toISOString(),
      };
      await saveEntry(updated, true);
    },
    [entries, saveEntry]
  );

  return (
    <JournalContext.Provider
      value={{
        entries,
        isLoading,
        isOnline,
        syncStatus,
        saveEntry,
        loadEntry,
        deleteEntry,
        moveToTrash,
        restoreEntry,
        permanentlyDeleteEntry,
        emptyTrash,
        toggleFavourite,
        toggleArchive,
        fetchEntries,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useJournalContext = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournalContext must be used within a JournalProvider');
  }
  return context;
};
