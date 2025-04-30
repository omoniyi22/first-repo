
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { BlogPost } from '@/data/blogPosts';

interface FeaturedPostProps {
  post: BlogPost;
}

const FeaturedPost = ({ post }: FeaturedPostProps) => {
  const disciplineColor = post.discipline === 'Jumping' ? 'blue' : 'purple';
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
      <div className="md:flex">
        <div className="md:w-1/2">
          <img 
            src={post.image} 
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-8 md:w-1/2 flex flex-col justify-center">
          <div className="flex items-center mb-4">
            <span 
              className={`${
                post.discipline === 'Jumping' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              } text-xs font-semibold px-3 py-1 rounded-full`}
            >
              {post.discipline}
            </span>
            <span 
              className={`ml-2 text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-800`}
            >
              {post.category}
            </span>
            <span className="ml-3 text-sm text-gray-500">{post.date}</span>
          </div>
          <h2 className={`text-2xl md:text-3xl font-serif font-bold text-${disciplineColor}-900 mb-4`}>
            <Link to={`/blog/${post.slug}`} className={`hover:text-${disciplineColor}-700 transition-colors`}>
              {post.title}
            </Link>
          </h2>
          <p className="text-gray-700 mb-6">{post.excerpt}</p>
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div 
                  className={`mr-3 ${
                    post.discipline === 'Jumping'
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-purple-200 text-purple-800'
                  } rounded-full h-10 w-10 flex items-center justify-center`}
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
                className={`${
                  post.discipline === 'Jumping'
                    ? 'bg-blue-700 hover:bg-blue-800'
                    : 'bg-purple-700 hover:bg-purple-800'
                }`}
              >
                Read Article
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
