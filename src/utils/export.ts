import type { JournalEntry, Collection, Tag } from '../types/journal';

/**
 * Downloads a text/blob payload as a file in the user's browser.
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Converts entries into a structured Markdown document.
 */
export const exportToMarkdown = (
  entries: JournalEntry[],
  collections: Collection[] = [],
  tags: Tag[] = []
): string => {
  const collectionMap = new Map(collections.map((c) => [c.id, c.name]));

  let md = `# Qalbanion Journal Export\n\n`;
  md += `*Exported on ${new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })} · Total entries: ${entries.length} · Tags: ${tags.length}*\n\n---\n\n`;

  entries.forEach((entry, index) => {
    const dateStr = new Date(entry.created_at).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    md += `## ${index + 1}. ${entry.title || 'Untitled Thought'}\n\n`;
    md += `- **Date**: ${dateStr}\n`;
    md += `- **Type**: ${entry.entry_type}\n`;
    if (entry.mood) md += `- **Mood**: ${entry.mood}\n`;
    if (entry.collections && entry.collections.length > 0) {
      const colNames = entry.collections.map((id) => collectionMap.get(id) || id).join(', ');
      md += `- **Collections**: ${colNames}\n`;
    }
    if (entry.tags && entry.tags.length > 0) {
      md += `- **Tags**: ${entry.tags.map((t) => `#${t}`).join(' ')}\n`;
    }
    md += `- **Word Count**: ${entry.word_count || 0}\n\n`;
    md += `${entry.content_text || ''}\n\n---\n\n`;
  });

  return md;
};

/**
 * Converts entries into clean plain text.
 */
export const exportToPlainText = (entries: JournalEntry[]): string => {
  let txt = `QALBANION JOURNAL ARCHIVE\n`;
  txt += `Generated on ${new Date().toLocaleString()}\n`;
  txt += `Total Entries: ${entries.length}\n`;
  txt += `============================================================\n\n`;

  entries.forEach((entry, index) => {
    const dateStr = new Date(entry.created_at).toLocaleString();
    txt += `[${index + 1}] ${entry.title || 'UNTITLED THOUGHT'}\n`;
    txt += `Date: ${dateStr} | Type: ${entry.entry_type.toUpperCase()}`;
    if (entry.mood) txt += ` | Mood: ${entry.mood}`;
    txt += `\n------------------------------------------------------------\n`;
    txt += `${entry.content_text || ''}\n\n\n`;
  });

  return txt;
};

/**
 * Converts entries and metadata into a complete lossless JSON archive.
 */
export const exportToJSON = (
  entries: JournalEntry[],
  collections: Collection[] = [],
  tags: Tag[] = []
): string => {
  const archive = {
    metadata: {
      application: 'Qalbanion',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      entry_count: entries.length,
      collection_count: collections.length,
      tag_count: tags.length,
    },
    collections,
    tags,
    entries,
  };

  return JSON.stringify(archive, null, 2);
};
