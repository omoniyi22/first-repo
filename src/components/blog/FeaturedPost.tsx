
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { BlogPost } from '@/data/blogPosts';
import { useLanguage } from '@/contexts/LanguageContext';

interface FeaturedPostProps {
  post: BlogPost;
}

const FeaturedPost = ({ post }: FeaturedPostProps) => {
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  // Define colors based on discipline
  const colors = {
    Jumping: {
      light: 'bg-blue-100',
      text: 'text-blue-800',
      accent: 'bg-blue-200',
      button: 'bg-blue-700 hover:bg-blue-800',
      title: 'text-blue-900',
      hover: 'hover:text-blue-700',
    },
    Dressage: {
      light: 'bg-purple-100',
      text: 'text-purple-800',
      accent: 'bg-purple-200',
      button: 'bg-purple-700 hover:bg-purple-800',
      title: 'text-purple-900',
      hover: 'hover:text-purple-700',
    }
  };
  
  const colorSet = colors[post.discipline as keyof typeof colors];
  
  // Translate post content if needed
  const getLocalizedContent = (content: string, fallback: string) => {
    if (language === 'es' && post.translations?.es?.[content]) {
      return post.translations.es[content];
    }
    return fallback;
  };
  
  const localizedTitle = getLocalizedContent('title', post.title);
  const localizedExcerpt = getLocalizedContent('excerpt', post.excerpt);
  const localizedCategory = getLocalizedContent('category', post.category);
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
      <div className="md:flex">
        <div className="md:w-1/2">
          <img 
            src={post.image} 
            alt={localizedTitle}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-8 md:w-1/2 flex flex-col justify-center">
          <div className="flex items-center mb-4">
            <span 
              className={`${colorSet.light} ${colorSet.text} text-xs font-semibold px-3 py-1 rounded-full`}
            >
              {post.discipline === 'Jumping' ? t["jumping"] : t["dressage"]}
            </span>
            <span className="ml-2 text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-800">
              {localizedCategory}
            </span>
            <span className="ml-3 text-sm text-gray-500">{post.date}</span>
          </div>
          <h2 className={`text-2xl md:text-3xl font-serif font-bold ${colorSet.title} mb-4`}>
            <Link to={`/blog/${post.slug}`} className={`${colorSet.hover} transition-colors`}>
              {localizedTitle}
            </Link>
          </h2>
          <p className="text-gray-700 mb-6">{localizedExcerpt}</p>
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div 
                  className={`mr-3 ${colorSet.accent} ${colorSet.text} rounded-full h-10 w-10 flex items-center justify-center`}
                >
                  {post.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span className="text-sm font-medium block">{post.author}</span>
                  <span className="text-xs text-gray-500">{post.readingTime}</span>
                </div>
              </div>
            </div>
            <Link to={`/blog/${post.slug}`}>
              <Button 
                className={colorSet.button}
              >
                {t["read-article"]}
                <BookOpen className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPost;
