
import React from 'react';
import { useEffect } from 'react';
import { SEO, generateDisciplineMetadata } from '@/lib/seo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StepsSection from '@/components/howitworks/StepsSection';
import FaqSection from '@/components/howitworks/FaqSection';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Link } from 'react-router-dom';

const DressageHowItWorks = () => {
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
    canonicalUrl: '/dressage/how-it-works',
    ogImage: '/lovable-uploads/5e82da92-7197-4290-8ed3-3848fcd50fb3.png'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      
      <div className="container mx-auto px-6 pt-24 pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dressage">Dressage</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>How It Works</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* Hero Section */}
      <div className="relative mb-12">
        <div className="w-full h-80 md:h-96 overflow-hidden relative">
          <img 
            src="/lovable-uploads/5e82da92-7197-4290-8ed3-3848fcd50fb3.png" 
            alt="Dressage rider performing with AI analytics visualization overlay"
            className="w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-transparent"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white max-w-2xl drop-shadow-lg text-shadow-lg">
                How AI Dressage Analysis Works
              </h1>
              <p className="text-xl text-white/90 max-w-xl mt-4 drop-shadow-lg text-shadow-md">
                Understand the process behind our AI-powered equestrian dressage analysis
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <main className="pt-2">
        <StepsSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
};

export default DressageHowItWorks;
