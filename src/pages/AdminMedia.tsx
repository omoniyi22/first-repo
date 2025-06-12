
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MediaLibrary from '@/components/admin/media/MediaLibrary';

const AdminMedia = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20">
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Media Management</h1>
                <p className="text-gray-600">Manage your media files and uploads</p>
              </div>
              <MediaLibrary />
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminMedia;
