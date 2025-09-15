import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// For server-side operations
export const createServerClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone_number: string
          telegram_id: number | null
          name: string
          email: string | null
          role: 'customer' | 'waiter' | 'chef' | 'delivery' | 'operation_manager' | 'admin' | 'owner'
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          last_login: string | null
          permissions: string[]
        }
        Insert: {
          id?: string
          phone_number: string
          telegram_id?: number | null
          name: string
          email?: string | null
          role?: 'customer' | 'waiter' | 'chef' | 'delivery' | 'operation_manager' | 'admin' | 'owner'
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
          permissions?: string[]
        }
        Update: {
          id?: string
          phone_number?: string
          telegram_id?: number | null
          name?: string
          email?: string | null
          role?: 'customer' | 'waiter' | 'chef' | 'delivery' | 'operation_manager' | 'admin' | 'owner'
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
          permissions?: string[]
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          category_id: string | null
          image_url: string | null
          prep_time: number
          calories: number | null
          is_vegetarian: boolean
          is_spicy: boolean
          is_popular: boolean
          is_available: boolean
          ingredients: string[]
          allergens: string[]
          tags: string[]
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          category_id?: string | null
          image_url?: string | null
          prep_time?: number
          calories?: number | null
          is_vegetarian?: boolean
          is_spicy?: boolean
          is_popular?: boolean
          is_available?: boolean
          ingredients?: string[]
          allergens?: string[]
          tags?: string[]
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          category_id?: string | null
          image_url?: string | null
          prep_time?: number
          calories?: number | null
          is_vegetarian?: boolean
          is_spicy?: boolean
          is_popular?: boolean
          is_available?: boolean
          ingredients?: string[]
          allergens?: string[]
          tags?: string[]
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          customer_email: string | null
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
          order_type: 'delivery' | 'pickup' | 'dine_in'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method: string | null
          subtotal: number
          delivery_fee: number
          service_fee: number
          total: number
          delivery_address: string | null
          delivery_landmark: string | null
          special_instructions: string | null
          estimated_delivery_time: string | null
          actual_delivery_time: string | null
          assigned_waiter_id: string | null
          assigned_chef_id: string | null
          assigned_driver_id: string | null
          table_number: number | null
          restaurant_branch: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
          order_type?: 'delivery' | 'pickup' | 'dine_in'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          subtotal: number
          delivery_fee?: number
          service_fee?: number
          total: number
          delivery_address?: string | null
          delivery_landmark?: string | null
          special_instructions?: string | null
          estimated_delivery_time?: string | null
          actual_delivery_time?: string | null
          assigned_waiter_id?: string | null
          assigned_chef_id?: string | null
          assigned_driver_id?: string | null
          table_number?: number | null
          restaurant_branch?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
          order_type?: 'delivery' | 'pickup' | 'dine_in'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          subtotal?: number
          delivery_fee?: number
          service_fee?: number
          total?: number
          delivery_address?: string | null
          delivery_landmark?: string | null
          special_instructions?: string | null
          estimated_delivery_time?: string | null
          actual_delivery_time?: string | null
          assigned_waiter_id?: string | null
          assigned_chef_id?: string | null
          assigned_driver_id?: string | null
          table_number?: number | null
          restaurant_branch?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string | null
          menu_item_name: string
          quantity: number
          unit_price: number
          total_price: number
          customizations: string[]
          special_instructions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id?: string | null
          menu_item_name: string
          quantity?: number
          unit_price: number
          total_price: number
          customizations?: string[]
          special_instructions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string | null
          menu_item_name?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          customizations?: string[]
          special_instructions?: string | null
          created_at?: string
        }
      }
      // Add other table types as needed
    }
  }
}
