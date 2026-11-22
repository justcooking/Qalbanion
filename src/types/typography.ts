export interface FontOption {
  id: string;
  name: string;
  category: 'Serif' | 'Sans-Serif' | 'Monospace';
  family: string;
  description: string;
}

export const HEADING_FONTS: FontOption[] = [
  {
    id: 'newsreader',
    name: 'Newsreader',
    category: 'Serif',
    family: "'Newsreader', Georgia, 'Times New Roman', serif",
    description: 'Literary editorial serif, warm proportions and quiet elegance.',
  },
  {
    id: 'cormorant',
    name: 'Cormorant Garamond',
    category: 'Serif',
    family: "'Cormorant Garamond', Garamond, Georgia, serif",
    description: 'Poetic Renaissance elegance, delicate and regal.',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    category: 'Serif',
    family: "'Playfair Display', Georgia, serif",
    description: 'High-contrast romantic serif with distinctive charm.',
  },
  {
    id: 'fraunces',
    name: 'Fraunces',
    category: 'Serif',
    family: "'Fraunces', Georgia, serif",
    description: 'Warm, soft-serif with vintage bookish character.',
  },
  {
    id: 'lora',
    name: 'Lora',
    category: 'Serif',
    family: "'Lora', Georgia, serif",
    description: 'Approachable, serene contemporary serif.',
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    category: 'Sans-Serif',
    family: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    description: 'Clean, warm geometric sans with human proportions.',
  },
  {
    id: 'inter',
    name: 'Inter',
    category: 'Sans-Serif',
    family: "'Inter', system-ui, -apple-system, sans-serif",
    description: 'Objective, neutral modern interface sans.',
  },
];

export const BODY_FONTS: FontOption[] = [
  {
    id: 'lora',
    name: 'Lora',
    category: 'Serif',
    family: "'Lora', Georgia, serif",
    description: 'Extremely comfortable for long reflective writing, calligraphic warmth.',
  },
  {
    id: 'eb-garamond',
    name: 'EB Garamond',
    category: 'Serif',
    family: "'EB Garamond', Garamond, Georgia, serif",
    description: 'Pure classical hardbound book typography.',
  },
  {
    id: 'crimson-pro',
    name: 'Crimson Pro',
    category: 'Serif',
    family: "'Crimson Pro', Georgia, serif",
    description: 'Gentle, readable book serif designed specifically for essayists.',
  },
  {
    id: 'literata',
    name: 'Literata',
    category: 'Serif',
    family: "'Literata', Georgia, serif",
    description: 'Crafted for digital book readers, flawless rhythm on screens.',
  },
  {
    id: 'newsreader',
    name: 'Newsreader',
    category: 'Serif',
    family: "'Newsreader', Georgia, 'Times New Roman', serif",
    description: 'Continuous editorial cadence, timeless and thoughtful.',
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    category: 'Sans-Serif',
    family: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    description: 'Warm, soft contemporary sans for modern writers.',
  },
  {
    id: 'inter',
    name: 'Inter',
    category: 'Sans-Serif',
    family: "'Inter', system-ui, -apple-system, sans-serif",
    description: 'Clean, functional UI sans.',
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    category: 'Monospace',
    family: "'JetBrains Mono', 'Courier New', monospace",
    description: 'Typewriter and raw markdown notes aesthetic.',
  },
];

export interface TypographyPreset {
  id: string;
  name: string;
  subtitle: string;
  headingFontId: string;
  bodyFontId: string;
  bodySize: 'normal' | 'large' | 'reading';
  lineSpacing: 'relaxed' | 'spacious' | 'compact';
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: 'novelist',
    name: 'The Quiet Novelist',
    subtitle: 'Newsreader & Lora — Pure literary hardbound book feel',
    headingFontId: 'newsreader',
    bodyFontId: 'lora',
    bodySize: 'large',
    lineSpacing: 'relaxed',
  },
  {
    id: 'vintage',
    name: 'Poetic Archive',
    subtitle: 'Cormorant & EB Garamond — Timeless classical elegance',
    headingFontId: 'cormorant',
    bodyFontId: 'eb-garamond',
    bodySize: 'large',
    lineSpacing: 'relaxed',
  },
  {
    id: 'editorial',
    name: 'Modern Essayist',
    subtitle: 'Playfair & Plus Jakarta — Refined contrast with warm sans body',
    headingFontId: 'playfair',
    bodyFontId: 'plus-jakarta',
    bodySize: 'normal',
    lineSpacing: 'relaxed',
  },
  {
    id: 'chronicle',
    name: 'Warm Chronicle',
    subtitle: 'Fraunces & Crimson Pro — Cozy, inviting, and human',
    headingFontId: 'fraunces',
    bodyFontId: 'crimson-pro',
    bodySize: 'large',
    lineSpacing: 'spacious',
  },
  {
    id: 'minimalist',
    name: 'Minimalist Journal',
    subtitle: 'Newsreader & Plus Jakarta — Quiet serif titles with clean prose',
    headingFontId: 'newsreader',
    bodyFontId: 'plus-jakarta',
    bodySize: 'normal',
    lineSpacing: 'relaxed',
  },
  {
    id: 'typewriter',
    name: 'Typewriter Memoir',
    subtitle: 'Newsreader & JetBrains Mono — Retro typewriter diary notes',
    headingFontId: 'newsreader',
    bodyFontId: 'jetbrains-mono',
    bodySize: 'normal',
    lineSpacing: 'relaxed',
  },
];

export type BodySize = 'small' | 'normal' | 'large' | 'reading' | 'xlarge';
export type LineSpacing = 'relaxed' | 'spacious' | 'compact';
