
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
            <div className="inline-block px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-medium mb-4">
              Coming Soon
            </div>
            <h2 className="text-3xl font-serif font-semibold text-purple-900 mb-4">
              Be the First to Know When We Launch
            </h2>
            <p className="text-purple-600 mb-8 max-w-2xl mx-auto">
              Our subscription plans will be available soon. Sign up below to be notified when we launch and get exclusive early access offers.
            </p>
            <EmailSignupForm />
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10" />
          <PricingTiers />
          <PricingFaq />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
