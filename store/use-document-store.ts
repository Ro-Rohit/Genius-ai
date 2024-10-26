import { create } from 'zustand';

export type historyType = {
  role: 'user' | 'model';
  parts: any;
};

interface Props {
  history: historyType[];
  createChat: (role: 'user' | 'model', parts: any) => historyType;
  setHistory: (history: historyType[]) => void;
  clearHistory: () => void;
}

export const useDocumentStore = create<Props>(set => ({
  history: [],
  setHistory(history) {
    set(pre => ({ history: [...history] }));
  },
  createChat(role, parts) {
    return {
      role: role,
      parts: parts,
    };
  },
  clearHistory() {
    set({ history: [] });
  },
}));
