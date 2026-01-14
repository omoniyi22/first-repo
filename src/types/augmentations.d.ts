
import { BlogPost } from "@/data/blogPosts";
import { Event } from "@/services/eventService";

declare module '@/data/blogPosts' {
  interface BlogPost {
    supabaseId?: string;
  }
}

declare module '@/services/eventService' {
  interface Event {
    userId?: string;
  }
}
