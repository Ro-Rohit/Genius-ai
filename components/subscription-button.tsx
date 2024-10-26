import { NextPage } from 'next';
import { Button } from './ui/button';
import { Loader, Zap } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  isPro: boolean;
}

const SubscriptionButton: NextPage<Props> = ({ isPro }) => {
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
    <Button
      disabled={loading}
      onClick={onSubscribe}
      variant={'premium'}
      size={'lg'}
      className="cursor-pointer"
      asChild
    >
      <div className="flex items-center gap-x-2">
        {isPro && !loading ? 'Manage Subscription' : 'Upgrade'}
        {!isPro && !loading && <Zap className="ml-2 size-4 fill-white" />}
        {loading && <Loader className="size-4 animate-spin text-white" />}
      </div>
    </Button>
  );
};

export default SubscriptionButton;
