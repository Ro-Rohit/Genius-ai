import { createClient } from '@/lib/utils';

const DAY_IN_MS = 86_400_000;
export const getSubscriptionLimit = async (userId: string) => {
  const data = await getSubscriptionData(userId);

  if (!data) return false;
  const isValid =
    data.stripeCurrentPeriodEnd &&
    new Date(data.stripeCurrentPeriodEnd).getTime()! + DAY_IN_MS > Date.now();
  return isValid;
};

export const getSubscriptionData = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('Subscription')
    .select('*')
    .eq('userId', userId)
    .single();
  if (error) return null;
  
  if (!data) return false;
  return data;
};
