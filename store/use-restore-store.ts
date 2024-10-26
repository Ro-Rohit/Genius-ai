import { create } from 'zustand';

export type restoreHistoryType = {
  role: 'user' | 'model';
  parts: any;
};

interface Props {
  history: restoreHistoryType[];
  createChat: (role: 'user' | 'model', part: any) => restoreHistoryType;
  setHistory: (history: restoreHistoryType[]) => void;
  clearHistory: () => void;
}

export const useRestoreImageStore = create<Props>(set => ({
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
