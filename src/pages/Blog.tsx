import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import BlogFilter from '@/components/blog/BlogFilter';
import FeaturedPost from '@/components/blog/FeaturedPost';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { blogPosts, BlogPost } from '@/data/blogPosts';
import { BookOpen, Search } from 'lucide-react';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const disciplineParam = searchParams.get('discipline') || 'all';
  const categoryParam = searchParams.get('category') || 'all';
  
  const [disciplineFilter, setDisciplineFilter] = useState(disciplineParam);
  const [categoryFilter, setCategoryFilter] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(blogPosts);
  
  // Update state when URL params change
  useEffect(() => {
    setDisciplineFilter(disciplineParam);
    setCategoryFilter(categoryParam);
  }, [disciplineParam, categoryParam]);
  
  // Filter posts based on discipline, category, and search query
  useEffect(() => {
    let result = [...blogPosts];
    
    // Filter by discipline
    if (disciplineFilter !== 'all') {
      result = result.filter(post => 
        post.discipline.toLowerCase() === disciplineFilter.toLowerCase()
      );
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter(post => 
        post.category.toLowerCase() === categoryFilter.toLowerCase()
          .replace(/(^|\s)\S/g, function(t) { return t.toUpperCase(); })
      );
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
  }, [disciplineFilter, categoryFilter, searchQuery]);
  
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

  const featuredPost = blogPosts.find(post => post.id === 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-16">
        {/* SEO-optimized heading structure */}
        <div className="mb-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Blog</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Equestrian Excellence Blog</h1>
          <p className="text-xl text-gray-700 max-w-3xl">
            Expert insights, training tips, and the latest innovations in equestrian sports.
          </p>
        </div>
        
        {/* Search and filters */}
        <div className="my-8 flex flex-col gap-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search articles..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Discipline filter */}
          <BlogFilter 
            disciplineFilter={disciplineFilter}
            categoryFilter={categoryFilter}
            updateFilters={updateFilters}
          />
        </div>
        
        {/* Featured post */}
        {featuredPost && disciplineFilter === 'all' && categoryFilter === 'all' && !searchQuery && (
          <div className="reveal-scroll mb-12 opacity-0 translate-y-8 transition-all duration-700 ease-out">
            <FeaturedPost post={featuredPost} />
          </div>
        )}
        
        {/* Blog posts grid */}
        <div className="mb-10">
          {filteredPosts.length > 0 ? (
            <>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                {disciplineFilter !== 'all' || categoryFilter !== 'all' || searchQuery
                  ? `${filteredPosts.length} ${filteredPosts.length === 1 ? 'Result' : 'Results'}`
                  : 'Latest Articles'
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
              <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search term</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                  setDisciplineFilter('all');
                  setCategoryFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
        
        {/* Newsletter sign-up */}
        <div className="reveal-scroll mt-16 bg-gray-100 rounded-xl p-8 md:p-12 opacity-0 translate-y-8 transition-all duration-700 ease-out">
          <div className="md:flex items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">Subscribe to Our Newsletter</h2>
              <p className="text-gray-700">Get the latest equestrian insights and updates delivered straight to your inbox.</p>
            </div>
            <div className="md:w-1/3">
              <form className="flex flex-col sm:flex-row gap-3">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  required
                />
                <Button>
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
