
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const AdminMedia = () => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Media Management</h2>
        <p className="text-gray-600">
          Media uploads are now handled directly within components that need them.
          Use the upload functionality in profiles, blog posts, and other areas where images are needed.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminMedia;
