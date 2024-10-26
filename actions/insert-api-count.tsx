import { createClient } from '@/lib/utils';

export const insertUserApiLmit = async (userId: string, count: number) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('UserApiLimit')
    .upsert({ userId: userId, count: count }, { onConflict: 'userId' });
  if (error) {
    return null;
  }
  return data;
};
