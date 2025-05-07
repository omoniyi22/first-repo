
import * as z from "zod";

export const blogPostFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().optional(),
  author: z.string().min(1, "Author is required"),
  discipline: z.enum(["Jumping", "Dressage"]),
  category: z.enum(["Technology", "Analytics", "Training", "Guides", "Competition"]),
  slug: z.string().min(1, "Slug is required"),
  image: z.string().min(1, "Image URL is required"),
});

export type BlogFormData = z.infer<typeof blogPostFormSchema>;
