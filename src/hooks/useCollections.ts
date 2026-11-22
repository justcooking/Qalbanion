import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
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

export const useCollections = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all collections and tags for current user
  const fetchCollectionsAndTags = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        // 1. Fetch Collections
        const { data: colsData } = await supabase
          .from('collections')
          .select('*, entry_collections(count)')
          .order('name', { ascending: true });

        if (colsData) {
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
        }

        // 2. Fetch Tags
        const { data: tagsData } = await supabase
          .from('tags')
          .select('*')
          .order('name', { ascending: true });

        if (tagsData) {
          setTags(tagsData as Tag[]);
        }
      } else {
        // Fallback local storage for offline/guest
        const savedCols = localStorage.getItem('qalbanion_local_collections');
        const savedTags = localStorage.getItem('qalbanion_local_tags');
        if (savedCols) setCollections(JSON.parse(savedCols));
        if (savedTags) setTags(JSON.parse(savedTags));
      }
    } catch (err) {
      console.error('Error fetching collections/tags:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCollectionsAndTags();
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

    if (user && navigator.onLine) {
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
        setCollections((prev) => [...prev, { ...newCol, id: data.id }]);
        return data as Collection;
      }
    }

    // Local state fallback
    setCollections((prev) => {
      const updated = [...prev, newCol];
      localStorage.setItem('qalbanion_local_collections', JSON.stringify(updated));
      return updated;
    });
    return newCol;
  };

  // Update Collection
  const updateCollection = async (id: string, updates: Partial<Collection>) => {
    if (user && navigator.onLine) {
      await supabase
        .from('collections')
        .update({
          name: updates.name,
          description: updates.description,
          color: updates.color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c))
    );
  };

  // Delete Collection (Notice: Entries are NOT deleted!)
  const deleteCollection = async (id: string) => {
    if (user && navigator.onLine) {
      await supabase.from('collections').delete().eq('id', id);
    }

    setCollections((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem('qalbanion_local_collections', JSON.stringify(updated));
      return updated;
    });
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

    if (user && navigator.onLine) {
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
        setTags((prev) => [...prev, data as Tag]);
        return data as Tag;
      }
    }

    setTags((prev) => {
      const updated = [...prev, newTag];
      localStorage.setItem('qalbanion_local_tags', JSON.stringify(updated));
      return updated;
    });
    return newTag;
  };

  // Get collections for an entry
  const getEntryCollections = async (entryId: string): Promise<string[]> => {
    if (user && navigator.onLine) {
      const { data } = await supabase
        .from('entry_collections')
        .select('collection_id')
        .eq('entry_id', entryId);
      return data ? data.map((d) => d.collection_id) : [];
    }
    const map = JSON.parse(localStorage.getItem('qalbanion_entry_collections') || '{}');
    return map[entryId] || [];
  };

  // Save collections for an entry
  const setEntryCollections = async (entryId: string, collectionIds: string[]) => {
    if (user && navigator.onLine) {
      // 1. Delete existing
      await supabase.from('entry_collections').delete().eq('entry_id', entryId);
      // 2. Insert new
      if (collectionIds.length > 0) {
        const rows = collectionIds.map((colId) => ({
          entry_id: entryId,
          collection_id: colId,
          user_id: user.id,
        }));
        await supabase.from('entry_collections').insert(rows);
      }
    }

    // Local fallback
    const map = JSON.parse(localStorage.getItem('qalbanion_entry_collections') || '{}');
    map[entryId] = collectionIds;
    localStorage.setItem('qalbanion_entry_collections', JSON.stringify(map));
  };

  // Get tags for an entry
  const getEntryTags = async (entryId: string): Promise<string[]> => {
    if (user && navigator.onLine) {
      const { data } = await supabase
        .from('entry_tags')
        .select('tag_id, tags(name)')
        .eq('entry_id', entryId);
      if (data) {
        const rows = data as unknown as TagRelationRow[];
        return rows.map((d) => d.tags?.name).filter((name): name is string => Boolean(name));
      }
      return [];
    }
    const map = JSON.parse(localStorage.getItem('qalbanion_entry_tags') || '{}');
    return map[entryId] || [];
  };

  // Save tags for an entry
  const setEntryTags = async (entryId: string, tagNames: string[]) => {
    if (user && navigator.onLine) {
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
    }

    const map = JSON.parse(localStorage.getItem('qalbanion_entry_tags') || '{}');
    map[entryId] = tagNames;
    localStorage.setItem('qalbanion_entry_tags', JSON.stringify(map));
  };

  return {
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
  };
};
