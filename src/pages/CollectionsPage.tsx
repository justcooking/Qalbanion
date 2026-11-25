import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../hooks/useCollections';
import { useJournal } from '../hooks/useJournal';
import type { Collection } from '../types/journal';
import {
  Plus,
  FolderTree,
  ArrowRight,
  Trash2,
  Edit2,
  X,
  Calendar,
  Pin,
  Leaf,
  Lightbulb,
  BookOpen,
  Compass,
  Feather,
  Waves,
  Mountain,
  Palette,
} from 'lucide-react';

const THEMATIC_ICONS = [
  { label: 'Stream', icon: 'folder', Component: FolderTree },
  { label: 'Growth', icon: 'leaf', Component: Leaf },
  { label: 'Ideas', icon: 'lightbulb', Component: Lightbulb },
  { label: 'Readings', icon: 'book', Component: BookOpen },
  { label: 'Decisions', icon: 'compass', Component: Compass },
  { label: 'Peace', icon: 'feather', Component: Feather },
  { label: 'Life', icon: 'waves', Component: Waves },
  { label: 'Challenges', icon: 'mountain', Component: Mountain },
  { label: 'Creative', icon: 'palette', Component: Palette },
];

const renderCollectionIcon = (iconKey: string) => {
  const match = THEMATIC_ICONS.find((item) => item.icon === iconKey);
  const IconComp = match ? match.Component : FolderTree;
  return <IconComp className="w-4 h-4 stroke-[1.5] text-white" />;
};

export const CollectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { collections, entryCollectionsMap, isLoading, createCollection, updateCollection, deleteCollection } = useCollections();
  const { entries } = useJournal();

  const getCollectionEntries = (collectionId: string) => {
    return entries.filter((entry) => {
      if (entry.status === 'trashed') return false;
      const fromEntry = entry.collections?.includes(collectionId);
      const fromMap = entryCollectionsMap[entry.id]?.includes(collectionId);
      return Boolean(fromEntry || fromMap);
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#5E6D55');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  // Persistent Pinned Collections & Thematic Icons maps
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('qalbanion_pinned_collections');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [iconsMap, setIconsMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('qalbanion_collection_icons');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const colors = [
    { label: 'Muted Olive', value: '#5E6D55' },
    { label: 'Warm Terracotta', value: '#9E5D4E' },
    { label: 'Deep Slate', value: '#465B6E' },
    { label: 'Sage', value: '#7A8B74' },
    { label: 'Plum Charcoal', value: '#6E5564' },
    { label: 'Amber Clay', value: '#8E734E' },
  ];

  const togglePin = (colId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedIds((prev) => {
      const next = prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId];
      try {
        localStorage.setItem('qalbanion_pinned_collections', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const handleOpenCreate = () => {
    setEditingCollection(null);
    setName('');
    setDescription('');
    setColor('#5E6D55');
    setSelectedIcon('📁');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCollection(col);
    setName(col.name);
    setDescription(col.description || '');
    setColor(col.color || '#5E6D55');
    setSelectedIcon(iconsMap[col.id] || '📁');
    setIsModalOpen(true);
  };

  const handleDelete = async (colId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this collection? (Your journal entries will NOT be deleted).')) {
      await deleteCollection(colId);
      if (selectedCollection?.id === colId) {
        setSelectedCollection(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let targetId = editingCollection?.id;

    if (editingCollection) {
      await updateCollection(editingCollection.id, {
        name: name.trim(),
        description: description.trim() || null,
        color,
      });
    } else {
      const created = await createCollection(name.trim(), description.trim(), color);
      targetId = created?.id;
    }

    if (targetId) {
      const nextIcons = { ...iconsMap, [targetId]: selectedIcon };
      setIconsMap(nextIcons);
      try {
        localStorage.setItem('qalbanion_collection_icons', JSON.stringify(nextIcons));
      } catch {
        /* ignore */
      }
    }

    setIsModalOpen(false);
  };

  // Sort collections: Pinned collections first, then alphabetical
  const sortedCollections = useMemo(() => {
    return [...collections].sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id);
      const bPinned = pinnedIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [collections, pinnedIds]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text-primary)]">
            Collections
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Thematic streams to group thoughts without forcing rigid categorization.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-xs sm:text-sm font-medium shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New collection</span>
        </button>
      </div>

      {/* Collections Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">
          Loading your collections...
        </div>
      ) : sortedCollections.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
          <FolderTree className="w-8 h-8 mx-auto text-[var(--accent-olive)]" />
          <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
            No collections yet
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            Create collections for themes like "Questions I Haven't Answered", "Ideas", or "Personal Growth".
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-olive)] text-white text-xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create your first collection</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedCollections.map((col) => {
            const isPinned = pinnedIds.includes(col.id);
            const iconChar = iconsMap[col.id] || 'folder';

            return (
              <div
                key={col.id}
                onClick={() => setSelectedCollection(selectedCollection?.id === col.id ? null : col)}
                className={`p-5 rounded-2xl border transition-colors cursor-pointer space-y-3 group ${
                  selectedCollection?.id === col.id
                    ? 'border-[var(--accent-olive)] bg-[var(--bg-surface-elevated)] ring-1 ring-[var(--accent-olive)]/30'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: col.color || '#5E6D55' }}
                  >
                    {renderCollectionIcon(iconChar)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Pin button */}
                    <button
                      type="button"
                      onClick={(e) => togglePin(col.id, e)}
                      title={isPinned ? 'Unpin stream' : 'Pin stream to top'}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isPinned
                          ? 'text-[var(--accent-olive)] bg-[var(--accent-olive-soft)]'
                          : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" fill={isPinned ? 'currentColor' : 'none'} />
                    </button>

                    <span className="text-xs tabular-nums text-[var(--text-tertiary)]">
                      {(() => {
                        const count = entries.length > 0 ? getCollectionEntries(col.id).length : (col.entry_count || 0);
                        return `${count} ${count === 1 ? 'entry' : 'entries'}`;
                      })()}
                    </span>

                    <button
                      onClick={(e) => handleOpenEdit(col, e)}
                      className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-w-[28px] min-h-[28px] flex items-center justify-center cursor-pointer"
                      title="Edit collection"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(col.id, e)}
                      className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-rose-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-w-[28px] min-h-[28px] flex items-center justify-center cursor-pointer"
                      title="Delete collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-olive)] transition-colors">
                      {col.name}
                    </h3>
                    {isPinned && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)]">
                        Pinned
                      </span>
                    )}
                  </div>
                  {col.description && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-1 text-xs font-medium text-[var(--accent-olive)]">
                  <span>{selectedCollection?.id === col.id ? 'Viewing entries below' : 'Explore entries'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Collection Entries View */}
      {selectedCollection && (() => {
        const collectionEntries = getCollectionEntries(selectedCollection.id);
        return (
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: selectedCollection.color || '#5E6D55' }}
              >
                {renderCollectionIcon(iconsMap[selectedCollection.id] || 'folder')}
              </div>
              <h2 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
                {selectedCollection.name}
              </h2>
            </div>
            <button
              onClick={() => setSelectedCollection(null)}
              className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          <div className="space-y-2">
            {collectionEntries.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
                No entries assigned to this collection yet. Open any entry and attach it to this collection.
              </p>
            ) : (
              collectionEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => navigate(`/journal/${entry.id}`)}
                  className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:border-[var(--border-strong)] transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-editorial text-lg text-[var(--text-primary)]">
                      {entry.title || 'Untitled Thought'}
                    </h4>
                    <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                      <Calendar className="w-3 h-3 stroke-[1.5]" />
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 stroke-[1.5] text-[var(--text-tertiary)]" />
                </div>
              ))
            )}
          </div>
        </div>
        );
      })()}

      {/* Modal: Create or Edit Collection */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
                {editingCollection ? 'Edit Collection' : 'New Collection'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Personal Development, Ideas, Architecture"
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-olive)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What belongs in this collection?"
                  rows={3}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-olive)] rounded-xl px-3.5 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none resize-none transition-colors"
                />
              </div>

              {/* Thematic Icon Picker */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                  Thematic Icon
                </label>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {THEMATIC_ICONS.map((item) => {
                    const IconComp = item.Component;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setSelectedIcon(item.icon)}
                        title={item.label}
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          selectedIcon === item.icon
                            ? 'border-[var(--accent-olive)] bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <IconComp className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Picker */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      title={c.label}
                      className={`w-7 h-7 rounded-full transition-colors cursor-pointer ${
                        color === c.value ? 'ring-2 ring-offset-2 ring-[var(--accent-olive)]' : ''
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
                >
                  {editingCollection ? 'Save changes' : 'Create collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
