
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
import Hero from '@/components/home/Hero';

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
        <Hero />
        
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
                  <BlogPostCard post={featuredJumpingPost} hideAuthor={true} />
                </div>
              )}
              
              {featuredDressagePost && (
                <div className="reveal-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out" style={{ transitionDelay: '100ms' }}>
                  <BlogPostCard post={featuredDressagePost} hideAuthor={true} />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <Link to="/blog">
                <Button variant="outlinePurple" animation="bounce" className="group">
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
