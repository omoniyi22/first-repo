
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
      toast({
        title: "Storage Error",
        description: "Could not initialize media storage. Media library functionality may be limited.",
        variant: "destructive",
        duration: 5000
      });
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
