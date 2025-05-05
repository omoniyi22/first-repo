
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { blogPosts } from '@/data/blogPosts';
import { SEO } from '@/lib/seo/SEO';
import { getPageMetadata } from '@/lib/seo/pageMetadata';

const Index = () => {
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
  
  // Get featured blog posts - one from each discipline
  const featuredJumpingPost = blogPosts.find(post => post.discipline === 'Jumping' && post.id === 1);
  const featuredDressagePost = blogPosts.find(post => post.discipline === 'Dressage' && post.id === 7);

  // SEO metadata for homepage
  const seoMetadata = getPageMetadata('home');

  return (
    <div className="min-h-screen">
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="pt-0">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100/50">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          
          <img 
            src="/lovable-uploads/7c32e2d9-4fce-4ed5-abba-0fb12abe96eb.png" 
            alt="Professional equestrian using AI analytics to improve dressage performance"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            style={{ objectPosition: 'center 30%' }}
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-purple-900/40"></div>
          
          <div className="container relative z-10 mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/30">
                AI-Powered Equestrian Training
              </span>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold leading-tight text-white mb-8 text-shadow">
                AI Equestrian
              </h1>
              
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto text-shadow-sm">
                Advanced AI solutions for equestrian training, analysis, and performance improvement
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all transform hover:-translate-y-1 group">
                  <h2 className="text-2xl font-serif font-medium text-white mb-4">AI Dressage Trainer</h2>
                  <p className="text-white/80 mb-6">
                    Upload your dressage score sheets, get AI-powered analysis, and receive personalized training recommendations.
                  </p>
                  <Link to="/dressage">
                    <Button className="navy-button w-full group flex items-center justify-center gap-2 text-base">
                      Explore Dressage
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all transform hover:-translate-y-1 group">
                  <h2 className="text-2xl font-serif font-medium text-white mb-4">AI Jumping Trainer</h2>
                  <p className="text-white/80 mb-6">
                    Analyze your jumping performance, get insights on technique, and improve your show jumping results.
                  </p>
                  <Link to="/jumping">
                    <Button className="navy-button w-full group flex items-center justify-center gap-2 text-base">
                      Explore Jumping
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
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
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6 text-gray-900">
                Why Choose AI Equestrian?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our AI-powered platform offers unique solutions for both dressage and jumping disciplines
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Personalized Training",
                  description: "Get customized training recommendations based on your performance data and goals."
                },
                {
                  title: "Objective Analysis",
                  description: "AI-powered insights that identify patterns and improvement opportunities in your riding."
                },
                {
                  title: "Progress Tracking",
                  description: "Monitor your advancement over time with detailed metrics and visual progress reports."
                }
              ].map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-purple-50 p-8 rounded-xl border border-purple-100 reveal-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <h3 className="text-xl font-serif font-medium mb-4 text-purple-900">{benefit.title}</h3>
                  <p className="text-gray-700">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Latest Blog Posts Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6 text-gray-900">
                Latest from Our Blog
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Stay updated with the latest insights, tips, and news from the equestrian world
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {/* Display one featured post from each discipline */}
              {featuredJumpingPost && (
                <div className="reveal-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out">
                  <BlogPostCard post={featuredJumpingPost} />
                </div>
              )}
              
              {featuredDressagePost && (
                <div className="reveal-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out" style={{ transitionDelay: '100ms' }}>
                  <BlogPostCard post={featuredDressagePost} />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <Link to="/blog">
                <Button variant="outline" className="outline-button group">
                  View All Articles
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
