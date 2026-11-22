import { Mark, mergeAttributes } from '@tiptap/react';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
    textColor: {
      setTextColor: (color: string) => ReturnType;
      unsetTextColor: () => ReturnType;
    };
    textHighlight: {
      setTextHighlight: (color: string) => ReturnType;
      unsetTextHighlight: () => ReturnType;
    };
    fontFamily: {
      setFontFamily: (family: string) => ReturnType;
      unsetFontFamily: () => ReturnType;
    };
  }
}

export const FontSize = Mark.create({
  name: 'fontSize',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (!attributes.size) return {};
          return { style: `font-size: ${attributes.size}` };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[style*=font-size]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }) => {
          return chain().setMark(this.name, { size }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});

export const TextColor = Mark.create({
  name: 'textColor',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color,
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return { style: `color: ${attributes.color}` };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[style*=color]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setTextColor:
        (color: string) =>
        ({ chain }) => {
          return chain().setMark(this.name, { color }).run();
        },
      unsetTextColor:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});

export const TextHighlight = Mark.create({
  name: 'textHighlight',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor,
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return {
            style: `background-color: ${attributes.color}; padding: 0.1em 0.3em; border-radius: 0.25rem;`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'mark' }, { tag: 'span[style*=background-color]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setTextHighlight:
        (color: string) =>
        ({ chain }) => {
          return chain().setMark(this.name, { color }).run();
        },
      unsetTextHighlight:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});

export const FontFamily = Mark.create({
  name: 'fontFamily',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      family: {
        default: null,
        parseHTML: (element) => element.style.fontFamily,
        renderHTML: (attributes) => {
          if (!attributes.family) return {};
          return { style: `font-family: ${attributes.family}` };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[style*=font-family]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontFamily:
        (family: string) =>
        ({ chain }) => {
          return chain().setMark(this.name, { family }).run();
        },
      unsetFontFamily:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});
