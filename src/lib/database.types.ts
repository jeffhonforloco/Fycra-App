export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      thumbnails: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          image_url: string
          prompt: string
          status: 'pending' | 'completed' | 'failed'
          impressions: number
          clicks: number
          ctr: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          image_url?: string
          prompt: string
          status?: 'pending' | 'completed' | 'failed'
          impressions?: number
          clicks?: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          image_url?: string
          prompt?: string
          status?: 'pending' | 'completed' | 'failed'
          impressions?: number
          clicks?: number
        }
      }
      ab_tests: {
        Row: {
          id: string
          user_id: string
          created_at: string
          status: 'running' | 'completed'
          winning_variation_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          status?: 'running' | 'completed'
          winning_variation_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          status?: 'running' | 'completed'
          winning_variation_id?: string | null
        }
      }
      ab_test_variations: {
        Row: {
          id: string
          test_id: string
          thumbnail_id: string
          impressions: number
          clicks: number
        }
        Insert: {
          id?: string
          test_id: string
          thumbnail_id: string
          impressions?: number
          clicks?: number
        }
        Update: {
          id?: string
          test_id?: string
          thumbnail_id?: string
          impressions?: number
          clicks?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      test_status: 'running' | 'completed'
    }
  }
}