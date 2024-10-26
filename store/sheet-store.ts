import { create } from 'zustand';

interface Props {
  open: boolean;
  setIsOpen: (open: boolean) => void;
}

export const useSheetStore = create<Props>(set => ({
  open: false,
  setIsOpen(open) {
    set({ open: open });
  },
}));
