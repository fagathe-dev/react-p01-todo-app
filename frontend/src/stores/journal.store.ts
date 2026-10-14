import { sessionAppStorage } from '@/services/storage.service';
import { create } from 'zustand';

export const JOURNAL_TOKEN_KEY = 'ffr.v4_jtkn';

interface JournalState {
  token: string | null;
  isUnlocked: boolean;
  unlock: (token: string) => void;
  lock: () => void;
  syncSession: () => void;
}

export const useJournalStore = create<JournalState>((set) => ({
  token: (sessionAppStorage.get(JOURNAL_TOKEN_KEY) as string) || null,
  isUnlocked: Boolean(sessionAppStorage.get(JOURNAL_TOKEN_KEY)),

  unlock: (token: string) => {
    sessionAppStorage.set(JOURNAL_TOKEN_KEY, token);
    set({ token, isUnlocked: true });
  },

  lock: () => {
    sessionAppStorage.remove(JOURNAL_TOKEN_KEY);
    set({ token: null, isUnlocked: false });
  },

  syncSession: () => {
    const current = (sessionAppStorage.get(JOURNAL_TOKEN_KEY) as string) || null;
    set({ token: current, isUnlocked: Boolean(current) });
  },
}));
