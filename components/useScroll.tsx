import { useEffect } from 'react';

export const useScroll = (ref: React.RefObject<HTMLDivElement>, dependency: any[]) => {
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
  }, dependency);
};
