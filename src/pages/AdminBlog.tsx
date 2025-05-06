
import React, { useEffect } from 'react';
import BlogManagement from '@/components/admin/blog/BlogManagement';
import MediaBucket from '@/components/admin/media/MediaBucket';

const AdminBlog = () => {
  return (
    <>
      <MediaBucket bucketId="blog-images" />
      <BlogManagement />
    </>
  );
};

export default AdminBlog;
