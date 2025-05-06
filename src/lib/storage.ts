
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
    console.log(`Checking if bucket '${bucketId}' exists...`);
    
    // Check if bucket exists
    const { data: existingBucket, error: checkError } = await supabase.storage.getBucket(bucketId);
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        // This is a "not found" error, which is expected if the bucket doesn't exist
        console.log(`Bucket '${bucketId}' not found, creating it...`);
      } else {
        console.error(`Error checking bucket '${bucketId}':`, checkError);
      }
      
      // Create bucket if it doesn't exist
      const { data, error: createError } = await supabase.storage.createBucket(bucketId, options);
      
      if (createError) {
        console.error(`Failed to create bucket '${bucketId}':`, createError);
        return { success: false, error: createError };
      }
      
      console.log(`Successfully created bucket '${bucketId}'`);
      return { success: true, data, created: true };
    } else {
      console.log(`Bucket '${bucketId}' already exists:`, existingBucket);
      return { success: true, created: false };
    }
    
  } catch (error) {
    console.error(`Exception in createBucketIfNotExists for '${bucketId}':`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Optimizes image for SEO before upload
 */
export const optimizeImageForSEO = async (
  file: File, 
  options: { 
    maxWidth?: number; 
    quality?: number; 
    generateAlt?: boolean;
    altText?: string;
  } = {}
): Promise<{ 
  optimizedFile: File; 
  width: number; 
  height: number; 
  altText: string;
}> => {
  const { 
    maxWidth = 1200, 
    quality = 0.85,
    generateAlt = true,
    altText = ''
  } = options;
  
  // Create a promise that resolves with the processed image
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.floor(height * (maxWidth / width));
        width = maxWidth;
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with specified quality
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from image'));
            return;
          }
          
          // Generate descriptive alt text if needed
          let finalAltText = altText;
          if (generateAlt && !altText) {
            // Extract name from file and clean it
            const fileName = file.name.split('.')[0]
              .replace(/-|_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());
              
            finalAltText = `${fileName} - AI Equestrian`;
          }
          
          // Create new optimized file
          const optimizedFile = new File(
            [blob], 
            file.name, 
            { type: 'image/jpeg', lastModified: Date.now() }
          );
          
          resolve({
            optimizedFile,
            width,
            height,
            altText: finalAltText
          });
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for optimization'));
    };
    
    // Load image from the file
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Uploads an image with SEO optimization
 */
export const uploadOptimizedImage = async (
  file: File,
  path: string,
  bucket: string = 'profiles',
  options: {
    maxWidth?: number;
    quality?: number;
    altText?: string;
    metadata?: Record<string, string>;
  } = {}
): Promise<{
  success: boolean;
  data?: {
    path: string;
    publicUrl: string;
    width: number;
    height: number;
    altText: string;
  };
  error?: any;
}> => {
  try {
    // First create bucket if it doesn't exist
    const bucketResult = await createBucketIfNotExists(bucket);
    if (!bucketResult.success) {
      return { success: false, error: bucketResult.error };
    }
    
    // Optimize the image
    const { optimizedFile, width, height, altText } = await optimizeImageForSEO(file, {
      maxWidth: options.maxWidth || 1200,
      quality: options.quality || 0.85,
      altText: options.altText
    });
    
    // Upload the optimized image
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, optimizedFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg',
      });
      
    if (error) {
      return { success: false, error };
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return {
      success: true,
      data: {
        path: data.path,
        publicUrl: publicUrlData.publicUrl,
        width,
        height,
        altText
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
