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
      horses: {
        Row: {
          age: number | null
          breed: string | null
          competition_level: string | null
          created_at: string | null
          id: string
          name: string
          owner_id: string
          photo_url: string | null
          sex: string | null
          updated_at: string | null
          years_competing: number | null
        }
        Insert: {
          age?: number | null
          breed?: string | null
          competition_level?: string | null
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          photo_url?: string | null
          sex?: string | null
          updated_at?: string | null
          years_competing?: number | null
        }
        Update: {
          age?: number | null
          breed?: string | null
          competition_level?: string | null
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          photo_url?: string | null
          sex?: string | null
          updated_at?: string | null
          years_competing?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          best_score: number | null
          challenges: string | null
          coach_email: string | null
          coach_name: string | null
          competition_level: string | null
          connect_with_coach: boolean | null
          created_at: string | null
          email_reminders: string[] | null
          full_name: string | null
          has_horse: boolean | null
          id: string
          import_results: string | null
          important_statistics: string[] | null
          long_term_goals: string | null
          medium_term_goals: string | null
          notifications: string[] | null
          profile_picture_url: string | null
          region: string | null
          rider_category: string | null
          short_term_goals: string | null
          specific_competitions: string | null
          stable_affiliation: string | null
          tests_ridden: number | null
          training_schedule: string | null
          updated_at: string | null
          want_recommendations: boolean | null
        }
        Insert: {
          best_score?: number | null
          challenges?: string | null
          coach_email?: string | null
          coach_name?: string | null
          competition_level?: string | null
          connect_with_coach?: boolean | null
          created_at?: string | null
          email_reminders?: string[] | null
          full_name?: string | null
          has_horse?: boolean | null
          id: string
          import_results?: string | null
          important_statistics?: string[] | null
          long_term_goals?: string | null
          medium_term_goals?: string | null
          notifications?: string[] | null
          profile_picture_url?: string | null
          region?: string | null
          rider_category?: string | null
          short_term_goals?: string | null
          specific_competitions?: string | null
          stable_affiliation?: string | null
          tests_ridden?: number | null
          training_schedule?: string | null
          updated_at?: string | null
          want_recommendations?: boolean | null
        }
        Update: {
          best_score?: number | null
          challenges?: string | null
          coach_email?: string | null
          coach_name?: string | null
          competition_level?: string | null
          connect_with_coach?: boolean | null
          created_at?: string | null
          email_reminders?: string[] | null
          full_name?: string | null
          has_horse?: boolean | null
          id?: string
          import_results?: string | null
          important_statistics?: string[] | null
          long_term_goals?: string | null
          medium_term_goals?: string | null
          notifications?: string[] | null
          profile_picture_url?: string | null
          region?: string | null
          rider_category?: string | null
          short_term_goals?: string | null
          specific_competitions?: string | null
          stable_affiliation?: string | null
          tests_ridden?: number | null
          training_schedule?: string | null
          updated_at?: string | null
          want_recommendations?: boolean | null
        }
        Relationships: []
      }
      subscription_interests: {
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
      training_focus: {
        Row: {
          created_at: string | null
          id: string
          movements_to_improve: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          movements_to_improve?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          movements_to_improve?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
