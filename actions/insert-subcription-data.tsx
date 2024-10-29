import { createClient } from '@/lib/utils';
import { Database } from '@/types/supabase';

export type subscriptionType = Database['public']['Tables']['Subscription']['Update'];

export const insertSubscriptionData = async (payload: subscriptionType) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('Subscription')
    .upsert(payload, { onConflict: 'stripeSubscriptionId' });
  if (error) return null;

  return data;
};
