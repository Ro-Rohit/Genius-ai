'usc client';
import { NextPage } from 'next';
import { Button } from './ui/button';
import { Zap } from 'lucide-react';
import useSubscriptionModalStore from '@/store/subscription-modal-store';
import { useCountStore } from '@/store/use-count-store';
import { Progress } from './ui/progress';
import { useEffect, useState } from 'react';
import { useSheetStore } from '@/store/sheet-store';
import { MAX_COUNT } from '@/lib/constant';

const FreeCounter: NextPage = () => {
  const { setIsOpen } = useSubscriptionModalStore();
  const { setIsOpen: setSheetOpen } = useSheetStore();
  const { count, isPro } = useCountStore();
  const [mount, setMount] = useState(false);

  const handleClick = () => {
    setSheetOpen(false);
    setIsOpen(true);
  };

  useEffect(() => {
    setMount(true);
  }, []);

  if (!mount || isPro) return null;
  return (
    <div className="mt-4 flex flex-col items-center justify-center space-y-4 rounded-lg bg-slate-700 px-4 py-2 text-center">
      {/* slider */}
      <p className="text-sm text-accent">{count}/5 Free Generations</p>
      <Progress value={(count / MAX_COUNT) * 100} className="h-3" />
      <Button
        onClick={handleClick}
        variant={'premium'}
        size={'lg'}
        asChild
        className="cursor-pointer"
      >
        <div className="flex items-center gap-x-2">
          <span>UPGRADE</span>
          <Zap className="ml-2 size-4 fill-white" />
        </div>
      </Button>
    </div>
  );
};

export default FreeCounter;
