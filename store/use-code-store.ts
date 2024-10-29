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
  isStreaming: boolean;
  setIsStreaming: (isStreaming: boolean) => void;
  text: string | null;
  setText: (text: string | null) => void;
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
    set(pre => ({ text: null }));
    set(pre => ({ isStreaming: true }));
  },
  isStreaming: false,
  setIsStreaming(isStreaming) {
    set(pre => ({ isStreaming: isStreaming }));
  },
  text: null,
  setText(text) {
    set(pre => ({ text: text }));
  },
}));
