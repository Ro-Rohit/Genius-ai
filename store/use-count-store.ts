import { create } from 'zustand';

interface Props {
  count: number;
  isPro: boolean;
  setCount: (count: number) => void;
  setIsPro: (isPro: boolean) => void;
}

export const useCountStore = create<Props>(set => ({
  isPro: true,
  count: 0,
  setCount(count) {
    set({ count: count });
  },
  setIsPro(isPro) {
    set({ isPro: isPro });
  },
}));
