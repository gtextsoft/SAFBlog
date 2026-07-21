export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string
          id: string
          role: string | null
          slug: string
          twitter_url: string | null
          linkedin_url: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name: string
          id?: string
          role?: string | null
          slug: string
          twitter_url?: string | null
          linkedin_url?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          role?: string | null
          slug?: string
          twitter_url?: string | null
          linkedin_url?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_name: string
          author_email: string
          body: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_name: string
          author_email: string
          body: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_name?: string
          author_email?: string
          body?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          id: string
          stripe_session_id: string
          amount: number
          currency: string
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          stripe_session_id: string
          amount: number
          currency?: string
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          stripe_session_id?: string
          amount?: number
          currency?: string
          email?: string | null
          created_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          unsubscribed_at: string | null
          confirmed_at: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          source: string | null
          status: string
        }
        Insert: {
          unsubscribed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          source?: string | null
          status?: string
        }
        Update: {
          unsubscribed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          source?: string | null
          status?: string
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          id: string
          subject: string
          body: string
          sent_at: string
          recipient_count: number
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subject: string
          body: string
          sent_at?: string
          recipient_count?: number
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          subject?: string
          body?: string
          sent_at?: string
          recipient_count?: number
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      post_categories: {
        Row: {
          category_id: string
          post_id: string
        }
        Insert: {
          category_id: string
          post_id: string
        }
        Update: {
          category_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          meta_title: string | null
          meta_description: string | null
          focus_keyword: string | null
          og_image_url: string | null
          canonical_url: string | null
          faq: Json
          key_takeaways: string[] | null
          reading_minutes: number | null
          view_count: number
          noindex: boolean
          scheduled_at: string | null
          preview_token: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          meta_title?: string | null
          meta_description?: string | null
          focus_keyword?: string | null
          og_image_url?: string | null
          canonical_url?: string | null
          faq?: Json
          key_takeaways?: string[] | null
          reading_minutes?: number | null
          view_count?: number
          noindex?: boolean
          scheduled_at?: string | null
          preview_token?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          meta_title?: string | null
          meta_description?: string | null
          focus_keyword?: string | null
          og_image_url?: string | null
          canonical_url?: string | null
          faq?: Json
          key_takeaways?: string[] | null
          reading_minutes?: number | null
          view_count?: number
          noindex?: boolean
          scheduled_at?: string | null
          preview_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      // Hand-written to match supabase/migrations/20260720000000_add_promotions.sql.
      // Regenerate this file once that migration is applied and these entries
      // will be replaced by the generated equivalents:
      //   supabase gen types typescript --linked > src/integrations/supabase/types.ts
      promotions: {
        Row: {
          body: string | null
          clicks: number
          created_at: string
          cta_label: string
          ends_at: string | null
          id: string
          image_url: string | null
          impressions: number
          placement: Database["public"]["Enums"]["promotion_placement"]
          priority: number
          sponsor_name: string
          starts_at: string | null
          status: Database["public"]["Enums"]["promotion_status"]
          target_url: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          clicks?: number
          created_at?: string
          cta_label?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          placement?: Database["public"]["Enums"]["promotion_placement"]
          priority?: number
          sponsor_name: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["promotion_status"]
          target_url: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          clicks?: number
          created_at?: string
          cta_label?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          placement?: Database["public"]["Enums"]["promotion_placement"]
          priority?: number
          sponsor_name?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["promotion_status"]
          target_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      newsletter_confirm: {
        Args: { p_email: string; p_secret: string }
        Returns: boolean
      }
      newsletter_ensure_secret: {
        Args: { p_secret: string }
        Returns: undefined
      }
      newsletter_request_resubscribe: {
        Args: {
          p_email: string
          p_full_name: string
          p_source: string
          p_secret: string
        }
        Returns: string
      }
      record_promotion_click: {
        Args: { _promotion_id: string }
        Returns: string
      }
      record_promotion_impression: {
        Args: { _promotion_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
      promotion_placement: "sidebar" | "in_feed" | "in_article"
      promotion_status: "draft" | "active" | "paused" | "ended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "viewer"],
    },
  },
} as const
