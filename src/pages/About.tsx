
import { useEffect } from 'react';
import { SEO, getPageMetadata } from '@/lib/seo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/about/HeroSection';
import MissionAndVision from '@/components/about/MissionAndVision';
import CoreValues from '@/components/about/CoreValues';
import KeyStatistics from '@/components/about/KeyStatistics';
import ProblemsWeSolve from '@/components/about/ProblemsWeSolve';
import DisciplineSpecificTabs from '@/components/about/DisciplineSpecificTabs';
import ExperienceSection from '@/components/about/ExperienceSection';
import EquestrianTeamSection from '@/components/about/EquestrianTeamSection';

// The following sections are preserved from the existing About page
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Get page metadata
  const seoMetadata = getPageMetadata('about', {
    title: 'About AI Equestrian | Advanced Equestrian Analytics',
    description: 'Learn about AI Equestrian\'s mission to transform dressage and jumping training through artificial intelligence and data-driven performance analysis.',
    canonicalUrl: '/about'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="pt-20">
        {/* New Hero Section */}
        <HeroSection />
        
        {/* New Mission & Vision Section */}
        <MissionAndVision />
        
        {/* New Core Values Section */}
        <CoreValues />
        
        {/* New Key Statistics Section */}
        <KeyStatistics />
        
        {/* New Problems We Solve Section */}
        <ProblemsWeSolve />
        
        {/* New Discipline-Specific Tabs Section */}
        <DisciplineSpecificTabs />
        
        {/* Team Section - Preserving existing section */}
        <EquestrianTeamSection />
        
        {/* New Experience Section */}
        <ExperienceSection />
        
        {/* Partnerships and Sponsorships Section - Preserved from existing About page */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12 reveal-scroll">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Partnerships & Sponsorships</h2>
              <p className="text-lg text-gray-700">
                We're proud to collaborate with leading equestrian organizations and brands to advance the sport and support riders at all levels.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto reveal-scroll">
              {/* Partner Card 1 */}
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-center font-serif">Equestrian Federation</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">Official technology partner providing AI training solutions to national team riders.</p>
                  <div className="h-20 w-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-gray-400">Logo</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Partner Card 2 */}
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-center font-serif">Elite Equine Equipment</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">Premium equipment manufacturer partnering to integrate technology with traditional training tools.</p>
                  <div className="h-20 w-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-gray-400">Logo</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Partner Card 3 */}
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-center font-serif">International Shows Circuit</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">Official AI analysis partner for major international competitions and events.</p>
                  <div className="h-20 w-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-gray-400">Logo</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-12 text-center reveal-scroll">
              <h3 className="text-xl font-medium mb-4">Interested in partnering with AI Equestrian?</h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                We're always looking to collaborate with organizations and brands that share our vision for the future of equestrian training.
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white">
                Contact for Partnership Opportunities
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
