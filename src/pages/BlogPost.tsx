import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchBlogPostBySlug, fetchBlogPosts } from "@/services/blogService";
import { BlogPost } from "@/data/blogPosts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SEO, getPageMetadata } from "@/lib/seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import BlogPostCard from "@/components/blog/BlogPostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { marked } from "marked";
import { getImagePath, handleImageError } from "@/utils/imageUtils";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const { language, translations } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();

  useEffect(() => {
    const loadBlogPost = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const blogPost = await fetchBlogPostBySlug(slug);

        if (!blogPost) {
          setError("Blog post not found");
          console.error(`Blog post with slug "${slug}" not found`);
        } else {
          console.log("Loaded blog post:", blogPost);

          // Check if content is null/undefined
          if (blogPost.content === null || blogPost.content === undefined) {
            console.warn("Blog post content is null or undefined:", blogPost);
          }

          setPost(blogPost);
        }
      } catch (err) {
        console.error("Error loading blog post:", err);
        setError("Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };

    loadBlogPost();
  }, [slug]);

  // Get related posts
  useEffect(() => {
    if (!post) return;

    const fetchRelatedPosts = async () => {
      try {
        const allPosts = await fetchBlogPosts();

        // Filter out current post and get posts with same discipline or category
        const related = allPosts
          .filter((p) => p.id !== post.id)
          .filter(
            (p) =>
              p.discipline === post.discipline || p.category === post.category
          )
          .slice(0, 3); // Get up to 3 related posts

        setRelatedPosts(related);
      } catch (error) {
        console.error("Error fetching related posts:", error);
      }
    };

    fetchRelatedPosts();
  }, [post]);

  // Get SEO metadata
  const seoMetadata = post
    ? getPageMetadata("blogPost", {
        title: post.title,
        description: post.excerpt,
        ogImage: post.image,
      })
    : getPageMetadata("blogPost");

  // Get localized content
  const getLocalizedContent = (field: string, fallback: string) => {
    if (language === "es" && post?.translations?.es?.[field]) {
      return post.translations.es[field];
    }
    return fallback;
  };

  // Render markdown content
  const renderContent = (content: string) => {
    if (!content)
      return (
        <p className="text-gray-500 italic">{t["no-content-available"]}</p>
      );

    try {
      const html = marked(content);
      return (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch (error) {
      console.error("Error rendering markdown:", error);
      return <div className="whitespace-pre-wrap">{content}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO {...seoMetadata} />
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-16">
        {loading ? (
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-96 w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t["post-not-found"]}
            </h1>
            <p className="text-gray-600 mb-8">{t["post-not-found-message"]}</p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t["back-to-blog"]}
              </Link>
            </Button>
          </div>
        ) : post ? (
          <>
            {/* Back to blog link */}
            <div className="max-w-4xl mx-auto mb-8">
              <Link
                to="/blog"
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t["back-to-blog"]}
              </Link>
            </div>

            {/* Blog post header */}
            <div className="max-w-4xl mx-auto mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">
                {getLocalizedContent("title", post.title)}
              </h1>

              <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {new Date(post.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{post.readingTime}</span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.discipline === "Jumping"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {post.discipline === "Jumping"
                      ? t["jumping"]
                      : t["dressage"]}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                    {getLocalizedContent("category", post.category)}
                  </span>
                </div>
              </div>

              <p className="text-xl text-gray-700 mb-8">
                {getLocalizedContent("excerpt", post.excerpt)}
              </p>
            </div>

            {/* Featured image */}
            <div className="max-w-4xl mx-auto mb-8">
              <img
                src={getImagePath(post.image)}
                alt={getLocalizedContent("title", post.title)}
                className="w-full h-auto rounded-lg shadow-md"
                onError={(e) => handleImageError(e)}
              />
            </div>

            {/* Blog content */}
            <article className="max-w-4xl mx-auto mb-16">
              {renderContent(
                getLocalizedContent("content", post.content || "")
              )}
            </article>

            {/* Author info */}
            <div className="max-w-4xl mx-auto mb-16 bg-gray-50 rounded-lg p-6 flex items-center">
              <div className="mr-4">
                <img
                  src={getImagePath(post.authorImage || "/placeholder.svg")}
                  alt={post.author}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => handleImageError(e)}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {post.author}
                </h3>
                <p className="text-gray-600">{t["author-bio"]}</p>
              </div>
            </div>

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                  {t["related-posts"]}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <BlogPostCard
                      key={relatedPost.id}
                      post={relatedPost}
                      hideAuthor
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
