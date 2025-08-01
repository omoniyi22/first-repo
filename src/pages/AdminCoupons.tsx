import React from "react";
import { SEO, getPageMetadata } from "@/lib/seo";
import CouponsSettings from "@/components/admin/settings/CouponsSettings";

const AdminCoupons = () => {
  const seoMetadata = getPageMetadata("admin-coupons", {
    noIndex: true,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <SEO {...seoMetadata} />
      <CouponsSettings />
    </div>
  );
};

export default AdminCoupons;
