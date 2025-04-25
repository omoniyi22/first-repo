
import Hero from '@/components/home/Hero';
import Process from '@/components/home/Process';
import Benefits from '@/components/home/Benefits';
import Testimonials from '@/components/home/Testimonials';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useEffect } from 'react';
import SupabaseConnectionTest from '@/components/ui/SupabaseConnectionTest';
import { isSupabaseConfigured } from '@/lib/supabase';

const Index = () => {
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

  // Check if we're in development or if Supabase is not configured
  const showConnectionTest = process.env.NODE_ENV !== 'production' || !isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      <Navbar />
      <main className="pt-0">
        {showConnectionTest && <SupabaseConnectionTest />}
        <Hero />
        <Process />
        <Benefits />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
