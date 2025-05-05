
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useEffect } from 'react';
import { SEO, getPageMetadata } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HowItWorks = () => {
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

  const seoMetadata = getPageMetadata('how-it-works');

  return (
    <div className="min-h-screen">
      <SEO {...seoMetadata} />
      <Navbar />
      
      <main className="pt-24">
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-16 reveal-scroll">
              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-6">How AI Equestrian Works</h1>
              <p className="text-lg text-gray-700">
                Choose your equestrian discipline to learn how our AI-powered training solutions can help you improve your performance.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-8 shadow-sm border border-purple-100 reveal-scroll h-full flex flex-col">
                <h2 className="text-2xl font-serif font-medium mb-4 text-purple-900">AI Dressage Trainer</h2>
                <p className="mb-6 text-gray-700">
                  Transform your dressage performance with AI-powered analysis of test sheets, videos, and receive personalized training recommendations.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</div>
                    <span>Upload dressage test videos or score sheets</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</div>
                    <span>Receive detailed AI analysis of movements and transitions</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</div>
                    <span>Follow personalized training recommendations</span>
                  </li>
                </ul>
                <div className="flex flex-col items-center mt-auto">
                  <Link to="/sign-in?signup=true" className="w-full max-w-md mb-3">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-none hover:text-white">
                      Start Your Free Trial
                    </Button>
                  </Link>
                  <Link to="/dressage/how-it-works" className="w-full max-w-md">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-none hover:text-white">
                      Learn More About Dressage AI
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-8 shadow-sm border border-blue-100 reveal-scroll h-full flex flex-col">
                <h2 className="text-2xl font-serif font-medium mb-4 text-blue-900">AI Jumping Trainer</h2>
                <p className="mb-6 text-gray-700">
                  Elevate your jumping performance with AI-powered video analysis, course insights, and personalized training recommendations.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</div>
                    <span>Upload videos of your jumping rounds or training sessions</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</div>
                    <span>Get analyzed insights on approach, takeoff, and landing</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</div>
                    <span>Implement targeted exercises to improve technique</span>
                  </li>
                </ul>
                <div className="flex flex-col items-center mt-auto">
                  <Link to="/sign-in?signup=true" className="w-full max-w-md mb-3">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-none hover:text-white">
                      Start Your Free Trial
                    </Button>
                  </Link>
                  <Link to="/jumping/how-it-works" className="w-full max-w-md">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-none hover:text-white">
                      Learn More About Jumping AI
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto mt-20 text-center reveal-scroll">
              <h2 className="text-2xl md:text-3xl font-serif font-medium mb-6">Why Choose AI Equestrian?</h2>
              <div className="grid md:grid-cols-3 gap-8 mt-10">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-purple-900">Data-Driven</h3>
                  <p className="text-gray-700">Advanced analysis technology that provides objective insights you can trust.</p>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-purple-900">Personalized</h3>
                  <p className="text-gray-700">Tailored feedback and training plans based on your specific goals and challenges.</p>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-purple-900">Accessible</h3>
                  <p className="text-gray-700">Elite-level training insights available anywhere, anytime, at a fraction of the cost.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;
