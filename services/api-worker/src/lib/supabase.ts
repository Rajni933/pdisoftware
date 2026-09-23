import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

export function getSupabase(env: Env) {
  const url = env.SUPABASE_URL || 'https://eyskoxjbzziahdatzvmq.supabase.co';
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || 'sb_publishable_YC_deZ2YNk0EwpdQBEliMQ_X2ES1f10';
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
