import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cjxwxeedcytfdsitaqqt.supabase.co'; // ของคุณ
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeHd4ZWVkY3l0ZmRzaXRhcXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjA5NDAsImV4cCI6MjA4NDgzNjk0MH0.rsE0pHam_B69DnK9UcMSZ6bfSdSBEEjOjvKfoaCTXCI';

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