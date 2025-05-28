import { useParams, Navigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogPosts } from '@/data/blogPosts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import { SEO, getPageMetadata } from '@/lib/seo';
import { useEffect, useState } from 'react';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [htmlContent, setHtmlContent] = useState<string>('');

  // Find the blog post by slug
  const post = blogPosts.find(p => p.slug === slug);

  useEffect(() => {
    if (post?.content) {
      // Convert markdown to HTML and set it to state
      marked(post.content)
        .then((html) => {
          if (typeof html === 'string') {
            setHtmlContent(html);
          }
        })
        .catch((error) => {
          console.error('Error converting markdown:', error);
          setHtmlContent('');
        });
    }
  }, [post?.content]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Get SEO metadata for the blog post
  const seoMetadata = getPageMetadata("blog", {
    title: post.title,
    description: post.excerpt,
    image: post.image,
  });

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Function to format the date
  const formatDate = (dateString: string, language: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if (language === 'es') {
      return date.toLocaleDateString('es-ES', options);
    } else {
      return date.toLocaleDateString('en-US', options);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="container mx-auto px-4 pt-20 sm:pt-24 pb-12 sm:pb-16 max-w-4xl">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-4 pl-0">
          <Link to="/blog" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="h-5 w-5" />
            {language === "en" ? "Back to Blog" : "Volver al Blog"}
          </Link>
        </Button>

        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 font-serif mb-2">{post.title}</h1>
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.date, language)}</span>
            <span className="mx-1">•</span>
            <Clock className="h-4 w-4" />
            <span>{post.reading_time}</span>
            <span className="mx-1">•</span>
            <User className="h-4 w-4" />
            <span>{post.author}</span>
          </div>
        </header>
        
        <Card className="overflow-hidden">
          {/* Image */}
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto object-cover aspect-video mb-4"
          />
          
          {/* Metadata */}
          <div className="flex items-center justify-between px-6 sm:px-8 mb-4">
            <Badge className="bg-purple-100 text-purple-700 border-none">{post.category}</Badge>
            <div className="text-gray-500 text-sm">
              {language === "en" ? "Share this article" : "Comparte este artículo"}
              {/* Add social sharing links here */}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 sm:p-8">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-purple-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </Card>

        {/* Related Posts (Example) */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 font-serif mb-4">
            {language === "en" ? "Related Posts" : "Artículos Relacionados"}
          </h2>
          {/* Add related blog posts here */}
          <p className="text-gray-600">
            {language === "en" ? "More articles coming soon!" : "¡Más artículos próximamente!"}
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
