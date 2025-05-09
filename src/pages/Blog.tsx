import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BlogFilter from '@/components/blog/BlogFilter';
import FeaturedPost from '@/components/blog/FeaturedPost';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { BlogPost } from '@/data/blogPosts';
import { BookOpen, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO, getPageMetadata } from '@/lib/seo';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchBlogPosts } from '@/services/blogService';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const disciplineParam = searchParams.get('discipline') || 'all';
  const categoryParam = searchParams.get('category') || 'all';
  
  const [disciplineFilter, setDisciplineFilter] = useState(disciplineParam);
  const [categoryFilter, setCategoryFilter] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language, translations } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  
  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get SEO metadata for blog page
  const seoMetadata = getPageMetadata('blog', {
    title: disciplineFilter !== 'all' 
      ? `${disciplineFilter} Articles | AI Equestrian Blog` 
      : undefined,
    description: disciplineFilter !== 'all'
      ? `Explore our collection of articles about ${disciplineFilter.toLowerCase()} training, technique, and analysis using AI technology.`
      : undefined
  });
  
  // Load blog posts from Supabase
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        setIsLoading(true);
        const posts = await fetchBlogPosts();
        console.log('Blog posts loaded:', posts);
        
        // Check if the posts have content
        if (posts.length > 0) {
          const nullContentPosts = posts.filter(post => post.content === undefined || post.content === null);
          if (nullContentPosts.length > 0) {
            console.warn(`${nullContentPosts.length} posts have null/undefined content:`, nullContentPosts);
          }
        }
        
        setBlogPosts(posts);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
        toast({
          title: t["error-occurred"],
          description: t["failed-load-posts"],
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBlogPosts();
  }, [toast, t]);
  
  // Update state when URL params change
  useEffect(() => {
    setDisciplineFilter(disciplineParam);
    setCategoryFilter(categoryParam);
  }, [disciplineParam, categoryParam]);
  
  // Filter posts based on discipline, category, and search query
  useEffect(() => {
    if (blogPosts.length === 0) return;
    
    let result = [...blogPosts];
    
    // Filter by discipline
    if (disciplineFilter !== 'all') {
      result = result.filter(post => 
        post.discipline.toLowerCase() === disciplineFilter.toLowerCase()
      );
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      const formattedCategory = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1).toLowerCase();
      result = result.filter(post => post.category === formattedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.excerpt.toLowerCase().includes(query) || 
        post.author.toLowerCase().includes(query)
      );
    }
    
    setFilteredPosts(result);
  }, [disciplineFilter, categoryFilter, searchQuery, blogPosts]);
  
  // Update URL parameters when filters change
  const updateFilters = (type: 'discipline' | 'category', value: string) => {
    if (type === 'discipline') {
      setDisciplineFilter(value);
    } else {
      setCategoryFilter(value);
    }
    
    const newSearchParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newSearchParams.delete(type);
    } else {
      newSearchParams.set(type, value);
    }
    setSearchParams(newSearchParams);
  };
  
  // Handle newsletter subscription
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Blog newsletter subscription attempt for:', newsletterEmail);
      
      const { data, error } = await supabase.functions.invoke('send-newsletter-confirmation', {
        body: { 
          email: newsletterEmail,
          source: 'blog_page' 
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log('Blog newsletter subscription successful:', data);
      
      toast({
        title: t["subscription-successful"],
        description: t["thank-you-subscribing"],
      });
      
      setNewsletterEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: t["subscription-failed"],
        description: t["problem-subscribing"],
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
  }, [filteredPosts]);

  const featuredPost = blogPosts.find(post => post.slug === 'how-ai-analysis-is-transforming-show-jumping-training');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-16">
        {/* SEO-optimized heading structure - Removed breadcrumb */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">{t["blog-title"]}</h1>
          <p className="text-xl text-gray-700 max-w-3xl">
            {t["blog-description"]}
          </p>
        </div>
        
        {/* Search and filters */}
        <div className="my-8 flex flex-col gap-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder={t["search-placeholder"]}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search blog posts"
            />
          </div>
          
          {/* Discipline filter */}
          <BlogFilter 
            disciplineFilter={disciplineFilter}
            categoryFilter={categoryFilter}
            updateFilters={updateFilters}
          />
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">{t["loading-posts"]}</p>
          </div>
        )}
        
        {/* Featured post */}
        {!isLoading && featuredPost && disciplineFilter === 'all' && categoryFilter === 'all' && !searchQuery && (
          <div className="reveal-scroll mb-12 opacity-0 translate-y-8 transition-all duration-700 ease-out">
            <FeaturedPost post={featuredPost} />
          </div>
        )}
        
        {/* Blog posts grid */}
        {!isLoading && (
          <div className="mb-10">
            {filteredPosts.length > 0 ? (
              <>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                  {disciplineFilter !== 'all' || categoryFilter !== 'all' || searchQuery
                    ? `${filteredPosts.length} ${filteredPosts.length === 1 ? t["result"] : t["results"]}`
                    : t["latest-articles"]
                  }
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post, index) => (
                    <div 
                      key={post.id} 
                      className="reveal-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out"
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <BlogPostCard post={post} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">{t["no-articles"]}</h3>
                <p className="text-gray-600 mb-6">{t["adjust-filters"]}</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchParams(new URLSearchParams());
                    setDisciplineFilter('all');
                    setCategoryFilter('all');
                    setSearchQuery('');
                  }}
                >
                  {t["clear-filters"]}
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Newsletter sign-up */}
        <div className="reveal-scroll mt-16 bg-gray-100 rounded-xl p-8 md:p-12 opacity-0 translate-y-8 transition-all duration-700 ease-out">
          <div className="md:flex items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">{t["newsletter-title"]}</h2>
              <p className="text-gray-700">{t["newsletter-description"]}</p>
            </div>
            <div className="md:w-1/3">
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                <Input 
                  type="email" 
                  placeholder={t["email-placeholder"]}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  aria-label="Email for newsletter subscription"
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t["sending"] : t["subscribe"]}
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
