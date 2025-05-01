
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
    canonicalUrl: '/jumping/how-it-works'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="pt-24">
        <JumpingStepsSection />
        <JumpingFaqSection />
      </main>
      <Footer />
    </div>
  );
};

export default JumpingHowItWorks;
