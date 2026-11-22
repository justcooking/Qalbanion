import React from 'react';
import { useTypography } from '../../contexts/TypographyContext';
import {
  HEADING_FONTS,
  BODY_FONTS,
  TYPOGRAPHY_PRESETS,
  type BodySize,
  type LineSpacing,
} from '../../types/typography';
import { Type, Sparkles, Check } from 'lucide-react';

export const TypographySettings: React.FC = () => {
  const {
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
  } = useTypography();

  return (
    <section className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-[var(--accent-olive)]" />
            <h2 className="font-editorial text-2xl font-medium text-[var(--text-primary)]">
              Typography & Reading Experience
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Choose aesthetic typefaces that make writing and reading your thoughts a calming pleasure.
          </p>
        </div>
      </div>

      {/* 1. Curated Presets */}
      <div className="space-y-3">
        <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
          <span>Curated Aesthetic Presets</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TYPOGRAPHY_PRESETS.map((preset) => {
            const isSelected = currentPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[var(--accent-olive)] bg-[var(--accent-olive-soft)] ring-1 ring-[var(--accent-olive)]/30'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {preset.name}
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[var(--accent-olive)]" />
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                  {preset.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Custom Font Selectors (Heading & Body) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-subtle)]">
        {/* Heading Font Picker */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--text-secondary)] block">
            Title & Heading Font
          </label>
          <select
            value={headingFontId}
            onChange={(e) => setHeadingFontId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-olive)] cursor-pointer"
          >
            {HEADING_FONTS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.name} ({font.category})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[var(--text-tertiary)] italic">
            {activeHeadingFont.description}
          </p>
        </div>

        {/* Body Font Picker */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--text-secondary)] block">
            Body & Journal Text Font
          </label>
          <select
            value={bodyFontId}
            onChange={(e) => setBodyFontId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-olive)] cursor-pointer"
          >
            {BODY_FONTS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.name} ({font.category})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[var(--text-tertiary)] italic">
            {activeBodyFont.description}
          </p>
        </div>
      </div>

      {/* 3. Size & Line Height Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-subtle)]">
        {/* Body Size */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--text-secondary)] block">
            Overall Journal Font Size
          </label>
          <div className="flex flex-wrap gap-1.5">
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
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-colors cursor-pointer ${
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

        {/* Line Spacing */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--text-secondary)] block">
            Paragraph Line Spacing
          </label>
          <div className="flex gap-2">
            {(
              [
                { id: 'compact', label: 'Compact' },
                { id: 'relaxed', label: 'Relaxed' },
                { id: 'spacious', label: 'Spacious' },
              ] as { id: LineSpacing; label: string }[]
            ).map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLineSpacing(l.id)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  lineSpacing === l.id
                    ? 'border-[var(--accent-olive)] bg-[var(--accent-olive-soft)] text-[var(--accent-olive-text)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Live Aesthetic Preview Box */}
      <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Live Typography Preview
          </span>
          <span className="text-[11px] text-[var(--accent-olive)] font-medium">
            {activeHeadingFont.name} + {activeBodyFont.name}
          </span>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] shadow-2xs space-y-3">
          <h3
            style={{ fontFamily: activeHeadingFont.family }}
            className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--text-primary)]"
          >
            Unexpected Turns & Quiet Lessons
          </h3>
          <p
            style={{ fontFamily: activeBodyFont.family }}
            className="text-[var(--text-secondary)] leading-relaxed"
          >
            Clarity rarely comes from thinking more; it comes from putting thoughts onto paper where you can see them honestly. When the noise quietens down, the thoughts that truly mattered begin to emerge with effortless grace.
          </p>
        </div>
      </div>
    </section>
  );
};
