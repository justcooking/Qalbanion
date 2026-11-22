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
// DRAFTS
// ==========================================

export const saveLocalDraft = async (entry: JournalEntry): Promise<void> => {
  const db = await getDB();
  await db.put('drafts', entry);
};

export const getLocalDraft = async (id: string): Promise<JournalEntry | undefined> => {
  const db = await getDB();
  return db.get('drafts', id);
};

export const deleteLocalDraft = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('drafts', id);
};

// ==========================================
// CACHED ENTRIES (Offline Journal Reading)
// ==========================================

export const cacheEntriesLocally = async (entries: JournalEntry[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('cached_entries', 'readwrite');
  for (const entry of entries) {
    await tx.store.put(entry);
  }
  await tx.done;
};

export const getCachedEntriesLocally = async (userId?: string): Promise<JournalEntry[]> => {
  const db = await getDB();
  if (userId) {
    return db.getAllFromIndex('cached_entries', 'by-user', userId);
  }
  return db.getAll('cached_entries');
};

export const deleteCachedEntryLocally = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('cached_entries', id);
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
