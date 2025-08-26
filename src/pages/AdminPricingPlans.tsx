import React from "react";
import { SEO, getPageMetadata } from "@/lib/seo";
import PricingSettings from "@/components/admin/settings/PricingSettings";

const AdminPricingPlans = () => {
  const seoMetadata = getPageMetadata("admin-pricing-plans", {
    noIndex: true,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <SEO {...seoMetadata} />
      <PricingSettings />
    </div>
  );
};

export default AdminPricingPlans;
