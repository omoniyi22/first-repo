
import React from 'react';
import { useEffect } from 'react';
import { SEO, getPageMetadata } from '@/lib/seo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EquestrianMissionSection from '@/components/about/EquestrianMissionSection';
import EquestrianTeamSection from '@/components/about/EquestrianTeamSection';
import ProblemsWeSolve from '@/components/about/ProblemsWeSolve';
import ExperienceSection from '@/components/about/ExperienceSection';

const EquestrianAbout = () => {
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

  // Get page metadata
  const seoMetadata = getPageMetadata('about', {
    title: 'About Our Technology | AI Equestrian',
    description: 'Learn about AI Equestrian\'s mission to transform dressage and jumping training through artificial intelligence and data-driven performance analysis.',
    canonicalUrl: '/about'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="pt-20">
        <EquestrianMissionSection />
        <ProblemsWeSolve />
        <EquestrianTeamSection />
        <ExperienceSection />
      </main>
      <Footer />
    </div>
  );
};

export default EquestrianAbout;
