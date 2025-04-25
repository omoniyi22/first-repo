
// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and anon key
// You can find these in your Supabase project dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
