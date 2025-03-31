
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AnimatedSection from '../ui/AnimatedSection';

const Hero = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(#9b87f5 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>
      
      <div className="container mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className={`transition-all duration-1000 transform ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <AnimatedSection animation="fade-in" delay="delay-100">
              <span className="inline-block px-3 py-1 bg-purple-700/60 text-white rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-purple-400/30">
                Next Generation Dressage Training
              </span>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in" delay="delay-200">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold leading-tight text-purple-900 mb-6">
                Transform Your Dressage Training with AI
              </h1>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in" delay="delay-300">
              <p className="text-lg text-purple-800 mb-8 max-w-lg">
                Upload your score sheets, get AI-powered analysis, and receive personalized training recommendations to improve your performance.
              </p>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in" delay="delay-400">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/sign-in?signup=true">
                  <Button className="group flex items-center gap-2 text-base bg-purple-700 hover:bg-purple-800 text-white">
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="outline" className="outline-button text-base border-purple-200 bg-white/90 text-purple-800 hover:bg-purple-800/50 hover:text-purple-100">
                    How It Works
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in" delay="delay-500">
              <div className="mt-12 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-purple-800 overflow-hidden">
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
                  <p className="text-sm text-purple-800 font-medium">
                    500+ riders love our platform
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
          
          <div className={`transition-all duration-1000 delay-300 transform ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <AnimatedSection animation="fade-in-left" delay="delay-500" className="relative">
              <div className="relative h-[600px] flex items-center justify-center">
                <img 
                  src="/lovable-uploads/987a3f3b-1917-439f-a3a9-8fabc609cffa.png" 
                  alt="Dressage rider with horse"
                  className="w-full h-full object-contain object-right"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
