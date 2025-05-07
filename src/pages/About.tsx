import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MissionSection from '@/components/about/MissionSection';
import TeamSection from '@/components/about/TeamSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO, getPageMetadata } from '@/lib/seo';

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
        {/* Core Mission Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 reveal-scroll">
              <h1 className="text-4xl md:text-5xl font-serif font-semibold text-gray-900 mb-6">
                About AI Equestrian
              </h1>
              <p className="text-lg text-gray-700">
                We're on a mission to transform equestrian training through the power of artificial intelligence.
              </p>
            </div>
            
            
          </div>
        </section>
        
        {/* Team Section - Modified for full-height images */}
        <TeamSection />
        
        {/* Specialized Disciplines Section */}
        <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12 reveal-scroll">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Our Specialized Disciplines</h2>
              <p className="text-lg text-gray-700">
                We've developed specialized AI training systems for the main equestrian disciplines, each tailored to the unique requirements and techniques of that style.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Dressage Card */}
              <Card className="border border-gray-200 bg-white hover:shadow-lg transition-shadow reveal-scroll">
                <CardHeader className="bg-purple-50 border-b border-gray-200">
                  <CardTitle className="text-2xl text-center font-serif text-purple-900">AI Dressage</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <img 
                      src="/lovable-uploads/42930ec1-2f55-429f-aaa5-4aac1791a729.png" 
                      alt="AI Dressage Training" 
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                  <p className="text-gray-700 mb-5">
                    Our AI Dressage system analyzes rider position, horse gait, and movement harmony to provide real-time feedback for perfecting your dressage techniques and improving scores.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Link to="/dressage/about">
                      <Button variant="outline" className="border-purple-400 text-purple-800 hover:bg-purple-50">
                        About AI Dressage
                      </Button>
                    </Link>
                    <Link to="/dressage/how-it-works">
                      <Button variant="outline" className="border-purple-400 text-purple-800 hover:bg-purple-50">
                        How It Works
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              {/* Jumping Card */}
              <Card className="border border-gray-200 bg-white hover:shadow-lg transition-shadow reveal-scroll">
                <CardHeader className="bg-blue-50 border-b border-gray-200">
                  <CardTitle className="text-2xl text-center font-serif text-blue-900">AI Jump</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <img 
                      src="/lovable-uploads/09bde514-1caf-42e9-9093-d5bd869dda06.png" 
                      alt="AI Jump Training" 
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                  <p className="text-gray-700 mb-5">
                    Our AI Jump system evaluates approach angles, timing, takeoff distances, and landing techniques to help riders optimize their jumping performance and reduce faults.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Link to="/jumping/about">
                      <Button variant="outline" className="border-blue-400 text-blue-800 hover:bg-blue-50">
                        About AI Jump
                      </Button>
                    </Link>
                    <Link to="/jumping/how-it-works">
                      <Button variant="outline" className="border-blue-400 text-blue-800 hover:bg-blue-50">
                        How It Works
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Partnerships and Sponsorships Section */}
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
        
        {/* Experience AI Equestrian Section - UPDATED with image on the left */}
        <section className="py-16 bg-gradient-to-r from-purple-100 to-blue-100">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center md:space-x-12 max-w-6xl mx-auto">
              {/* Left side - Image (moved to left) */}
              <div className="md:w-1/2 mb-8 md:mb-0 reveal-scroll order-2 md:order-1">
                <img 
                  src="/lovable-uploads/3b7c24a2-ef67-42cc-9b46-875418451128.png" 
                  alt="AI Equestrian Experience" 
                  className="rounded-xl shadow-lg w-full h-64 md:h-80 object-cover"
                />
              </div>
              
              {/* Right side - Text content */}
              <div className="md:w-1/2 reveal-scroll order-1 md:order-2">
                <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Experience AI Equestrian Training</h2>
                <p className="text-lg text-gray-700 mb-8">
                  Have questions about our platform or want to learn more about how AI Equestrian can help you achieve your riding goals? Get in touch with our team.
                </p>
                <div className="flex justify-start">
                  <Link to="/sign-in?signup=true">
                    <Button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-none hover:text-white">
                      Start Free Trial
                    </Button>
                  </Link>
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

export default About;
