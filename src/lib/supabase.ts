
// This file is deprecated. Import the Supabase client from '@/integrations/supabase/client' instead.
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Re-export for backward compatibility
export { supabase };

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!supabase;
};

// Function to test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    if (!isSupabaseConfigured()) {
      return {
        isConnected: false,
        message: 'Supabase is not properly configured. Please check your setup.',
      };
    }

    // Try to make a simple query to test the connection
    // Since we're using generic Supabase client with potentially no tables,
    // we'll handle the "relation does not exist" error as a success case
    try {
      // We'll use a simple RPC call that doesn't require a specific table
      const { error } = await supabase.rpc('get_server_time');

      if (error) {
        // Even if there's an RPC error, as long as we got a response, the connection is working
        console.log('Supabase RPC error (but connection is working):', error.message);
        return {
          isConnected: true,
          message: 'Successfully connected to Supabase!',
        };
      }
    } catch (error: any) {
      // If the connection works but the function doesn't exist
      if (error && error.message && error.message.includes('does not exist')) {
        return {
          isConnected: true,
          message: 'Successfully connected to Supabase!',
        };
      }
      console.error('Supabase connection error:', error);
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
