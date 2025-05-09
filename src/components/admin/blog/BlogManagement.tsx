import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogPost } from "@/data/blogPosts";
import BlogPostsList from "@/components/admin/blog/BlogPostsList";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { fetchBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, fetchBlogPostBySlug } from "@/services/blogService";
import { useToast } from "@/hooks/use-toast";

const POSTS_PER_PAGE = 10;

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedPosts, setPaginatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      setIsLoading(true);
      const fetchedPosts = await fetchBlogPosts();
      setPosts(fetchedPosts);
      setFilteredPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Failed to load posts",
        description: "There was a problem loading blog posts from the database.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = posts;
    
    if (searchTerm) {
      result = result.filter(
        post => 
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (disciplineFilter && disciplineFilter !== "all") {
      result = result.filter(post => post.discipline === disciplineFilter);
    }
    
    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter(post => post.category === categoryFilter);
    }
    
    setFilteredPosts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, disciplineFilter, categoryFilter, posts]);

  // Paginate the filtered posts
  useEffect(() => {
    const startIdx = (currentPage - 1) * POSTS_PER_PAGE;
    const endIdx = startIdx + POSTS_PER_PAGE;
    setPaginatedPosts(filteredPosts.slice(startIdx, endIdx));
  }, [filteredPosts, currentPage]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddPost = () => {
    setEditingPost(null);
    setIsFormOpen(true);
  };

  const handleEditPost = async (post: BlogPost) => {
    try {
      setIsLoading(true);
      // When editing, fetch the complete blog post with content
      if (post.slug) {
        const fullPost = await fetchBlogPostBySlug(post.slug);
        if (fullPost) {
          setEditingPost(fullPost);
        } else {
          setEditingPost(post);
          console.warn("Could not fetch full blog post details, using list data");
        }
      } else {
        setEditingPost(post);
      }
    } catch (error) {
      console.error("Error fetching complete blog post:", error);
      setEditingPost(post);
    } finally {
      setIsLoading(false);
      setIsFormOpen(true);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      // Find the post to get its Supabase UUID
      const postToDelete = posts.find(p => p.id === postId);
      
      if (!postToDelete) {
        throw new Error("Post not found");
      }
      
      // For Supabase, we need the actual UUID, not our numeric ID
      const supabaseId = postToDelete.supabaseId;
      
      if (!supabaseId) {
        throw new Error("Supabase ID not found for this post");
      }
      
      await deleteBlogPost(supabaseId);
      
      // Remove post from state
      setPosts(posts.filter(post => post.id !== postId));
      
      toast({
        title: "Post deleted",
        description: "The blog post has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      
      toast({
        title: "Failed to delete post",
        description: "There was a problem deleting the blog post.",
        variant: "destructive"
      });
    }
  };

  const handleSavePost = async (post: BlogPost) => {
    try {
      if (editingPost) {
        // Update existing post
        const supabaseId = editingPost.supabaseId;
        
        if (!supabaseId) {
          throw new Error("Supabase ID not found for this post");
        }
        
        // Ensure content is handled properly (empty string if null/undefined)
        const content = post.content === undefined ? "" : post.content;
        
        console.log("Updating blog post with content:", content);
        
        await updateBlogPost(supabaseId, {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: content, 
          author: post.author,
          discipline: post.discipline,
          category: post.category,
          image: post.image,
          authorImage: post.authorImage
        });
        
        // Update the post in our local state
        setPosts(prevPosts => 
          prevPosts.map(p => p.id === post.id ? { ...post, supabaseId } : p)
        );
        
        toast({
          title: "Post updated",
          description: "The blog post has been successfully updated.",
        });
      } else {
        // Create new post
        // Format date as string in the format expected by Supabase
        const formattedDate = new Date().toISOString();
        
        // Handle content field (empty string if null/undefined)
        const content = post.content === undefined ? "" : post.content;
        
        console.log("Creating new blog post with content:", content);
        
        const newPostId = await createBlogPost({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: content,
          author: post.author,
          authorImage: post.authorImage || '/placeholder.svg',
          date: formattedDate,
          discipline: post.discipline,
          category: post.category,
          image: post.image,
          readingTime: post.readingTime || '5 min read'
        });
        
        if (newPostId) {
          // Reload all posts to get the new one with correct ID
          await loadBlogPosts();
          
          toast({
            title: "Post created",
            description: "The new blog post has been successfully created.",
          });
        }
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving post:', error);
      
      toast({
        title: "Failed to save post",
        description: "There was a problem saving the blog post to the database.",
        variant: "destructive"
      });
    }
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          isActive={currentPage === 1} 
          onClick={() => handlePageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <span className="flex h-9 w-9 items-center justify-center">...</span>
        </PaginationItem>
      );
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last pages as they're handled separately
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i} 
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2 && totalPages > 3) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <span className="flex h-9 w-9 items-center justify-center">...</span>
        </PaginationItem>
      );
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            isActive={currentPage === totalPages} 
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-500">Create and manage blog posts</p>
        </div>
        <Button onClick={handleAddPost}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search posts..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by discipline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Disciplines</SelectItem>
            <SelectItem value="Jumping">Jumping</SelectItem>
            <SelectItem value="Dressage">Dressage</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Analytics">Analytics</SelectItem>
            <SelectItem value="Training">Training</SelectItem>
            <SelectItem value="Guides">Guides</SelectItem>
            <SelectItem value="Competition">Competition</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog posts...</p>
        </div>
      ) : (
        <BlogPostsList 
          posts={paginatedPosts} 
          onEdit={handleEditPost} 
          onDelete={handleDeletePost} 
        />
      )}
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {renderPaginationItems()}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
            <DialogDescription>
              {editingPost 
                ? 'Make changes to your blog post here.' 
                : 'Fill out the form below to create a new blog post.'}
            </DialogDescription>
          </DialogHeader>
          <BlogPostForm 
            post={editingPost} 
            onSave={handleSavePost} 
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;
