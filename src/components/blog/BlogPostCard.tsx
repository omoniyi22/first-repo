
import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '@/data/blogPosts';
import { Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard = ({ post }: BlogPostCardProps) => {
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  const disciplineColor = post.discipline === 'Jumping' ? 'blue' : 'purple';
  
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
    <article className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full flex flex-col relative`}>
      {/* Discipline color bar */}
      <div 
        className={`absolute top-0 left-0 w-1 h-full ${
          post.discipline === 'Jumping' ? 'bg-blue-600' : 'bg-purple-600'
        }`} 
      />
      
      <Link to={`/blog/${post.slug}`} className="block">
        <img 
          src={post.image} 
          alt={localizedTitle}
          className="w-full h-48 object-cover"
        />
      </Link>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center mb-3 gap-2">
          <span 
            className={`${
              post.discipline === 'Jumping' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            } text-xs font-semibold px-2 py-0.5 rounded-full`}
          >
            {post.discipline === 'Jumping' ? t["jumping"] : t["dressage"]}
          </span>
          <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
            {localizedCategory}
          </span>
          <div className="flex items-center ml-auto text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {post.readingTime}
          </div>
        </div>
        
        <h3 className={`text-xl font-serif font-bold text-${disciplineColor}-900 mb-3`}>
          <Link to={`/blog/${post.slug}`} className={`hover:text-${disciplineColor}-700 transition-colors`}>
            {localizedTitle}
          </Link>
        </h3>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{localizedExcerpt}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <div 
              className={`mr-2 ${
                post.discipline === 'Jumping'
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-purple-200 text-purple-800'
              } rounded-full h-8 w-8 flex items-center justify-center text-sm`}
            >
              {post.author.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <span className="text-xs font-medium">{post.author}</span>
              <span className="text-xs text-gray-500 block">{post.date}</span>
            </div>
          </div>
          
          <Link 
            to={`/blog/${post.slug}`} 
            className={`text-${disciplineColor}-700 hover:text-${disciplineColor}-900 text-sm font-medium flex items-center`}
          >
            {t["read"]}
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogPostCard;
