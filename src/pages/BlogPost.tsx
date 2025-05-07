
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { SEO } from '@/lib/seo';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchBlogPostBySlug, fetchAllBlogPosts } from '@/services/blogService';
import type { BlogPost } from '@/data/blogPosts';
import { useToast } from '@/hooks/use-toast';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const { language, translations } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  
  // Fetch the blog post data
  useEffect(() => {
    const loadBlogPost = async () => {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        const fetchedPost = await fetchBlogPostBySlug(slug);
        setPost(fetchedPost);
        
        // Now that we have the post, fetch all posts for related articles
        if (fetchedPost) {
          const allPosts = await fetchAllBlogPosts();
          
          // Find 3 related posts from the same discipline and category
          const sameDisciplineAndCategory = allPosts.filter(p => 
            p.id !== fetchedPost.id && 
            p.discipline === fetchedPost.discipline && 
            p.category === fetchedPost.category
          ).slice(0, 3);
          
          // Find additional posts from the other discipline
          const otherDiscipline = allPosts.find(p => 
            p.discipline !== fetchedPost.discipline
          );
          
          setRelatedPosts([...sameDisciplineAndCategory, otherDiscipline].filter(Boolean));
        }
      } catch (error) {
        console.error('Error loading blog post:', error);
        toast({
          title: t["error-occurred"] || "An error occurred",
          description: t["failed-load-post"] || "Failed to load the blog post",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBlogPost();
  }, [slug, toast, t]);
  
  // Helper function to get localized content
  const getLocalizedContent = (content: string, fallback: string) => {
    if (language === 'es' && post?.translations?.es?.[content]) {
      return post.translations.es[content];
    }
    return fallback;
  };
  
  // Get localized content for current post
  const localizedTitle = post ? getLocalizedContent('title', post.title) : '';
  const localizedExcerpt = post ? getLocalizedContent('excerpt', post.excerpt) : '';
  const localizedContent = post ? getLocalizedContent('content', '') : '';
  const localizedCategory = post ? getLocalizedContent('category', post.category) : '';
  
  // Set up SEO metadata for the blog post
  const postSeoProps = post ? {
    title: `${localizedTitle} | AI Equestrian Blog`,
    description: localizedExcerpt.substring(0, 155) + '...',
    canonicalUrl: `/blog/${post.slug}`,
    ogType: 'article' as const,
    ogImage: post.image,
    ogImageAlt: `Featured image for article: ${localizedTitle}`,
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
        headline: localizedTitle,
        description: localizedExcerpt,
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
  }, [post, localizedTitle, localizedExcerpt]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t["loading-post"]}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t["no-articles"]}</h1>
          <Link to="/blog">
            <Button>{t["blog"]}</Button>
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
                <Link to="/">{t["home"]}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/blog">{t["blog"]}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{localizedTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="lg:flex gap-8">
          {/* Main content */}
          <div className="lg:w-2/3">
            <Link to="/blog">
              <Button variant="ghost" className="mb-4 -ml-2 flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                {language === 'es' ? 'Volver a todos los artículos' : 'Back to all articles'}
              </Button>
            </Link>
            
            <article className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <img 
                src={post.image} 
                alt={`Featured image: ${localizedTitle}`}
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
                    {post.discipline === 'Jumping' ? t["jumping"] : t["dressage"]}
                  </Badge>
                  
                  <Badge variant="outline">
                    {localizedCategory}
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
                  {localizedTitle}
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
                    <span className="text-sm text-gray-500">
                      {language === 'es' ? 'Especialista en Tecnología Ecuestre' : 'Equestrian Technology Specialist'}
                    </span>
                  </div>
                  
                  <Button variant="ghost" size="icon" className="ml-auto" aria-label="Share article">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Article content */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-medium text-lg text-gray-700">{localizedExcerpt}</p>
                  
                  {/* Display translated content if available, otherwise use the default content */}
                  {localizedContent ? (
                    <div dangerouslySetInnerHTML={{ __html: localizedContent }} />
                  ) : (
                    <>
                      {/* Placeholder content - in a real app, this would be the full article content */}
                      <p>
                        {language === 'es' 
                          ? "Los deportes ecuestres siempre han sido una mezcla de tradición e innovación. Desde los primeros días de la equitación hasta la equitación competitiva moderna, hemos buscado continuamente formas de mejorar la comunicación con nuestros compañeros equinos y refinar nuestras técnicas. Hoy, estamos en el umbral de una nueva frontera: la inteligencia artificial y su aplicación en el entrenamiento ecuestre."
                          : "Equestrian sports have always been a blend of tradition and innovation. From the earliest days of horsemanship to modern competitive riding, we've continuously sought ways to improve communication with our equine partners and refine our techniques. Today, we stand at the threshold of a new frontier: artificial intelligence and its application in equestrian training."
                        }
                      </p>
                      
                      <h2>
                        {language === 'es' 
                          ? 'La Evolución del Entrenamiento Ecuestre'
                          : 'The Evolution of Equestrian Training'
                        }
                      </h2>
                      <p>
                        {language === 'es'
                          ? "Los métodos de entrenamiento tradicionales dependen en gran medida de la experiencia y el ojo de los entrenadores que han pasado décadas en la silla. Si bien esta experiencia sigue siendo invaluable, la tecnología ahora ofrece herramientas que pueden mejorar la percepción humana y proporcionar datos objetivos para complementar las evaluaciones subjetivas."
                          : "Traditional training methods rely heavily on the experience and eye of trainers who have spent decades in the saddle. While this expertise remains invaluable, technology now offers tools that can enhance human perception and provide objective data to complement subjective assessments."
                        }
                      </p>
                      
                      <h2>
                        {language === 'es'
                          ? 'Cómo la IA Mejora el Rendimiento Ecuestre'
                          : 'How AI Enhances Equestrian Performance'
                        }
                      </h2>
                      <p>
                        {language === 'es'
                          ? "La inteligencia artificial, particularmente la visión por computadora y el aprendizaje automático, puede analizar sesiones de equitación con notable precisión. Estos sistemas pueden rastrear el movimiento del caballo y del jinete, identificar patrones y proporcionar retroalimentación que podría ser invisible incluso para el ojo entrenado."
                          : "Artificial intelligence, particularly computer vision and machine learning, can analyze riding sessions with remarkable precision. These systems can track horse and rider movement, identify patterns, and provide feedback that might be invisible even to the trained eye."
                        }
                      </p>
                      
                      <h3>
                        {language === 'es'
                          ? 'Beneficios Clave del Entrenamiento Mejorado por IA'
                          : 'Key Benefits of AI-Enhanced Training'
                        }
                      </h3>
                      <ul>
                        <li>
                          <strong>
                            {language === 'es'
                              ? 'Análisis Objetivo:'
                              : 'Objective Analysis:'
                            }
                          </strong> 
                          {language === 'es'
                            ? 'Mediciones en lugar de impresiones'
                            : 'Measurements rather than impressions'
                          }
                        </li>
                        <li>
                          <strong>
                            {language === 'es'
                              ? 'Seguimiento de Consistencia:'
                              : 'Consistency Tracking:'
                            }
                          </strong> 
                          {language === 'es'
                            ? 'Métricas de rendimiento a través de múltiples sesiones'
                            : 'Performance metrics across multiple sessions'
                          }
                        </li>
                        <li>
                          <strong>
                            {language === 'es'
                              ? 'Reconocimiento de Patrones:'
                              : 'Pattern Recognition:'
                            }
                          </strong> 
                          {language === 'es'
                            ? 'Identificación de hábitos sutiles en el caballo y el jinete'
                            : 'Identification of subtle habits in horse and rider'
                          }
                        </li>
                        <li>
                          <strong>
                            {language === 'es'
                              ? 'Retroalimentación Personalizada:'
                              : 'Personalized Feedback:'
                            }
                          </strong> 
                          {language === 'es'
                            ? 'Recomendaciones adaptadas basadas en datos individuales'
                            : 'Tailored recommendations based on individual data'
                          }
                        </li>
                      </ul>
                      
                      <h2>
                        {language === 'es'
                          ? 'Mirando Hacia Adelante: El Futuro de la Tecnología Ecuestre'
                          : 'Looking Forward: The Future of Equestrian Technology'
                        }
                      </h2>
                      <p>
                        {language === 'es'
                          ? "A medida que estas tecnologías continúan desarrollándose, podemos esperar herramientas aún más sofisticadas que ayudarán a los jinetes de todos los niveles a mejorar su rendimiento, mejorar el bienestar de los caballos a través de una mejor comprensión de la biomecánica, y potencialmente revolucionar cómo se entrenan, juzgan y experimentan los deportes ecuestres."
                          : "As these technologies continue to develop, we can expect even more sophisticated tools that will help riders of all levels improve their performance, enhance horse welfare through better understanding of biomechanics, and potentially revolutionize how equestrian sports are trained, judged, and experienced."
                        }
                      </p>
                      
                      <p>
                        {language === 'es'
                          ? "La asociación entre el caballo y el jinete sigue siendo el corazón de los deportes ecuestres. La tecnología no reemplaza esta conexión fundamental, la mejora, ofreciendo nuevas perspectivas sobre esta antigua relación y ayudándonos a comunicarnos más eficazmente con nuestros compañeros equinos."
                          : "The partnership between horse and rider remains at the heart of equestrian sports. Technology doesn't replace this fundamental connection—it enhances it, offering new insights into this ancient relationship and helping us communicate more effectively with our equine partners."
                        }
                      </p>
                    </>
                  )}
                </div>
              </div>
            </article>
            
            {/* Related articles */}
            <section className="mt-12">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                {language === 'es' ? 'Artículos Relacionados' : 'Related Articles'}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.slice(0, 2).map((relPost) => {
                  // Get localized content for related post
                  const relLocalizedTitle = language === 'es' && relPost.translations?.es?.title 
                    ? relPost.translations.es.title 
                    : relPost.title;
                  
                  const relLocalizedExcerpt = language === 'es' && relPost.translations?.es?.excerpt
                    ? relPost.translations.es.excerpt
                    : relPost.excerpt;
                  
                  const relLocalizedCategory = language === 'es' && relPost.translations?.es?.category
                    ? relPost.translations.es.category
                    : relPost.category;
                  
                  return (
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
                          alt={relLocalizedTitle}
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
                            {relPost.discipline === 'Jumping' ? t["jumping"] : t["dressage"]}
                          </span>
                          <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {relLocalizedCategory}
                          </span>
                          <div className="flex items-center ml-auto text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {relPost.readingTime}
                          </div>
                        </div>
                        
                        <h3 className={`text-xl font-serif font-bold text-${relPost.discipline === 'Jumping' ? 'blue' : 'purple'}-900 mb-3`}>
                          <Link to={`/blog/${relPost.slug}`} className={`hover:text-${relPost.discipline === 'Jumping' ? 'blue' : 'purple'}-700 transition-colors`}>
                            {relLocalizedTitle}
                          </Link>
                        </h3>
                        
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{relLocalizedExcerpt}</p>
                        
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
                            {t["read"]}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
          
          {/* Sidebar */}
          <aside className="lg:w-1/3 space-y-8 mt-8 lg:mt-0">
            {/* About the author */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-serif font-bold mb-4">
                  {language === 'es' ? 'Sobre el Autor' : 'About the Author'}
                </h3>
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
                    <p className="text-sm text-gray-600 mb-2">
                      {language === 'es' ? 'Especialista en Tecnología Ecuestre' : 'Equestrian Technology Specialist'}
                    </p>
                    <p className="text-sm text-gray-700">
                      {language === 'es' 
                        ? "Un experto en aplicar tecnología a los deportes ecuestres, con un enfoque en mejorar el rendimiento del jinete y el bienestar del caballo a través del análisis de datos."
                        : "An expert in applying technology to equestrian sports, with a focus on improving rider performance and horse welfare through data analysis."
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Popular in this discipline */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-serif font-bold mb-4">
                  {language === 'es' 
                    ? `Popular en ${post.discipline === 'Jumping' ? 'Salto' : 'Doma'}`
                    : `Popular in ${post.discipline}`
                  }
                </h3>
                <div className="space-y-4">
                  {relatedPosts
                    .filter(p => p.discipline === post.discipline && p.id !== post.id)
                    .slice(0, 3)
                    .map(popularPost => {
                      // Get localized title for popular post
                      const popLocalizedTitle = language === 'es' && popularPost.translations?.es?.title 
                        ? popularPost.translations.es.title 
                        : popularPost.title;
                        
                      return (
                        <Link 
                          to={`/blog/${popularPost.slug}`} 
                          key={popularPost.id}
                          className="flex gap-3 group"
                        >
                          <img 
                            src={popularPost.image} 
                            alt={popLocalizedTitle}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <h4 className={`font-medium group-hover:text-${disciplineColor}-700 transition-colors`}>
                              {popLocalizedTitle}
                            </h4>
                            <p className="text-xs text-gray-500">{popularPost.date}</p>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
            
            {/* Product CTA */}
            <Card className={post.discipline === 'Jumping' ? 'bg-blue-50' : 'bg-purple-50'}>
              <CardContent className="p-6">
                <h3 className="text-xl font-serif font-bold mb-2">
                  {language === 'es'
                    ? `Mejora tu ${post.discipline === 'Jumping' ? 'Salto' : 'Doma'} con IA`
                    : `Improve Your ${post.discipline} with AI`
                  }
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  {post.discipline === 'Jumping' 
                    ? (language === 'es'
                        ? "Obtén análisis de salto personalizados y recomendaciones técnicas adaptadas a tu equitación."
                        : "Get personalized jump analysis and technique recommendations tailored to your riding.")
                    : (language === 'es'
                        ? "Mejora tu entrenamiento de doma con análisis preciso de movimiento y retroalimentación personalizada."
                        : "Enhance your dressage training with precise movement analysis and personalized feedback.")
                  }
                </p>
                <Link to={post.discipline === 'Jumping' ? '/jumping' : '/dressage'}>
                  <Button 
                    className={`w-full ${
                      post.discipline === 'Jumping'
                        ? 'bg-blue-700 hover:bg-blue-800'
                        : 'bg-purple-700 hover:bg-purple-800'
                    }`}
                  >
                    {language === 'es'
                      ? `Aprende Más Sobre ${post.discipline === 'Jumping' ? 'Salto' : 'Doma'} con IA`
                      : `Learn More About AI ${post.discipline}`
                    }
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Categories */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-serif font-bold mb-4">
                  {language === 'es' ? 'Categorías' : 'Categories'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Technology', 'Analytics', 'Training', 'Guides', 'Competition'].map(category => {
                    // Translate categories
                    const translatedCategory = language === 'es' ? t[category.toLowerCase()] : category;
                    
                    return (
                      <Link to={`/blog?category=${category.toLowerCase()}`} key={category}>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer py-1 px-3"
                        >
                          {translatedCategory}
                        </Badge>
                      </Link>
                    );
                  })}
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
