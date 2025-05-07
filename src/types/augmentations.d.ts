
import { BlogPost } from "@/data/blogPosts";

declare module '@/data/blogPosts' {
  interface BlogPost {
    supabaseId?: string;
  }
}
