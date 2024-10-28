import { create } from 'zustand';

export type visionHistoryType = {
  role: 'user' | 'model';
  parts: any;
};

interface Props {
  history: visionHistoryType[];
  createChat: (role: 'user' | 'model', part: any) => visionHistoryType;
  setHistory: (history: visionHistoryType[]) => void;
  clearHistory: () => void;
}

export const useVisionStore = create<Props>(set => ({
  history: [],
  setHistory(history) {
    set(pre => ({ history: [...history] }));
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
