import { create } from 'zustand';

export type imageHistoryType = {
  role: 'user' | 'model';
  parts: string;
};

interface Props {
  history: imageHistoryType[];
  createChat: (role: 'user' | 'model', parts: string) => imageHistoryType;
  setHistory: (history: imageHistoryType[]) => void;
  clearHistory: () => void;
}

export const useImageStore = create<Props>(set => ({
  history: [],
  setHistory(history) {
    set(pre => ({ history: [...pre.history, ...history] }));
  },
  createChat(role, parts) {
    return {
      role: role,
      parts: parts,
    };
  },
  clearHistory() {
    set(pre => ({ history: [] }));
  },
}));
