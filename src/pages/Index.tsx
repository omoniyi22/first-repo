import React from 'react';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SEO } from '@/lib/seo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Process from '@/components/home/Process';
import Benefits from '@/components/home/Benefits';
import Testimonials from '@/components/home/Testimonials';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import DualDisciplineHero from '@/components/shared/DualDisciplineHero';

const Home = () => {
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
    <div className="min-h-screen">
      <SEO />
      <Navbar />
      
      {/* Hero Section with DualDisciplineHero for mobile */}
      <section className="relative bg-gradient-to-b from-gray-900 to-gray-800">
        <DualDisciplineHero
          jumpingImageSrc="/lovable-uploads/dbb9802b-bed7-4888-96a3-73b68198710b.png"
          dressageImageSrc="/lovable-uploads/7c32e2d9-4fce-4ed5-abba-0fb12abe96eb.png"
          jumpingAlt="Show jumper using AI analytics"
          dressageAlt="Dressage rider using AI analytics"
          className="w-full h-screen md:h-[80vh] absolute inset-0"
          overlayClassName="hidden md:block bg-gradient-to-r from-gray-900/70 to-gray-800/40"
        />
        
        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-6 py-32 md:py-40 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold leading-tight text-white mb-8 text-shadow">
            Unlock Your Equestrian Potential with AI
          </h1>
          
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto text-shadow-sm">
            Transform your dressage and jumping performance with AI-powered insights and personalized training.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
            <Link to="/sign-in?signup=true">
              <Button className="group flex items-center gap-2 text-base bg-white hover:bg-white/90 text-gray-900">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/dressage">
              <Button variant="outline" className="text-base border-gray-400 bg-gray-900/50 text-white hover:bg-gray-900/70 hover:text-white backdrop-blur-sm">
                Explore Dressage
              </Button>
            </Link>
            <Link to="/jumping">
              <Button variant="outline" className="text-base border-gray-400 bg-gray-900/50 text-white hover:bg-gray-900/70 hover:text-white backdrop-blur-sm">
                Explore Jumping
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <main>
        <Process />
        <Benefits />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
