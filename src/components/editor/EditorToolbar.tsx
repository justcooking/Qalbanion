import React, { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link2,
  Undo2,
  Redo2,
  Type,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useTypography } from '../../contexts/TypographyContext';
import {
  TYPOGRAPHY_PRESETS,
  type BodySize,
} from '../../types/typography';

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    currentPresetId,
    applyPreset,
    activeBodyFont,
    bodySize,
    setBodySize,
  } = useTypography();

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsFontMenuOpen(false);
      }
    };
    if (isFontMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFontMenuOpen]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const toolButton = (
    onClick: () => void,
    isActive: boolean,
    icon: React.ReactNode,
    title: string,
    disabled = false
  ) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] border border-[var(--accent-olive)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border border-transparent'
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs select-none sticky top-2 z-10 backdrop-blur-md">
      {/* Text Styles */}
      {toolButton(
        () => editor.chain().focus().toggleBold().run(),
        editor.isActive('bold'),
        <Bold className="w-3.5 h-3.5" />,
        'Bold (Ctrl+B)'
      )}
      {toolButton(
        () => editor.chain().focus().toggleItalic().run(),
        editor.isActive('italic'),
        <Italic className="w-3.5 h-3.5" />,
        'Italic (Ctrl+I)'
      )}
      {toolButton(
        () => editor.chain().focus().toggleUnderline().run(),
        editor.isActive('underline'),
        <UnderlineIcon className="w-3.5 h-3.5" />,
        'Underline (Ctrl+U)'
      )}

      <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-1" />

      {/* Headings */}
      {toolButton(
        () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        editor.isActive('heading', { level: 1 }),
        <Heading1 className="w-3.5 h-3.5" />,
        'Heading 1'
      )}
      {toolButton(
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        editor.isActive('heading', { level: 2 }),
        <Heading2 className="w-3.5 h-3.5" />,
        'Heading 2'
      )}

      <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-1" />

      {/* Lists & Quotes */}
      {toolButton(
        () => editor.chain().focus().toggleBulletList().run(),
        editor.isActive('bulletList'),
        <List className="w-3.5 h-3.5" />,
        'Bullet list'
      )}
      {toolButton(
        () => editor.chain().focus().toggleOrderedList().run(),
        editor.isActive('orderedList'),
        <ListOrdered className="w-3.5 h-3.5" />,
        'Numbered list'
      )}
      {toolButton(
        () => editor.chain().focus().toggleBlockquote().run(),
        editor.isActive('blockquote'),
        <Quote className="w-3.5 h-3.5" />,
        'Blockquote'
      )}
      {toolButton(
        setLink,
        editor.isActive('link'),
        <Link2 className="w-3.5 h-3.5" />,
        'Add link'
      )}

      <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-1" />

      {/* History */}
      {toolButton(
        () => editor.chain().focus().undo().run(),
        false,
        <Undo2 className="w-3.5 h-3.5" />,
        'Undo (Ctrl+Z)',
        !editor.can().undo()
      )}
      {toolButton(
        () => editor.chain().focus().redo().run(),
        false,
        <Redo2 className="w-3.5 h-3.5" />,
        'Redo (Ctrl+Y)',
        !editor.can().redo()
      )}

      {/* Typography Quick Selector */}
      <div className="relative ml-auto" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
            isFontMenuOpen
              ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] border-[var(--accent-olive)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border-transparent'
          }`}
          title="Change writing typography & font size"
        >
          <Type className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
          <span className="hidden sm:inline font-sans">
            {activeBodyFont.name}
          </span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {isFontMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg z-50 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                Aesthetic Typography
              </span>
              <a
                href="/settings"
                className="text-[11px] text-[var(--accent-olive)] hover:underline"
              >
                More options
              </a>
            </div>

            {/* Presets */}
            <div className="space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] block px-1">
                Curated Presets
              </span>
              <div className="space-y-0.5">
                {TYPOGRAPHY_PRESETS.map((preset) => {
                  const isSelected = currentPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        applyPreset(preset.id);
                        setIsFontMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] font-medium'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
                      }`}
                    >
                      <span>{preset.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-olive)]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size Pills */}
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] block px-1">
                Text Size
              </span>
              <div className="flex gap-1.5">
                {(
                  [
                    { id: 'normal', label: '16px' },
                    { id: 'large', label: '18px' },
                    { id: 'reading', label: '20px' },
                  ] as { id: BodySize; label: string }[]
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setBodySize(s.id)}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                      bodySize === s.id
                        ? 'border-[var(--accent-olive)] bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
