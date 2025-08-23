import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key-here'

// Temporary fallback for development
if (!process.env.REACT_APP_SUPABASE_URL) {
  console.warn('⚠️ Supabase URL not configured. Using mock configuration for development.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          media_urls: string[] | null
          location: string | null
          hashtags: string[] | null
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          media_urls?: string[] | null
          location?: string | null
          hashtags?: string[] | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          media_urls?: string[] | null
          location?: string | null
          hashtags?: string[] | null
          likes_count?: number
          comments_count?: number
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          organizer_id: string
          title: string
          description: string
          location: string
          date: string
          time: string
          max_attendees: number | null
          current_attendees: number
          requires_verification: boolean
          verification_questions: any | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          title: string
          description: string
          location: string
          date: string
          time: string
          max_attendees?: number | null
          current_attendees?: number
          requires_verification?: boolean
          verification_questions?: any | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          location?: string
          date?: string
          time?: string
          max_attendees?: number | null
          current_attendees?: number
          requires_verification?: boolean
          verification_questions?: any | null
          image_url?: string | null
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string | null
          room_id: string | null
          content: string
          message_type: 'text' | 'image' | 'file'
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id?: string | null
          room_id?: string | null
          content: string
          message_type?: 'text' | 'image' | 'file'
          file_url?: string | null
          created_at?: string
        }
        Update: {
          content?: string
          message_type?: 'text' | 'image' | 'file'
          file_url?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: any | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: any | null
          read?: boolean
          created_at?: string
        }
        Update: {
          read?: boolean
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
