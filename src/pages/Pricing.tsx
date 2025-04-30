
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricingTiers from '@/components/pricing/PricingTiers';
import PricingFaq from '@/components/pricing/PricingFaq';
import EmailSignupForm from '@/components/pricing/EmailSignupForm';
import { useEffect } from 'react';

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-6 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-semibold text-purple-900 mb-4">
              Choose the Perfect Plan for Your Training Journey
            </h2>
            <p className="text-purple-600 mb-8 max-w-2xl mx-auto">
              Stay updated with our latest pricing plans and exclusive offers. Join our waitlist to be notified when new subscription tiers become available.
            </p>
            <EmailSignupForm />
          </div>
        </div>
        <PricingTiers />
        <PricingFaq />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
