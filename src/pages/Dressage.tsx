
import React from 'react';
import Hero from '@/components/home/Hero';
import Process from '@/components/home/Process';
import Benefits from '@/components/home/Benefits';
import Testimonials from '@/components/home/Testimonials';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '@/lib/seo/SEO';
import { generateDisciplineMetadata } from '@/lib/seo/disciplineMetadata';

const Dressage = () => {
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
    
    // Add console log to verify component mounting
    console.log('Dressage component mounted');
  }, []);

  // Get discipline-specific metadata
  const seoMetadata = generateDisciplineMetadata('Dressage', {
    canonicalUrl: '/dressage'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      <div className="container mx-auto px-6 pt-24 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <Button variant="ghost" className="flex items-center gap-2 -ml-2 hover:bg-purple-100 hover:text-purple-800">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to AI Equestrian</span>
              </Button>
            </Link>
            <div className="ml-4 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              AI Dressage Trainer
            </div>
          </div>
          <Link to="/dressage/about" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
            About AI Dressage
          </Link>
        </div>
      </div>
      <main className="pt-2">
        <Hero />
        <Process />
        <Benefits />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Dressage;
