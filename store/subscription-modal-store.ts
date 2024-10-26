import { create } from 'zustand';

interface Props {
  open: boolean;
  setIsOpen: (open: boolean) => void;
}

const useSubscriptionModalStore = create<Props>(set => ({
  open: false,
  setIsOpen(open) {
    set({ open: open });
  },
}));

export default useSubscriptionModalStore;
