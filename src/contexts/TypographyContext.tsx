import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type FontOption,
  type BodySize,
  type LineSpacing,
  HEADING_FONTS,
  BODY_FONTS,
  TYPOGRAPHY_PRESETS,
} from '../types/typography';

interface TypographyContextType {
  headingFontId: string;
  bodyFontId: string;
  bodySize: BodySize;
  lineSpacing: LineSpacing;
  currentPresetId: string | null;
  setHeadingFontId: (id: string) => void;
  setBodyFontId: (id: string) => void;
  setBodySize: (size: BodySize) => void;
  setLineSpacing: (spacing: LineSpacing) => void;
  applyPreset: (presetId: string) => void;
  activeHeadingFont: FontOption;
  activeBodyFont: FontOption;
}

const STORAGE_KEY = 'qalbanion_typography_settings';

const TypographyContext = createContext<TypographyContextType | undefined>(undefined);

export const TypographyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [headingFontId, setHeadingFontIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.headingFontId) return parsed.headingFontId;
      }
    } catch {
      /* ignore storage parse errors */
    }
    return 'newsreader';
  });

  const [bodyFontId, setBodyFontIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bodyFontId) return parsed.bodyFontId;
      }
    } catch {
      /* ignore storage parse errors */
    }
    // Default to Lora (superb aesthetic serif body)
    return 'lora';
  });

  const [bodySize, setBodySizeState] = useState<BodySize>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bodySize) return parsed.bodySize;
      }
    } catch {
      /* ignore storage parse errors */
    }
    return 'large';
  });

  const [lineSpacing, setLineSpacingState] = useState<LineSpacing>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lineSpacing) return parsed.lineSpacing;
      }
    } catch {
      /* ignore storage parse errors */
    }
    return 'relaxed';
  });

  const [currentPresetId, setCurrentPresetId] = useState<string | null>('novelist');

  // Resolve font objects
  const activeHeadingFont =
    HEADING_FONTS.find((f) => f.id === headingFontId) || HEADING_FONTS[0];
  const activeBodyFont =
    BODY_FONTS.find((f) => f.id === bodyFontId) || BODY_FONTS[0];

  // Apply CSS variables to root
  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty('--font-heading', activeHeadingFont.family);
    root.style.setProperty('--font-body', activeBodyFont.family);

    // Font size mapping
    const sizeMap = {
      normal: '1rem', // 16px
      large: '1.125rem', // 18px (editorial standard)
      reading: '1.25rem', // 20px (comfort book)
    };
    root.style.setProperty('--font-size-body', sizeMap[bodySize]);

    // Line height mapping
    const spacingMap = {
      compact: '1.6',
      relaxed: '1.8',
      spacious: '2.0',
    };
    root.style.setProperty('--line-height-body', spacingMap[lineSpacing]);

    // Persist to localStorage
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          headingFontId,
          bodyFontId,
          bodySize,
          lineSpacing,
          currentPresetId,
        })
      );
    } catch (e) {
      console.warn('Failed to save typography settings:', e);
    }
  }, [activeHeadingFont, activeBodyFont, bodySize, lineSpacing, headingFontId, bodyFontId, currentPresetId]);

  const setHeadingFontId = (id: string) => {
    setHeadingFontIdState(id);
    setCurrentPresetId(null);
  };

  const setBodyFontId = (id: string) => {
    setBodyFontIdState(id);
    setCurrentPresetId(null);
  };

  const setBodySize = (size: BodySize) => {
    setBodySizeState(size);
  };

  const setLineSpacing = (spacing: LineSpacing) => {
    setLineSpacingState(spacing);
  };

  const applyPreset = (presetId: string) => {
    const preset = TYPOGRAPHY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setHeadingFontIdState(preset.headingFontId);
    setBodyFontIdState(preset.bodyFontId);
    setBodySizeState(preset.bodySize);
    setLineSpacingState(preset.lineSpacing);
    setCurrentPresetId(preset.id);
  };

  return (
    <TypographyContext.Provider
      value={{
        headingFontId,
        bodyFontId,
        bodySize,
        lineSpacing,
        currentPresetId,
        setHeadingFontId,
        setBodyFontId,
        setBodySize,
        setLineSpacing,
        applyPreset,
        activeHeadingFont,
        activeBodyFont,
      }}
    >
      {children}
    </TypographyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTypography = () => {
  const context = useContext(TypographyContext);
  if (!context) {
    throw new Error('useTypography must be used within a TypographyProvider');
  }
  return context;
};
