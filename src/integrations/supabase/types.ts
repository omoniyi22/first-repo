export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analysis_results: {
        Row: {
          created_at: string
          document_id: string
          id: string
          result_json: Json
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          result_json: Json
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          result_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string
          author_image: string | null
          category: string
          content: string | null
          created_at: string
          date: string
          discipline: string
          excerpt: string
          id: string
          image: string
          reading_time: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          author_image?: string | null
          category: string
          content?: string | null
          created_at?: string
          date?: string
          discipline: string
          excerpt: string
          id?: string
          image: string
          reading_time?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          author_image?: string | null
          category?: string
          content?: string | null
          created_at?: string
          date?: string
          discipline?: string
          excerpt?: string
          id?: string
          image?: string
          reading_time?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_translations: {
        Row: {
          blog_id: string
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          language: string
          title: string | null
          updated_at: string
        }
        Insert: {
          blog_id: string
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          language: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          blog_id?: string
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          language?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_translations_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      document_analysis: {
        Row: {
          competition_type: string | null
          created_at: string
          discipline: string
          document_date: string
          document_url: string
          file_name: string
          file_type: string
          horse_id: string
          horse_name: string
          id: string
          notes: string | null
          status: string
          tags: string[] | null
          test_level: string | null
          updated_at: string
          user_country: string | null
          user_governing_body: string | null
          user_id: string
          video_type: string | null
        }
        Insert: {
          competition_type?: string | null
          created_at?: string
          discipline: string
          document_date: string
          document_url: string
          file_name: string
          file_type: string
          horse_id: string
          horse_name: string
          id?: string
          notes?: string | null
          status?: string
          tags?: string[] | null
          test_level?: string | null
          updated_at?: string
          user_country?: string | null
          user_governing_body?: string | null
          user_id: string
          video_type?: string | null
        }
        Update: {
          competition_type?: string | null
          created_at?: string
          discipline?: string
          document_date?: string
          document_url?: string
          file_name?: string
          file_type?: string
          horse_id?: string
          horse_name?: string
          id?: string
          notes?: string | null
          status?: string
          tags?: string[] | null
          test_level?: string | null
          updated_at?: string
          user_country?: string | null
          user_governing_body?: string | null
          user_id?: string
          video_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_document_analysis_horse"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          discipline: string
          event_date: string
          event_type: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discipline: string
          event_date: string
          event_type: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discipline?: string
          event_date?: string
          event_type?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          goal_text: string
          goal_type: string
          id: string
          progress: number
          target_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_text: string
          goal_type: string
          id?: string
          progress?: number
          target_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_text?: string
          goal_type?: string
          id?: string
          progress?: number
          target_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      horses: {
        Row: {
          age: number
          breed: string
          competition_level: string | null
          created_at: string
          dressage_level: string | null
          dressage_type: string | null
          id: string
          jumping_level: string | null
          name: string
          photo_url: string | null
          sex: string
          special_notes: string | null
          strengths: string | null
          updated_at: string
          user_id: string
          weaknesses: string | null
          years_owned: number | null
        }
        Insert: {
          age: number
          breed: string
          competition_level?: string | null
          created_at?: string
          dressage_level?: string | null
          dressage_type?: string | null
          id?: string
          jumping_level?: string | null
          name: string
          photo_url?: string | null
          sex: string
          special_notes?: string | null
          strengths?: string | null
          updated_at?: string
          user_id: string
          weaknesses?: string | null
          years_owned?: number | null
        }
        Update: {
          age?: number
          breed?: string
          competition_level?: string | null
          created_at?: string
          dressage_level?: string | null
          dressage_type?: string | null
          id?: string
          jumping_level?: string | null
          name?: string
          photo_url?: string | null
          sex?: string
          special_notes?: string | null
          strengths?: string | null
          updated_at?: string
          user_id?: string
          weaknesses?: string | null
          years_owned?: number | null
        }
        Relationships: []
      }
      media_items: {
        Row: {
          cloudinary_id: string | null
          created_at: string
          file_size: number
          file_type: string
          height: number | null
          id: string
          name: string
          original_name: string
          updated_at: string
          url: string
          user_id: string
          width: number | null
        }
        Insert: {
          cloudinary_id?: string | null
          created_at?: string
          file_size: number
          file_type: string
          height?: number | null
          id?: string
          name: string
          original_name: string
          updated_at?: string
          url: string
          user_id: string
          width?: number | null
        }
        Update: {
          cloudinary_id?: string | null
          created_at?: string
          file_size?: number
          file_type?: string
          height?: number | null
          id?: string
          name?: string
          original_name?: string
          updated_at?: string
          url?: string
          user_id?: string
          width?: number | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      pricing_features: {
        Row: {
          created_at: string
          display_order: number
          id: string
          included: boolean
          plan_id: string
          text_en: string
          text_es: string
        }
        Insert: {
          created_at?: string
          display_order: number
          id?: string
          included?: boolean
          plan_id: string
          text_en: string
          text_es: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          included?: boolean
          plan_id?: string
          text_en?: string
          text_es?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          annual_price: number
          button_text_en: string
          button_text_es: string
          created_at: string
          id: string
          is_highlighted: boolean | null
          monthly_price: number
          name: string
          tagline_en: string
          tagline_es: string
          updated_at: string
        }
        Insert: {
          annual_price: number
          button_text_en?: string
          button_text_es?: string
          created_at?: string
          id?: string
          is_highlighted?: boolean | null
          monthly_price: number
          name: string
          tagline_en: string
          tagline_es: string
          updated_at?: string
        }
        Update: {
          annual_price?: number
          button_text_en?: string
          button_text_es?: string
          created_at?: string
          id?: string
          is_highlighted?: boolean | null
          monthly_price?: number
          name?: string
          tagline_en?: string
          tagline_es?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          coach_name: string | null
          created_at: string | null
          discipline: string | null
          display_name: string | null
          governing_body: string | null
          id: string
          profile_picture_url: string | null
          region: string | null
          rider_category: string | null
          stable_affiliation: string | null
          updated_at: string | null
        }
        Insert: {
          coach_name?: string | null
          created_at?: string | null
          discipline?: string | null
          display_name?: string | null
          governing_body?: string | null
          id: string
          profile_picture_url?: string | null
          region?: string | null
          rider_category?: string | null
          stable_affiliation?: string | null
          updated_at?: string | null
        }
        Update: {
          coach_name?: string | null
          created_at?: string | null
          discipline?: string | null
          display_name?: string | null
          governing_body?: string | null
          id?: string
          profile_picture_url?: string | null
          region?: string | null
          rider_category?: string | null
          stable_affiliation?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          analysis_id: string
          created_at: string
          focus_area: string | null
          id: string
          priority: number | null
          recommendation_text: string
        }
        Insert: {
          analysis_id: string
          created_at?: string
          focus_area?: string | null
          id?: string
          priority?: number | null
          recommendation_text: string
        }
        Update: {
          analysis_id?: string
          created_at?: string
          focus_area?: string | null
          id?: string
          priority?: number | null
          recommendation_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analysis_results"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      set_admin_role: {
        Args: { email_address: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
