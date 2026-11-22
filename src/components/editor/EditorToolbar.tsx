import React from 'react';
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
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
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
    </div>
  );
};
