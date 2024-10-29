import { createClient } from '@/lib/utils';

export const uploadImage = async (file: File) => {
  const supabase = createClient();
  const { data: image, error } = await supabase.storage
    .from('images')
    .upload(`public/${file.name}`, file, { upsert: true });
  if (error) return null;
  
  return image.path;
};

export const getImage = async (path: string) => {
  const supabase = createClient();
  const { data: image } = await supabase.storage.from('images').getPublicUrl(path);
  return image.publicUrl;
};
