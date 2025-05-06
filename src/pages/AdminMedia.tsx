
import React from 'react';
import MediaLibrary from '@/components/admin/media/MediaLibrary';
import MediaBucket from '@/components/admin/media/MediaBucket';

const AdminMedia = () => {
  return (
    <>
      <MediaBucket bucketId="blog-images" />
      <MediaLibrary />
    </>
  );
};

export default AdminMedia;
