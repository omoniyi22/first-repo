import { useState, useEffect } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import MediaSelector from "../media/MediaSelector";
import { updateBlogTranslation } from "@/services/blogService";
import { useToast } from "@/hooks/use-toast";

interface BlogPostFormProps {
  post: BlogPost | null;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

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
        // Keep the Supabase ID if we're editing
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
      toast({
        title: 'Error',
        description: 'Failed to save blog post. Please try again.',
        variant: 'destructive',
      });
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
                      <Input placeholder="Enter URL slug" {...field} />
                    </FormControl>
                    <FormMessage />
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
              <Button type="submit" disabled={isSubmitting}>
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
            <FormLabel htmlFor="spanish-title">Title (Spanish)</FormLabel>
            <Input
              id="spanish-title"
              value={spanishTranslation.title}
              onChange={(e) => setSpanishTranslation({ ...spanishTranslation, title: e.target.value })}
              placeholder="Título del artículo en español..."
            />
          </div>

          <div>
            <FormLabel htmlFor="spanish-excerpt">Excerpt (Spanish)</FormLabel>
            <Textarea
              id="spanish-excerpt"
              value={spanishTranslation.excerpt}
              onChange={(e) => setSpanishTranslation({ ...spanishTranslation, excerpt: e.target.value })}
              placeholder="Breve descripción del artículo en español..."
              className="resize-none h-20"
            />
          </div>

          <div>
            <FormLabel htmlFor="spanish-content">Content (Spanish)</FormLabel>
            <Textarea
              id="spanish-content"
              value={spanishTranslation.content}
              onChange={(e) => setSpanishTranslation({ ...spanishTranslation, content: e.target.value })}
              placeholder="Escribe el contenido del artículo en español..."
              className="resize-none h-48"
            />
          </div>

          <div>
            <FormLabel htmlFor="spanish-category">Category (Spanish)</FormLabel>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : post ? 'Update Post & Translation' : 'Create Post & Translation'}
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default BlogPostForm;
