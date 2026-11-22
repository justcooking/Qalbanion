import React, { useState, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link2,
  Heading1,
  Heading2,
  Quote,
  Palette,
  Highlighter,
  ChevronDown,
} from 'lucide-react';

interface FloatingBubbleMenuProps {
  editor: Editor | null;
}

export const FloatingBubbleMenu: React.FC<FloatingBubbleMenuProps> = ({ editor }) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isHighlightOpen, setIsHighlightOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const updatePosition = () => {
      const { from, to } = editor.state.selection;

      // Only show when there is a non-collapsed text selection and editor has focus
      if (from === to || !editor.isFocused) {
        setIsVisible(false);
        setIsSizeOpen(false);
        setIsColorOpen(false);
        setIsHighlightOpen(false);
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setIsVisible(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        setIsVisible(false);
        return;
      }

      // Position floating bar directly above the selection
      const top = rect.top - 48;
      const left = rect.left + rect.width / 2;

      setCoords({ top, left });
      setIsVisible(true);
    };

    editor.on('selectionUpdate', updatePosition);
    editor.on('blur', () => {
      // Small timeout so clicks inside the floating menu itself aren't killed
      setTimeout(() => {
        if (!menuRef.current?.contains(document.activeElement)) {
          setIsVisible(false);
        }
      }, 150);
    });

    return () => {
      editor.off('selectionUpdate', updatePosition);
    };
  }, [editor]);

  if (!editor || !isVisible || !coords) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const btnClass = (isActive: boolean) =>
    `p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
      isActive
        ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
    }`;

  const textSizes = [
    { label: 'Small', value: '14px' },
    { label: 'Standard', value: '16px' },
    { label: 'Large', value: '18px' },
    { label: 'Subhead', value: '20px' },
    { label: 'Heading', value: '24px' },
  ];

  const textColors = [
    { hex: '#2C2B29', label: 'Charcoal' },
    { hex: '#5E6D55', label: 'Olive' },
    { hex: '#9E5D4E', label: 'Terracotta' },
    { hex: '#465B6E', label: 'Slate' },
    { hex: '#B85C5C', label: 'Crimson' },
  ];

  const highlightColors = [
    { hex: 'rgba(254, 240, 138, 0.45)', label: 'Yellow' },
    { hex: 'rgba(239, 242, 237, 0.9)', label: 'Olive' },
    { hex: 'rgba(254, 226, 226, 0.55)', label: 'Rose' },
    { hex: 'rgba(224, 242, 254, 0.55)', label: 'Sky' },
  ];

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${Math.max(12, coords.top)}px`,
        left: `${coords.left}px`,
        transform: 'translateX(-50%)',
      }}
      className="z-50 flex items-center gap-0.5 p-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md shadow-xl animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      {/* Bold, Italic, Underline, Strike, Code */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive('underline'))}
        title="Underline"
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={btnClass(editor.isActive('code'))}
        title="Code"
      >
        <Code className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-0.5" />

      {/* Font Size Quick Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsSizeOpen(!isSizeOpen);
            setIsColorOpen(false);
            setIsHighlightOpen(false);
          }}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            editor.isActive('fontSize') ? 'text-[var(--accent-olive)]' : 'text-[var(--text-secondary)]'
          } hover:bg-[var(--bg-surface-elevated)] cursor-pointer`}
          title="Font Size"
        >
          <span>Size</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {isSizeOpen && (
          <div className="absolute left-0 bottom-full mb-1.5 w-32 p-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg space-y-0.5">
            {textSizes.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  editor.chain().focus().setFontSize(s.value).run();
                  setIsSizeOpen(false);
                }}
                className="w-full text-left px-2 py-1 rounded text-xs hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] cursor-pointer"
              >
                {s.label} ({s.value})
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().unsetFontSize().run();
                setIsSizeOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded text-[11px] text-rose-500 hover:bg-rose-500/10 cursor-pointer border-t border-[var(--border-subtle)] pt-1"
            >
              Default
            </button>
          </div>
        )}
      </div>

      {/* Text Color Popover */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsColorOpen(!isColorOpen);
            setIsSizeOpen(false);
            setIsHighlightOpen(false);
          }}
          className={btnClass(editor.isActive('textColor'))}
          title="Text Color"
        >
          <Palette className="w-3.5 h-3.5" />
        </button>

        {isColorOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 p-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg flex gap-1">
            {textColors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => {
                  editor.chain().focus().setTextColor(c.hex).run();
                  setIsColorOpen(false);
                }}
                className="w-5 h-5 rounded-full border border-black/10 transition-transform hover:scale-110 cursor-pointer"
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>
        )}
      </div>

      {/* Highlighter Popover */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsHighlightOpen(!isHighlightOpen);
            setIsSizeOpen(false);
            setIsColorOpen(false);
          }}
          className={btnClass(editor.isActive('textHighlight'))}
          title="Highlight"
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>

        {isHighlightOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 p-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg flex gap-1">
            {highlightColors.map((h) => (
              <button
                key={h.hex}
                type="button"
                onClick={() => {
                  editor.chain().focus().setTextHighlight(h.hex).run();
                  setIsHighlightOpen(false);
                }}
                className="w-5 h-5 rounded-md border border-black/10 transition-transform hover:scale-110 cursor-pointer"
                style={{ backgroundColor: h.hex }}
                title={h.label}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-0.5" />

      {/* Headings & Quote */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btnClass(editor.isActive('heading', { level: 1 }))}
        title="Heading 1"
      >
        <Heading1 className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive('blockquote'))}
        title="Quote"
      >
        <Quote className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={setLink}
        className={btnClass(editor.isActive('link'))}
        title="Link"
      >
        <Link2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
