import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          price: number;
          image: string | null;
          category: string;
          stock: number;
          barcode: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          price: number;
          image?: string | null;
          category: string;
          stock?: number;
          barcode?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          price?: number;
          image?: string | null;
          category?: string;
          stock?: number;
          barcode?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      movements: {
        Row: {
          id: number;
          type: 'entry' | 'exit';
          product_id: number;
          product_name: string;
          quantity: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          type: 'entry' | 'exit';
          product_id: number;
          product_name: string;
          quantity: number;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          type?: 'entry' | 'exit';
          product_id?: number;
          product_name?: string;
          quantity?: number;
          reason?: string;
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: number;
          name: string;
          email: string | null;
          phone: string;
          vehicle: string | null;
          vehicle_type: string | null;
          license_plate: string | null;
          status: 'VIP' | 'Regular' | 'Normal';
          visits: number;
          images: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          email?: string | null;
          phone: string;
          vehicle?: string | null;
          vehicle_type?: string | null;
          license_plate?: string | null;
          status?: 'VIP' | 'Regular' | 'Normal';
          visits?: number;
          images?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          email?: string | null;
          phone?: string;
          vehicle?: string | null;
          vehicle_type?: string | null;
          license_plate?: string | null;
          status?: 'VIP' | 'Regular' | 'Normal';
          visits?: number;
          images?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: number;
          sale_id: string;
          customer_id: number | null;
          customer_name: string | null;
          total: number;
          payment_method: string;
          items: any;
          created_at: string;
        };
        Insert: {
          id?: number;
          sale_id: string;
          customer_id?: number | null;
          customer_name?: string | null;
          total: number;
          payment_method: string;
          items: any;
          created_at?: string;
        };
        Update: {
          id?: number;
          sale_id?: string;
          customer_id?: number | null;
          customer_name?: string | null;
          total?: number;
          payment_method?: string;
          items?: any;
          created_at?: string;
        };
      };
    };
  };
}
