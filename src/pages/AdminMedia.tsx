
import React, { useState } from 'react';
import MediaLibrary from '@/components/admin/media/MediaLibrary';
import MediaBucket from '@/components/admin/media/MediaBucket';
import { useToast } from '@/hooks/use-toast';

const AdminMedia = () => {
  const [isBucketReady, setIsBucketReady] = useState(false);
  const { toast } = useToast();
  
  const handleBucketInitialized = (success: boolean) => {
    setIsBucketReady(success);
    
    if (!success) {
      // The toast is now shown by the MediaBucket component itself
      console.log("Media bucket initialization failed, using local storage");
    } else {
      console.log("Media bucket successfully initialized");
    }
  };
  
  return (
    <>
      <MediaBucket 
        bucketId="blog-images" 
        onInitialized={handleBucketInitialized} 
      />
      <MediaLibrary />
    </>
  );
};

export default AdminMedia;
