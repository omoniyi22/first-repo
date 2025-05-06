
import { createBucketIfNotExists, getStorageBucketInfo } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MediaBucketProps {
  bucketId: string;
  onInitialized?: (success: boolean) => void;
}

export const MediaBucket = ({ bucketId, onInitialized }: MediaBucketProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we've already shown the storage toast in this session
    const hasShownStorageToast = sessionStorage.getItem(`storageToast_${bucketId}`) === 'true';
    
    const initBucket = async () => {
      try {
        console.log(`Initializing bucket: ${bucketId} (attempt ${retryCount + 1})`);
        setIsLoading(true);
        
        // First check if we can access the bucket info - we'll still try
        // but less critical now that we have Cloudinary
        const bucketInfo = await getStorageBucketInfo(bucketId);
        
        if (bucketInfo.success) {
          console.log(`Bucket ${bucketId} already exists and is accessible`);
          setIsInitialized(true);
          setIsLoading(false);
          setError(null);
          
          // Set a key in localStorage to indicate this bucket is available in the cloud
          localStorage.setItem(`bucket_available_${bucketId}`, 'true');
          
          if (onInitialized) onInitialized(true);
          return;
        }
        
        // If we can't access it, try to create it
        const result = await createBucketIfNotExists(bucketId);
        console.log(`Bucket initialization result:`, result);
        
        if (result.success) {
          setIsInitialized(true);
          setError(null);
          
          // Set a key in localStorage to indicate this bucket is available
          localStorage.setItem(`bucket_available_${bucketId}`, 'true');
          
          if (onInitialized) onInitialized(true);
        } else {
          setError(`Failed to initialize bucket: ${result.error || 'Unknown error'}`);
          console.error(`Bucket creation error:`, result.error);
          
          // Remove the key from localStorage to indicate bucket is not available
          localStorage.removeItem(`bucket_available_${bucketId}`);
          
          // Now we'll try to use Cloudinary anyway
          console.log("Will use Cloudinary for image storage");
          
          // No need to show toast since we have Cloudinary as primary storage
          if (onInitialized) onInitialized(true);
        }
      } catch (err) {
        console.error('Error initializing media bucket:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize media storage');
        
        // Remove the key from localStorage to indicate bucket is not available
        localStorage.removeItem(`bucket_available_${bucketId}`);
        
        // Since we have Cloudinary, we can still function without Supabase storage
        console.log("Will use Cloudinary for image storage (after error)");
        if (onInitialized) {
          // We're still initialized since we have Cloudinary
          onInitialized(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initBucket();
  }, [bucketId, onInitialized, retryCount, toast]);

  // If we're in loading state, show a small indicator
  if (isLoading && retryCount === 0) {
    return <div className="text-xs text-gray-400">Initializing media storage...</div>;
  }

  // This is a utility component with no visual representation when successful
  return null;
};

export default MediaBucket;
