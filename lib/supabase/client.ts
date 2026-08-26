import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wqpgnzcpsrqzegeknuil.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_KgzYj_GPNiTLjvmG_4DZzw_LYcQ3-Mr'
  );
}