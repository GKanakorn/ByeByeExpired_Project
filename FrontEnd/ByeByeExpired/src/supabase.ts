import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cjxwxeedcytfdsitaqqt.supabase.co'; // ของคุณ
const supabaseAnonKey = 'sb_publishable_7MFnByQQWGWzsqZOy4Vmkw_h0hS1udR';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // ⭐ สำคัญสำหรับ Expo
    },
  }
);