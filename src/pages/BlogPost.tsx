
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { blogPosts } from '@/data/blogPosts';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { SEO } from '@/lib/seo';

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);
  
  const [relatedPosts, setRelatedPosts] = useState([]);
  
  // Set up SEO metadata for the blog post
  const postSeoProps = post ? {
    title: `${post.title} | AI Equestrian Blog`,
    description: post.excerpt.substring(0, 155) + '...',
    canonicalUrl: `/blog/${post.slug}`,
    ogType: 'article' as const,
    ogImage: post.image,
    ogImageAlt: `Featured image for article: ${post.title}`,
    keywords: [post.discipline.toLowerCase(), post.category.toLowerCase(), 'equestrian', 'ai', 'training', 
               post.discipline === 'Jumping' ? 'jumping technique' : 'dressage test'],
    discipline: post.discipline as 'Dressage' | 'Jumping'
  } : {};
  
  // Set up structured data for article
  useEffect(() => {
    if (post) {
      // Create article schema
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: post.image,
        datePublished: post.date,
        author: {
          '@type': 'Person',
          name: post.author
        },
        publisher: {
          '@type': 'Organization',
          name: 'AI Equestrian',
          logo: {
            '@type': 'ImageObject',
            url: 'https://aiequestrian.com/og-image.png'
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://aiequestrian.com/blog/${post.slug}`
        }
      };
      
      // Add schema to page
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(articleSchema);
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [post]);
  
  useEffect(() => {
    if (post) {
      // Find 3 related posts from the same discipline and category
      const sameDisciplineAndCategory = blogPosts.filter(p => 
        p.id !== post.id && 
        p.discipline === post.discipline && 
        p.category === post.category
      ).slice(0, 3);
      
      // Find 1 post from the other discipline
      const otherDiscipline = blogPosts.find(p => 
        p.discipline !== post.discipline
      );
      
      setRelatedPosts([...sameDisciplineAndCategory, otherDiscipline].filter(Boolean));
    }
  }, [post]);
  
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/blog">
            <Button>Return to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const disciplineColor = post.discipline === 'Jumping' ? 'blue' : 'purple';
  const disciplineThemeBg = post.discipline === 'Jumping' 
    ? 'from-blue-50 to-white' 
    : 'from-purple-50 to-white';
  
  return (
    <div className={`min-h-screen bg-gradient-to-b ${disciplineThemeBg}`}>
      <SEO {...postSeoProps} />
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-16">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/blog">Blog</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{post.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="lg:flex gap-8">
          {/* Main content */}
          <div className="lg:w-2/3">
            <Link to="/blog">
              <Button variant="ghost" className="mb-4 -ml-2 flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to all articles
              </Button>
            </Link>
            
            <article className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <img 
                src={post.image} 
                alt={`Featured image: ${post.title}`}
                className="w-full h-72 object-cover"
                width="800"
                height="450"
              />
              
              <div className="p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge
                    className={`${
                      post.discipline === 'Jumping' 
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                        : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                    }`}
                  >
                    {post.discipline}
                  </Badge>
                  
                  <Badge variant="outline">
                    {post.category}
                  </Badge>
                  
                  <div className="flex items-center text-sm text-gray-500 ml-auto">
                    <Calendar className="h-4 w-4 mr-1" />
                    <time dateTime={post.date.replace(/\./g, '-')}>{post.date}</time>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {post.readingTime}
                  </div>
                </div>
                
                <h1 className={`text-3xl md:text-4xl font-serif font-bold text-${disciplineColor}-900 mb-4`}>
                  {post.title}
                </h1>
                
                <div className="flex items-center mb-8 pt-2 pb-6 border-b border-gray-100">
                  <div 
                    className={`mr-3 ${
                      post.discipline === 'Jumping'
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-purple-200 text-purple-800'
                    } rounded-full h-12 w-12 flex items-center justify-center`}
                    aria-hidden="true"
                  >
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <span className="font-medium block">{post.author}</span>
                    <span className="text-sm text-gray-500">Equestrian Technology Specialist</span>
                  </div>
                  
                  <Button variant="ghost" size="icon" className="ml-auto" aria-label="Share article">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Article content */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-medium text-lg text-gray-700">{post.excerpt}</p>
                  
                  {/* Placeholder content - in a real app, this would be the full article content */}
                  <p>
                    Equestrian sports have always been a blend of tradition and innovation. From the earliest 
                    days of horsemanship to modern competitive riding, we've continuously sought ways to improve 
                    communication with our equine partners and refine our techniques. Today, we stand at the 
                    threshold of a new frontier: artificial intelligence and its application in equestrian training.
                  </p>
                  
                  <h2>The Evolution of Equestrian Training</h2>
                  <p>
                    Traditional training methods rely heavily on the experience and eye of trainers who have 
                    spent decades in the saddle. While this expertise remains invaluable, technology now offers 
                    tools that can enhance human perception and provide objective data to complement subjective 
                    assessments.
                  </p>
                  
                  <h2>How AI Enhances Equestrian Performance</h2>
                  <p>
                    Artificial intelligence, particularly computer vision and machine learning, can analyze 
                    riding sessions with remarkable precision. These systems can track horse and rider movement, 
                    identify patterns, and provide feedback that might be invisible even to the trained eye.
                  </p>
                  
                  <h3>Key Benefits of AI-Enhanced Training</h3>
                  <ul>
                    <li>
                      <strong>Objective Analysis:</strong> Measurements rather than impressions
                    </li>
                    <li>
                      <strong>Consistency Tracking:</strong> Performance metrics across multiple sessions
                    </li>
                    <li>
                      <strong>Pattern Recognition:</strong> Identification of subtle habits in horse and rider
                    </li>
                    <li>
                      <strong>Personalized Feedback:</strong> Tailored recommendations based on individual data
                    </li>
                  </ul>
                  
                  <h2>Looking Forward: The Future of Equestrian Technology</h2>
                  <p>
                    As these technologies continue to develop, we can expect even more sophisticated tools that 
                    will help riders of all levels improve their performance, enhance horse welfare through better 
                    understanding of biomechanics, and potentially revolutionize how equestrian sports are trained, 
                    judged, and experienced.
                  </p>
                  
                  <p>
                    The partnership between horse and rider remains at the heart of equestrian sports. Technology 
                    doesn't replace this fundamental connection—it enhances it, offering new insights into this 
                    ancient relationship and helping us communicate more effectively with our equine partners.
                  </p>
                </div>
              </div>
            </article>
            
            {/* Related articles */}
            <section className="mt-12">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.slice(0, 2).map((relPost) => (
                  <div 
                    key={relPost.id}
                    className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full flex flex-col relative`}
                  >
                    {/* Discipline color bar */}
                    <div 
                      className={`absolute top-0 left-0 w-1 h-full ${
                        relPost.discipline === 'Jumping' ? 'bg-blue-600' : 'bg-purple-600'
                      }`} 
                    />
                    
                    <Link to={`/blog/${relPost.slug}`} className="block">
                      <img 
                        src={relPost.image} 
                        alt={relPost.title}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center mb-3 gap-2">
                        <span 
                          className={`${
                            relPost.discipline === 'Jumping' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          } text-xs font-semibold px-2 py-0.5 rounded-full`}
                        >
                          {relPost.discipline}
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {relPost.category}
                        </span>
                        <div className="flex items-center ml-auto text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {relPost.readingTime}
                        </div>
                      </div>
                      
                      <h3 className={`text-xl font-serif font-bold text-${relPost.discipline === 'Jumping' ? 'blue' : 'purple'}-900 mb-3`}>
                        <Link to={`/blog/${relPost.slug}`} className={`hover:text-${relPost.discipline === 'Jumping' ? 'blue' : 'purple'}-700 transition-colors`}>
                          {relPost.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">{relPost.excerpt}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <div className="flex items-center">
                          <div 
                            className={`mr-2 ${
                              relPost.discipline === 'Jumping'
                                ? 'bg-blue-200 text-blue-800'
                                : 'bg-purple-200 text-purple-800'
                            } rounded-full h-8 w-8 flex items-center justify-center text-sm`}
                          >
                            {relPost.author.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="text-xs font-medium">{relPost.author}</span>
                            <span className="text-xs text-gray-500 block">{relPost.date}</span>
                          </div>
                        </div>
                        
                        <Link 
                          to={`/blog/${relPost.slug}`} 
                          className={`text-${relPost.discipline === 'Jumping' ? 'blue' : 'purple'}-700 hover:text-${relPost.discipline === 'Jumping' ? 'blue' : 'purple'}-900 text-sm font-medium flex items-center`}
                        >
                          Read
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          {/* Sidebar */}
          <aside className="lg:w-1/3 space-y-8 mt-8 lg:mt-0">
            {/* About the author */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-serif font-bold mb-4">About the Author</h3>
                <div className="flex items-start">
                  <div 
                    className={`mr-4 ${
                      post.discipline === 'Jumping'
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-purple-200 text-purple-800'
                    } rounded-full h-16 w-16 flex items-center justify-center text-xl`}
                  >
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold">{post.author}</h4>
                    <p className="text-sm text-gray-600 mb-2">Equestrian Technology Specialist</p>
                    <p className="text-sm text-gray-700">
                      An expert in applying technology to equestrian sports, with a focus on 
                      improving rider performance and horse welfare through data analysis.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Popular in this discipline */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-serif font-bold mb-4">
                  Popular in {post.discipline}
                </h3>
                <div className="space-y-4">
                  {blogPosts
                    .filter(p => p.discipline === post.discipline && p.id !== post.id)
                    .slice(0, 3)
                    .map(popularPost => (
                      <Link 
                        to={`/blog/${popularPost.slug}`} 
                        key={popularPost.id}
                        className="flex gap-3 group"
                      >
                        <img 
                          src={popularPost.image} 
                          alt={popularPost.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h4 className={`font-medium group-hover:text-${disciplineColor}-700 transition-colors`}>
                            {popularPost.title}
                          </h4>
                          <p className="text-xs text-gray-500">{popularPost.date}</p>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Product CTA */}
            <Card className={post.discipline === 'Jumping' ? 'bg-blue-50' : 'bg-purple-50'}>
              <CardContent className="p-6">
                <h3 className="text-xl font-serif font-bold mb-2">
                  Improve Your {post.discipline} with AI
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  {post.discipline === 'Jumping' 
                    ? 'Get personalized jump analysis and technique recommendations tailored to your riding.' 
                    : 'Enhance your dressage training with precise movement analysis and personalized feedback.'}
                </p>
                <Link to={post.discipline === 'Jumping' ? '/jumping' : '/dressage'}>
                  <Button 
                    className={`w-full ${
                      post.discipline === 'Jumping'
                        ? 'bg-blue-700 hover:bg-blue-800'
                        : 'bg-purple-700 hover:bg-purple-800'
                    }`}
                  >
                    Learn More About AI {post.discipline}
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Categories */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-serif font-bold mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {['Technology', 'Analytics', 'Training', 'Guides', 'Competition'].map(category => (
                    <Link to={`/blog?category=${category.toLowerCase()}`} key={category}>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer py-1 px-3"
                      >
                        {category}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
