import { createClient } from '@supabase/supabase-js';

// Clean up the URL just in case it has /rest/v1/ or a trailing slash accidentally copied
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}`;
}
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadFileToSupabase(file: File, path: string): Promise<{ url: string | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage
      .from('hr-attachments')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { url: null, error };
    }

    const { data: publicUrlData } = supabase.storage
      .from('hr-attachments')
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err) {
    console.error('Unexpected error uploading file:', err);
    return { url: null, error: err as Error };
  }
}
