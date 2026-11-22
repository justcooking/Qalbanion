import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { FontSize, TextColor, TextHighlight, FontFamily } from './extensions/tiptapExtensions';
import { EditorToolbar } from './EditorToolbar';

interface TipTapEditorProps {
  initialContent?: Record<string, unknown> | string;
  onChange: (json: Record<string, unknown>, text: string, wordCount: number) => void;
  placeholder?: string;
  editable?: boolean;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  initialContent,
  onChange,
  placeholder = 'What is on your mind? Begin writing freely...',
  editable = true,
}) => {
  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[var(--accent-olive)] underline cursor-pointer hover:opacity-80 transition-opacity',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      FontSize,
      TextColor,
      TextHighlight,
      FontFamily,
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class:
          'focus:outline-none min-h-[350px] text-[var(--text-primary)] prose-editorial',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const text = editor.getText();
      // Calculate word count cleanly
      const words = text
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      onChange(json as Record<string, unknown>, text, words.length);
    },
  });

  // Sync if initialContent changes externally (e.g. template applied)
  useEffect(() => {
    if (editor && initialContent && editor.isEmpty) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  return (
    <div className="space-y-3">
      {editable && <EditorToolbar editor={editor} />}
      <div className="pt-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
