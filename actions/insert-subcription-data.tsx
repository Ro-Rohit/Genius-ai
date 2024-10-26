import { createClient } from '@/lib/utils';
import { Database } from '@/types/supabase';

export type subscriptionType = Database['public']['Tables']['Subscription']['Update'];

export const insertSubscriptionData = async (payload: subscriptionType) => {
  const supabase = createClient();
  console.log('payload', payload);
  const { data, error } = await supabase
    .from('Subscription')
    .upsert(payload, { onConflict: 'stripeSubscriptionId' });
  if (error) {
    console.log('Subscription error', error);
    return null;
  }
  return data;
};
