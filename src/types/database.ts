export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: 'admin' | 'customer' | 'staff'
  created_at: string
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at?: string
}

export interface Product {
  id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  price: number
  old_price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  stock: number | null
  sort_order: number
  created_at: string
  updated_at?: string
  category?: Category | null
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  sort_order: number
  created_at: string
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'approved' | 'rejected'
export type PaymentMethod = 'vodafone_cash' | 'instapay'

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  shipping_address: string
  notes: string | null
  subtotal: number
  delivery_fee: number
  total: number
  status: OrderStatus
  payment_method: PaymentMethod | null
  payment_status: PaymentStatus
  payment_transfer_number: string | null
  payment_proof_path: string | null
  payment_reviewed_at: string | null
  payment_reviewed_by: string | null
  payment_rejection_reason: string | null
  created_at: string
  updated_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string | null
  price: number
  quantity: number
  created_at: string
}

export interface StoreSetting {
  id: string
  key: string
  value: string | null
  label: string | null
  created_at: string
  updated_at?: string
}

export interface StoreSettingsMap {
  store_name: string
  store_name_en: string
  tagline: string
  contact_phone: string
  whatsapp: string
  email: string
  address: string
  payment_number: string
  payment_number_vodafone: string
  payment_number_instapay: string
  delivery_fee: number
  free_delivery_threshold: number
  announcement: string
  hero_title: string
  hero_subtitle: string
  [key: string]: string | number
}

export interface CartItem {
  product_id: string
  slug: string
  name: string
  price: number
  old_price: number | null
  image_url: string | null
  quantity: number
  stock: number | null
}

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: Partial<Category>
        Update: Partial<Category>
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['category_id']
          }
        ]
      }
      products: {
        Row: Product
        Insert: Partial<Product>
        Update: Partial<Product>
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
      }
      product_images: {
        Row: ProductImage
        Insert: Partial<ProductImage>
        Update: Partial<ProductImage>
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: Profile
        Insert: Partial<Profile>
        Update: Partial<Profile>
        Relationships: []
      }
      store_settings: {
        Row: StoreSetting
        Insert: Partial<StoreSetting>
        Update: Partial<StoreSetting>
        Relationships: []
      }
      orders: {
        Row: Order
        Insert: Partial<Order>
        Update: Partial<Order>
        Relationships: []
      }
      order_items: {
        Row: OrderItem
        Insert: Partial<OrderItem>
        Update: Partial<OrderItem>
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      create_order: {
        Args: {
          p_customer_name: string
          p_customer_phone: string
          p_customer_email?: string | null
          p_shipping_address: string
          p_notes?: string | null
          p_payment_method: string
          p_payment_transfer_number?: string | null
          p_payment_proof_path?: string | null
          p_items: Json
        }
        Returns: Json
      }
      get_order_by_number: {
        Args: {
          p_order_number: string
          p_phone: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
