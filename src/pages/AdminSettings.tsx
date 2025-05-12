
import React from 'react';
import SettingsManagement from '@/components/admin/settings/SettingsManagement';
import { SEO, getPageMetadata } from '@/lib/seo';

const AdminSettings = () => {
  const seoMetadata = getPageMetadata('admin-settings', {
    noIndex: true
  });
  
  return (
    <div className="container mx-auto px-4 py-6">
      <SEO {...seoMetadata} />
      <SettingsManagement />
    </div>
  );
};

export default AdminSettings;
