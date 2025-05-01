
import { supabase } from '@/integrations/supabase/client';

/**
 * Tests the Supabase storage functionality
 * This can be called from a debug component to verify storage setup
 */
export const testStorageUpload = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Create a small test file
    const testBlob = new Blob(['test file content'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
    
    // Try to upload to storage
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(`test/storage-test-${Date.now()}.txt`, testFile, {
        cacheControl: '0',
        upsert: true
      });
      
    if (error) {
      console.error('Storage test upload failed:', error);
      return {
        success: false,
        message: `Upload failed: ${error.message}`
      };
    }
    
    // Clean up test file
    await supabase.storage
      .from('profiles')
      .remove([data?.path || '']);
      
    return {
      success: true,
      message: 'Storage test succeeded! Upload and delete operations worked.'
    };
  } catch (error) {
    console.error('Storage test error:', error);
    return {
      success: false,
      message: `Test failed with error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Gets storage bucket info
 */
export const getStorageBucketInfo = async (bucketId: string) => {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketId);
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Creates a storage bucket if it doesn't exist
 */
export const createBucketIfNotExists = async (bucketId: string, options = { public: true }) => {
  try {
    // Check if bucket exists
    const { error: checkError } = await supabase.storage.getBucket(bucketId);
    
    if (checkError) {
      // Create bucket if it doesn't exist
      const { data, error: createError } = await supabase.storage.createBucket(bucketId, options);
      
      if (createError) {
        return { success: false, error: createError };
      }
      
      return { success: true, data, created: true };
    }
    
    return { success: true, created: false };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
