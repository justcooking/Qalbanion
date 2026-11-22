import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Code,
  Type,
  Sparkles,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  keywords: string[];
  action: (editor: Editor) => void;
}

interface SlashCommandMenuProps {
  editor: Editor | null;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'paragraph',
        title: 'Plain Text',
        subtitle: 'Normal body paragraph',
        icon: <Type className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['text', 'p', 'paragraph', 'normal'],
        action: (ed) => ed.chain().focus().setParagraph().run(),
      },
      {
        id: 'h1',
        title: 'Heading 1',
        subtitle: 'Large essay title or major thought',
        icon: <Heading1 className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['h1', 'heading', 'title', 'large', 'header'],
        action: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        id: 'h2',
        title: 'Heading 2',
        subtitle: 'Medium section subtitle',
        icon: <Heading2 className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['h2', 'heading', 'section', 'subtitle'],
        action: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        id: 'h3',
        title: 'Heading 3',
        subtitle: 'Small sub-heading for focal points',
        icon: <Heading3 className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['h3', 'subheading', 'small'],
        action: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        id: 'bullet-list',
        title: 'Bulleted List',
        subtitle: 'Unordered collection of thoughts',
        icon: <List className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['bullet', 'list', 'ul', 'points'],
        action: (ed) => ed.chain().focus().toggleBulletList().run(),
      },
      {
        id: 'ordered-list',
        title: 'Numbered List',
        subtitle: 'Sequential or chronological steps',
        icon: <ListOrdered className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['number', 'ordered', 'ol', 'steps'],
        action: (ed) => ed.chain().focus().toggleOrderedList().run(),
      },
      {
        id: 'quote',
        title: 'Reflection Quote',
        subtitle: 'Editorial blockquote for meaningful excerpts',
        icon: <Quote className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['quote', 'blockquote', 'wisdom', 'cite'],
        action: (ed) => ed.chain().focus().toggleBlockquote().run(),
      },
      {
        id: 'divider',
        title: 'Divider',
        subtitle: 'Horizontal divider line between thoughts',
        icon: <Minus className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['divider', 'hr', 'line', 'separator'],
        action: (ed) => ed.chain().focus().setHorizontalRule().run(),
      },
      {
        id: 'code-block',
        title: 'Code Block',
        subtitle: 'Monospace preformatted block',
        icon: <Code className="w-4 h-4 text-[var(--accent-olive)]" />,
        keywords: ['code', 'pre', 'snippet', 'monospace'],
        action: (ed) => ed.chain().focus().toggleCodeBlock().run(),
      },
    ],
    []
  );

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        c.subtitle.toLowerCase().includes(lower) ||
        c.keywords.some((k) => k.includes(lower))
    );
  }, [commands, query]);

  const executeCommand = useCallback(
    (item: CommandItem) => {
      if (!editor) return;

      // Delete the slash and query text
      const { state } = editor;
      const { selection } = state;
      const { $from } = selection;
      const currentLineText = $from.parent.textContent;
      const slashIndex = currentLineText.lastIndexOf('/');

      if (slashIndex >= 0) {
        const fromPos = $from.start() + slashIndex;
        const toPos = $from.pos;
        editor.chain().focus().deleteRange({ from: fromPos, to: toPos }).run();
      }

      // Execute command action
      item.action(editor);
      setIsOpen(false);
      setQuery('');
    },
    [editor]
  );

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { state } = editor;
      const { selection } = state;
      const { $from } = selection;

      // Check current line text up to cursor
      const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc');
      const slashMatch = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/);

      if (slashMatch) {
        const filterText = slashMatch[1];
        setQuery(filterText);
        setSelectedIndex(0);

        // Get cursor coordinates on screen
        const coordsAtCursor = editor.view.coordsAtPos($from.pos);
        setCoords({
          top: coordsAtCursor.bottom + 8,
          left: Math.min(window.innerWidth - 300, Math.max(16, coordsAtCursor.left)),
        });
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        if (filteredCommands.length > 0) {
          e.preventDefault();
          executeCommand(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    editor.on('transaction', handleUpdate);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      editor.off('transaction', handleUpdate);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [editor, isOpen, filteredCommands, selectedIndex, executeCommand]);

  if (!isOpen || !coords || filteredCommands.length === 0) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
      className="z-50 w-72 max-h-80 overflow-y-auto p-1.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md shadow-2xl space-y-0.5 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center justify-between border-b border-[var(--border-subtle)] mb-1">
        <span>Insert block</span>
        <span className="flex items-center gap-1 opacity-70">
          <Sparkles className="w-3 h-3 text-[var(--accent-olive)]" />
          <span>Type to filter</span>
        </span>
      </div>

      {filteredCommands.map((item, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <button
            key={item.id}
            type="button"
            onMouseEnter={() => setSelectedIndex(idx)}
            onClick={() => executeCommand(item)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
              isSelected
                ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)]'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-[var(--border-subtle)] ${
                isSelected ? 'bg-white/80 dark:bg-black/20' : 'bg-[var(--bg-surface-elevated)]'
              }`}
            >
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                {item.title}
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] truncate">
                {item.subtitle}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
