
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
      {/* Background with the dressage image */}
      <div className="absolute inset-0 bg-navy-950 -z-10">
        <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-navy-950 via-navy-900/80 to-navy-950">
          <img 
            src="/lovable-uploads/79f64a37-cb8e-4627-b743-c5330837a1b0.png" 
            alt="Dressage illustration"
            className="w-full h-full object-cover object-center opacity-70"
          />
        </div>
      </div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>
      
      <div className="container mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className={`transition-all duration-1000 transform ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <AnimatedSection animation="fade-in" delay="delay-100">
              <span className="inline-block px-3 py-1 bg-navy-700/30 text-navy-100 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-navy-400/20">
                Next Generation Dressage Training
              </span>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in" delay="delay-200">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold leading-tight text-white mb-6">
                Transform Your Dressage Training with AI
              </h1>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in" delay="delay-300">
              <p className="text-lg text-navy-100 mb-8 max-w-lg">
                Upload your score sheets, get AI-powered analysis, and receive personalized training recommendations to improve your performance.
              </p>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in" delay="delay-400">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/sign-in?signup=true">
                  <Button className="navy-button group flex items-center gap-2 text-base bg-navy-700 hover:bg-navy-800 text-white">
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="outline" className="outline-button text-base border-navy-200 bg-white/80 text-navy-800 hover:bg-navy-800/50 hover:text-navy-100">
                    How It Works
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in" delay="delay-500">
              <div className="mt-12 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-navy-800 overflow-hidden">
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
                  <p className="text-sm text-navy-200 font-medium">
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
                <div className="absolute -top-6 -right-6 -bottom-6 -left-6 rounded-xl bg-navy-300/10 -z-10 transform -rotate-2" />
                
                <div className="glass-card bg-navy-900/70 border border-navy-700/50 backdrop-blur-md overflow-hidden">
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
                      <h4 className="text-navy-100 font-medium">Recent Test: Level 2 - Test 3</h4>
                      <span className="text-sm text-navy-200">Score: 68.2%</span>
                    </div>
                    
                    {/* Dressage Test Sheet Preview */}
                    <div className="mb-6 bg-white p-3 rounded-lg shadow-sm">
                      <div className="border border-navy-200 rounded overflow-hidden">
                        <div className="bg-navy-50 border-b border-navy-200 px-3 py-2 flex justify-between items-center">
                          <span className="text-xs font-semibold text-navy-800">USDF Second Level - Test 3</span>
                          <span className="text-xs text-navy-600">Judge: A. Roberts</span>
                        </div>
                        <div className="py-2 px-3">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-navy-100">
                                <th className="py-1 w-8 text-navy-700">#</th>
                                <th className="py-1 text-navy-700">Movement</th>
                                <th className="py-1 w-10 text-navy-700">Mark</th>
                                <th className="py-1 text-navy-700">Remarks</th>
                              </tr>
                            </thead>
                            <tbody className="text-navy-800">
                              <tr className="border-b border-navy-100 bg-navy-50/50">
                                <td className="py-1">1</td>
                                <td className="py-1">Enter collected trot</td>
                                <td className="py-1 font-medium">7</td>
                                <td className="py-1 italic text-navy-600">Straight entry, good halt</td>
                              </tr>
                              <tr className="border-b border-navy-100">
                                <td className="py-1">2</td>
                                <td className="py-1">Shoulder-in right</td>
                                <td className="py-1 font-medium">6</td>
                                <td className="py-1 italic text-navy-600">Needs more bend</td>
                              </tr>
                              <tr className="border-b border-navy-100 bg-navy-50/50">
                                <td className="py-1">3</td>
                                <td className="py-1">Medium trot</td>
                                <td className="py-1 font-medium">8</td>
                                <td className="py-1 italic text-navy-600">Good extension</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-navy-300">Collection</span>
                          <span className="text-sm font-medium text-navy-200">72%</span>
                        </div>
                        <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                          <div className="h-full bg-navy-400 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-navy-300">Transitions</span>
                          <span className="text-sm font-medium text-navy-200">64%</span>
                        </div>
                        <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                          <div className="h-full bg-navy-400 rounded-full" style={{ width: '64%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-navy-300">Rhythm</span>
                          <span className="text-sm font-medium text-navy-200">83%</span>
                        </div>
                        <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                          <div className="h-full bg-navy-400 rounded-full" style={{ width: '83%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-navy-800/80 p-4 rounded-lg mb-6 border border-navy-700/50">
                      <h5 className="text-navy-100 font-medium mb-2">AI Recommendation</h5>
                      <p className="text-navy-300 text-sm">
                        Focus on smoother transitions between trot and canter. 
                        Try exercise #42 from our library to improve collection during transitions.
                      </p>
                    </div>
                    
                    <button className="w-full bg-navy-700 hover:bg-navy-600 text-white py-2 rounded-lg transition-colors">
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
