
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
import { blogPosts, BlogPost } from "@/data/blogPosts";
import BlogPostsList from "@/components/admin/blog/BlogPostsList";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    // In a real app, we would fetch posts from the API
    // For now, we use the static data from blogPosts.ts
    setPosts(blogPosts);
    setFilteredPosts(blogPosts);
  }, []);

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
    
    if (disciplineFilter) {
      result = result.filter(post => post.discipline === disciplineFilter);
    }
    
    if (categoryFilter) {
      result = result.filter(post => post.category === categoryFilter);
    }
    
    setFilteredPosts(result);
  }, [searchTerm, disciplineFilter, categoryFilter, posts]);

  const handleAddPost = () => {
    setEditingPost(null);
    setIsFormOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setIsFormOpen(true);
  };

  const handleDeletePost = (postId: number) => {
    // In a real app, we would call the API to delete the post
    // For now, we just filter it out from our state
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handleSavePost = (post: BlogPost) => {
    // In a real app, we would call the API to save the post
    if (editingPost) {
      // Update existing post
      setPosts(posts.map(p => p.id === post.id ? post : p));
    } else {
      // Add new post
      const newPost = {
        ...post,
        id: Math.max(...posts.map(p => p.id)) + 1,
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };
      setPosts([...posts, newPost]);
    }
    setIsFormOpen(false);
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
            <SelectItem value="">All Disciplines</SelectItem>
            <SelectItem value="Jumping">Jumping</SelectItem>
            <SelectItem value="Dressage">Dressage</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Analytics">Analytics</SelectItem>
            <SelectItem value="Training">Training</SelectItem>
            <SelectItem value="Guides">Guides</SelectItem>
            <SelectItem value="Competition">Competition</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BlogPostsList 
        posts={filteredPosts} 
        onEdit={handleEditPost} 
        onDelete={handleDeletePost} 
      />

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
