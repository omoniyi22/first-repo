
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
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-silver-50 to-white -z-10" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(#3d3fb1 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>
      
      <div className="container mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className={`transition-all duration-1000 transform ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <AnimatedSection animation="fade-in" delay="delay-100">
              <span className="inline-block px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-sm font-medium mb-6">
                Next Generation Dressage Training
              </span>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in" delay="delay-200">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold leading-tight text-navy-900 mb-6">
                Transform Your Dressage Training with AI
              </h1>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in" delay="delay-300">
              <p className="text-lg text-navy-700 mb-8 max-w-lg">
                Upload your score sheets, get AI-powered analysis, and receive personalized training recommendations to improve your performance.
              </p>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in" delay="delay-400">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/sign-in?signup=true">
                  <Button className="navy-button group flex items-center gap-2 text-base">
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="outline" className="outline-button text-base">
                    How It Works
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in" delay="delay-500">
              <div className="mt-12 flex items-center">
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
                      <svg key={star} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-navy-600 font-medium">
                    500+ riders love our platform
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
          
          <div className={`transition-all duration-1000 delay-300 transform ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <AnimatedSection animation="fade-in-left" delay="delay-500" className="relative">
              <div className="relative">
                <div className="absolute -top-6 -right-6 -bottom-6 -left-6 rounded-xl bg-navy-500/5 -z-10 transform rotate-3" />
                <div className="absolute -top-6 -right-6 -bottom-6 -left-6 rounded-xl bg-silver-300/10 -z-10 transform -rotate-2" />
                
                <div className="glass-card overflow-hidden">
                  <div className="bg-navy-800 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-medium">AI Analysis Dashboard</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-navy-900 font-medium">Recent Test: Level 2 - Test 3</h4>
                      <span className="text-sm text-navy-600">Score: 68.2%</span>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-navy-600">Collection</span>
                          <span className="text-sm font-medium">72%</span>
                        </div>
                        <div className="h-2 bg-silver-100 rounded-full overflow-hidden">
                          <div className="h-full bg-navy-600 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-navy-600">Transitions</span>
                          <span className="text-sm font-medium">64%</span>
                        </div>
                        <div className="h-2 bg-silver-100 rounded-full overflow-hidden">
                          <div className="h-full bg-navy-600 rounded-full" style={{ width: '64%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-navy-600">Rhythm</span>
                          <span className="text-sm font-medium">83%</span>
                        </div>
                        <div className="h-2 bg-silver-100 rounded-full overflow-hidden">
                          <div className="h-full bg-navy-600 rounded-full" style={{ width: '83%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-navy-50 p-4 rounded-lg mb-6">
                      <h5 className="text-navy-800 font-medium mb-2">AI Recommendation</h5>
                      <p className="text-navy-700 text-sm">
                        Focus on smoother transitions between trot and canter. 
                        Try exercise #42 from our library to improve collection during transitions.
                      </p>
                    </div>
                    
                    <button className="w-full bg-navy-700 hover:bg-navy-800 text-white py-2 rounded-lg transition-colors">
                      View Detailed Analysis
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
