import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { NextPage } from 'next';
import { Button } from './ui/button';
import useSubscriptionModalStore from '@/store/subscription-modal-store';
import { Badge } from './ui/badge';
import { routes } from '@/lib/constant';
import Link from 'next/link';
import { Card, CardContent } from './ui/card';
import { api, cn } from '@/lib/utils';
import { Check, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const SubscriptionModal: NextPage = ({}) => {
  const { open, setIsOpen } = useSubscriptionModalStore();
  const [loading, setLoading] = useState(false);
  const onSubscribe = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/stripe');
      window.location.href = await response.data.url;
    } catch (error) {
      console.log(error, 'STRIPE_CLIENT_ERROR');
      toast.error('Something went wrong');
    }
    setLoading(false);
  };
  return (
    <Dialog open={open} onOpenChange={!loading ? setIsOpen : () => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex items-center justify-center gap-x-2">
              <h2>Upgrade to Genius</h2>
              <Badge variant={'premium'}>Pro</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-3">
          {routes.slice(1, 7).map(route => (
            <Link href={route.href} key={route.href}>
              <Card className="transition-all duration-150 hover:drop-shadow-md">
                <CardContent className="flex items-center justify-between p-1.5">
                  <div className="flex h-full items-center gap-x-2">
                    <route.icon
                      className={cn(
                        'size-10 rounded-md bg-emerald-500/10 bg-green-500/10 bg-orange-500/10 bg-pink-500/10 bg-violet-500/10 bg-yellow-500/10 bg-zinc-500/10 p-1.5',
                        route.color,
                        route.iconbg
                      )}
                    />
                    <p className="text-sm font-semibold capitalize text-zinc-800">{route.label}</p>
                  </div>

                  <Check className="size-6 text-green-500" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <DialogFooter className="w-full">
          <Button
            disabled={loading}
            onClick={() => {
              onSubscribe();
            }}
            variant={'premium'}
            size={'lg'}
            className="w-full cursor-pointer"
            asChild
          >
            <div className="flex items-center gap-x-2">
              <span>UPGRADE</span>
              <Zap className="size-4 text-white" />
            </div>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
