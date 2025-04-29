
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
      
      <div class="my-8">
        <img src="/lovable-uploads/b729b0be-9b4c-4b4b-bdec-6bd2f849b8f8.png" alt="Rider in green jacket on chestnut horse" class="w-full h-auto rounded-lg shadow-md" />
        <p class="text-sm text-gray-500 italic mt-2 text-center">A proper riding position is fundamental to effective dressage training</p>
      </div>
      
      <h2>1. Focus on Your Position and Balance</h2>
      <p>The cornerstone of effective dressage riding is a correct riding position. Your seat is your primary communication tool with your horse, so developing a balanced, independent seat should be your first priority. Keep your shoulders back and down, your core engaged, and your legs long and relaxed. Work without stirrups whenever possible to improve your balance and deepen your seat. Remember that a stable, balanced rider creates a stable, balanced horse.</p>
      
      <div class="my-8">
        <img src="/lovable-uploads/8bd55054-fb8f-46dd-8f14-41c093349591.png" alt="Rider on white horse in dressage arena" class="w-full h-auto rounded-lg shadow-md" />
        <p class="text-sm text-gray-500 italic mt-2 text-center">Maintaining proper form during movements is essential for clear communication with your horse</p>
      </div>
      
      <h2>2. Master the Basics Before Advancing</h2>
      <p>In dressage, there are no shortcuts. Each level builds upon the skills acquired in the previous one. Take your time to master basic skills such as clear transitions, accurate circles, and consistent rhythm before attempting more advanced movements. A well-executed 20-meter circle at a steady rhythm is far more impressive and beneficial than a rushed, unbalanced attempt at a shoulder-in or travers.</p>
      
      <h2>3. Develop Clear Communication Through Half-Halts</h2>
      <p>Understanding and effectively using half-halts is crucial in dressage. A half-halt is essentially a rebalancing tool, helping your horse maintain engagement and responsiveness. Practice coordinating your seat, legs, and hands to create a clear half-halt that your horse understands. This communication tool will help you navigate transitions, prepare for movements, and maintain your horse's attention throughout your ride.</p>
      
      <div class="my-8">
        <img src="/lovable-uploads/e6996e68-34bc-4e87-a5ff-e12b847f7df5.png" alt="Rider on white horse in competition arena" class="w-full h-auto rounded-lg shadow-md" />
        <p class="text-sm text-gray-500 italic mt-2 text-center">Competition dressage requires precision and attention to detail</p>
      </div>
      
      <h2>4. Emphasize Quality Over Quantity</h2>
      <p>It's better to ride for 20 minutes with focus and purpose than to meander around the arena for an hour. Set specific goals for each riding session and focus on the quality of your horse's gaits rather than how long you ride. Pay attention to rhythm, straightness, and relaxation—the foundation of the dressage training scale—and reward your horse when these elements improve.</p>
      
      <h2>5. Seek Regular Professional Guidance</h2>
      <p>Even the world's top riders continue to take lessons and seek feedback. A knowledgeable instructor can provide invaluable guidance, catch errors before they become habits, and help you understand the nuances of dressage training. Video your rides when possible and review them critically. And consider technology solutions like AI Dressage Trainer that can provide instant feedback on your performance and help you track your progress over time.</p>
      
      <div class="my-8">
        <img src="/lovable-uploads/42930ec1-2f55-429f-aaa5-4aac1791a729.png" alt="Rider in formal dressage attire" class="w-full h-auto rounded-lg shadow-md" />
        <p class="text-sm text-gray-500 italic mt-2 text-center">Formal dressage competitions showcase the elegance and precision of this equestrian discipline</p>
      </div>
      
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
    content: `
      <p>For many dressage riders, the scoring process can seem mysterious and sometimes unpredictable. Understanding what judges are looking for is essential to improving your scores and advancing in the sport. This article breaks down the key elements of dressage test scoring to help you better prepare for your next competition.</p>
      
      <div class="my-8">
        <img src="/lovable-uploads/987a3f3b-1917-439f-a3a9-8fabc609cffa.png" alt="Judge scoring a dressage test" class="w-full h-auto rounded-lg shadow-md" />
        <p class="text-sm text-gray-500 italic mt-2 text-center">A dressage judge evaluating a performance with precision and attention to detail</p>
      </div>
      
      <h2>The Scoring Scale: Understanding the Numbers</h2>
      <p>Dressage tests are scored on a scale from 0 to 10, with 0 being "not performed" and 10 being "excellent." Most movements in a typical test will score between 5 ("sufficient") and 7 ("fairly good"). Understanding this scale is the first step in recognizing what each score represents:</p>
      
      <ul class="list-disc pl-6 my-4 space-y-2">
        <li><strong>10:</strong> Excellent</li>
        <li><strong>9:</strong> Very good</li>
        <li><strong>8:</strong> Good</li>
        <li><strong>7:</strong> Fairly good</li>
        <li><strong>6:</strong> Satisfactory</li>
        <li><strong>5:</strong> Sufficient</li>
        <li><strong>4:</strong> Insufficient</li>
        <li><strong>3:</strong> Fairly bad</li>
        <li><strong>2:</strong> Bad</li>
        <li><strong>1:</strong> Very bad</li>
        <li><strong>0:</strong> Not performed</li>
      </ul>
      
      <h2>The Training Scale: The Foundation of Scoring</h2>
      <p>Judges evaluate movements based on the principles of the dressage training scale. This progressive scale includes six elements that build upon each other:</p>
      
      <ol class="list-decimal pl-6 my-4 space-y-2">
        <li><strong>Rhythm:</strong> The regularity and tempo of the gaits</li>
        <li><strong>Relaxation:</strong> Mental and physical absence of tension</li>
        <li><strong>Connection:</strong> The flow of energy from hindquarters through the body to a soft, elastic contact</li>
        <li><strong>Impulsion:</strong> The desire to move forward with energy and elasticity</li>
        <li><strong>Straightness:</strong> Proper alignment and equal weight distribution</li>
        <li><strong>Collection:</strong> Engagement, lightness of the forehand, and self-carriage</li>
      </ol>
      
      <h2>What Judges Are Really Looking For</h2>
      <p>Beyond the technical aspects, judges are seeking harmony between horse and rider. Here are the key elements they're evaluating:</p>
      
      <h3>1. Accuracy and Precision</h3>
      <p>Judges look for movements performed precisely where they're supposed to be in the arena. This means accurate circles, straight lines, and correct positioning of transitions. Practice riding your test with markers to improve your spatial awareness.</p>
      
      <h3>2. Quality of Gaits</h3>
      <p>The natural correctness of the horse's movement, including rhythm, elasticity, and expression. Judges want to see pure gaits with clear rhythm and good energy.</p>
      
      <h3>3. Submission and Harmony</h3>
      <p>How willingly and calmly your horse responds to your aids, without resistance or tension. A harmonious partnership always scores higher than a tense, forced performance.</p>
      
      <div class="my-8">
        <img src="/lovable-uploads/79f64a37-cb8e-4627-b743-c5330837a1b0.png" alt="Rider and horse in perfect harmony" class="w-full h-auto rounded-lg shadow-md" />
        <p class="text-sm text-gray-500 italic mt-2 text-center">The harmony between horse and rider is a crucial element in dressage scoring</p>
      </div>
      
      <h3>4. Rider Position and Effectiveness</h3>
      <p>Your position should be balanced, with an independent seat and invisible aids. Judges can tell when a rider is using excessive force or when aids are unclear.</p>
      
      <h2>Common Scoring Deductions</h2>
      <p>Understanding what commonly leads to lower scores can help you avoid these pitfalls:</p>
      
      <ul class="list-disc pl-6 my-4 space-y-2">
        <li>Inaccurate figures and transitions</li>
        <li>Tension or resistance in the horse</li>
        <li>Irregular rhythm or tempo</li>
        <li>Loss of balance or frame</li>
        <li>Obvious or excessive aids from the rider</li>
        <li>Lack of straightness</li>
      </ul>
      
      <h2>How to Improve Your Scores</h2>
      <p>With understanding comes improvement. Here are practical tips to boost your test scores:</p>
      
      <ol class="list-decimal pl-6 my-4 space-y-2">
        <li><strong>Study the test thoroughly</strong> before competing. Visualize each movement and transition.</li>
        <li><strong>Record yourself riding</strong> and analyze your performance objectively.</li>
        <li><strong>Focus on transitions</strong>, as they often carry their own scores and influence the quality of subsequent movements.</li>
        <li><strong>Develop a consistent warm-up routine</strong> that prepares your horse mentally and physically.</li>
        <li><strong>Request feedback from judges</strong> after tests when possible.</li>
      </ol>
      
      <p>Remember that dressage scoring is designed to evaluate your progress along the training scale. A thoughtful, harmonious ride on a correctly trained horse will always score better than flashy movements performed with tension or resistance.</p>
      
      <p>By understanding what judges are looking for, you can focus your training more effectively and enter the competition arena with confidence and clarity.</p>
    `,
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
    content: `
      <p>The world of equestrian sports is experiencing a technological revolution, and dressage is at the forefront of this transformation. Artificial Intelligence (AI) is reshaping how riders train, compete, and develop their skills, offering unprecedented insights and opportunities for improvement. Let's explore how AI technology is revolutionizing dressage training methods and creating new pathways to excellence.</p>
      
      <div class="my-8">
        <img src="/lovable-uploads/15df63d0-27e1-486c-98ee-bcf44eb600f4.png" alt="Rider using tablet with AI dressage app" class="w-full h-auto rounded-lg shadow-md" />
        <p class="text-sm text-gray-500 italic mt-2 text-center">Modern dressage training now incorporates AI technology for instant feedback and analysis</p>
      </div>
      
      <h2>Real-Time Motion Analysis and Feedback</h2>
      <p>One of the most groundbreaking applications of AI in dressage is real-time motion analysis. Using computer vision algorithms, AI systems can now analyze both horse and rider movements with incredible precision, capturing details that might escape even the most experienced trainer's eye.</p>
      
      <p>These systems typically use multiple cameras to capture the horse and rider from different angles. The AI then processes this video data to assess various aspects of the performance:</p>
      
      <ul class="list-disc pl-6 my-4 space-y-2">
        <li>Tracking the precision of movements and figures</li>
        <li>Analyzing the horse's gait for regularity and rhythm</li>
        <li>Evaluating the rider's position and balance</li>
        <li>Measuring the geometry of circles, diagonals, and other patterns</li>
        <li>Detecting subtle asymmetries in the horse's movement</li>
      </ul>
      
      <p>The real power of these systems lies in their ability to provide immediate feedback. Rather than waiting for a weekly lesson with a trainer, riders can receive instant insights about their performance and make adjustments during the same training session. This accelerates the learning process and helps develop muscle memory more effectively.</p>
      
      <div class="my-8">
        <img src="/lovable-uploads/4c938b42-7713-4f2d-947a-1e70c3caca32.png" alt="AI software analyzing dressage movements" class="w-full h-auto rounded-lg shadow-md" />
        <p class="text-sm text-gray-500 italic mt-2 text-center">AI software can analyze subtle details of dressage movements that may be missed by the human eye</p>
      </div>
      
      <h2>Personalized Training Programs</h2>
      <p>AI doesn't just analyze performance—it can also create personalized training programs tailored to the specific needs of each horse and rider combination. By collecting and analyzing data over time, AI systems can identify patterns, strengths, and areas that need improvement.</p>
      
      <p>These intelligent systems consider factors such as:</p>
      
      <ul class="list-disc pl-6 my-4 space-y-2">
        <li>The horse's physical capabilities and limitations</li>
        <li>The rider's skill level and goals</li>
        <li>Previous training history and progress</li>
        <li>Competition schedules and performance targets</li>
      </ul>
      
      <p>Based on this comprehensive analysis, AI can suggest structured training plans with specific exercises designed to address weaknesses while building on existing strengths. As the horse and rider progress, the AI continuously adjusts these recommendations to ensure optimal development.</p>
      
      <h2>Biomechanical Analysis and Injury Prevention</h2>
      <p>Perhaps one of the most valuable applications of AI in dressage is in the realm of biomechanics and injury prevention. By monitoring subtle changes in movement patterns, AI can detect early signs of potential lameness or discomfort before they become visible to the human eye.</p>
      
      <p>These systems use machine learning algorithms trained on thousands of examples of both healthy and problematic movements. This allows them to identify minor deviations that might indicate:</p>
      
      <ul class="list-disc pl-6 my-4 space-y-2">
        <li>Early signs of lameness</li>
        <li>Muscle soreness or tension</li>
        <li>Compensatory movement patterns</li>
        <li>Saddle fit issues</li>
        <li>Improper weight distribution</li>
      </ul>
      
      <p>By catching these issues early, riders and trainers can address them before they develop into more serious problems, potentially extending the horse's competitive career and ensuring their welfare.</p>
      
      <div class="my-8">
        <img src="/lovable-uploads/3b7c24a2-ef67-42cc-9b46-875418451128.png" alt="Horse with biomechanical sensors" class="w-full h-auto rounded-lg shadow-md" />
        <p class="text-sm text-gray-500 italic mt-2 text-center">Advanced sensors combined with AI can detect subtle biomechanical issues before they become visible problems</p>
      </div>
      
      <h2>Virtual Coaching and Remote Training</h2>
      <p>The COVID-19 pandemic accelerated the adoption of remote coaching technologies, and AI has played a crucial role in making virtual training more effective. Using smartphone cameras or dedicated systems, riders can now receive high-quality feedback without their coach being physically present.</p>
      
      <p>AI-powered virtual coaching offers several advantages:</p>
      
      <ul class="list-disc pl-6 my-4 space-y-2">
        <li>Access to expertise regardless of geographical location</li>
        <li>Reduced travel costs and time for both coaches and riders</li>
        <li>The ability to train effectively between in-person lessons</li>
        <li>Detailed data collection that can be shared with multiple professionals</li>
      </ul>
      
      <p>Some systems even allow coaches to annotate video footage with drawings and comments, creating a rich multimedia learning experience that can be reviewed repeatedly by the rider.</p>
      
      <h2>Competition Preparation and Analysis</h2>
      <p>AI is also transforming how riders prepare for and analyze their competition performances. By analyzing videos of previous tests, AI can identify patterns in the judge's scoring and help riders understand which aspects of their performance need attention.</p>
      
      <p>For example, an AI system might notice that a particular rider consistently scores lower on extended trot movements or that certain judges tend to prioritize specific qualities. Armed with this information, riders can focus their training more effectively and make strategic decisions about which competitions to enter.</p>
      
      <h2>The Future of AI in Dressage</h2>
      <p>As AI technology continues to advance, we can expect even more innovative applications in the dressage world. Some emerging technologies include:</p>
      
      <ul class="list-disc pl-6 my-4 space-y-2">
        <li><strong>Wearable sensors</strong> that provide continuous monitoring during riding and rest periods</li>
        <li><strong>Augmented reality systems</strong> that project ideal lines and patterns onto the arena during training</li>
        <li><strong>Emotional analysis</strong> that can detect stress or anxiety in both horse and rider</li>
        <li><strong>Predictive analytics</strong> that can forecast competition outcomes based on training data</li>
      </ul>
      
      <h2>Balancing Technology with Tradition</h2>
      <p>While AI offers exciting possibilities for dressage training, the equestrian community is rightfully careful about balancing technological innovation with the traditional aspects of the sport. The relationship between horse and rider remains central to dressage, and technology should enhance rather than replace this connection.</p>
      
      <p>The most successful applications of AI in dressage recognize that the goal is not to create cookie-cutter performances but to help each horse-rider combination reach their unique potential while honoring the classical principles that define the sport.</p>
      
      <p>As we embrace these new tools, the focus remains on the wellbeing of the horse, the development of the rider, and the preservation of dressage as an art form. When used thoughtfully, AI can help us achieve these goals more effectively than ever before, opening new possibilities for riders at all levels.</p>
    `,
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
                         prose-strong:text-purple-700
                         prose-img:rounded-lg"
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
