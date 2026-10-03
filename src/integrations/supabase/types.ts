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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bill_items: {
        Row: {
          bill_id: string
          created_at: string
          description: string | null
          id: string
          inventory_unit_id: string | null
          line_total: number
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          bill_id: string
          created_at?: string
          description?: string | null
          id?: string
          inventory_unit_id?: string | null
          line_total?: number
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Update: {
          bill_id?: string
          created_at?: string
          description?: string | null
          id?: string
          inventory_unit_id?: string | null
          line_total?: number
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_items_inventory_unit_id_fkey"
            columns: ["inventory_unit_id"]
            isOneToOne: false
            referencedRelation: "inventory_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          advance_paid: number
          bill_number: string | null
          created_at: string
          created_by: string | null
          customer_name: string | null
          customer_phone: string | null
          discount: number
          grand_total: number
          id: string
          payment_method: string | null
          reservation_id: string | null
          status: string
          subtotal: number
          tax: number
          updated_at: string
        }
        Insert: {
          advance_paid?: number
          bill_number?: string | null
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number
          grand_total?: number
          id?: string
          payment_method?: string | null
          reservation_id?: string | null
          status?: string
          subtotal?: number
          tax?: number
          updated_at?: string
        }
        Update: {
          advance_paid?: number
          bill_number?: string | null
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number
          grand_total?: number
          id?: string
          payment_method?: string | null
          reservation_id?: string | null
          status?: string
          subtotal?: number
          tax?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_featured: boolean
          is_visible: boolean
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_units: {
        Row: {
          cost_price: number | null
          created_at: string
          id: string
          imei: string | null
          imei2: string | null
          notes: string | null
          product_id: string
          purchase_date: string | null
          serial: string | null
          sold_at: string | null
          status: string
          supplier: string | null
          updated_at: string
          warranty_until: string | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          id?: string
          imei?: string | null
          imei2?: string | null
          notes?: string | null
          product_id: string
          purchase_date?: string | null
          serial?: string | null
          sold_at?: string | null
          status?: string
          supplier?: string | null
          updated_at?: string
          warranty_until?: string | null
        }
        Update: {
          cost_price?: number | null
          created_at?: string
          id?: string
          imei?: string | null
          imei2?: string | null
          notes?: string | null
          product_id?: string
          purchase_date?: string | null
          serial?: string | null
          sold_at?: string | null
          status?: string
          supplier?: string | null
          updated_at?: string
          warranty_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_units_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_primary: boolean
          original_url: string | null
          process_error: string | null
          process_status: string | null
          processed_at: string | null
          product_id: string
          url: string
          white_bg_error: string | null
          white_bg_processed_at: string | null
          white_bg_status: string | null
          white_bg_url: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          original_url?: string | null
          process_error?: string | null
          process_status?: string | null
          processed_at?: string | null
          product_id: string
          url: string
          white_bg_error?: string | null
          white_bg_processed_at?: string | null
          white_bg_status?: string | null
          white_bg_url?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          original_url?: string | null
          process_error?: string | null
          process_status?: string | null
          processed_at?: string | null
          product_id?: string
          url?: string
          white_bg_error?: string | null
          white_bg_processed_at?: string | null
          white_bg_status?: string | null
          white_bg_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category: string | null
          color: string | null
          condition: string
          created_at: string
          description: string | null
          id: string
          is_deleted: boolean
          is_featured: boolean
          is_listed: boolean
          model: string | null
          name: string
          ram: string | null
          selling_price: number
          slug: string
          storage: string | null
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          category?: string | null
          color?: string | null
          condition?: string
          created_at?: string
          description?: string | null
          id?: string
          is_deleted?: boolean
          is_featured?: boolean
          is_listed?: boolean
          model?: string | null
          name: string
          ram?: string | null
          selling_price?: number
          slug: string
          storage?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          category?: string | null
          color?: string | null
          condition?: string
          created_at?: string
          description?: string | null
          id?: string
          is_deleted?: boolean
          is_featured?: boolean
          is_listed?: boolean
          model?: string | null
          name?: string
          ram?: string | null
          selling_price?: number
          slug?: string
          storage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_banners: {
        Row: {
          button_link: string | null
          button_text: string | null
          created_at: string
          display_order: number
          heading: string | null
          id: string
          image_path: string
          is_active: boolean
          subheading: string | null
          updated_at: string
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          display_order?: number
          heading?: string | null
          id?: string
          image_path: string
          is_active?: boolean
          subheading?: string | null
          updated_at?: string
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          display_order?: number
          heading?: string | null
          id?: string
          image_path?: string
          is_active?: boolean
          subheading?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservation_events: {
        Row: {
          actor: string
          created_at: string
          event_type: string
          id: string
          new_status: string | null
          payload: Json | null
          payload_hash: string | null
          prev_status: string | null
          reservation_id: string | null
        }
        Insert: {
          actor?: string
          created_at?: string
          event_type: string
          id?: string
          new_status?: string | null
          payload?: Json | null
          payload_hash?: string | null
          prev_status?: string | null
          reservation_id?: string | null
        }
        Update: {
          actor?: string
          created_at?: string
          event_type?: string
          id?: string
          new_status?: string | null
          payload?: Json | null
          payload_hash?: string | null
          prev_status?: string | null
          reservation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservation_events_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          balance_due: number
          cancelled_at: string | null
          confirmed_at: string | null
          converted_at: string | null
          converted_bill_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          hold_expires_at: string
          id: string
          inventory_unit_id: string
          ip_address: string | null
          product_id: string
          product_price: number
          public_token: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          refund_amount: number
          refund_id: string | null
          refund_reason: string | null
          refunded_at: string | null
          reservation_amount: number
          reservation_expires_at: string | null
          reservation_number: string | null
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          balance_due: number
          cancelled_at?: string | null
          confirmed_at?: string | null
          converted_at?: string | null
          converted_bill_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          hold_expires_at?: string
          id?: string
          inventory_unit_id: string
          ip_address?: string | null
          product_id: string
          product_price: number
          public_token?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_amount?: number
          refund_id?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          reservation_amount: number
          reservation_expires_at?: string | null
          reservation_number?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          balance_due?: number
          cancelled_at?: string | null
          confirmed_at?: string | null
          converted_at?: string | null
          converted_bill_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          hold_expires_at?: string
          id?: string
          inventory_unit_id?: string
          ip_address?: string | null
          product_id?: string
          product_price?: number
          public_token?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_amount?: number
          refund_id?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          reservation_amount?: number
          reservation_expires_at?: string | null
          reservation_number?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_converted_bill_id_fkey"
            columns: ["converted_bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_inventory_unit_id_fkey"
            columns: ["inventory_unit_id"]
            isOneToOne: false
            referencedRelation: "inventory_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      product_available_counts: {
        Row: {
          available_count: number | null
          product_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_units_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      attach_razorpay_order: {
        Args: { _razorpay_order_id: string; _reservation_id: string }
        Returns: undefined
      }
      calc_reservation_amount: { Args: { _price: number }; Returns: number }
      check_refund_eligibility: {
        Args: { _reservation_id: string }
        Returns: {
          amount: number
          eligible: boolean
          percent: number
          reason: string
        }[]
      }
      confirm_reservation: {
        Args: {
          _razorpay_order_id: string
          _razorpay_payment_id: string
          _razorpay_signature: string
          _reservation_id: string
        }
        Returns: {
          balance_due: number
          cancelled_at: string | null
          confirmed_at: string | null
          converted_at: string | null
          converted_bill_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          hold_expires_at: string
          id: string
          inventory_unit_id: string
          ip_address: string | null
          product_id: string
          product_price: number
          public_token: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          refund_amount: number
          refund_id: string | null
          refund_reason: string | null
          refunded_at: string | null
          reservation_amount: number
          reservation_expires_at: string | null
          reservation_number: string | null
          status: string
          updated_at: string
          user_agent: string | null
        }
        SetofOptions: {
          from: "*"
          to: "reservations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      convert_reservation_to_sale: {
        Args: {
          _discount?: number
          _payment_method: string
          _reservation_id: string
          _tax?: number
        }
        Returns: {
          advance_paid: number
          bill_number: string | null
          created_at: string
          created_by: string | null
          customer_name: string | null
          customer_phone: string | null
          discount: number
          grand_total: number
          id: string
          payment_method: string | null
          reservation_id: string | null
          status: string
          subtotal: number
          tax: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "bills"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_reservation_hold: {
        Args: {
          _customer_email: string
          _customer_name: string
          _customer_phone: string
          _inventory_unit_id: string
          _ip?: string
          _user_agent?: string
        }
        Returns: {
          balance_due: number
          cancelled_at: string | null
          confirmed_at: string | null
          converted_at: string | null
          converted_bill_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          hold_expires_at: string
          id: string
          inventory_unit_id: string
          ip_address: string | null
          product_id: string
          product_price: number
          public_token: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          refund_amount: number
          refund_id: string | null
          refund_reason: string | null
          refunded_at: string | null
          reservation_amount: number
          reservation_expires_at: string | null
          reservation_number: string | null
          status: string
          updated_at: string
          user_agent: string | null
        }
        SetofOptions: {
          from: "*"
          to: "reservations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      expire_stale_reservations: {
        Args: never
        Returns: {
          expired_confirmed: number
          expired_pending: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      record_reservation_cancellation: {
        Args: {
          _actor?: string
          _reason: string
          _refund_amount: number
          _refund_id: string
          _reservation_id: string
        }
        Returns: {
          balance_due: number
          cancelled_at: string | null
          confirmed_at: string | null
          converted_at: string | null
          converted_bill_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          hold_expires_at: string
          id: string
          inventory_unit_id: string
          ip_address: string | null
          product_id: string
          product_price: number
          public_token: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          refund_amount: number
          refund_id: string | null
          refund_reason: string | null
          refunded_at: string | null
          reservation_amount: number
          reservation_expires_at: string | null
          reservation_number: string | null
          status: string
          updated_at: string
          user_agent: string | null
        }
        SetofOptions: {
          from: "*"
          to: "reservations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "staff"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "staff"],
    },
  },
} as const
