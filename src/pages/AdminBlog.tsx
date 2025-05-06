
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
      toast({
        title: "Storage Error",
        description: "Could not initialize blog media storage. Image uploads may not work.",
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
      <BlogManagement />
    </>
  );
};

export default AdminBlog;
