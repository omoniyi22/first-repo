
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/data/blogPosts';

// Core blog fetch functionality
export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, blog_translations(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform Supabase data into BlogPost format
    return data.map(transformDatabasePostToBlogPost);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

export const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, blog_translations(*)')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    
    return transformDatabasePostToBlogPost(data);
  } catch (error) {
    console.error(`Error fetching blog post with slug "${slug}":`, error);
    return null;
  }
};

// Blog post CRUD operations
export const createBlogPost = async (post: Partial<BlogPost>) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{
        title: post.title || 'Untitled Post',
        slug: post.slug || generateSlug(post.title || 'Untitled Post'),
        excerpt: post.excerpt || '',
        content: post.content || '',
        image: post.image || '/placeholder.svg',
        author: post.author || 'AI Equestrian Team',
        category: post.category || 'General',
        discipline: post.discipline || 'Dressage',
        date: post.date || new Date().toISOString().split('T')[0],
        reading_time: post.readingTime || '5 min read'
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return transformDatabasePostToBlogPost(data);
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

export const updateBlogPost = async (id: string, post: Partial<BlogPost>) => {
  try {
    // Convert BlogPost format to database schema
    const dbPost: any = {
      title: post.title,
      slug: post.slug || generateSlug(post.title || ''),
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      author: post.author,
      category: post.category,
      discipline: post.discipline,
      date: post.date,
      reading_time: post.readingTime
    };
    
    // Filter out undefined values
    Object.keys(dbPost).forEach(key => {
      if (dbPost[key] === undefined) delete dbPost[key];
    });
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(dbPost)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return transformDatabasePostToBlogPost(data);
  } catch (error) {
    console.error(`Error updating blog post with id "${id}":`, error);
    throw error;
  }
};

export const deleteBlogPost = async (id: string) => {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting blog post with id "${id}":`, error);
    throw error;
  }
};

// Blog post translation operations
export const updateBlogTranslation = async (blogId: string, language: string, translation: any) => {
  try {
    const { data: existingTranslation } = await supabase
      .from('blog_translations')
      .select()
      .eq('blog_id', blogId)
      .eq('language', language)
      .maybeSingle();
    
    if (existingTranslation) {
      const { error } = await supabase
        .from('blog_translations')
        .update(translation)
        .eq('id', existingTranslation.id);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('blog_translations')
        .insert([{
          blog_id: blogId,
          language,
          ...translation
        }]);
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating translation for blog post "${blogId}":`, error);
    throw error;
  }
};

// Utility functions
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-');
};

const transformDatabasePostToBlogPost = (dbPost: any): BlogPost => {
  if (!dbPost) return null as any;
  
  const translations: any = {};
  
  if (dbPost.blog_translations && dbPost.blog_translations.length > 0) {
    dbPost.blog_translations.forEach((translation: any) => {
      translations[translation.language] = {
        title: translation.title,
        excerpt: translation.excerpt,
        content: translation.content,
        category: translation.category
      };
    });
  }
  
  return {
    id: dbPost.id,
    slug: dbPost.slug,
    title: dbPost.title,
    excerpt: dbPost.excerpt,
    content: dbPost.content,
    image: dbPost.image,
    author: dbPost.author,
    authorImage: dbPost.author_image,
    category: dbPost.category,
    discipline: dbPost.discipline,
    date: dbPost.date,
    readingTime: dbPost.reading_time,
    translations: Object.keys(translations).length > 0 ? translations : undefined,
    created_at: dbPost.created_at,
    updated_at: dbPost.updated_at
  };
};
