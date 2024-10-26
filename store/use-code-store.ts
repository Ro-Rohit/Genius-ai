import { create } from 'zustand';

export type contentType = {
  role: 'user' | 'model';
  parts: Array<{ [text: string]: string }>;
};

interface Props {
  contents: contentType[];
  createContent: (role: 'user' | 'model', message: string) => contentType;
  setContent: (content: contentType[]) => void;
  clearContents: () => void;
}

export const useCodeStore = create<Props>(set => ({
  contents: [],
  setContent(content) {
    set(pre => ({ contents: [...content] }));
  },
  createContent(role, message) {
    return {
      role: role,
      parts: [{ text: message }],
    };
  },
  clearContents() {
    set(pre => ({ contents: [] }));
  },
}));
