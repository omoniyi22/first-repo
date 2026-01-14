import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogPost } from "@/data/blogPosts";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import MediaSelector from "../media/MediaSelector";
import { updateBlogTranslation } from "@/services/blogService";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Replace with your Supabase client import

interface BlogPostFormProps {
  post: BlogPost | null;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

// Supabase function to check if slug exists
const checkSlugExists = async (slug: string, currentPostId?: number | string): Promise<{ exists: boolean; error?: string }> => {
  try {
    let query = supabase
      .from('blog_posts') // Replace 'blog_posts' with your actual table name
      .select('id')
      .eq('slug', slug);

    // Exclude current post when editing (if we have a Supabase ID)
    if (currentPostId) {
      query = query.neq('id', currentPostId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error checking slug:', error);
      return { exists: false, error: error.message || 'Failed to check slug availability' };
    }

    return { exists: data && data.length > 0 };
  } catch (error) {
    console.error('Error checking slug:', error);
    return { exists: false, error: error.message || 'Failed to check slug availability' };
  }
};

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().optional(),
  author: z.string().min(1, "Author is required"),
  discipline: z.enum(["Jumping", "Dressage"]),
  category: z.enum([
    "Technology",
    "Analytics",
    "Training",
    "Guides",
    "Competition",
  ]),
  slug: z.string().min(1, "Slug is required"),
  image: z.string().min(1, "Image URL is required"),
});

const BlogPostForm = ({ post, onSave, onCancel }: BlogPostFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('english');
  const [spanishTranslation, setSpanishTranslation] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: ''
  });
  
  // Slug validation states
  const [slugValidation, setSlugValidation] = useState<{
    isChecking: boolean;
    isValid: boolean | null;
    message: string;
    hasError: boolean;
  }>({
    isChecking: false,
    isValid: null,
    message: '',
    hasError: false
  });

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      author: "",
      discipline: "Jumping" as "Jumping" | "Dressage",
      category: "Technology" as
        | "Technology"
        | "Analytics"
        | "Training"
        | "Guides"
        | "Competition",
      slug: "",
      image: "/placeholder.svg",
    },
  });

  // Debounced slug validation function
  const validateSlug = useCallback(
    debounce(async (slug: string) => {
      if (!slug.trim()) {
        setSlugValidation({
          isChecking: false,
          isValid: null,
          message: '',
          hasError: false
        });
        return;
      }

      setSlugValidation(prev => ({ ...prev, isChecking: true }));
      
      try {
        // Use supabaseId if available, otherwise use regular id
        const postId = post?.supabaseId || post?.id;
        const result = await checkSlugExists(slug, postId);
        
        if (result.error) {
          setSlugValidation({
            isChecking: false,
            isValid: null,
            message: `Error: ${result.error}`,
            hasError: true
          });
        } else if (result.exists) {
          setSlugValidation({
            isChecking: false,
            isValid: false,
            message: 'This slug is already taken. Please choose a different one.',
            hasError: false
          });
          form.setError('slug', {
            type: 'manual',
            message: 'This slug is already taken'
          });
        } else {
          setSlugValidation({
            isChecking: false,
            isValid: true,
            message: 'Slug is available',
            hasError: false
          });
          form.clearErrors('slug');
        }
      } catch (error) {
        setSlugValidation({
          isChecking: false,
          isValid: null,
          message: 'Error checking slug availability',
          hasError: true
        });
      }
    }, 500),
    [post?.supabaseId, post?.id, form]
  );

  // Watch slug changes for real-time validation
  const slugValue = form.watch('slug');
  
  useEffect(() => {
    if (slugValue) {
      validateSlug(slugValue);
    }
  }, [slugValue, validateSlug]);

  // Update the form values when the post prop changes
  useEffect(() => {
    if (post) {
      console.log("Setting form values with post:", post);
      form.reset({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content ?? "",
        author: post.author,
        discipline: post.discipline,
        category: post.category,
        slug: post.slug,
        image: post.image,
      });

      // Reset slug validation when editing existing post
      setSlugValidation({
        isChecking: false,
        isValid: null,
        message: '',
        hasError: false
      });

      // Load Spanish translations if they exist
      if (post.translations?.es) {
        setSpanishTranslation({
          title: post.translations.es.title || '',
          excerpt: post.translations.es.excerpt || '',
          content: post.translations.es.content || '',
          category: post.translations.es.category || ''
        });
      }
    }
  }, [post, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // Prevent submission if slug validation has errors or is invalid
    if (slugValidation.hasError) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the slug validation error before saving.',
        variant: 'destructive',
      });
      return;
    }

    if (slugValidation.isValid === false) {
      toast({
        title: 'Invalid Slug',
        description: 'Please choose a different slug before saving.',
        variant: 'destructive',
      });
      return;
    }

    // If we haven't validated the slug yet (e.g., user typed and immediately clicked save)
    if (slugValidation.isValid === null && values.slug) {
      toast({
        title: 'Validating Slug',
        description: 'Please wait while we validate the slug...',
      });
      
      // Trigger validation and wait for it
      const postId = post?.supabaseId || post?.id;
      const result = await checkSlugExists(values.slug, postId);
      
      if (result.error) {
        toast({
          title: 'Validation Error',
          description: `Could not validate slug: ${result.error}`,
          variant: 'destructive',
        });
        return;
      }
      
      if (result.exists) {
        toast({
          title: 'Invalid Slug',
          description: 'This slug is already taken. Please choose a different one.',
          variant: 'destructive',
        });
        setSlugValidation({
          isChecking: false,
          isValid: false,
          message: 'This slug is already taken. Please choose a different one.',
          hasError: false
        });
        form.setError('slug', {
          type: 'manual',
          message: 'This slug is already taken'
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting blog post form with values:", values);

      const content = values.content || "";

      const updatedPost: BlogPost = {
        id: post?.id || Math.floor(Math.random() * 1000),
        title: values.title,
        excerpt: values.excerpt,
        content: content,
        author: values.author,
        date:
          post?.date ||
          new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }),
        discipline: values.discipline,
        category: values.category,
        slug: values.slug,
        image: values.image,
        readingTime: post?.readingTime || "5 min read",
        authorImage: post?.authorImage || "/placeholder.svg",
        translations: post?.translations || {},
        ...(post && post.supabaseId ? { supabaseId: post.supabaseId } : {}),
      };

      await onSave(updatedPost);

      // Save Spanish translation if provided and we have a Supabase ID
      if (post?.supabaseId && (spanishTranslation.title || spanishTranslation.excerpt || spanishTranslation.content)) {
        try {
          await updateBlogTranslation(post.supabaseId, 'es', spanishTranslation);
          toast({
            title: 'Success',
            description: 'Blog post and Spanish translation saved successfully.',
          });
        } catch (translationError) {
          console.error('Error saving Spanish translation:', translationError);
          toast({
            title: 'Warning',
            description: 'Blog post saved but Spanish translation failed to save.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Success',
          description: `Blog post ${post ? 'updated' : 'created'} successfully.`,
        });
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      
      // Check if it's a duplicate slug error from Supabase
      if (error.code === '23505' || 
          (error.message && error.message.includes('duplicate key value violates unique constraint')) ||
          (error.message && error.message.includes('blog_posts_slug_key'))) {
        toast({
          title: 'Duplicate Slug Error',
          description: 'This slug is already taken. Please choose a different one and try again.',
          variant: 'destructive',
        });
        
        // Update validation state to show error
        setSlugValidation({
          isChecking: false,
          isValid: false,
          message: 'This slug is already taken. Please choose a different one.',
          hasError: false
        });
        
        form.setError('slug', {
          type: 'manual',
          message: 'This slug is already taken'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save blog post. Please try again.',
          variant: 'destructive',
        });
      }
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

  const getSlugValidationIcon = () => {
    if (slugValidation.isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />;
    }
    if (slugValidation.hasError) {
      return <XCircle className="h-4 w-4 text-orange-500" />;
    }
    if (slugValidation.isValid === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (slugValidation.isValid === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="english">English</TabsTrigger>
        <TabsTrigger value="spanish">Spanish</TabsTrigger>
      </TabsList>

      <TabsContent value="english">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 py-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter blog post title"
                        {...field}
                        onBlur={() => {
                          field.onBlur();
                          if (!form.getValues("slug")) {
                            generateSlug();
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Slug
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 ml-2"
                        onClick={generateSlug}
                      >
                        Generate from title
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Enter URL slug" 
                          {...field}
                          className={`pr-10 ${
                            slugValidation.isValid === false ? 'border-red-500 focus:border-red-500' :
                            slugValidation.isValid === true ? 'border-green-500 focus:border-green-500' :
                            slugValidation.hasError ? 'border-orange-500 focus:border-orange-500' : ''
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {getSlugValidationIcon()}
                        </div>
                      </div>
                    </FormControl>
                    {slugValidation.message && (
                      <p className={`text-sm mt-1 ${
                        slugValidation.isValid === false ? 'text-red-500' : 
                        slugValidation.isValid === true ? 'text-green-500' : 
                        slugValidation.hasError ? 'text-orange-500' : 'text-gray-500'
                      }`}>
                        {slugValidation.message}
                      </p>
                    )}
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a short excerpt"
                      className="resize-none h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter blog content"
                      className="resize-none h-48"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Author name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discipline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discipline</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select discipline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Jumping">Jumping</SelectItem>
                        <SelectItem value="Dressage">Dressage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Analytics">Analytics</SelectItem>
                        <SelectItem value="Training">Training</SelectItem>
                        <SelectItem value="Guides">Guides</SelectItem>
                        <SelectItem value="Competition">Competition</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image</FormLabel>
                  <FormControl>
                    <MediaSelector value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || slugValidation.isValid === false || slugValidation.isChecking || slugValidation.hasError}
              >
                {isSubmitting ? "Saving..." : post ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="spanish">
        <div className="space-y-6 py-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Spanish Translation</strong> - Provide Spanish translations for the blog post content.
            </p>
          </div>

          <div>
            <Label htmlFor="spanish-title">Title (Spanish)</Label>
            <Input
              id="spanish-title"
              value={spanishTranslation.title}
              onChange={(e) => setSpanishTranslation({ ...spanishTranslation, title: e.target.value })}
              placeholder="Título del artículo en español..."
            />
          </div>

          <div>
            <Label htmlFor="spanish-excerpt">Excerpt (Spanish)</Label>
            <Textarea
              id="spanish-excerpt"
              value={spanishTranslation.excerpt}
              onChange={(e) => setSpanishTranslation({ ...spanishTranslation, excerpt: e.target.value })}
              placeholder="Breve descripción del artículo en español..."
              className="resize-none h-20"
            />
          </div>

          <div>
            <Label htmlFor="spanish-content">Content (Spanish)</Label>
            <Textarea
              id="spanish-content"
              value={spanishTranslation.content}
              onChange={(e) => setSpanishTranslation({ ...spanishTranslation, content: e.target.value })}
              placeholder="Escribe el contenido del artículo en español..."
              className="resize-none h-48"
            />
          </div>

          <div>
            <Label htmlFor="spanish-category">Category (Spanish)</Label>
            <Input
              id="spanish-category"
              value={spanishTranslation.category}
              onChange={(e) => setSpanishTranslation({ ...spanishTranslation, category: e.target.value })}
              placeholder="Categoría en español..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={() => form.handleSubmit(handleSubmit)()}
              disabled={isSubmitting || slugValidation.isValid === false || slugValidation.isChecking || slugValidation.hasError}
            >
              {isSubmitting ? 'Saving...' : post ? 'Update Post & Translation' : 'Create Post & Translation'}
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default BlogPostForm;