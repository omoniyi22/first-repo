
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MissionSection from '@/components/about/MissionSection';
import { useEffect } from 'react';
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
    title: 'About AI Equestrian | Our Mission & Team',
    description: 'Learn about AI Equestrian\'s mission to transform training through artificial intelligence and data-driven performance analysis across all equestrian disciplines.',
    canonicalUrl: '/about'
  });

  return (
    <div className="min-h-screen">
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="pt-20">
        <MissionSection />
        
        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12 reveal-scroll">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Meet Our Team</h2>
              <p className="text-lg text-gray-700">
                We're a dedicated team of equestrian experts and AI specialists passionate about transforming training across all disciplines.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16 reveal-scroll">
              {/* Team Member 1 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  <div className="h-full overflow-hidden bg-gray-100">
                    <img 
                      src="/lovable-uploads/592077d0-4e0a-4e4a-be25-565368837404.png" 
                      alt="Jenny Stanley"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-medium text-gray-900 mb-1">
                      Jenny Stanley
                    </h3>
                    <p className="text-gray-600 font-medium text-sm mb-4">
                      Founder & CEO
                    </p>
                    <p className="text-gray-700 text-sm">
                      With over 20 years experience in international sales management across the media, advertising and creative technology industries, Jenny combines her passion for dressage with her expertise in technology to revolutionize equestrian training through AI.
                    </p>
                    <div className="mt-4">
                      <a 
                        href="https://www.linkedin.com/in/jenny-stanley/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        <span className="text-sm">View LinkedIn Profile</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Team Member 2 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  <div className="h-full overflow-hidden bg-gray-100">
                    <img 
                      src="https://randomuser.me/api/portraits/men/42.jpg" 
                      alt="Marcus Chen"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-medium text-gray-900 mb-1">
                      Marcus Chen
                    </h3>
                    <p className="text-gray-600 font-medium text-sm mb-4">
                      Chief Technology Officer
                    </p>
                    <p className="text-gray-700 text-sm">
                      With 15+ years of experience in AI and machine learning, Marcus leads our technology team in developing and refining our analysis algorithms and recommendation systems.
                    </p>
                  </div>
                </div>
              </div>
            </div>
        
            {/* Our Approach */}
            <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm reveal-scroll">
              <h3 className="text-2xl md:text-3xl font-serif font-semibold text-gray-900 mb-6 text-center">
                Our Approach
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-br from-gray-50 to-purple-100 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium mb-2 text-center text-gray-900">Data-Driven</h4>
                  <p className="text-gray-700 text-sm text-center">
                    We utilize advanced data analytics to provide riders with actionable insights for improvement.
                  </p>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-gray-50 to-purple-100 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium mb-2 text-center text-gray-900">Personalized</h4>
                  <p className="text-gray-700 text-sm text-center">
                    Every rider receives custom training plans tailored to their specific goals and challenges.
                  </p>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-gray-50 to-purple-100 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium mb-2 text-center text-gray-900">Accessible</h4>
                  <p className="text-gray-700 text-sm text-center">
                    We make elite-level equestrian training accessible to riders worldwide, regardless of location.
                  </p>
                </div>
              </div>
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
        
        {/* Experience AI Equestrian Section - Fixed layout */}
        <section className="py-16 bg-gradient-to-r from-purple-100 to-blue-100">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto reveal-scroll">
              <div className="md:w-1/2">
                <img 
                  src="/lovable-uploads/6782ac64-8d3f-4d9e-902e-7cdb1240c449.png"
                  alt="Equestrian training demonstration"
                  className="rounded-lg w-full h-auto object-cover shadow-md"
                />
              </div>
              <div className="md:w-1/2 flex flex-col">
                <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Experience AI Equestrian Training</h2>
                <p className="text-lg text-gray-700 mb-8">
                  Have questions about our platform or want to learn more about how AI Equestrian can help you achieve your riding goals? Get in touch with our team.
                </p>
                <Link to="/sign-in?signup=true" className="self-start">
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-none hover:text-white">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Discipline Links */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12 reveal-scroll">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Our Specialized Disciplines</h2>
              <p className="text-lg text-gray-700">
                Learn more about our discipline-specific AI training approaches for dressage and jumping.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto reveal-scroll">
              <Link to="/dressage" className="block">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-8 hover:shadow-md transition-shadow h-full">
                  <h3 className="text-2xl font-serif font-semibold text-purple-900 mb-4">AI Dressage</h3>
                  <p className="text-gray-700 mb-4">
                    Our specialized dressage team combines classical training principles with cutting-edge technology to create a truly innovative dressage analysis platform.
                  </p>
                  <Button variant="outline" className="border-purple-500 text-purple-700 hover:bg-purple-50">
                    Explore AI Dressage
                  </Button>
                </div>
              </Link>
              
              <Link to="/jumping" className="block">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8 hover:shadow-md transition-shadow h-full">
                  <h3 className="text-2xl font-serif font-semibold text-blue-900 mb-4">AI Jump</h3>
                  <p className="text-gray-700 mb-4">
                    Our dedicated jump team combines extensive course design experience with performance analytics to deliver actionable insights for jumping riders of all levels.
                  </p>
                  <Button variant="outline" className="border-blue-500 text-blue-700 hover:bg-blue-50">
                    Explore AI Jump
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Call to Action Button - Centralized */}
        <div className="container mx-auto px-6 py-12 flex justify-center">
          <Link to="/sign-in?signup=true">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-none hover:text-white">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
