
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricingTiers from '@/components/pricing/PricingTiers';
import PricingFaq from '@/components/pricing/PricingFaq';
import { useEffect } from 'react';
import { SEO, getPageMetadata } from '@/lib/seo';
import Analytics from '@/components/layout/Analytics';

const Pricing = () => {
  // Initialize scroll reveal for animations
  useEffect(() => {
    const initScrollReveal = () => {
      const revealItems = document.querySelectorAll('.reveal-scroll');
      
      const revealCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      };
      
      const observer = new IntersectionObserver(revealCallback, {
        threshold: 0.1,
      });
      
      revealItems.forEach((item) => {
        observer.observe(item);
      });
      
      return () => {
        revealItems.forEach((item) => {
          observer.unobserve(item);
        });
      };
    };
    
    initScrollReveal();
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  // Get SEO metadata for pricing page
  const seoMetadata = getPageMetadata('pricing');

  return (
    <div className="min-h-screen bg-white">
      <SEO {...seoMetadata} />
      <Navbar />
      <Analytics />
      <main className="pt-navbar">
        <PricingTiers />
        <PricingFaq />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
