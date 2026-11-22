import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  saveLocalDraft,
  getLocalDraft,
  deleteLocalDraft,
  cacheEntriesLocally,
  getCachedEntriesLocally,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
} from '../lib/indexeddb';
import type { JournalEntry, EntryStatus } from '../types/journal';

export type SyncStatus = 'saved' | 'saving' | 'offline_saved' | 'error';

export const useJournal = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      console.warn('Sync queue flush error:', err);
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

  // Fetch all entries (Supabase if online, fallback to IndexedDB cache)
  const fetchEntries = useCallback(async () => {
    try {
      if (user && isOnline) {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data as JournalEntry[];
          setEntries(formatted);
          await cacheEntriesLocally(formatted);
          setIsLoading(false);
          return formatted;
        }
      }

      // Fallback to local cache
      const localCached = await getCachedEntriesLocally(user?.id);
      setEntries(localCached);
      setIsLoading(false);
      return localCached;
    } catch (err) {
      console.error('Failed to load entries:', err);
      const localCached = await getCachedEntriesLocally(user?.id);
      setEntries(localCached);
      setIsLoading(false);
      return localCached;
    }
  }, [user, isOnline]);

  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntries().then(() => {
      if (!isMounted) return;
    });
    return () => {
      isMounted = false;
    };
  }, [fetchEntries]);

  // Debounced Autosave Engine
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveEntry = useCallback(
    (entry: JournalEntry, immediate = false) => {
      setSyncStatus('saving');

      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      const performSave = async () => {
        try {
          // 1. Immediately store in IndexedDB (zero latency, resilient)
          await saveLocalDraft(entry);

          // 2. If online and logged in, push to Supabase
          if (user && navigator.onLine) {
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
              console.warn('Cloud sync error, queued locally:', error);
              await addToSyncQueue(entry, 'upsert');
              setSyncStatus('offline_saved');
            } else {
              setSyncStatus('saved');
            }
          } else {
            // Offline or guest
            await addToSyncQueue(entry, 'upsert');
            setSyncStatus('offline_saved');
          }

          // Update local entries state
          setEntries((prev) => {
            const index = prev.findIndex((e) => e.id === entry.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = entry;
              return updated;
            }
            return [entry, ...prev];
          });
        } catch (err) {
          console.error('Save failed:', err);
          setSyncStatus('error');
        }
      };

      if (immediate) {
        performSave();
      } else {
        autosaveTimerRef.current = setTimeout(performSave, 600);
      }
    },
    [user]
  );

  // Load a single entry (checks drafts first, then cache, then cloud)
  const loadEntry = useCallback(
    async (id: string): Promise<JournalEntry | null> => {
      try {
        // Check local draft
        const draft = await getLocalDraft(id);
        if (draft) return draft;

        // Check cloud if online
        if (user && isOnline) {
          const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('id', id)
            .single();

          if (!error && data) {
            return data as JournalEntry;
          }
        }

        // Check cached entries
        const cached = entries.find((e) => e.id === id);
        return cached || null;
      } catch (err) {
        console.error('Error loading entry:', err);
        return null;
      }
    },
    [user, isOnline, entries]
  );

  // Delete entry (soft or hard)
  const deleteEntry = useCallback(
    async (id: string, soft = true) => {
      try {
        if (soft) {
          // Soft delete (move to trashed)
          const target = entries.find((e) => e.id === id);
          if (target) {
            const updated = { ...target, status: 'trashed' as EntryStatus };
            saveEntry(updated, true);
          }
        } else {
          // Permanent delete
          await deleteLocalDraft(id);
          if (user && isOnline) {
            await supabase.from('journal_entries').delete().eq('id', id);
          } else {
            const mockEntry = { id } as JournalEntry;
            await addToSyncQueue(mockEntry, 'delete');
          }
          setEntries((prev) => prev.filter((e) => e.id !== id));
        }
      } catch (err) {
        console.error('Delete error:', err);
      }
    },
    [entries, user, isOnline, saveEntry]
  );

  // Toggle Favourite
  const toggleFavourite = useCallback(
    async (id: string) => {
      const target = entries.find((e) => e.id === id);
      if (target) {
        const updated: JournalEntry = {
          ...target,
          is_favourite: !target.is_favourite,
          client_updated_at: new Date().toISOString(),
        };
        saveEntry(updated, true);
      }
    },
    [entries, saveEntry]
  );

  // Archive / Restore
  const toggleArchive = useCallback(
    async (id: string) => {
      const target = entries.find((e) => e.id === id);
      if (target) {
        const nextStatus: EntryStatus = target.status === 'archived' ? 'active' : 'archived';
        const updated: JournalEntry = {
          ...target,
          status: nextStatus,
          client_updated_at: new Date().toISOString(),
        };
        saveEntry(updated, true);
      }
    },
    [entries, saveEntry]
  );

  return {
    entries,
    isLoading,
    isOnline,
    syncStatus,
    fetchEntries,
    saveEntry,
    loadEntry,
    deleteEntry,
    toggleFavourite,
    toggleArchive,
  };
};
