import React from 'react';
import { Plus, FolderTree, ArrowRight } from 'lucide-react';

export const CollectionsPage: React.FC = () => {
  const initialCollections = [
    { id: '1', name: 'Personal Development', count: 3, description: 'Growth, reading notes, and insights on character.' },
    { id: '2', name: 'Ideas & Spontaneous Thoughts', count: 5, description: 'Quick hypotheses and creative sparks.' },
    { id: '3', name: 'Questions I Haven\'t Answered', count: 2, description: 'Unresolved paradoxes and things to ponder over time.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-4xl font-normal tracking-tight text-[var(--text-primary)]">
            Collections
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Organize thoughts into thematic streams without rigid categorisation.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-olive)] hover:bg-[var(--accent-olive-hover)] text-white text-sm font-medium shadow-xs transition-colors self-start sm:self-auto cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>New collection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {initialCollections.map((col) => (
          <div
            key={col.id}
            className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
                <FolderTree className="w-4 h-4" />
              </div>
              <span className="text-xs text-[var(--text-tertiary)]">{col.count} entries</span>
            </div>

            <div>
              <h3 className="font-editorial text-xl font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-olive)] transition-colors">
                {col.name}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                {col.description}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-1 text-xs text-[var(--accent-olive)] font-medium">
              <span>Explore collection</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
