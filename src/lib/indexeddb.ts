import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { JournalEntry } from '../types/journal';

export interface SyncQueueItem {
  id: string;
  entry: JournalEntry;
  action: 'upsert' | 'delete';
  queued_at: string;
}

interface QalbanionDB extends DBSchema {
  drafts: {
    key: string;
    value: JournalEntry;
    indexes: { 'by-user': string; 'by-date': string };
  };
  cached_entries: {
    key: string;
    value: JournalEntry;
    indexes: { 'by-user': string; 'by-date': string; 'by-status': string };
  };
  sync_queue: {
    key: string;
    value: SyncQueueItem;
  };
}

const DB_NAME = 'qalbanion_offline_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<QalbanionDB>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<QalbanionDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 1. Local drafts store
        if (!db.objectStoreNames.contains('drafts')) {
          const draftStore = db.createObjectStore('drafts', { keyPath: 'id' });
          draftStore.createIndex('by-user', 'user_id');
          draftStore.createIndex('by-date', 'client_updated_at');
        }

        // 2. Cached entries store for offline browsing
        if (!db.objectStoreNames.contains('cached_entries')) {
          const entryStore = db.createObjectStore('cached_entries', { keyPath: 'id' });
          entryStore.createIndex('by-user', 'user_id');
          entryStore.createIndex('by-date', 'created_at');
          entryStore.createIndex('by-status', 'status');
        }

        // 3. Sync queue for pending cloud mutations
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// ==========================================
// DRAFTS & ENTRIES (Unified Local-First Store)
// ==========================================

export const saveLocalDraft = async (entry: JournalEntry): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction(['drafts', 'cached_entries'], 'readwrite');
  await tx.objectStore('drafts').put(entry);
  await tx.objectStore('cached_entries').put(entry);
  await tx.done;
};

export const getLocalDraft = async (id: string): Promise<JournalEntry | undefined> => {
  const db = await getDB();
  const draft = await db.get('drafts', id);
  if (draft) return draft;
  return db.get('cached_entries', id);
};

export const deleteLocalDraft = async (id: string): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction(['drafts', 'cached_entries'], 'readwrite');
  await tx.objectStore('drafts').delete(id);
  await tx.objectStore('cached_entries').delete(id);
  await tx.done;
};

// ==========================================
// CACHED ENTRIES (Offline Journal Reading)
// ==========================================

export const cacheEntriesLocally = async (entries: JournalEntry[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction(['cached_entries', 'drafts'], 'readwrite');
  for (const entry of entries) {
    await tx.objectStore('cached_entries').put(entry);
    await tx.objectStore('drafts').put(entry);
  }
  await tx.done;
};

export const getCachedEntriesLocally = async (userId?: string): Promise<JournalEntry[]> => {
  const db = await getDB();
  const [cached, drafts] = await Promise.all([
    db.getAll('cached_entries'),
    db.getAll('drafts'),
  ]);

  // Merge cached and drafts by ID
  const map = new Map<string, JournalEntry>();
  for (const item of [...cached, ...drafts]) {
    // If filtering by user, allow matching user_id OR local_guest
    if (userId && item.user_id && item.user_id !== userId && item.user_id !== 'local_guest') {
      continue;
    }
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else {
      const existingDate = new Date(existing.client_updated_at || existing.updated_at).getTime();
      const itemDate = new Date(item.client_updated_at || item.updated_at).getTime();
      if (itemDate >= existingDate) {
        map.set(item.id, item);
      }
    }
  }

  const result = Array.from(map.values());
  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return result;
};

export const deleteCachedEntryLocally = async (id: string): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction(['cached_entries', 'drafts'], 'readwrite');
  await tx.objectStore('cached_entries').delete(id);
  await tx.objectStore('drafts').delete(id);
  await tx.done;
};

// ==========================================
// SYNC QUEUE
// ==========================================

export const addToSyncQueue = async (
  entry: JournalEntry,
  action: 'upsert' | 'delete' = 'upsert'
): Promise<void> => {
  const db = await getDB();
  await db.put('sync_queue', {
    id: entry.id,
    entry,
    action,
    queued_at: new Date().toISOString(),
  });
};

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  const db = await getDB();
  return db.getAll('sync_queue');
};

export const removeFromSyncQueue = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('sync_queue', id);
};
