'use client';
import Heading from '@/components/heading';
import SubscriptionButton from '@/components/subscription-button';
import { routes } from '@/lib/constant';
import { useCountStore } from '@/store/use-count-store';

const SettingsPage = () => {
  const headingData = routes[7];
  const { isPro } = useCountStore();
  return (
    <section className="p-4">
      <Heading
        title={headingData.label}
        description={headingData.description}
        Icon={headingData.icon}
        iconColor={headingData.color}
        iconbg={headingData.iconbg}
      />

      <div className="space-y-4 px-4 py-10 lg:px-8">
        <div className="text-sm text-muted-foreground">
          {isPro ? 'Your Subscription is Active.' : 'Your are currently on a free plan.'}
        </div>
        <SubscriptionButton isPro={isPro} />
      </div>
    </section>
  );
};

export default SettingsPage;
