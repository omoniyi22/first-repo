
import React from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEO, generateDisciplineMetadata } from '@/lib/seo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EquestrianMissionSection from '@/components/about/EquestrianMissionSection';
import EquestrianTeamSection from '@/components/about/EquestrianTeamSection';

const DressageAbout = () => {
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
  const seoMetadata = generateDisciplineMetadata('Dressage', {
    title: 'About AI Dressage | Our Mission and Team',
    canonicalUrl: '/dressage/about'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative mb-12">
        <div className="w-full h-96 md:h-[500px] overflow-hidden relative">
          <img 
            src="/lovable-uploads/42930ec1-2f55-429f-aaa5-4aac1791a729.png" 
            alt="Dressage rider with AI analysis overlay"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-purple-800/40"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl">
                <Link to="/dressage">
                  <Button variant="ghost" className="flex items-center gap-2 mb-4 -ml-2 text-white bg-purple-800/30 hover:bg-purple-800/50">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to AI Dressage</span>
                  </Button>
                </Link>
                <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-2">
                  About AI Dressage
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white max-w-2xl drop-shadow-md mt-4">
                  Transforming Dressage Training Through AI
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="pt-0">
        <EquestrianMissionSection />
        <EquestrianTeamSection />
      </main>
      <Footer />
    </div>
  );
};

export default DressageAbout;
