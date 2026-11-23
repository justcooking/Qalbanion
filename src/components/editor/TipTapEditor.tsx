import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { FontSize, TextColor, TextHighlight, FontFamily } from './extensions/tiptapExtensions';
import { EditorToolbar } from './EditorToolbar';
import { FloatingBubbleMenu } from './FloatingBubbleMenu';
import { SlashCommandMenu } from './SlashCommandMenu';

interface TipTapEditorProps {
  initialContent?: Record<string, unknown> | string;
  onChange: (json: Record<string, unknown>, text: string, wordCount: number) => void;
  placeholder?: string;
  editable?: boolean;
  isTypewriterMode?: boolean;
  onToggleTypewriter?: () => void;
  onOpenShortcuts?: () => void;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  initialContent,
  onChange,
  placeholder = 'What is on your mind? Begin writing freely...',
  editable = true,
  isTypewriterMode = false,
  onToggleTypewriter,
  onOpenShortcuts,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Smooth Typewriter Scrolling Engine
  useEffect(() => {
    if (!editor || !isTypewriterMode) return;

    let rAFId: number | null = null;

    const handleCaretScroll = () => {
      if (rAFId) cancelAnimationFrame(rAFId);

      rAFId = requestAnimationFrame(() => {
        try {
          if (!editor.isFocused) return;
          const { from } = editor.state.selection;
          const coords = editor.view.coordsAtPos(from);
          if (!coords) return;

          // Ideal focal line: 42% from top of viewport
          const targetY = window.innerHeight * 0.42;
          const diff = coords.top - targetY;

          // Only scroll if deviation is noticeable to eliminate micro-jitter
          if (Math.abs(diff) > 22) {
            // Find closest scrollable ancestor
            let parent: HTMLElement | null = containerRef.current;
            let scrollable: HTMLElement | Window = window;

            while (parent) {
              const overflowY = window.getComputedStyle(parent).overflowY;
              if (
                (overflowY === 'auto' || overflowY === 'scroll') &&
                parent.scrollHeight > parent.clientHeight
              ) {
                scrollable = parent;
                break;
              }
              parent = parent.parentElement;
            }

            if (scrollable === window) {
              window.scrollBy({ top: diff, behavior: 'smooth' });
            } else {
              (scrollable as HTMLElement).scrollBy({ top: diff, behavior: 'smooth' });
            }
          }
        } catch {
          // Caret coords not available yet
        }
      });
    };

    editor.on('selectionUpdate', handleCaretScroll);
    editor.on('transaction', handleCaretScroll);

    return () => {
      if (rAFId) cancelAnimationFrame(rAFId);
      editor.off('selectionUpdate', handleCaretScroll);
      editor.off('transaction', handleCaretScroll);
    };
  }, [editor, isTypewriterMode]);

  return (
    <div ref={containerRef} className="space-y-3 relative">
      {editable && (
        <>
          <EditorToolbar
            editor={editor}
            isTypewriterMode={isTypewriterMode}
            onToggleTypewriter={onToggleTypewriter}
            onOpenShortcuts={onOpenShortcuts}
          />
          <FloatingBubbleMenu editor={editor} />
          <SlashCommandMenu editor={editor} />
        </>
      )}
      <div className={`pt-2 transition-all duration-300 ${isTypewriterMode ? 'pb-[45vh]' : ''}`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
