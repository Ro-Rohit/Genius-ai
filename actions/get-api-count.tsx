import { createClient } from '@/lib/utils';

export const getUserApiCount = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('UserApiLimit')
    .select('*')
    .eq('userId', userId)
    .single();
  if (error) {
    return null;
  }
  return data;
};
