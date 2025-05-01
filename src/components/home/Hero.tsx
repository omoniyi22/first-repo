
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AnimatedSection from '../ui/AnimatedSection';
import { Skeleton } from '../ui/skeleton';

const Hero = () => {
  const [loaded, setLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Full-width background image */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-purple-100/50">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      
      <img 
        src="/lovable-uploads/7c32e2d9-4fce-4ed5-abba-0fb12abe96eb.png" 
        alt="Dressage rider performing"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
        style={{ objectPosition: 'center 30%' }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-purple-900/40"></div>
      
      <div className="container relative z-10 mx-auto px-6 text-center">
        <div className={`max-w-2xl mx-auto transition-all duration-1000 transform ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <AnimatedSection animation="fade-in" delay="delay-100">
            <div className="inline-block px-6 py-3 mb-6 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl backdrop-blur-sm">
              <span className="text-white font-medium">Next Generation Dressage Training</span>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-in" delay="delay-200">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold leading-tight text-white mb-6 text-shadow">
              Transform Your Dressage Training with AI
            </h1>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-in" delay="delay-300">
            <p className="text-lg text-white/90 mb-8 max-w-lg mx-auto text-shadow-sm">
              Upload your score sheets, get AI-powered analysis, and receive personalized training recommendations to improve your performance.
            </p>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-in" delay="delay-400">
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
              <Link to="/sign-in?signup=true">
                <Button className="group flex items-center gap-2 text-base bg-white hover:bg-white/90 text-purple-800">
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" className="text-base border-white/30 bg-white/10 text-white hover:bg-white/30 hover:text-purple-900 backdrop-blur-sm">
                  How It Works
                </Button>
              </Link>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-in" delay="delay-500">
            <div className="flex items-center justify-center">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <img 
                      src={`https://randomuser.me/api/portraits/women/${i + 20}.jpg`}
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-white font-medium">
                  500+ riders love our platform
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Hero;
