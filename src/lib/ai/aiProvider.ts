import type { JournalEntry } from '../../types/journal';

export interface AiAnalysisResult {
  summary: string;
  recurringThemes: string[];
  suggestedQuestions: string[];
  perspectiveObservations?: string;
  disclaimer: string;
}

export interface AiProvider {
  name: string;
  analyzeSelectedEntries(entries: JournalEntry[]): Promise<AiAnalysisResult>;
  comparePerspectives(entryA: JournalEntry, entryB: JournalEntry): Promise<string>;
}

/**
 * Heuristic Local AI Provider:
 * Performs deterministic, on-device thematic analysis and reflection synthesis
 * without sending any private data across the internet.
 */
export class LocalHeuristicAiProvider implements AiProvider {
  name = 'Local Cognitive Engine (Private & On-Device)';

  async analyzeSelectedEntries(entries: JournalEntry[]): Promise<AiAnalysisResult> {
    // Artificial calming delay to feel natural
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (entries.length === 0) {
      return {
        summary: 'No entries selected for analysis.',
        recurringThemes: [],
        suggestedQuestions: [],
        disclaimer: 'Analysis performed locally on your device.',
      };
    }

    // Extract word frequencies & question marks
    const combinedText = entries.map((e) => `${e.title || ''} ${e.content_text}`).join(' ');
    const words = combinedText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4);

    const freqMap: { [word: string]: number } = {};
    const stopWords = new Set(['about', 'their', 'there', 'would', 'could', 'should', 'which', 'where', 'because']);
    words.forEach((w) => {
      if (!stopWords.has(w)) {
        freqMap[w] = (freqMap[w] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

    const totalWordCount = entries.reduce((acc, e) => acc + (e.word_count || 0), 0);
    const moodBreakdown = entries.map((e) => e.mood).filter(Boolean).join(', ');

    const summary = `Analyzed ${entries.length} selected journal ${
      entries.length === 1 ? 'entry' : 'entries'
    } spanning ${totalWordCount} words. The writing centers primarily on ${
      topKeywords.length > 0 ? topKeywords.slice(0, 3).join(', ') : 'personal reflections'
    }${moodBreakdown ? ` with an emotional tone marked by ${moodBreakdown}` : ''}.`;

    const suggestedQuestions = [
      `What underlying belief connects your reflections on ${topKeywords[0] || 'these thoughts'}?`,
      'If you were to revisit these entries one year from now, what would you hope to see resolved?',
      'Which of these thoughts represents your current priority versus an inherited expectation?',
    ];

    return {
      summary,
      recurringThemes: topKeywords,
      suggestedQuestions,
      disclaimer:
        'Notice: This interpretation was computed locally on your device. It offers reflective suggestions, not psychological assessments.',
    };
  }

  async comparePerspectives(entryA: JournalEntry, entryB: JournalEntry): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const dateA = new Date(entryA.created_at).toLocaleDateString();
    const dateB = new Date(entryB.created_at).toLocaleDateString();

    return `Comparing "${entryA.title || 'Untitled'}" (${dateA}) with "${
      entryB.title || 'Untitled'
    }" (${dateB}):\n\n` +
      `In ${dateA}, the focus was primarily on initial observations with an estimated ${entryA.word_count || 0} words. ` +
      `By ${dateB}, the perspective evolved into a deeper ${entryB.entry_type} structure. ` +
      `The shift reveals increasing clarity and a willingness to examine questions directly.`;
  }
}

export const defaultAiProvider: AiProvider = new LocalHeuristicAiProvider();
