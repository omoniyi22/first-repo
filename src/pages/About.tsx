
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO, getPageMetadata } from '@/lib/seo';
import AnimatedSection from '@/components/ui/AnimatedSection';

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
            <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl md:text-5xl font-serif font-semibold text-gray-900 mb-6">
                About AI Equestrian
              </h1>
              <p className="text-lg text-gray-700">
                We're on a mission to transform equestrian training through the power of artificial intelligence.
              </p>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
              <AnimatedSection animation="fade-in-right">
                <div className="aspect-square bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <span className="font-serif text-3xl bg-gradient-to-r from-purple-800 to-blue-800 bg-clip-text text-transparent">Our Vision</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="fade-in">
                <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-6">
                  Our Mission & Vision
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <p>
                    At AI Equestrian, we believe that technology can enhance the time-honored tradition of equestrian sports. Our mission is to democratize access to elite-level training by leveraging artificial intelligence to provide personalized, data-driven insights to riders of all levels across disciplines.
                  </p>
                  
                  <p>
                    We envision a world where every equestrian, regardless of location or resources, can receive tailored guidance to improve their performance and strengthen the partnership with their horse.
                  </p>
                  
                  <p>
                    Our platform offers specialized tools for both dressage and jumping riders through our AI Dressage and AI Jump applications, bringing innovative technology to these distinct but complementary disciplines.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
        
        {/* Discipline-Specific Challenges Section */}
        <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="container mx-auto px-6">
            <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-4">
                The Problems We're Solving
              </h2>
              <p className="text-lg text-gray-700">
                Each equestrian discipline presents unique challenges that our specialized AI systems are designed to address.
              </p>
            </AnimatedSection>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Dressage Challenges */}
              <AnimatedSection animation="fade-in-left" className="bg-white rounded-xl p-8 shadow-sm border border-purple-100">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-purple-800 font-serif text-2xl">D</span>
                  </div>
                  <h3 className="text-2xl font-serif font-semibold text-purple-900">Dressage Challenges</h3>
                </div>
                
                <div className="mb-6">
                  <img 
                    src="/lovable-uploads/6782ac64-8d3f-4d9e-902e-7cdb1240c449.png"
                    alt="Dressage training with AI analysis"
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                </div>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    Dressage riders face unique challenges in their training journey:
                  </p>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full text-purple-700 font-medium mr-3 mt-0.5">1</span>
                      <span>Competition feedback is valuable but often inconsistent across judges</span>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full text-purple-700 font-medium mr-3 mt-0.5">2</span>
                      <span>Limited access to high-quality coaching and structured training programs</span>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full text-purple-700 font-medium mr-3 mt-0.5">3</span>
                      <span>Difficulty tracking progress and identifying patterns across performances</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-6">
                  <Link to="/dressage/how-it-works">
                    <Button variant="outline" className="border-purple-400 text-purple-800 hover:bg-purple-50">
                      How AI Dressage Works
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
              
              {/* Jumping Challenges */}
              <AnimatedSection animation="fade-in-right" className="bg-white rounded-xl p-8 shadow-sm border border-blue-100">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-blue-800 font-serif text-2xl">J</span>
                  </div>
                  <h3 className="text-2xl font-serif font-semibold text-blue-900">Jumping Challenges</h3>
                </div>
                
                <div className="mb-6">
                  <img 
                    src="/lovable-uploads/dbb9802b-bed7-4888-96a3-73b68198710b.png"
                    alt="Show jumping with AI analysis"
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                </div>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    Jumping riders face unique challenges in their training journey:
                  </p>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full text-blue-700 font-medium mr-3 mt-0.5">1</span>
                      <span>Limited competition feedback that rarely identifies specific areas for improvement</span>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full text-blue-700 font-medium mr-3 mt-0.5">2</span>
                      <span>Lack of access to structured course analysis and technique evaluation</span>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full text-blue-700 font-medium mr-3 mt-0.5">3</span>
                      <span>Difficulty translating round results into effective training exercises</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-6">
                  <Link to="/jumping/how-it-works">
                    <Button variant="outline" className="border-blue-400 text-blue-800 hover:bg-blue-50">
                      How AI Jump Works
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-4">
                Meet Our Team
              </h2>
              <p className="text-lg text-gray-700">
                We're a dedicated team of equestrian experts and AI specialists passionate about transforming training across disciplines.
              </p>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Team Member 1 */}
              <AnimatedSection animation="fade-in" delay="delay-100">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="aspect-square overflow-hidden bg-gray-100">
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
                          aria-label="Jenny Stanley's LinkedIn profile"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin mr-1"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                          <span className="text-sm">View LinkedIn Profile</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
              
              {/* Team Member 2 */}
              <AnimatedSection animation="fade-in" delay="delay-200">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="aspect-square overflow-hidden bg-gray-100">
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
              </AnimatedSection>
            </div>
          </div>
        </section>
        
        {/* Our Approach Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <AnimatedSection animation="fade-in" className="mb-12">
              <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h4 className="text-xl font-serif font-medium text-blue-900 mb-3">AI Jump Methodology</h4>
                    <p className="text-blue-700 mb-4">
                      Our AI Jump system evaluates approach angles, timing, takeoff distances, and landing techniques to help riders optimize their jumping performance and reduce faults.
                    </p>
                    <Link to="/jumping">
                      <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
                        Learn More About AI Jump
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                    <h4 className="text-xl font-serif font-medium text-purple-900 mb-3">AI Dressage Methodology</h4>
                    <p className="text-purple-700 mb-4">
                      Our AI Dressage system analyzes rider position, horse gait, and movement harmony to provide real-time feedback for perfecting your dressage techniques and improving scores.
                    </p>
                    <Link to="/dressage">
                      <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-100">
                        Learn More About AI Dressage
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
        
        {/* Experience AI Equestrian Section */}
        <AnimatedSection animation="fade-in">
          <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="container mx-auto px-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-serif font-semibold text-white mb-4">
                  Experience AI Equestrian Training
                </h2>
                <p className="text-blue-100 max-w-3xl mx-auto">
                  Transform your equestrian training with cutting-edge AI technology designed for both dressage and jumping disciplines.
                </p>
              </div>
              
              <div className="md:flex justify-center items-center space-y-6 md:space-y-0 md:space-x-8">
                <div className="md:w-1/2 flex-shrink-0">
                  <img 
                    src="/lovable-uploads/3b7c24a2-ef67-42cc-9b46-875418451128.png"
                    alt="Equestrian demonstration"
                    className="rounded-lg w-full max-h-80 object-cover shadow-lg"
                  />
                </div>
                
                <div className="md:w-1/2 text-left">
                  <p className="text-gray-100 mb-6">
                    Have questions about our platform or want to learn more about how AI Equestrian can help you achieve your riding goals? Get in touch with our team.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/sign-in?signup=true">
                      <Button className="bg-white text-purple-700 hover:bg-gray-100">
                        Start Free Trial
                      </Button>
                    </Link>
                    
                    <Link to="/pricing">
                      <Button variant="outline" className="border-white text-white hover:bg-purple-700/30">
                        View Pricing Plans
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>
        
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
      </main>
      <Footer />
    </div>
  );
};

export default About;
