import { create } from 'zustand';

export type descriptorHistoryType = {
  role: 'user' | 'model';
  content: any;
};

interface Props {
  history: descriptorHistoryType[];
  createChat: (role: 'user' | 'model', content: any) => descriptorHistoryType;
  setHistory: (history: descriptorHistoryType[]) => void;
  clearHistory: () => void;
}

export const useDescriptorStore = create<Props>(set => ({
  history: [],
  setHistory(history) {
    set(pre => ({ history: [...history] }));
  },
  createChat(role, content) {
    return {
      role: role,
      content: content,
    };
  },
  clearHistory() {
    set(pre => ({ history: [] }));
  },
}));