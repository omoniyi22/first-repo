import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { ArrowLeft, Bookmark, Share2, MessageSquare, ThumbsUp, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const blogPosts = [
  {
    id: 1,
    title: "5 Essential Dressage Training Tips for Beginners",
    content: `
      <p>Dressage, often described as "horse ballet," is a disciplined and elegant form of horseback riding that requires patience, precision, and a deep connection between horse and rider. For beginners stepping into the world of dressage, the journey can seem daunting, but with the right guidance, it becomes a rewarding experience. Here are five essential tips to help beginners establish a solid foundation in dressage training.</p>
      
      <h2>1. Focus on Your Position and Balance</h2>
      <p>The cornerstone of effective dressage riding is a correct riding position. Your seat is your primary communication tool with your horse, so developing a balanced, independent seat should be your first priority. Keep your shoulders back and down, your core engaged, and your legs long and relaxed. Work without stirrups whenever possible to improve your balance and deepen your seat. Remember that a stable, balanced rider creates a stable, balanced horse.</p>
      
      <h2>2. Master the Basics Before Advancing</h2>
      <p>In dressage, there are no shortcuts. Each level builds upon the skills acquired in the previous one. Take your time to master basic skills such as clear transitions, accurate circles, and consistent rhythm before attempting more advanced movements. A well-executed 20-meter circle at a steady rhythm is far more impressive and beneficial than a rushed, unbalanced attempt at a shoulder-in or travers.</p>
      
      <h2>3. Develop Clear Communication Through Half-Halts</h2>
      <p>Understanding and effectively using half-halts is crucial in dressage. A half-halt is essentially a rebalancing tool, helping your horse maintain engagement and responsiveness. Practice coordinating your seat, legs, and hands to create a clear half-halt that your horse understands. This communication tool will help you navigate transitions, prepare for movements, and maintain your horse's attention throughout your ride.</p>
      
      <h2>4. Emphasize Quality Over Quantity</h2>
      <p>It's better to ride for 20 minutes with focus and purpose than to meander around the arena for an hour. Set specific goals for each riding session and focus on the quality of your horse's gaits rather than how long you ride. Pay attention to rhythm, straightness, and relaxation—the foundation of the dressage training scale—and reward your horse when these elements improve.</p>
      
      <h2>5. Seek Regular Professional Guidance</h2>
      <p>Even the world's top riders continue to take lessons and seek feedback. A knowledgeable instructor can provide invaluable guidance, catch errors before they become habits, and help you understand the nuances of dressage training. Video your rides when possible and review them critically. And consider technology solutions like AI Dressage Trainer that can provide instant feedback on your performance and help you track your progress over time.</p>
      
      <h2>Conclusion</h2>
      <p>Dressage is as much about training yourself as it is about training your horse. Be patient, stay consistent, and celebrate small improvements. Remember that the journey of dressage is continuous learning and refinement, and every great dressage rider was once a beginner. With dedication, proper guidance, and these foundational tips, you're well on your way to developing the skills needed for success in the dressage arena.</p>
    `,
    excerpt: "Master the basics of dressage with these expert tips that will help you establish a solid foundation.",
    date: "April 22, 2025",
    author: "Emma Richardson",
    category: "Training",
    imageUrl: "/lovable-uploads/79f64a37-cb8e-4627-b743-c5330837a1b0.png",
    slug: "essential-dressage-tips",
    tags: ["beginner", "dressage training", "riding position", "horse communication"]
  },
  {
    id: 2,
    title: "Understanding Dressage Test Scoring: What Judges Are Looking For",
    content: "<p>Sample content for the second blog post...</p>",
    excerpt: "Learn how dressage tests are scored and what specific elements judges evaluate during your performance.",
    date: "April 18, 2025",
    author: "Michael Peterson",
    category: "Competition",
    imageUrl: "/lovable-uploads/987a3f3b-1917-439f-a3a9-8fabc609cffa.png",
    slug: "dressage-test-scoring",
    tags: ["competition", "scoring", "judges", "dressage tests"]
  },
  {
    id: 3,
    title: "How AI Technology is Transforming Modern Dressage Training",
    content: "<p>Sample content for the third blog post...</p>",
    excerpt: "Discover how artificial intelligence is revolutionizing dressage training methods and improving rider performance.",
    date: "April 15, 2025",
    author: "Sarah Johnson",
    category: "Technology",
    imageUrl: "/lovable-uploads/15df63d0-27e1-486c-98ee-bcf44eb600f4.png",
    slug: "ai-dressage-technology",
    tags: ["technology", "AI", "innovation", "training tools"]
  }
];

const getRelatedPosts = (currentPostId: number, category: string) => {
  return blogPosts
    .filter(post => post.id !== currentPostId && post.category === category)
    .slice(0, 2);
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const { toast } = useToast();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showCommentField, setShowCommentField] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  useEffect(() => {
    const currentPost = blogPosts.find(post => post.slug === slug);
    
    if (currentPost) {
      setPost(currentPost);
      setRelatedPosts(getRelatedPosts(currentPost.id, currentPost.category));
      
      document.title = `${currentPost.title} | Equestrian Excellence Blog`;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', currentPost.excerpt);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = currentPost.excerpt;
        document.head.appendChild(meta);
      }
    } else {
      navigate('/blog');
    }
    
    window.scrollTo(0, 0);
  }, [slug, navigate]);
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "The article link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed like" : "Article liked!",
      description: isLiked ? "You've removed your like from this article." : "Thanks for appreciating this article!",
    });
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Article saved!",
      description: isSaved ? "This article has been removed from your saved items." : "This article has been added to your saved items.",
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      toast({
        title: "Comment posted!",
        description: "Your comment has been posted successfully.",
      });
      setCommentText('');
      setShowCommentField(false);
    } else {
      toast({
        title: "Empty comment",
        description: "Please write something before posting.",
        variant: "destructive"
      });
    }
  };
  
  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-16">
        <div className="mb-8">
          <Breadcrumb>
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
        </div>
        
        <div className="mb-8">
          <Link to="/blog">
            <Button variant="outline" className="text-purple-800 border-purple-800 hover:bg-purple-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Articles
            </Button>
          </Link>
        </div>
        
        <article className="bg-white rounded-xl overflow-hidden shadow-lg mb-12">
          <div className="relative">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-6 pt-24">
              <div className="flex items-center mb-4">
                <span className="bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full">{post.category}</span>
                <span className="ml-3 text-sm text-white">{post.date}</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
                {post.title}
              </h1>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="flex items-center mb-8 pb-8 border-b border-gray-200">
              <div className="mr-4 bg-purple-200 text-purple-800 rounded-full h-12 w-12 flex items-center justify-center">
                {post.author.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="font-medium text-purple-900">{post.author}</div>
            </div>
            
            <div 
              className="prose prose-purple prose-lg max-w-none mb-8 
                         prose-headings:text-purple-700
                         prose-h1:text-purple-800 
                         prose-h2:text-purple-700 
                         prose-h2:font-semibold 
                         prose-h2:mt-8 
                         prose-h2:mb-4
                         prose-p:mb-6 
                         prose-p:leading-relaxed
                         prose-li:text-purple-700
                         prose-li:mb-2
                         prose-strong:text-purple-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag: string) => (
                <span 
                  key={tag} 
                  className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between border-t border-b border-gray-200 py-4 my-8">
              <div className="flex items-center space-x-4">
                <button 
                  className={`flex items-center ${isLiked ? 'text-purple-700' : 'text-gray-600 hover:text-purple-800'}`}
                  onClick={handleLike}
                >
                  <ThumbsUp className={`h-5 w-5 mr-1 ${isLiked ? 'fill-purple-700' : ''}`} />
                  <span className="text-sm">{isLiked ? 'Liked' : 'Like'}</span>
                </button>
                <button 
                  className={`flex items-center ${showCommentField ? 'text-purple-700' : 'text-gray-600 hover:text-purple-800'}`}
                  onClick={() => setShowCommentField(!showCommentField)}
                >
                  <MessageSquare className="h-5 w-5 mr-1" />
                  <span className="text-sm">Comment</span>
                </button>
                <button 
                  className={`flex items-center ${isSaved ? 'text-purple-700' : 'text-gray-600 hover:text-purple-800'}`}
                  onClick={handleSave}
                >
                  <Bookmark className={`h-5 w-5 mr-1 ${isSaved ? 'fill-purple-700' : ''}`} />
                  <span className="text-sm">{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
              <button 
                className="flex items-center text-gray-600 hover:text-purple-800"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5 mr-1" />
                <span className="text-sm">Share</span>
              </button>
            </div>

            {showCommentField && (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write your comment..." 
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                  rows={3}
                ></textarea>
                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowCommentField(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-purple-700 hover:bg-purple-800">
                    Post Comment
                  </Button>
                </div>
              </form>
            )}
          </div>
        </article>
        
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold text-purple-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <Link to={`/blog/${relatedPost.slug}`}>
                    <img 
                      src={relatedPost.imageUrl} 
                      alt={relatedPost.title}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">{relatedPost.category}</span>
                      <span className="ml-3 text-xs text-gray-500">{relatedPost.date}</span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-purple-900 mb-3">
                      <Link to={`/blog/${relatedPost.slug}`} className="hover:text-purple-700 transition-colors">
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-700 text-sm mb-4">{relatedPost.excerpt}</p>
                    <Link to={`/blog/${relatedPost.slug}`} className="text-purple-700 hover:text-purple-900 text-sm font-medium flex items-center">
                      Read more
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl p-8 shadow-md">
          <h3 className="text-xl font-serif font-bold text-purple-900 mb-4">Join the Discussion</h3>
          <p className="text-gray-700 mb-6">Share your thoughts and experiences related to this article.</p>
          <textarea 
            placeholder="Write your comment..." 
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            rows={4}
          ></textarea>
          <Button className="bg-purple-700 hover:bg-purple-800">
            Post Comment
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
