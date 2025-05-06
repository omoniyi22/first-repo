
import React, { useState } from 'react';
import BlogManagement from '@/components/admin/blog/BlogManagement';
import MediaBucket from '@/components/admin/media/MediaBucket';
import { useToast } from '@/hooks/use-toast';

const AdminBlog = () => {
  const [isBucketReady, setIsBucketReady] = useState(false);
  const { toast } = useToast();
  
  const handleBucketInitialized = (success: boolean) => {
    setIsBucketReady(success);
    
    if (!success) {
      // Now we just log this, as the user-facing toast is shown in MediaBucket
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
      <BlogManagement />
    </>
  );
};

export default AdminBlog;
