import { useState } from "react";
import { BlogPost } from "@/data/blogPosts";
import { BlogFormData } from "../forms/blogFormSchema";

export const usePostFormSubmission = (
  onSave: (post: BlogPost) => void,
  existingPost: BlogPost | null
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: BlogFormData) => {
    setIsSubmitting(true);
    try {
      // Ensure content is not null/undefined
      const content = values.content || "";
      
      const updatedPost: BlogPost = {
        id: existingPost?.id || Math.floor(Math.random() * 1000),
        title: values.title,
        excerpt: values.excerpt,
        content: content,
        author: values.author,
        date: existingPost?.date || new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        discipline: values.discipline,
        category: values.category,
        slug: values.slug,
        image: values.image,
        readingTime: existingPost?.readingTime || "5 min read",
        authorImage: existingPost?.authorImage || "/placeholder.svg",
        translations: existingPost?.translations || {},
        // Keep the Supabase ID if we're editing
        ...(existingPost && existingPost.supabaseId ? { supabaseId: existingPost.supabaseId } : {})
      };

      onSave(updatedPost);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
};
