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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      allowed_cities: {
        Row: {
          created_at: string | null
          delivery_price: number | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          delivery_price?: number | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          delivery_price?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          message: string
          show_on_all_pages: boolean | null
          sort_order: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          message: string
          show_on_all_pages?: boolean | null
          sort_order?: number | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          message?: string
          show_on_all_pages?: boolean | null
          sort_order?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_8cb156cd99_app_settings: {
        Row: {
          app_is_open: boolean | null
          closing_message: string | null
          closing_time: string | null
          id: string
          maintenance_mode: boolean | null
          opening_message: string | null
          opening_time: string | null
          updated_at: string | null
          welcome_screen_image: string | null
        }
        Insert: {
          app_is_open?: boolean | null
          closing_message?: string | null
          closing_time?: string | null
          id?: string
          maintenance_mode?: boolean | null
          opening_message?: string | null
          opening_time?: string | null
          updated_at?: string | null
          welcome_screen_image?: string | null
        }
        Update: {
          app_is_open?: boolean | null
          closing_message?: string | null
          closing_time?: string | null
          id?: string
          maintenance_mode?: boolean | null
          opening_message?: string | null
          opening_time?: string | null
          updated_at?: string | null
          welcome_screen_image?: string | null
        }
        Relationships: []
      }
      app_8cb156cd99_areas: {
        Row: {
          city_id: string | null
          coordinates: string | null
          created_at: string | null
          delivery_price: number
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          city_id?: string | null
          coordinates?: string | null
          created_at?: string | null
          delivery_price?: number
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          city_id?: string | null
          coordinates?: string | null
          created_at?: string | null
          delivery_price?: number
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_8cb156cd99_areas_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "app_8cb156cd99_cities"
            referencedColumns: ["id"]
          },
        ]
      }
      app_8cb156cd99_categories: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          sort_order: number | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_8cb156cd99_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "app_8cb156cd99_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      app_8cb156cd99_cities: {
        Row: {
          created_at: string | null
          delivery_base_price: number | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          delivery_base_price?: number | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          delivery_base_price?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      app_8cb156cd99_offers: {
        Row: {
          applicable_categories: string[] | null
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          min_order_amount: number | null
          title: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          applicable_categories?: string[] | null
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_order_amount?: number | null
          title: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          applicable_categories?: string[] | null
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_order_amount?: number | null
          title?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      app_8cb156cd99_order_items: {
        Row: {
          category_name: string | null
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          product_name: string
          product_size_name: string | null
          quantity: number
          unit_price: number
          whatsapp_number: string | null
        }
        Insert: {
          category_name?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name: string
          product_size_name?: string | null
          quantity?: number
          unit_price: number
          whatsapp_number?: string | null
        }
        Update: {
          category_name?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          product_size_name?: string | null
          quantity?: number
          unit_price?: number
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_8cb156cd99_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "app_8cb156cd99_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_8cb156cd99_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "app_8cb156cd99_products"
            referencedColumns: ["id"]
          },
        ]
      }
      app_8cb156cd99_orders: {
        Row: {
          area_id: string | null
          city_id: string | null
          created_at: string | null
          delivery_fee: number
          id: string
          notes: string | null
          order_number: string
          shared_order_id: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_address: string | null
          user_location_lat: number | null
          user_location_lng: number | null
          user_name: string
          user_phone: string
          whatsapp_sent: boolean | null
        }
        Insert: {
          area_id?: string | null
          city_id?: string | null
          created_at?: string | null
          delivery_fee?: number
          id?: string
          notes?: string | null
          order_number: string
          shared_order_id?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_address?: string | null
          user_location_lat?: number | null
          user_location_lng?: number | null
          user_name: string
          user_phone: string
          whatsapp_sent?: boolean | null
        }
        Update: {
          area_id?: string | null
          city_id?: string | null
          created_at?: string | null
          delivery_fee?: number
          id?: string
          notes?: string | null
          order_number?: string
          shared_order_id?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_address?: string | null
          user_location_lat?: number | null
          user_location_lng?: number | null
          user_name?: string
          user_phone?: string
          whatsapp_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "app_8cb156cd99_orders_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "app_8cb156cd99_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_8cb156cd99_orders_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "app_8cb156cd99_cities"
            referencedColumns: ["id"]
          },
        ]
      }
      app_8cb156cd99_product_sizes: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          price: number
          product_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          price: number
          product_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          price?: number
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_8cb156cd99_product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "app_8cb156cd99_products"
            referencedColumns: ["id"]
          },
        ]
      }
      app_8cb156cd99_products: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          mood_tags: string[] | null
          name: string
          sort_order: number | null
          tags: string[] | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          mood_tags?: string[] | null
          name: string
          sort_order?: number | null
          tags?: string[] | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          mood_tags?: string[] | null
          name?: string
          sort_order?: number | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "app_8cb156cd99_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "app_8cb156cd99_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      app_8cb156cd99_shared_orders: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          main_order_id: string | null
          shared_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          main_order_id?: string | null
          shared_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          main_order_id?: string | null
          shared_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_8cb156cd99_shared_orders_main_order_id_fkey"
            columns: ["main_order_id"]
            isOneToOne: false
            referencedRelation: "app_8cb156cd99_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      app_8cb156cd99_statistics: {
        Row: {
          category_id: string | null
          created_at: string | null
          date: string
          delivery_profits: number | null
          id: string
          total_orders: number | null
          total_revenue: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          date: string
          delivery_profits?: number | null
          id?: string
          total_orders?: number | null
          total_revenue?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          date?: string
          delivery_profits?: number | null
          id?: string
          total_orders?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "app_8cb156cd99_statistics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "app_8cb156cd99_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      app_8cb156cd99_user_sessions: {
        Row: {
          cart_data: Json | null
          created_at: string | null
          favorites_products: string[] | null
          id: string
          last_activity: string | null
          session_id: string
          user_location: Json | null
        }
        Insert: {
          cart_data?: Json | null
          created_at?: string | null
          favorites_products?: string[] | null
          id?: string
          last_activity?: string | null
          session_id: string
          user_location?: Json | null
        }
        Update: {
          cart_data?: Json | null
          created_at?: string | null
          favorites_products?: string[] | null
          id?: string
          last_activity?: string | null
          session_id?: string
          user_location?: Json | null
        }
        Relationships: []
      }
      app_8cb156cd99_voice_orders: {
        Row: {
          audio_transcript: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          processed_items: Json | null
          session_id: string | null
          status: string | null
        }
        Insert: {
          audio_transcript?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          processed_items?: Json | null
          session_id?: string | null
          status?: string | null
        }
        Update: {
          audio_transcript?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          processed_items?: Json | null
          session_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      app_8cb156cd99_working_hours: {
        Row: {
          category_id: string | null
          close_time: string | null
          created_at: string | null
          day_of_week: number
          id: string
          is_closed: boolean | null
          open_time: string | null
        }
        Insert: {
          category_id?: string | null
          close_time?: string | null
          created_at?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          open_time?: string | null
        }
        Update: {
          category_id?: string | null
          close_time?: string | null
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          open_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_8cb156cd99_working_hours_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "app_8cb156cd99_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      districts: {
        Row: {
          created_at: string | null
          default_delivery_fee: number | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          name_en: string | null
          sort_order: number | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string | null
          default_delivery_fee?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          name_en?: string | null
          sort_order?: number | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string | null
          default_delivery_fee?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_en?: string | null
          sort_order?: number | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      group_orders: {
        Row: {
          created_at: string
          creator_user_id: string
          current_amount: number | null
          expires_at: string | null
          id: string
          name: string
          participants: Json | null
          status: string | null
          sub_category_id: string | null
          target_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_user_id: string
          current_amount?: number | null
          expires_at?: string | null
          id?: string
          name: string
          participants?: Json | null
          status?: string | null
          sub_category_id?: string | null
          target_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_user_id?: string
          current_amount?: number | null
          expires_at?: string | null
          id?: string
          name?: string
          participants?: Json | null
          status?: string | null
          sub_category_id?: string | null
          target_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_orders_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "order_statistics"
            referencedColumns: ["sub_category_id"]
          },
          {
            foreignKeyName: "group_orders_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "sub_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points: {
        Row: {
          created_at: string
          id: string
          level: string
          points: number
          total_orders: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string
          points?: number
          total_orders?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          points?: number
          total_orders?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      main_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      mood_suggestions: {
        Row: {
          created_at: string
          id: string
          items: Json
          mood: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          mood: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          mood?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          message: string
          scheduled_for: string | null
          sent_at: string | null
          sent_count: number | null
          sound: string | null
          status: string | null
          target_audience: string | null
          target_criteria: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          message: string
          scheduled_for?: string | null
          sent_at?: string | null
          sent_count?: number | null
          sound?: string | null
          status?: string | null
          target_audience?: string | null
          target_criteria?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          message?: string
          scheduled_for?: string | null
          sent_at?: string | null
          sent_count?: number | null
          sound?: string | null
          status?: string | null
          target_audience?: string | null
          target_criteria?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          original_price: number | null
          price: number | null
          product_id: string | null
          title: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          original_price?: number | null
          price?: number | null
          product_id?: string | null
          title: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          original_price?: number | null
          price?: number | null
          product_id?: string | null
          title?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_city: string
          customer_latitude: number | null
          customer_location: string | null
          customer_longitude: number | null
          customer_name: string
          customer_phone: string
          delivery_fee: number
          district_id: string | null
          district_name: string | null
          id: string
          items: Json
          order_number: number
          platform_fee: number | null
          shared_code: string | null
          status: string | null
          sub_category_id: string | null
          total_amount: number
          village_id: string | null
          village_name: string | null
          whatsapp_sent: boolean | null
        }
        Insert: {
          created_at?: string | null
          customer_city: string
          customer_latitude?: number | null
          customer_location?: string | null
          customer_longitude?: number | null
          customer_name: string
          customer_phone: string
          delivery_fee: number
          district_id?: string | null
          district_name?: string | null
          id?: string
          items: Json
          order_number?: number
          platform_fee?: number | null
          shared_code?: string | null
          status?: string | null
          sub_category_id?: string | null
          total_amount: number
          village_id?: string | null
          village_name?: string | null
          whatsapp_sent?: boolean | null
        }
        Update: {
          created_at?: string | null
          customer_city?: string
          customer_latitude?: number | null
          customer_location?: string | null
          customer_longitude?: number | null
          customer_name?: string
          customer_phone?: string
          delivery_fee?: number
          district_id?: string | null
          district_name?: string | null
          id?: string
          items?: Json
          order_number?: number
          platform_fee?: number | null
          shared_code?: string | null
          status?: string | null
          sub_category_id?: string | null
          total_amount?: number
          village_id?: string | null
          village_name?: string | null
          whatsapp_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "order_statistics"
            referencedColumns: ["sub_category_id"]
          },
          {
            foreignKeyName: "orders_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "sub_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      points_history: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allergens: Json | null
          average_rating: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          nutritional_info: Json | null
          price: number
          review_count: number | null
          sizes: Json | null
          sizes_and_prices: Json
          sort_order: number | null
          sub_category_id: string | null
          tags: Json | null
        }
        Insert: {
          allergens?: Json | null
          average_rating?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          nutritional_info?: Json | null
          price: number
          review_count?: number | null
          sizes?: Json | null
          sizes_and_prices?: Json
          sort_order?: number | null
          sub_category_id?: string | null
          tags?: Json | null
        }
        Update: {
          allergens?: Json | null
          average_rating?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          nutritional_info?: Json | null
          price?: number
          review_count?: number | null
          sizes?: Json | null
          sizes_and_prices?: Json
          sort_order?: number | null
          sub_category_id?: string | null
          tags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "order_statistics"
            referencedColumns: ["sub_category_id"]
          },
          {
            foreignKeyName: "products_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "sub_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          images: Json | null
          product_id: string | null
          rating: number
          sub_category_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          images?: Json | null
          product_id?: string | null
          rating: number
          sub_category_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          images?: Json | null
          product_id?: string | null
          rating?: number
          sub_category_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "order_statistics"
            referencedColumns: ["sub_category_id"]
          },
          {
            foreignKeyName: "reviews_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "sub_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_categories: {
        Row: {
          average_rating: number | null
          close_time: string | null
          created_at: string | null
          cuisine_type: string | null
          delivery_fee: number | null
          delivery_time_max: number | null
          delivery_time_min: number | null
          description: string | null
          district_id: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_open: boolean | null
          is_temporarily_closed: boolean
          main_category_id: string | null
          minimum_order: number | null
          name: string
          open_time: string | null
          password: string | null
          payment_methods: Json | null
          review_count: number | null
          sort_order: number | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          average_rating?: number | null
          close_time?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          delivery_fee?: number | null
          delivery_time_max?: number | null
          delivery_time_min?: number | null
          description?: string | null
          district_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_open?: boolean | null
          is_temporarily_closed?: boolean
          main_category_id?: string | null
          minimum_order?: number | null
          name: string
          open_time?: string | null
          password?: string | null
          payment_methods?: Json | null
          review_count?: number | null
          sort_order?: number | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          average_rating?: number | null
          close_time?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          delivery_fee?: number | null
          delivery_time_max?: number | null
          delivery_time_min?: number | null
          description?: string | null
          district_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_open?: boolean | null
          is_temporarily_closed?: boolean
          main_category_id?: string | null
          minimum_order?: number | null
          name?: string
          open_time?: string | null
          password?: string | null
          payment_methods?: Json | null
          review_count?: number | null
          sort_order?: number | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_categories_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sub_categories_main_category_id_fkey"
            columns: ["main_category_id"]
            isOneToOne: false
            referencedRelation: "main_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_devices: {
        Row: {
          created_at: string
          device_info: Json | null
          device_type: string | null
          fcm_token: string
          id: string
          is_active: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          device_type?: string | null
          fcm_token: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          device_type?: string | null
          fcm_token?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          is_quick_order: boolean
          item_data: Json
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_quick_order?: boolean
          item_data: Json
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_quick_order?: boolean
          item_data?: Json
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_user_id: string
          following_user_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_user_id: string
          following_user_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_user_id?: string
          following_user_id?: string
          id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          dietary_preferences: Json | null
          favorite_categories: Json | null
          favorite_products: Json | null
          favorite_sub_categories: Json | null
          id: string
          price_range: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dietary_preferences?: Json | null
          favorite_categories?: Json | null
          favorite_products?: Json | null
          favorite_sub_categories?: Json | null
          id?: string
          price_range?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dietary_preferences?: Json | null
          favorite_categories?: Json | null
          favorite_products?: Json | null
          favorite_sub_categories?: Json | null
          id?: string
          price_range?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      villages: {
        Row: {
          created_at: string | null
          delivery_fee: number
          district_id: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          name_en: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_fee?: number
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          name_en?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_fee?: number
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_en?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "villages_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          is_public: boolean | null
          items: Json | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          items?: Json | null
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          items?: Json | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      order_statistics: {
        Row: {
          orders_sent_count: number | null
          sub_category_id: string | null
          sub_category_name: string | null
          total_delivery_revenue: number | null
          whatsapp_number: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_old_orders: { Args: never; Returns: undefined }
      generate_shared_code: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
