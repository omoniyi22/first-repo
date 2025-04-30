
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
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      <Navbar />
      <div className="container mx-auto px-6 pt-24 pb-6">
        <Link to="/">
          <Button variant="ghost" className="flex items-center gap-2 mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to AI Equestrian</span>
          </Button>
        </Link>
        <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-2">
          AI Dressage Trainer
        </div>
      </div>
      <main className="pt-0">
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
