
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Jumping = () => {
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

  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <Navbar />
      <div className="container mx-auto px-6 pt-24 pb-6">
        <Link to="/">
          <Button variant="ghost" className="flex items-center gap-2 mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to AI Equestrian</span>
          </Button>
        </Link>
        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2">
          AI Jumping Trainer
        </div>
      </div>
      <main className="pt-0">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-blue-100/50">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          
          <img 
            src="/lovable-uploads/987a3f3b-1917-439f-a3a9-8fabc609cffa.png" 
            alt="Show jumping competition"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            style={{ objectPosition: 'center 30%' }}
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-900/40"></div>
          
          <div className="container relative z-10 mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto transition-all duration-1000 transform">
              <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/30">
                Next Generation Show Jumping Training
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold leading-tight text-white mb-6 text-shadow">
                Transform Your Jumping Performance with AI
              </h1>
              
              <p className="text-lg text-white/90 mb-8 max-w-lg mx-auto text-shadow-sm">
                Upload your jumping videos, get AI-powered analysis, and receive personalized technique recommendations to improve your performance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
                <Link to="/sign-in?signup=true">
                  <Button className="group flex items-center gap-2 text-base bg-white hover:bg-white/90 text-blue-800">
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="outline" className="text-base border-white/30 bg-white/10 text-white hover:bg-white/30 hover:text-blue-900 backdrop-blur-sm">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 reveal-scroll">
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6 text-gray-900">
                How AI Jumping Trainer Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our simple process helps you improve your show jumping technique through AI-powered analysis
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Upload Your Videos",
                  description: "Share your jumping rounds for our AI to analyze your technique and approach."
                },
                {
                  title: "Get AI Analysis",
                  description: "Our algorithms identify strengths and areas for improvement in your riding."
                },
                {
                  title: "Follow Tailored Recommendations",
                  description: "Implement personalized training exercises designed to enhance your performance."
                }
              ].map((step, index) => (
                <div 
                  key={index}
                  className="text-center p-8 reveal-scroll"
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-medium">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-serif font-medium mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-blue-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 reveal-scroll">
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6 text-gray-900">
                Benefits of AI Jumping Analysis
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover how our AI can transform your show jumping performance
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Technique Analysis",
                  description: "Detailed insight into your approach, takeoff, and landing technique"
                },
                {
                  title: "Pattern Recognition",
                  description: "Identify recurring issues that affect your performance across competitions"
                },
                {
                  title: "Progress Tracking",
                  description: "Visualize improvements in your riding technique and results over time"
                },
                {
                  title: "Expert Insights",
                  description: "AI-generated advice based on techniques from top show jumpers"
                }
              ].map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm reveal-scroll"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <h3 className="text-xl font-serif font-medium mb-3 text-blue-900">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Jumping;
