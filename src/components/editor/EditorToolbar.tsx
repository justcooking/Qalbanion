import React, { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Undo2,
  Redo2,
  Type,
  Check,
  ChevronDown,
  Highlighter,
  Palette,
  Minus,
} from 'lucide-react';
import { useTypography } from '../../contexts/TypographyContext';
import {
  TYPOGRAPHY_PRESETS,
  HEADING_FONTS,
  BODY_FONTS,
  type BodySize,
} from '../../types/typography';

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  // Popover states
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isHighlightDropdownOpen, setIsHighlightDropdownOpen] = useState(false);

  const fontMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const highlightMenuRef = useRef<HTMLDivElement>(null);

  const {
    currentPresetId,
    applyPreset,
    headingFontId,
    bodyFontId,
    setHeadingFontId,
    setBodyFontId,
    activeBodyFont,
    bodySize,
    setBodySize,
  } = useTypography();

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (fontMenuRef.current && !fontMenuRef.current.contains(target)) {
        setIsFontMenuOpen(false);
      }
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(target)) {
        setIsSizeDropdownOpen(false);
      }
      if (colorMenuRef.current && !colorMenuRef.current.contains(target)) {
        setIsColorDropdownOpen(false);
      }
      if (highlightMenuRef.current && !highlightMenuRef.current.contains(target)) {
        setIsHighlightDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 min-w-[34px] min-h-[34px] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] border border-[var(--accent-olive)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border border-transparent'
      }`}
    >
      {icon}
    </button>
  );

  const textSizes = [
    { label: 'Small (12px)', value: '12px' },
    { label: 'Caption (14px)', value: '14px' },
    { label: 'Standard (16px)', value: '16px' },
    { label: 'Large (18px)', value: '18px' },
    { label: 'Subhead (20px)', value: '20px' },
    { label: 'Heading (24px)', value: '24px' },
    { label: 'Title (30px)', value: '30px' },
    { label: 'Display (36px)', value: '36px' },
  ];

  const textColors = [
    { label: 'Charcoal (Default)', value: 'inherit', hex: '#2C2B29' },
    { label: 'Muted Olive', value: '#5E6D55', hex: '#5E6D55' },
    { label: 'Terracotta', value: '#9E5D4E', hex: '#9E5D4E' },
    { label: 'Slate Blue', value: '#465B6E', hex: '#465B6E' },
    { label: 'Sage', value: '#7A8B74', hex: '#7A8B74' },
    { label: 'Plum Charcoal', value: '#6E5564', hex: '#6E5564' },
    { label: 'Soft Crimson', value: '#B85C5C', hex: '#B85C5C' },
  ];

  const highlightColors = [
    { label: 'Soft Lemon', value: 'rgba(254, 240, 138, 0.45)', hex: '#FEF08A' },
    { label: 'Warm Olive', value: 'rgba(239, 242, 237, 0.9)', hex: '#EFF2ED' },
    { label: 'Blush Rose', value: 'rgba(254, 226, 226, 0.55)', hex: '#FEE2E2' },
    { label: 'Gentle Sky', value: 'rgba(224, 242, 254, 0.55)', hex: '#E0F2FE' },
    { label: 'Pale Sage', value: 'rgba(220, 252, 231, 0.45)', hex: '#DCFCE7' },
  ];

  return (
    <div className="flex items-center sm:flex-wrap gap-1 p-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 shadow-xs select-none sticky top-2 z-20 backdrop-blur-md overflow-x-auto sm:overflow-visible no-scrollbar touch-scroll">
      {/* 1. Basic Text Formatting */}
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
      {toolButton(
        () => editor.chain().focus().toggleStrike().run(),
        editor.isActive('strike'),
        <Strikethrough className="w-3.5 h-3.5" />,
        'Strikethrough'
      )}
      {toolButton(
        () => editor.chain().focus().toggleCode().run(),
        editor.isActive('code'),
        <Code className="w-3.5 h-3.5" />,
        'Inline code'
      )}

      <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-0.5 shrink-0" />

      {/* 2. Selected Text Font Size Selector */}
      <div className="relative shrink-0" ref={sizeMenuRef}>
        <button
          type="button"
          onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
            isSizeDropdownOpen || editor.isActive('fontSize')
              ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] border-[var(--accent-olive)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border-transparent'
          }`}
          title="Font size for selected text"
        >
          <span>Size</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {isSizeDropdownOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-44 p-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg z-50 space-y-0.5 animate-in fade-in duration-100">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border-subtle)] mb-1">
              Selected Text Size
            </div>
            {textSizes.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  editor.chain().focus().setFontSize(s.value).run();
                  setIsSizeDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] cursor-pointer"
              >
                <span>{s.label}</span>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{s.value}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().unsetFontSize().run();
                setIsSizeDropdownOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-rose-500 hover:bg-rose-500/10 cursor-pointer pt-1 border-t border-[var(--border-subtle)]"
            >
              Reset to Default Size
            </button>
          </div>
        )}
      </div>

      {/* 3. Text Color & Highlight Dropdowns */}
      <div className="relative shrink-0" ref={colorMenuRef}>
        <button
          type="button"
          onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
          className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border shrink-0 min-w-[34px] min-h-[34px] flex items-center justify-center ${
            isColorDropdownOpen || editor.isActive('textColor')
              ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] border-[var(--accent-olive)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border-transparent'
          }`}
          title="Text color for selected text"
        >
          <Palette className="w-3.5 h-3.5" />
        </button>

        {isColorDropdownOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-44 max-w-[calc(100vw-32px)] p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg z-50 space-y-1 animate-in fade-in duration-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block px-1">
              Text Color
            </span>
            <div className="space-y-0.5">
              {textColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    if (c.value === 'inherit') {
                      editor.chain().focus().unsetTextColor().run();
                    } else {
                      editor.chain().focus().setTextColor(c.value).run();
                    }
                    setIsColorDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] cursor-pointer"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative shrink-0" ref={highlightMenuRef}>
        <button
          type="button"
          onClick={() => setIsHighlightDropdownOpen(!isHighlightDropdownOpen)}
          className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border shrink-0 min-w-[34px] min-h-[34px] flex items-center justify-center ${
            isHighlightDropdownOpen || editor.isActive('textHighlight')
              ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] border-[var(--accent-olive)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border-transparent'
          }`}
          title="Highlight selected text"
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>

        {isHighlightDropdownOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-44 max-w-[calc(100vw-32px)] p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg z-50 space-y-1 animate-in fade-in duration-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block px-1">
              Highlight Color
            </span>
            <div className="space-y-0.5">
              {highlightColors.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setTextHighlight(h.value).run();
                    setIsHighlightDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] cursor-pointer"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-md border border-black/10 shrink-0"
                    style={{ backgroundColor: h.hex }}
                  />
                  <span>{h.label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetTextHighlight().run();
                  setIsHighlightDropdownOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-[11px] text-rose-500 hover:bg-rose-500/10 cursor-pointer pt-1 border-t border-[var(--border-subtle)]"
              >
                Clear Highlight
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-0.5" />

      {/* 4. Headings */}
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
      {toolButton(
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        editor.isActive('heading', { level: 3 }),
        <Heading3 className="w-3.5 h-3.5" />,
        'Heading 3'
      )}

      <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-0.5 shrink-0" />

      {/* 5. Lists & Blockquotes */}
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
        () => editor.chain().focus().setHorizontalRule().run(),
        false,
        <Minus className="w-3.5 h-3.5" />,
        'Horizontal divider'
      )}
      {toolButton(
        setLink,
        editor.isActive('link'),
        <Link2 className="w-3.5 h-3.5" />,
        'Add link'
      )}

      <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-0.5 shrink-0" />

      {/* 6. History Undo/Redo */}
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

      {/* 7. Global Typography & Overall Font Size Picker */}
      <div className="relative shrink-0 sm:ml-auto" ref={fontMenuRef}>
        <button
          type="button"
          onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border shrink-0 min-h-[34px] ${
            isFontMenuOpen
              ? 'bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)] border-[var(--accent-olive)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border-transparent'
          }`}
          title="Overall Journal Typography & Font Size"
        >
          <Type className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
          <span className="hidden sm:inline font-sans">
            {activeBodyFont.name}
          </span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {isFontMenuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-72 max-w-[calc(100vw-32px)] p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl z-50 space-y-3.5 animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-xs font-semibold text-[var(--text-primary)] block">
                  Overall Journal Typography
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  Applies to all entries & reflections
                </span>
              </div>
              <a
                href="/settings"
                className="text-[11px] text-[var(--accent-olive)] hover:underline font-medium"
              >
                All options
              </a>
            </div>

            {/* Overall Font Size Selection */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block">
                Reading Font Size
              </span>
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    { id: 'small', label: '14px' },
                    { id: 'normal', label: '16px' },
                    { id: 'large', label: '18px' },
                    { id: 'reading', label: '20px' },
                    { id: 'xlarge', label: '22px' },
                  ] as { id: BodySize; label: string }[]
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setBodySize(s.id)}
                    className={`flex-1 min-w-[42px] py-1 px-1.5 rounded-lg text-[11px] font-medium border text-center transition-colors cursor-pointer ${
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

            {/* Quick Presets */}
            <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block">
                Aesthetic Presets
              </span>
              <div className="space-y-0.5 max-h-44 overflow-y-auto pr-0.5">
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

            {/* Direct Heading & Body Font Quick Picks */}
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block mb-1">
                  Body Font
                </label>
                <select
                  value={bodyFontId}
                  onChange={(e) => setBodyFontId(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] cursor-pointer"
                >
                  {BODY_FONTS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block mb-1">
                  Heading Font
                </label>
                <select
                  value={headingFontId}
                  onChange={(e) => setHeadingFontId(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] cursor-pointer"
                >
                  {HEADING_FONTS.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
