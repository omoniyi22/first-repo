
import { createBucketIfNotExists } from '@/lib/storage';
import { useEffect, useState } from 'react';

interface MediaBucketProps {
  bucketId: string;
  onInitialized?: (success: boolean) => void;
}

export const MediaBucket = ({ bucketId, onInitialized }: MediaBucketProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initBucket = async () => {
      try {
        console.log(`Initializing bucket: ${bucketId}`);
        const result = await createBucketIfNotExists(bucketId);
        console.log(`Bucket initialization result:`, result);
        
        setIsInitialized(result.success);
        setIsLoading(false);
        
        if (onInitialized) {
          onInitialized(result.success);
        }
      } catch (err) {
        console.error('Error initializing media bucket:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize media storage');
        setIsLoading(false);
        
        if (onInitialized) {
          onInitialized(false);
        }
      }
    };

    initBucket();
  }, [bucketId, onInitialized]);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Initializing media storage...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">Storage initialization error: {error}</div>;
  }

  return null; // This is a utility component with no visual representation when successful
};

export default MediaBucket;
