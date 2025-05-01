
import React from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEO, generateDisciplineMetadata } from '@/lib/seo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StepsSection from '@/components/howitworks/StepsSection';
import FaqSection from '@/components/howitworks/FaqSection';

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
      <div className="container mx-auto px-6 pt-24 pb-6">
        <Link to="/jumping">
          <Button variant="ghost" className="flex items-center gap-2 mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to AI Jumping</span>
          </Button>
        </Link>
        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2">
          How AI Jumping Trainer Works
        </div>
      </div>
      <main className="pt-0">
        <StepsSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
};

export default JumpingHowItWorks;
