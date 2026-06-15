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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_items: {
        Row: {
          bill_id: string
          created_at: string
          id: string
          inventory_unit_id: string | null
          product_id: string | null
          quantity: number
          snapshot_brand_name: string | null
          snapshot_color: string | null
          snapshot_condition: string | null
          snapshot_imei: string | null
          snapshot_product_name: string
          snapshot_storage: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          bill_id: string
          created_at?: string
          id?: string
          inventory_unit_id?: string | null
          product_id?: string | null
          quantity?: number
          snapshot_brand_name?: string | null
          snapshot_color?: string | null
          snapshot_condition?: string | null
          snapshot_imei?: string | null
          snapshot_product_name: string
          snapshot_storage?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          bill_id?: string
          created_at?: string
          id?: string
          inventory_unit_id?: string | null
          product_id?: string | null
          quantity?: number
          snapshot_brand_name?: string | null
          snapshot_color?: string | null
          snapshot_condition?: string | null
          snapshot_imei?: string | null
          snapshot_product_name?: string
          snapshot_storage?: string | null
          total_price?: number
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
          bill_number: string
          created_at: string
          created_by: string | null
          customer_name: string | null
          customer_phone: string | null
          discount: number
          grand_total: number
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["bill_status"]
          subtotal: number
          updated_at: string
        }
        Insert: {
          bill_number: string
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number
          grand_total?: number
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["bill_status"]
          subtotal?: number
          updated_at?: string
        }
        Update: {
          bill_number?: string
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number
          grand_total?: number
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["bill_status"]
          subtotal?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
          condition: Database["public"]["Enums"]["condition_type"]
          created_at: string
          id: string
          imei: string | null
          imei2: string | null
          notes: string | null
          product_id: string
          purchase_price: number | null
          selling_price: number
          status: Database["public"]["Enums"]["inventory_status"]
          unit_code: string | null
          updated_at: string
        }
        Insert: {
          condition?: Database["public"]["Enums"]["condition_type"]
          created_at?: string
          id?: string
          imei?: string | null
          imei2?: string | null
          notes?: string | null
          product_id: string
          purchase_price?: number | null
          selling_price: number
          status?: Database["public"]["Enums"]["inventory_status"]
          unit_code?: string | null
          updated_at?: string
        }
        Update: {
          condition?: Database["public"]["Enums"]["condition_type"]
          created_at?: string
          id?: string
          imei?: string | null
          imei2?: string | null
          notes?: string | null
          product_id?: string
          purchase_price?: number | null
          selling_price?: number
          status?: Database["public"]["Enums"]["inventory_status"]
          unit_code?: string | null
          updated_at?: string
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
          product_id: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          product_id: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          product_id?: string
          url?: string
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
          category: string
          color: string | null
          condition: Database["public"]["Enums"]["condition_type"]
          created_at: string
          description: string | null
          id: string
          is_deleted: boolean
          is_featured: boolean
          is_listed: boolean
          model: string | null
          name: string
          purchase_price: number | null
          ram: string | null
          selling_price: number
          slug: string
          storage: string | null
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          category?: string
          color?: string | null
          condition?: Database["public"]["Enums"]["condition_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_deleted?: boolean
          is_featured?: boolean
          is_listed?: boolean
          model?: string | null
          name: string
          purchase_price?: number | null
          ram?: string | null
          selling_price?: number
          slug: string
          storage?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          category?: string
          color?: string | null
          condition?: Database["public"]["Enums"]["condition_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_deleted?: boolean
          is_featured?: boolean
          is_listed?: boolean
          model?: string | null
          name?: string
          purchase_price?: number | null
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
      shop_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          last_login: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          last_login?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
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
    }
    Enums: {
      app_role: "super_admin" | "admin" | "staff"
      bill_status: "DRAFT" | "COMPLETED" | "CANCELLED"
      condition_type: "like_new" | "good" | "fair" | "poor"
      inventory_status:
        | "AVAILABLE"
        | "RESERVED"
        | "SOLD"
        | "DEFECTIVE"
        | "DELETED"
      payment_method: "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "EMI"
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
      app_role: ["super_admin", "admin", "staff"],
      bill_status: ["DRAFT", "COMPLETED", "CANCELLED"],
      condition_type: ["like_new", "good", "fair", "poor"],
      inventory_status: [
        "AVAILABLE",
        "RESERVED",
        "SOLD",
        "DEFECTIVE",
        "DELETED",
      ],
      payment_method: ["CASH", "UPI", "CARD", "BANK_TRANSFER", "EMI"],
    },
  },
} as const
