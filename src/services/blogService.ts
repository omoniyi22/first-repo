
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/data/blogPosts';

export interface SupabaseBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string | null;
  author: string;
  author_image: string | null;
  date: string;
  discipline: 'Jumping' | 'Dressage';
  category: 'Technology' | 'Analytics' | 'Training' | 'Guides' | 'Competition';
  image: string;
  reading_time: string;
}

export interface SupabaseBlogTranslation {
  id: string;
  blog_id: string;
  language: string;
  title: string | null;
  excerpt: string | null;
  content: string | null;
  category: string | null;
}

// Convert Supabase blog post to our BlogPost format
export const mapToBlogPost = (post: SupabaseBlogPost, translations?: SupabaseBlogTranslation[]): BlogPost => {
  console.log('Mapping blog post to BlogPost format:', post);
  
  const translationMap = translations?.reduce((acc, translation) => {
    const { language, title, excerpt, content, category } = translation;
    if (!acc[language]) {
      acc[language] = {};
    }
    
    if (title) acc[language].title = title;
    if (excerpt) acc[language].excerpt = excerpt;
    if (content) acc[language].content = content;
    if (category) acc[language].category = category;
    
    return acc;
  }, {} as BlogPost['translations']);
  
  // Ensure content is properly handled even if it's null
  const blogContent = post.content || '';
  console.log(`Blog post "${post.title}" content status:`, post.content === null ? 'NULL' : 'Content length: ' + post.content?.length);

  return {
    id: parseInt(post.id.replace(/-/g, '').substring(0, 8), 16) % 1000, // Generate a stable numeric ID
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: blogContent, // Ensure we don't pass null but empty string
    author: post.author,
    authorImage: post.author_image || '/placeholder.svg',
    date: post.date,
    discipline: post.discipline,
    category: post.category,
    image: post.image,
    readingTime: post.reading_time,
    translations: translationMap || {},
    supabaseId: post.id // Store the Supabase UUID for later use
  };
};

// Fetch all blog posts
export const fetchAllBlogPosts = async (): Promise<BlogPost[]> => {
  console.log('Fetching all blog posts');
  
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error('Failed to fetch blog posts');
  }

  console.log('Fetched blog posts from database:', posts);

  const { data: translations, error: translationsError } = await supabase
    .from('blog_translations')
    .select('*');

  if (translationsError) {
    console.error('Error fetching translations:', translationsError);
    // Continue without translations
  }

  // Group translations by blog_id
  const translationsByBlogId = (translations || []).reduce((acc, translation) => {
    if (!acc[translation.blog_id]) {
      acc[translation.blog_id] = [];
    }
    acc[translation.blog_id].push(translation);
    return acc;
  }, {} as Record<string, SupabaseBlogTranslation[]>);

  // Map to our BlogPost format
  return posts.map(post => {
    // Ensure discipline is properly typed as 'Jumping' or 'Dressage'
    const typedPost: SupabaseBlogPost = {
      ...post,
      discipline: post.discipline as 'Jumping' | 'Dressage',
      category: post.category as 'Technology' | 'Analytics' | 'Training' | 'Guides' | 'Competition'
    };
    return mapToBlogPost(typedPost, translationsByBlogId[post.id]);
  });
};

// Fetch a single blog post by slug
export const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  console.log(`Fetching blog post with slug: ${slug}`);
  
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }

  console.log('Fetched blog post data:', post);
  console.log('Content:', post.content === null ? 'NULL' : 'Content length: ' + post.content?.length);

  const { data: translations, error: translationsError } = await supabase
    .from('blog_translations')
    .select('*')
    .eq('blog_id', post.id);

  if (translationsError) {
    console.error('Error fetching translations:', translationsError);
    // Continue without translations
  }

  // Ensure discipline is properly typed as 'Jumping' or 'Dressage'
  const typedPost: SupabaseBlogPost = {
    ...post,
    discipline: post.discipline as 'Jumping' | 'Dressage',
    category: post.category as 'Technology' | 'Analytics' | 'Training' | 'Guides' | 'Competition'
  };

  return mapToBlogPost(typedPost, translations || []);
};

// Create a new blog post
export const createBlogPost = async (post: Omit<SupabaseBlogPost, 'id'>): Promise<string | null> => {
  console.log('Creating new blog post:', post);
  
  // If content is null or undefined, set it to an empty string
  const finalPost = {
    ...post,
    content: post.content || ''  // Ensure content is never null
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([finalPost])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating blog post:', error);
    throw new Error('Failed to create blog post');
  }

  return data?.id || null;
};

// Update an existing blog post
export const updateBlogPost = async (id: string, post: Partial<SupabaseBlogPost>): Promise<void> => {
  console.log('Updating blog post:', id, post);
  
  // If content is explicitly set to null, provide an empty string instead
  const finalPost: Partial<SupabaseBlogPost> = {
    ...post
  };
  
  if (post.content === null) {
    finalPost.content = '';
  }
  
  // Make sure discipline and category are correctly typed
  if (finalPost.discipline) {
    finalPost.discipline = finalPost.discipline as 'Jumping' | 'Dressage';
  }
  
  if (finalPost.category) {
    finalPost.category = finalPost.category as 'Technology' | 'Analytics' | 'Training' | 'Guides' | 'Competition';
  }
  
  const { error } = await supabase
    .from('blog_posts')
    .update(finalPost)
    .eq('id', id);

  if (error) {
    console.error('Error updating blog post:', error);
    throw new Error('Failed to update blog post');
  }
};

// Delete a blog post
export const deleteBlogPost = async (id: string): Promise<void> => {
  console.log('Deleting blog post:', id);
  
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    throw new Error('Failed to delete blog post');
  }
};

// Create or update translations for a blog post
export const upsertBlogTranslation = async (
  blogId: string, 
  language: string, 
  translationData: Partial<SupabaseBlogTranslation>
): Promise<void> => {
  console.log('Upserting blog translation:', blogId, language, translationData);
  
  const { error } = await supabase
    .from('blog_translations')
    .upsert([
      {
        blog_id: blogId,
        language,
        ...translationData
      }
    ], { 
      onConflict: 'blog_id,language'
    });

  if (error) {
    console.error('Error updating translation:', error);
    throw new Error('Failed to update translation');
  }
};
