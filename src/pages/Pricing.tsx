
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricingTiers from '@/components/pricing/PricingTiers';
import PricingFaq from '@/components/pricing/PricingFaq';
import { useEffect } from 'react';
import { SEO, getPageMetadata } from '@/lib/seo';

const Pricing = () => {
  // Get SEO metadata for pricing page
  const seoMetadata = getPageMetadata('pricing');
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="pt-20">
        <PricingTiers />
        <PricingFaq />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
