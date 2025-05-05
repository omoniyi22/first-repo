
import React from 'react';
import { useEffect } from 'react';
import { SEO, generateDisciplineMetadata } from '@/lib/seo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JumpingStepsSection from '@/components/howitworks/JumpingStepsSection';
import JumpingFaqSection from '@/components/howitworks/JumpingFaqSection';

const JumpingHowItWorks = () => {
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

  // Get discipline-specific metadata
  const seoMetadata = generateDisciplineMetadata('Jumping', {
    canonicalUrl: '/jumping/how-it-works',
    ogImage: '/lovable-uploads/28c8b566-c53d-4197-b758-abac7ac25848.png'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-24 mb-12">
        <div className="w-full h-80 md:h-96 overflow-hidden relative">
          <img 
            src="/lovable-uploads/b4c7d6ae-2c74-42dc-984a-32d0c758a7aa.png" 
            alt="Show jumping competition with rider clearing a jump"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-transparent"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white max-w-2xl drop-shadow-md">
                How AI Jumping Analysis Works
              </h1>
              <p className="text-xl text-white/90 max-w-xl mt-4 drop-shadow-md">
                Understand the process behind our AI-powered equestrian jumping analysis
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <main>
        <JumpingStepsSection />
        <JumpingFaqSection />
      </main>
      <Footer />
    </div>
  );
};

export default JumpingHowItWorks;
