import { create } from 'zustand';

export type speechHistoryType = {
  role: 'user' | 'model';
  parts: any;
};

interface Props {
  history: speechHistoryType[];
  createChat: (role: 'user' | 'model', part: any) => speechHistoryType;
  setHistory: (history: speechHistoryType[]) => void;
  clearHistory: () => void;
}

export const useSpeechStore = create<Props>(set => ({
  history: [],
  setHistory(history) {
    set(pre => ({ history: [...pre.history, ...history] }));
  },
  createChat(role, part) {
    return {
      role: role,
      parts: part,
    };
  },
  clearHistory() {
    set(pre => ({ history: [] }));
  },
}));
