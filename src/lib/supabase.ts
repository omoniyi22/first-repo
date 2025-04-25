
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  if (!supabaseUrl || supabaseUrl === '') {
    console.error('VITE_SUPABASE_URL is missing or empty');
    return false;
  }
  if (!supabaseKey || supabaseKey === '') {
    console.error('VITE_SUPABASE_ANON_KEY is missing or empty');
    return false;
  }
  return true;
};

// Create and export the Supabase client only if configuration is valid
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Function to test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    if (!isSupabaseConfigured()) {
      return {
        isConnected: false,
        message: 'Supabase environment variables are not set. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your project settings.',
      };
    }

    // Use the client from the exported variable if available, or create a new one for this call
    const client = supabase || createClient(supabaseUrl, supabaseKey);
    
    if (!client) {
      return {
        isConnected: false,
        message: 'Could not initialize Supabase client. Please check your environment variables.',
      };
    }
    
    const { data, error } = await client
      .from('subscription_interests')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error.message);
      
      if (error.message.includes('does not exist')) {
        return {
          isConnected: false,
          message: 'Connected to Supabase, but the "subscription_interests" table does not exist. Please create this table in your Supabase dashboard.',
        };
      }
      
      throw error;
    }
    
    return {
      isConnected: true,
      message: 'Successfully connected to Supabase!',
    };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return {
      isConnected: false,
      message: error instanceof Error 
        ? `Connection error: ${error.message}` 
        : 'Unknown connection error',
    };
  }
};
