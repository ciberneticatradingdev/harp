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
      users: {
        Row: {
          id: string
          wallet_address: string
          username: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          username?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          username?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      scores: {
        Row: {
          id: string
          user_id: string
          score: number
          game_session_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          game_session_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          game_session_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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

// Tipos de conveniencia
export type User = Database['public']['Tables']['users']['Row'];
export type Score = Database['public']['Tables']['scores']['Row'];
export type NewUser = Database['public']['Tables']['users']['Insert'];
export type NewScore = Database['public']['Tables']['scores']['Insert'];

// Tipo para el leaderboard con información del usuario
export interface LeaderboardEntry {
  id: string;
  score: number;
  game_session_id: string;
  created_at: string;
  users: {
    wallet_address: string;
    username: string;
  };
}