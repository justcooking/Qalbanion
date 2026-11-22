import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Collection, Tag } from '../types/journal';

interface CollectionRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  entry_collections?: { count: number }[];
}

interface TagRelationRow {
  tag_id: string;
  tags: { name: string } | null;
}

interface CollectionsContextType {
  collections: Collection[];
  tags: Tag[];
  isLoading: boolean;
  createCollection: (name: string, description?: string, color?: string) => Promise<Collection | null>;
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  createTag: (name: string) => Promise<Tag | null>;
  getEntryCollections: (entryId: string) => Promise<string[]>;
  setEntryCollections: (entryId: string, collectionIds: string[]) => Promise<void>;
  getEntryTags: (entryId: string) => Promise<string[]>;
  setEntryTags: (entryId: string, tagNames: string[]) => Promise<void>;
  fetchCollectionsAndTags: () => Promise<void>;
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

const LOCAL_COLLECTIONS_KEY = 'qalbanion_local_collections';
const LOCAL_TAGS_KEY = 'qalbanion_local_tags';
const LOCAL_ENTRY_COLS_KEY = 'qalbanion_entry_collections';
const LOCAL_ENTRY_TAGS_KEY = 'qalbanion_entry_tags';

export const CollectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Initialize collections & tags synchronously from local cache so there is never an empty flicker
  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_COLLECTIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tags, setTags] = useState<Tag[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_TAGS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Helper to persist collections to local storage
  const saveCollectionsLocally = (cols: Collection[]) => {
    try {
      localStorage.setItem(LOCAL_COLLECTIONS_KEY, JSON.stringify(cols));
    } catch (e) {
      console.warn('Failed to save collections locally:', e);
    }
  };

  // Helper to persist tags to local storage
  const saveTagsLocally = (t: Tag[]) => {
    try {
      localStorage.setItem(LOCAL_TAGS_KEY, JSON.stringify(t));
    } catch (e) {
      console.warn('Failed to save tags locally:', e);
    }
  };

  // Fetch collections and tags from Supabase (or fallback to local cache)
  const fetchCollectionsAndTags = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Always ensure local cache is loaded
      const savedCols = localStorage.getItem(LOCAL_COLLECTIONS_KEY);
      const savedTags = localStorage.getItem(LOCAL_TAGS_KEY);
      if (savedCols) {
        setCollections(JSON.parse(savedCols));
      }
      if (savedTags) {
        setTags(JSON.parse(savedTags));
      }

      // 2. If user is logged in and online, attempt Supabase sync
      if (user && navigator.onLine) {
        try {
          const { data: colsData, error: colsError } = await supabase
            .from('collections')
            .select('*, entry_collections(count)')
            .order('name', { ascending: true });

          if (!colsError && colsData) {
            const raw = colsData as unknown as CollectionRow[];
            const formatted: Collection[] = raw.map((c) => ({
              id: c.id,
              user_id: c.user_id,
              name: c.name,
              description: c.description,
              color: c.color || '#5E6D55',
              created_at: c.created_at,
              updated_at: c.updated_at,
              entry_count: c.entry_collections?.[0]?.count || 0,
            }));
            setCollections(formatted);
            saveCollectionsLocally(formatted);
          } else if (colsError) {
            console.warn('Supabase collections query notice:', colsError.message);
          }
        } catch (supabaseColErr) {
          console.warn('Supabase collections query failed (using local cache):', supabaseColErr);
        }

        try {
          const { data: tagsData, error: tagsError } = await supabase
            .from('tags')
            .select('*')
            .order('name', { ascending: true });

          if (!tagsError && tagsData) {
            const formattedTags = tagsData as Tag[];
            setTags(formattedTags);
            saveTagsLocally(formattedTags);
          }
        } catch (supabaseTagErr) {
          console.warn('Supabase tags query failed (using local cache):', supabaseTagErr);
        }
      }
    } catch (err) {
      console.error('Error fetching collections/tags:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCollectionsAndTags().then(() => {
      if (!isMounted) return;
    });
    return () => {
      isMounted = false;
    };
  }, [fetchCollectionsAndTags]);

  // Create Collection
  const createCollection = async (name: string, description = '', color = '#5E6D55') => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const newCol: Collection = {
      id: crypto.randomUUID(),
      user_id: user?.id || 'local_guest',
      name: trimmed,
      description: description.trim() || null,
      color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      entry_count: 0,
    };

    // 1. Immediately update state and local cache (guarantees zero data loss & instant UI)
    setCollections((prev) => {
      const updated = [...prev, newCol];
      saveCollectionsLocally(updated);
      return updated;
    });

    // 2. If logged in and online, attempt Supabase insert in background
    if (user && navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('collections')
          .insert({
            id: newCol.id,
            user_id: user.id,
            name: newCol.name,
            description: newCol.description,
            color: newCol.color,
          })
          .select()
          .single();

        if (!error && data) {
          // If Supabase returned an assigned ID or timestamp, sync it
          setCollections((prev) => {
            const synced = prev.map((c) => (c.id === newCol.id ? { ...c, ...data } : c));
            saveCollectionsLocally(synced);
            return synced;
          });
          return data as Collection;
        } else if (error) {
          console.warn('Supabase collection insert notice (saved locally):', error.message);
        }
      } catch (err) {
        console.warn('Supabase insert error (saved locally):', err);
      }
    }

    return newCol;
  };

  // Update Collection
  const updateCollection = async (id: string, updates: Partial<Collection>) => {
    const updatedAt = new Date().toISOString();

    // 1. Immediately update state & local storage
    setCollections((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates, updated_at: updatedAt } : c));
      saveCollectionsLocally(updated);
      return updated;
    });

    // 2. Sync to Supabase if logged in
    if (user && navigator.onLine) {
      try {
        await supabase
          .from('collections')
          .update({
            name: updates.name,
            description: updates.description,
            color: updates.color,
            updated_at: updatedAt,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase collection update notice:', err);
      }
    }
  };

  // Delete Collection
  const deleteCollection = async (id: string) => {
    // 1. Immediately remove from state & local storage
    setCollections((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveCollectionsLocally(updated);
      return updated;
    });

    // 2. Delete from Supabase if logged in
    if (user && navigator.onLine) {
      try {
        await supabase.from('collections').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase collection delete notice:', err);
      }
    }
  };

  // Create Tag
  const createTag = async (name: string) => {
    const clean = name.trim().replace(/^#/, '');
    if (!clean) return null;

    const existing = tags.find((t) => t.name.toLowerCase() === clean.toLowerCase());
    if (existing) return existing;

    const newTag: Tag = {
      id: crypto.randomUUID(),
      user_id: user?.id || 'local_guest',
      name: clean,
      created_at: new Date().toISOString(),
    };

    // 1. Immediate local state & storage update
    setTags((prev) => {
      const updated = [...prev, newTag];
      saveTagsLocally(updated);
      return updated;
    });

    // 2. Supabase insert
    if (user && navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('tags')
          .insert({
            id: newTag.id,
            user_id: user.id,
            name: newTag.name,
          })
          .select()
          .single();

        if (!error && data) {
          setTags((prev) => {
            const synced = prev.map((t) => (t.id === newTag.id ? (data as Tag) : t));
            saveTagsLocally(synced);
            return synced;
          });
          return data as Tag;
        }
      } catch (err) {
        console.warn('Supabase tag insert notice:', err);
      }
    }

    return newTag;
  };

  // Entry-Collection relationships
  const getEntryCollections = async (entryId: string): Promise<string[]> => {
    if (user && navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('entry_collections')
          .select('collection_id')
          .eq('entry_id', entryId);
        if (!error && data) {
          return data.map((d) => d.collection_id);
        }
      } catch {
        // Fallback to local
      }
    }
    try {
      const map = JSON.parse(localStorage.getItem(LOCAL_ENTRY_COLS_KEY) || '{}');
      return map[entryId] || [];
    } catch {
      return [];
    }
  };

  const setEntryCollections = async (entryId: string, collectionIds: string[]) => {
    // 1. Save locally
    try {
      const map = JSON.parse(localStorage.getItem(LOCAL_ENTRY_COLS_KEY) || '{}');
      map[entryId] = collectionIds;
      localStorage.setItem(LOCAL_ENTRY_COLS_KEY, JSON.stringify(map));
    } catch (e) {
      console.warn('Failed to save entry collections locally:', e);
    }

    // 2. Sync to Supabase
    if (user && navigator.onLine) {
      try {
        await supabase.from('entry_collections').delete().eq('entry_id', entryId);
        if (collectionIds.length > 0) {
          const rows = collectionIds.map((colId) => ({
            entry_id: entryId,
            collection_id: colId,
            user_id: user.id,
          }));
          await supabase.from('entry_collections').insert(rows);
        }
      } catch (err) {
        console.warn('Supabase entry_collections sync notice:', err);
      }
    }
  };

  // Entry-Tags relationships
  const getEntryTags = async (entryId: string): Promise<string[]> => {
    if (user && navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('entry_tags')
          .select('tag_id, tags(name)')
          .eq('entry_id', entryId);
        if (!error && data) {
          const rows = data as unknown as TagRelationRow[];
          return rows.map((d) => d.tags?.name).filter((n): n is string => Boolean(n));
        }
      } catch {
        // Fallback
      }
    }
    try {
      const map = JSON.parse(localStorage.getItem(LOCAL_ENTRY_TAGS_KEY) || '{}');
      return map[entryId] || [];
    } catch {
      return [];
    }
  };

  const setEntryTags = async (entryId: string, tagNames: string[]) => {
    // 1. Save locally
    try {
      const map = JSON.parse(localStorage.getItem(LOCAL_ENTRY_TAGS_KEY) || '{}');
      map[entryId] = tagNames;
      localStorage.setItem(LOCAL_ENTRY_TAGS_KEY, JSON.stringify(map));
    } catch (e) {
      console.warn('Failed to save entry tags locally:', e);
    }

    // 2. Sync to Supabase
    if (user && navigator.onLine) {
      try {
        const tagIds: string[] = [];
        for (const tName of tagNames) {
          const tag = await createTag(tName);
          if (tag) tagIds.push(tag.id);
        }

        await supabase.from('entry_tags').delete().eq('entry_id', entryId);
        if (tagIds.length > 0) {
          const rows = tagIds.map((tId) => ({
            entry_id: entryId,
            tag_id: tId,
            user_id: user.id,
          }));
          await supabase.from('entry_tags').insert(rows);
        }
      } catch (err) {
        console.warn('Supabase entry_tags sync notice:', err);
      }
    }
  };

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        tags,
        isLoading,
        createCollection,
        updateCollection,
        deleteCollection,
        createTag,
        getEntryCollections,
        setEntryCollections,
        getEntryTags,
        setEntryTags,
        fetchCollectionsAndTags,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCollectionsContext = () => {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error('useCollectionsContext must be used within a CollectionsProvider');
  }
  return context;
};
