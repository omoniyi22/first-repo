
// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and anon key
// You can find these in your Supabase project dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://your-supabase-url.supabase.co' && 
         supabaseKey !== 'your-supabase-anon-key';
};
