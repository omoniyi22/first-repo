
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
      // The toast is now handled in the MediaBucket component with session storage
      console.log("Media bucket initialization failed, using local storage");
    } else {
      console.log("Media bucket successfully initialized");
      toast({
        title: "Media Storage Ready",
        description: "You can now upload and use images in your blog posts",
      });
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
