
import { createBucketIfNotExists } from '@/lib/storage';
import { useEffect, useState } from 'react';

interface MediaBucketProps {
  bucketId: string;
  onInitialized?: (success: boolean) => void;
}

export const MediaBucket = ({ bucketId, onInitialized }: MediaBucketProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initBucket = async () => {
      try {
        const result = await createBucketIfNotExists(bucketId);
        setIsInitialized(result.success);
        if (onInitialized) {
          onInitialized(result.success);
        }
      } catch (err) {
        console.error('Error initializing media bucket:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize media storage');
      }
    };

    initBucket();
  }, [bucketId, onInitialized]);

  if (error) {
    return <div className="text-sm text-red-500">Storage initialization error: {error}</div>;
  }

  return null; // This is a utility component with no visual representation
};

export default MediaBucket;
