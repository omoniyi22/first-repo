
import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads an image to Supabase storage
 */
export const uploadImage = async (file: File, userId: string): Promise<{
  success: boolean;
  publicUrl?: string;
  width?: number;
  height?: number;
  error?: string;
}> => {
  try {
    const fileHash = await generateFileHash(file);
    const filePath = `users/${userId}/media/${fileHash}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Storage upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return {
      success: true,
      publicUrl,
      width: undefined,  // These could be added by processing the image
      height: undefined  // before upload if needed
    };
  } catch (error) {
    console.error('Error uploading to storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

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
    console.log(`Getting info for bucket: ${bucketId}`);
    const { data, error } = await supabase.storage.getBucket(bucketId);
    
    if (error) {
      console.log(`Error getting bucket info for '${bucketId}':`, error);
      return { 
        success: false, 
        error: error.message || 'Failed to get bucket info'
      };
    }
    
    console.log(`Successfully retrieved info for bucket '${bucketId}':`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`Exception in getStorageBucketInfo for '${bucketId}':`, error);
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
      // Check for not found error by examining error message rather than using code property
      if (checkError.message && checkError.message.includes('not found')) {
        // This is a "not found" error, which is expected if the bucket doesn't exist
        console.log(`Bucket '${bucketId}' not found, creating it...`);
      } else {
        console.error(`Error checking bucket '${bucketId}':`, checkError);
      }
      
      try {
        // Create bucket if it doesn't exist
        const { data, error: createError } = await supabase.storage.createBucket(bucketId, options);
        
        if (createError) {
          console.error(`Failed to create bucket '${bucketId}':`, createError);
          return { 
            success: false, 
            error: createError.message || 'Failed to create bucket'
          };
        }
        
        console.log(`Successfully created bucket '${bucketId}'`);
        return { success: true, data, created: true };
      } catch (createError) {
        console.error(`Exception creating bucket '${bucketId}':`, createError);
        return { 
          success: false, 
          error: createError instanceof Error ? createError.message : 'Unknown error' 
        };
      }
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
 * Generates a hash of an image file to use for deduplication
 */
export const generateFileHash = async (file: File): Promise<string> => {
  try {
    // A simple hash function that uses a subset of the file's bytes
    // For a real application, you might want to use a more robust solution
    const MAX_BYTES = 1024 * 50; // 50KB for hash calculation
    const buffer = await file.slice(0, Math.min(file.size, MAX_BYTES)).arrayBuffer();
    const byteArray = new Uint8Array(buffer);
    
    // Simple hash calculation
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < byteArray.length; i++) {
      h1 = Math.imul(h1 ^ byteArray[i], 2654435761);
      h2 = Math.imul(h2 ^ byteArray[i], 1597334677);
    }
    
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    
    const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0);
    return hash.toString(16);
  } catch (error) {
    console.error("Error generating file hash:", error);
    // Fallback to a random value if hashing fails
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
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
    fileId?: string;
  } = {}
): Promise<{ 
  optimizedFile: File; 
  width: number; 
  height: number; 
  altText: string;
  fileId: string;
}> => {
  // First, get the file hash if needed
  let fileIdToUse = options.fileId;
  if (!fileIdToUse) {
    fileIdToUse = await generateFileHash(file);
  }
  
  const { 
    maxWidth = 1200, 
    quality = 0.85,
    generateAlt = true,
    altText = '',
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
            altText: finalAltText,
            fileId: fileIdToUse as string
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
  filePath: string,
  bucketId: string = "blog-images",
  options: {
    maxWidth?: number;
    quality?: number;
    altText?: string;
    fileId?: string;
  } = {}
): Promise<{
  success: boolean;
  data?: {
    publicUrl: string;
    width?: number;
    height?: number;
  };
  error?: string;
}> => {
  try {
    console.log("Starting optimized image upload process...");
    
    // Pre-compute the file hash if needed
    let fileIdToUse = options.fileId;
    if (!fileIdToUse) {
      fileIdToUse = await generateFileHash(file);
    }
    
    // Upload to Supabase storage
    
    // Check if Supabase bucket exists and is available
    const bucketAvailable = localStorage.getItem(`bucket_available_${bucketId}`) === 'true';
    
    // Try Supabase if available
    if (bucketAvailable) {
      console.log("Attempting to upload to Supabase storage...");
      
      // Create bucket if it doesn't exist
      const bucketResult = await createBucketIfNotExists(bucketId);
      if (!bucketResult.success) {
        return { success: false, error: bucketResult.error };
      }
      
      // Upload the optimized image to Supabase
      const { data, error } = await supabase.storage
        .from(bucketId)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        });
        
      if (error) {
        console.log("Supabase upload also failed, using localStorage as last resort");
        
        // Save image data URL to localStorage as last resort
        try {
          const reader = new FileReader();
          return new Promise((resolve) => {
            // Pre-compute file hash to avoid using await in callback
            const fileId = fileIdToUse;
            
            reader.onload = (e) => {
              if (!e.target || !e.target.result) {
                resolve({ success: false, error: "Failed to read file" });
                return;
              }
              
              const dataUrl = e.target.result.toString();
              localStorage.setItem(`media_item_${fileId}`, dataUrl);
              
              resolve({
                success: true,
                data: {
                  publicUrl: dataUrl,
                  width: options.maxWidth,
                  height: options.quality
                }
              });
            };
            
            reader.onerror = () => {
              resolve({ success: false, error: "Failed to read file" });
            };
            
            reader.readAsDataURL(file);
          });
        } catch (localError) {
          return { success: false, error: String(localError) };
        }
      }
      
      // Get public URL from Supabase
      const { data: publicUrlData } = supabase.storage
        .from(bucketId)
        .getPublicUrl(filePath);
      
      return {
        success: true,
        data: {
          publicUrl: publicUrlData.publicUrl,
          width: options.maxWidth,
          height: options.quality
        }
      };
    }
    
    // Fall back to client-side storage
    console.log("Falling back to local storage...");
    
    // Save image data URL to localStorage as last resort
    try {
      const reader = new FileReader();
      return new Promise((resolve) => {
        // Pre-compute file hash to avoid using await in callback
        const fileId = fileIdToUse;
        
        reader.onload = (e) => {
          if (!e.target || !e.target.result) {
            resolve({ success: false, error: "Failed to read file" });
            return;
          }
          
          const dataUrl = e.target.result.toString();
          try {
            localStorage.setItem(`media_item_${fileId}`, dataUrl);
          } catch (storageError) {
            console.error("Storage quota exceeded:", storageError);
            // Create a temporary URL instead
            const tempUrl = URL.createObjectURL(file);
            return resolve({
              success: true,
              data: {
                publicUrl: tempUrl,
                width: options.maxWidth,
                height: options.quality
              }
            });
          }
          
          resolve({
            success: true,
            data: {
              publicUrl: dataUrl,
              width: options.maxWidth,
              height: options.quality
            }
          });
        };
        
        reader.onerror = () => {
          resolve({ success: false, error: "Failed to read file" });
        };
        
        reader.readAsDataURL(file);
      });
    } catch (localError) {
      return { success: false, error: String(localError) };
    }
  } catch (error) {
    console.error("Error in uploadOptimizedImage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error"
    }
  }
};
