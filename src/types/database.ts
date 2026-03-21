// Auto-generate this file by running:
//   npx supabase gen types typescript --project-id rzulxdaiqdqsmckanebd > src/types/database.ts
// after the migration has been applied.
// The types below are hand-written to match the migration and will be
// replaced by the generated version once the schema is live.

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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          visa_route: string
          visa_start_date: string | null
          notifications_120_day: boolean
          notifications_150_day: boolean
          notifications_monthly: boolean
          notifications_ilr_reminder: boolean
          notifications_return_reminder: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          visa_route?: string
          visa_start_date?: string | null
          notifications_120_day?: boolean
          notifications_150_day?: boolean
          notifications_monthly?: boolean
          notifications_ilr_reminder?: boolean
          notifications_return_reminder?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          visa_route?: string
          visa_start_date?: string | null
          notifications_120_day?: boolean
          notifications_150_day?: boolean
          notifications_monthly?: boolean
          notifications_ilr_reminder?: boolean
          notifications_return_reminder?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          destination: string
          departure_date: string
          return_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          destination: string
          departure_date: string
          return_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          destination?: string
          departure_date?: string
          return_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'free' | 'pro_monthly' | 'pro_annual' | 'pro_lifetime'
          status: 'active' | 'canceled' | 'past_due' | 'unpaid'
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro_monthly' | 'pro_annual' | 'pro_lifetime'
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro_monthly' | 'pro_annual' | 'pro_lifetime'
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Trip = Database['public']['Tables']['trips']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type TripInsert = Database['public']['Tables']['trips']['Insert']
export type TripUpdate = Database['public']['Tables']['trips']['Update']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Subscription plan and status as string literals
export type SubscriptionPlan = Subscription['plan']
export type SubscriptionStatus = Subscription['status']
