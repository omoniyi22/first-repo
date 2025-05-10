import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { SEO } from '@/lib/seo/SEO';
import { getPageMetadata } from '@/lib/seo/pageMetadata';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAlternateImage } from '@/hooks/use-alternate-image';
import Testimonials from '@/components/home/Testimonials';
import { BlogPost } from '@/data/blogPosts';
import { fetchBlogPosts } from '@/services/blogService';

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

  const isMobile = useIsMobile();
  const [jumpingImageLoaded, setJumpingImageLoaded] = useState(false);
  const [dressageImageLoaded, setDressageImageLoaded] = useState(false);
  
  // State for blog posts
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Alternate between jumping and dressage images on mobile
  const mobileImageSrc = useAlternateImage(
    "/lovable-uploads/dbb9802b-bed7-4888-96a3-73b68198710b.png", // Jumping image
    "/lovable-uploads/7c32e2d9-4fce-4ed5-abba-0fb12abe96eb.png"  // Dressage image
  );
  
  // Fetch blog posts from the database
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        setIsLoading(true);
        const posts = await fetchBlogPosts();
        setBlogPosts(posts);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBlogPosts();
  }, []);
  
  // Get featured blog posts - one from each discipline
  const featuredJumpingPost = blogPosts.find(post => post.discipline === 'Jumping');
  const featuredDressagePost = blogPosts.find(post => post.discipline === 'Dressage');

  // SEO metadata for homepage
  const seoMetadata = getPageMetadata('home');

  return (
    <div className="min-h-screen">
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="pt-0">
        {/* Hero Section */}
        <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-24 md:pt-32">
          <div className="absolute inset-0">
            {/* Split hero section with two images for desktop, alternating image for mobile */}
            {isMobile ? (
              <div className="h-full">
                {/* Single alternating image for mobile */}
                <div className="relative w-full h-full">
                  {!jumpingImageLoaded && !dressageImageLoaded && (
                    <div className="absolute inset-0 bg-purple-100/50">
                      <Skeleton className="w-full h-full" />
                    </div>
                  )}
                  <img 
                    src={mobileImageSrc} 
                    alt="Equestrian training with AI analysis"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                    onLoad={() => {
                      if (mobileImageSrc.includes("dbb9802b")) {
                        setJumpingImageLoaded(true);
                      } else {
                        setDressageImageLoaded(true);
                      }
                    }}
                    style={{ objectPosition: 'center center' }}
                  />
                  {/* Gradient overlay that works for both disciplines */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-blue-900/40"></div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 h-full">
                {/* First image - Jumping - For desktop only */}
                <div className="relative w-full h-full">
                  {!jumpingImageLoaded && (
                    <div className="absolute inset-0 bg-blue-100/50">
                      <Skeleton className="w-full h-full" />
                    </div>
                  )}
                  <img 
                    src="/lovable-uploads/dbb9802b-bed7-4888-96a3-73b68198710b.png" 
                    alt="Show jumping with AI analysis"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${jumpingImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setJumpingImageLoaded(true)}
                    style={{ objectPosition: 'center center' }}
                  />
                  {/* Overlay gradient for jumping */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-900/40"></div>
                </div>
                
                {/* Second image - Dressage - For desktop only */}
                <div className="relative w-full h-full hidden md:block">
                  {!dressageImageLoaded && (
                    <div className="absolute inset-0 bg-purple-100/50">
                      <Skeleton className="w-full h-full" />
                    </div>
                  )}
                  <img 
                    src="/lovable-uploads/7c32e2d9-4fce-4ed5-abba-0fb12abe96eb.png" 
                    alt="Dressage rider performing"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${dressageImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setDressageImageLoaded(true)}
                    style={{ objectPosition: 'center 30%' }}
                  />
                  {/* Overlay gradient for dressage */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-purple-900/40"></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="container relative z-10 mx-auto px-4 sm:px-6 text-center mt-10 md:mt-0">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-semibold leading-tight text-white mb-4 text-shadow">
                AI Equestrian
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 mb-4 max-w-2xl mx-auto text-shadow-sm">
                Advanced AI solutions for equestrian training, analysis, and performance improvement
              </p>
              
              <p className="text-lg font-medium text-purple-200 mb-8">
                Riding Intelligence, Redefined
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 sm:p-8 border border-white/20 hover:bg-white/20 transition-all transform hover:-translate-y-1 group">
                  <h2 className="text-xl sm:text-2xl font-serif font-medium text-white mb-3 sm:mb-4">AI Dressage Trainer</h2>
                  <p className="text-white/80 mb-4 sm:mb-6 text-sm sm:text-base">
                    Upload your dressage score sheets, get AI-powered analysis, and receive personalized training recommendations.
                  </p>
                  <Link to="/dressage" className="block">
                    <Button className="navy-button w-full group flex items-center justify-center gap-2 text-base">
                      Explore Dressage
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 sm:p-8 border border-white/20 hover:bg-white/20 transition-all transform hover:-translate-y-1 group">
                  <h2 className="text-xl sm:text-2xl font-serif font-medium text-white mb-3 sm:mb-4">AI Jumping Trainer</h2>
                  <p className="text-white/80 mb-4 sm:mb-6 text-sm sm:text-base">
                    Analyze your jumping performance, get insights on technique, and improve your show jumping results.
                  </p>
                  <Link to="/jumping" className="block">
                    <Button className="navy-button w-full group flex items-center justify-center gap-2 text-base">
                      Explore Jumping
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/sign-in?signup=true" className="w-full sm:w-auto">
                  <Button className="navy-button w-full sm:w-auto group flex items-center justify-center gap-2 text-base">
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/how-it-works" className="w-full sm:w-auto">
                  <Button variant="outline" className="outline-button w-full sm:w-auto text-base">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <Testimonials />
        
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
              {isLoading ? (
                // Loading skeletons
                <>
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6">
                      <Skeleton className="h-6 w-2/3 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6">
                      <Skeleton className="h-6 w-2/3 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                </>
              ) : (
                // Display one featured post from each discipline
                <>
                  {featuredJumpingPost && (
                    <div className="opacity-1 translate-y-8 transition-all duration-700 ease-out">
                      <BlogPostCard post={featuredJumpingPost} hideAuthor={true} />
                    </div>
                  )}
                  
                  {featuredDressagePost && (
                    <div className="opacity-1 translate-y-8 transition-all duration-700 ease-out" style={{ transitionDelay: '100ms' }}>
                      <BlogPostCard post={featuredDressagePost} hideAuthor={true} />
                    </div>
                  )}
                  
                  {/* Fallback if no posts are found */}
                  {!featuredJumpingPost && !featuredDressagePost && (
                    <div className="col-span-2 text-center py-10">
                      <p className="text-gray-500">No blog posts found. Check back soon for updates!</p>
                    </div>
                  )}
                </>
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
