import { useJournalContext, type SyncStatus } from '../contexts/JournalContext';

export type { SyncStatus };

export const useJournal = () => {
  return useJournalContext();
};
