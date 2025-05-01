
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MissionSection from '@/components/about/MissionSection';
import TeamSection from '@/components/about/TeamSection';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About = () => {
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

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <MissionSection />
        <TeamSection />
        
        {/* Add centered call to action button */}
        <div className="container mx-auto px-6 py-12 flex justify-center">
          <Link to="/sign-in?signup=true">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-none hover:text-white">
              Get Started Now
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
