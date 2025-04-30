
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
    try {
      // Use a simple fetch instead of an RPC call to avoid type errors
      const { error } = await supabase.auth.getSession();

      if (error) {
        console.log('Supabase connection error:', error.message);
        return {
          isConnected: false,
          message: `Connection error: ${error.message}`,
        };
      }
      
      return {
        isConnected: true,
        message: 'Successfully connected to Supabase!',
      };
    } catch (error: any) {
      console.error('Supabase connection error:', error);
      return {
        isConnected: false,
        message: error instanceof Error 
          ? `Connection error: ${error.message}` 
          : 'Unknown connection error',
      };
    }
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
