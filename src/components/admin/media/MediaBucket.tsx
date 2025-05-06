
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
    const initBucket = async () => {
      try {
        console.log(`Initializing bucket: ${bucketId} (attempt ${retryCount + 1})`);
        setIsLoading(true);
        
        // First check if we can access the bucket info
        const bucketInfo = await getStorageBucketInfo(bucketId);
        if (bucketInfo.success) {
          console.log(`Bucket ${bucketId} already exists and is accessible`);
          setIsInitialized(true);
          setIsLoading(false);
          if (onInitialized) onInitialized(true);
          return;
        }
        
        // If we can't access it, try to create it
        const result = await createBucketIfNotExists(bucketId);
        console.log(`Bucket initialization result:`, result);
        
        if (result.success) {
          setIsInitialized(true);
          setError(null);
          if (onInitialized) onInitialized(true);
        } else {
          setError(`Failed to initialize bucket: ${result.error || 'Unknown error'}`);
          console.error(`Bucket creation error:`, result.error);
          
          // Notify parent component
          if (onInitialized) onInitialized(false);
          
          // Show error toast only on first attempt
          if (retryCount === 0) {
            toast({
              title: "Storage Information",
              description: "Using local storage for media. Uploads will be saved to your browser.",
              duration: 5000
            });
          }
        }
      } catch (err) {
        console.error('Error initializing media bucket:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize media storage');
        
        if (onInitialized) {
          onInitialized(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initBucket();
  }, [bucketId, onInitialized, retryCount, toast]);

  // If we're in loading state, show a small indicator
  if (isLoading && retryCount === 0) {
    return <div className="text-sm text-gray-500">Initializing media storage...</div>;
  }

  // If there's an error, show retry button after first attempt
  if (error && retryCount > 0) {
    return (
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <span>Using local storage</span>
        <button 
          onClick={() => setRetryCount(prev => prev + 1)}
          className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
        >
          Retry cloud storage
        </button>
      </div>
    );
  }

  // This is a utility component with no visual representation when successful
  return null;
};

export default MediaBucket;
