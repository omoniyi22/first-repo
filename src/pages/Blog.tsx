
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { BookOpen } from 'lucide-react';

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: "5 Essential Dressage Training Tips for Beginners",
    excerpt: "Master the basics of dressage with these expert tips that will help you establish a solid foundation.",
    date: "April 22, 2025",
    author: "Emma Richardson",
    category: "Training",
    imageUrl: "/lovable-uploads/79f64a37-cb8e-4627-b743-c5330837a1b0.png",
    slug: "essential-dressage-tips"
  },
  {
    id: 2,
    title: "Understanding Dressage Test Scoring: What Judges Are Looking For",
    excerpt: "Learn how dressage tests are scored and what specific elements judges evaluate during your performance.",
    date: "April 18, 2025",
    author: "Michael Peterson",
    category: "Competition",
    imageUrl: "/lovable-uploads/987a3f3b-1917-439f-a3a9-8fabc609cffa.png",
    slug: "dressage-test-scoring"
  },
  {
    id: 3,
    title: "How AI Technology is Transforming Modern Dressage Training",
    excerpt: "Discover how artificial intelligence is revolutionizing dressage training methods and improving rider performance.",
    date: "April 15, 2025",
    author: "Sarah Johnson",
    category: "Technology",
    imageUrl: "/lovable-uploads/15df63d0-27e1-486c-98ee-bcf44eb600f4.png",
    slug: "ai-dressage-technology"
  }
];

const Blog = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-16">
        {/* SEO-optimized heading structure */}
        <div className="mb-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Blog</BreadcrumbPage>
            </BreadcrumbItem>
          </Breadcrumb>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-purple-900 mb-4">Dressage Training Blog</h1>
          <p className="text-xl text-purple-700 max-w-3xl">
            Expert insights, training tips, and the latest innovations in dressage training and AI-assisted equestrian development.
          </p>
        </div>
        
        {/* Featured post */}
        <div className="reveal-scroll mb-12 opacity-0 translate-y-8 transition-all duration-700 ease-out">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img 
                  src={blogPosts[0].imageUrl} 
                  alt={blogPosts[0].title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8 md:w-1/2 flex flex-col justify-center">
                <div className="flex items-center mb-4">
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">{blogPosts[0].category}</span>
                  <span className="ml-3 text-sm text-gray-500">{blogPosts[0].date}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-purple-900 mb-4">
                  <Link to={`/blog/${blogPosts[0].slug}`} className="hover:text-purple-700 transition-colors">
                    {blogPosts[0].title}
                  </Link>
                </h2>
                <p className="text-gray-700 mb-6">{blogPosts[0].excerpt}</p>
                <div className="mt-auto">
                  <div className="flex items-center mb-4">
                    <div className="mr-3 bg-purple-200 text-purple-800 rounded-full h-10 w-10 flex items-center justify-center">
                      {blogPosts[0].author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-medium">{blogPosts[0].author}</span>
                  </div>
                  <Link to={`/blog/${blogPosts[0].slug}`}>
                    <Button className="bg-purple-700 hover:bg-purple-800">
                      Read Article
                      <BookOpen className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Blog post grid */}
        <h2 className="text-2xl font-serif font-bold text-purple-900 mb-6">Latest Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <article key={post.id} className="reveal-scroll bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow opacity-0 translate-y-8 transition-all duration-700 ease-out">
              <Link to={`/blog/${post.slug}`}>
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">{post.category}</span>
                  <span className="ml-3 text-xs text-gray-500">{post.date}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-purple-900 mb-3">
                  <Link to={`/blog/${post.slug}`} className="hover:text-purple-700 transition-colors">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-700 text-sm mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <div className="mr-2 bg-purple-200 text-purple-800 rounded-full h-8 w-8 flex items-center justify-center text-sm">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs font-medium">{post.author}</span>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="text-purple-700 hover:text-purple-900 text-sm font-medium flex items-center">
                    Read more
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        {/* Newsletter sign-up - good for SEO and lead generation */}
        <div className="reveal-scroll mt-16 bg-purple-100 rounded-xl p-8 md:p-12 opacity-0 translate-y-8 transition-all duration-700 ease-out">
          <div className="md:flex items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-purple-900 mb-4">Subscribe to Our Newsletter</h2>
              <p className="text-purple-700">Get the latest dressage training tips, insights, and updates delivered straight to your inbox.</p>
            </div>
            <div className="md:w-1/3">
              <form className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-grow px-4 py-3 rounded-md border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <Button className="bg-purple-700 hover:bg-purple-800 whitespace-nowrap">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
