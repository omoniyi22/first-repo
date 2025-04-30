
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
      // Use the QueryBuilder to test connection without specifying a concrete table
      const { error } = await supabase
        .from('test')
        .select('*')
        .limit(1)
        .maybeSingle();

      // If we get a "relation does not exist" error, it means the connection is working but the table doesn't exist yet
      if (error && error.message && error.message.includes('does not exist')) {
        return {
          isConnected: true,
          message: 'Successfully connected to Supabase! (Note: test table does not exist yet)',
        };
      }

      if (error) {
        console.error('Supabase connection error:', error.message);
        throw error;
      }
    } catch (error: any) {
      // If the error is about the table not existing, consider it a success
      if (error && error.message && error.message.includes('does not exist')) {
        return {
          isConnected: true,
          message: 'Successfully connected to Supabase! (Note: test table does not exist yet)',
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
