import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/data/blogPosts";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { blogPostFormSchema, BlogFormData } from "./forms/blogFormSchema";
import BasicInfoFields from "./forms/BasicInfoFields";
import ContentFields from "./forms/ContentFields";
import MetadataFields from "./forms/MetadataFields";
import FeaturedImageField from "./forms/FeaturedImageField";
import FormActions from "./forms/FormActions";

interface BlogPostFormProps {
  post: BlogPost | null;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

const BlogPostForm = ({ post, onSave, onCancel }: BlogPostFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      author: "",
      discipline: "Jumping" as "Jumping" | "Dressage",
      category: "Technology" as "Technology" | "Analytics" | "Training" | "Guides" | "Competition",
      slug: "",
      image: "/placeholder.svg",
    },
  });

  // Update the form values when the post prop changes
  useEffect(() => {
    if (post) {
      console.log("Setting form values with post:", post);
      form.reset({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content ?? "", // Use nullish coalescing operator to handle null or undefined
        author: post.author,
        discipline: post.discipline,
        category: post.category,
        slug: post.slug,
        image: post.image,
      });
    }
  }, [post, form]);

  const handleSubmit = async (values: BlogFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting blog post form with values:", values);
      
      // Ensure content is not null/undefined
      const content = values.content || "";
      
      const updatedPost: BlogPost = {
        id: post?.id || Math.floor(Math.random() * 1000), // Will be replaced with real ID from Supabase
        title: values.title,
        excerpt: values.excerpt,
        content: content, // Use the validated content
        author: values.author,
        date: post?.date || new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        discipline: values.discipline,
        category: values.category,
        slug: values.slug,
        image: values.image,
        readingTime: post?.readingTime || "5 min read",
        authorImage: post?.authorImage || "/placeholder.svg",
        translations: post?.translations || {},
        // Keep the Supabase ID if we're editing
        ...(post && post.supabaseId ? { supabaseId: post.supabaseId } : {})
      };

      onSave(updatedPost);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      form.setValue("slug", slug);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <BasicInfoFields form={form} generateSlug={generateSlug} />
        <ContentFields form={form} />
        <MetadataFields form={form} />
        <FeaturedImageField form={form} />
        <FormActions 
          onCancel={onCancel} 
          isSubmitting={isSubmitting} 
          isEditing={!!post} 
        />
      </form>
    </Form>
  );
};

export default BlogPostForm;
