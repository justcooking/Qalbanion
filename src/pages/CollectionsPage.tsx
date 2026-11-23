import React, { useState } from 'react';
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
} from 'lucide-react';

export const CollectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { collections, isLoading, createCollection, updateCollection, deleteCollection } = useCollections();
  const { entries } = useJournal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#5E6D55');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const colors = [
    { label: 'Muted Olive', value: '#5E6D55' },
    { label: 'Warm Terracotta', value: '#9E5D4E' },
    { label: 'Deep Slate', value: '#465B6E' },
    { label: 'Sage', value: '#7A8B74' },
    { label: 'Plum Charcoal', value: '#6E5564' },
    { label: 'Amber Clay', value: '#8E734E' },
  ];

  const handleOpenCreate = () => {
    setEditingCollection(null);
    setName('');
    setDescription('');
    setColor('#5E6D55');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCollection(col);
    setName(col.name);
    setDescription(col.description || '');
    setColor(col.color || '#5E6D55');
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

    if (editingCollection) {
      await updateCollection(editingCollection.id, {
        name: name.trim(),
        description: description.trim() || null,
        color,
      });
    } else {
      await createCollection(name.trim(), description.trim(), color);
    }

    setIsModalOpen(false);
  };

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
      ) : collections.length === 0 ? (
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
          {collections.map((col) => (
            <div
              key={col.id}
              onClick={() => setSelectedCollection(selectedCollection?.id === col.id ? null : col)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 group ${
                selectedCollection?.id === col.id
                  ? 'border-[var(--accent-olive)] bg-[var(--bg-surface-elevated)] ring-1 ring-[var(--accent-olive)]/30'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: col.color || '#5E6D55' }}
                >
                  <FolderTree className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {col.entry_count || 0} entries
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
                <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-olive)] transition-colors">
                  {col.name}
                </h3>
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
          ))}
        </div>
      )}

      {/* Selected Collection Entries View */}
      {selectedCollection && (
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCollection.color }} />
              <h2 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
                {selectedCollection.name}
              </h2>
            </div>
            <button
              onClick={() => setSelectedCollection(null)}
              className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {entries.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
                No entries assigned to this collection yet. Open any entry and attach it to this collection.
              </p>
            ) : (
              entries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => navigate(`/journal/${entry.id}`)}
                  className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:border-[var(--accent-olive)] transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-editorial text-lg text-[var(--text-primary)]">
                      {entry.title || 'Untitled Thought'}
                    </h4>
                    <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)]" />
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        color === c.value ? 'scale-125 ring-2 ring-offset-2 ring-[var(--accent-olive)]' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
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
