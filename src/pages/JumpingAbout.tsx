
import React from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEO, generateDisciplineMetadata } from '@/lib/seo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JumpMissionSection from '@/components/about/JumpMissionSection';
import JumpTeamSection from '@/components/about/JumpTeamSection';

const JumpingAbout = () => {
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
    canonicalUrl: '/jumping/about'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      
      {/* Hero Section with the new jumping horse image */}
      <div className="relative mb-12">
        <div className="w-full h-96 md:h-[500px] overflow-hidden relative">
          <img 
            src="/lovable-uploads/b729b0be-9b4c-4b4b-bdec-6bd2f849b8f8.png" 
            alt="Horse and rider jumping with AI analysis overlay"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/40"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl">
                <Link to="/jumping">
                  <Button variant="ghost" className="flex items-center gap-2 mb-4 -ml-2 text-white bg-blue-800/30 hover:bg-blue-800/50">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to AI Jump</span>
                  </Button>
                </Link>
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2">
                  About AI Jump Trainer
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white max-w-2xl drop-shadow-md mt-4">
                  Transforming Jump Training Through AI
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="pt-0">
        <JumpMissionSection />
        <JumpTeamSection />
      </main>
      <Footer />
    </div>
  );
};

export default JumpingAbout;
