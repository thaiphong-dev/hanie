export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string;
          password_hash: string;
          role: 'admin' | 'staff' | 'customer';
          full_name: string;
          zalo_id: string | null;
          birthday: string | null;
          avatar_url: string | null;
          member_tier: 'new' | 'regular' | 'vip';
          total_spent: number;
          notes: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      refresh_tokens: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          revoked: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['refresh_tokens']['Row'], 'id' | 'created_at' | 'revoked'>;
        Update: Partial<Database['public']['Tables']['refresh_tokens']['Insert']>;
      };
      service_categories: {
        Row: {
          id: string;
          name: string;
          name_i18n: Record<string, string>;
          slug: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['service_categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['service_categories']['Insert']>;
      };
      services: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          name_i18n: Record<string, string>;
          description: string | null;
          desc_i18n: Record<string, string>;
          service_type: 'main' | 'addon';
          price_min: number;
          price_max: number;
          unit: 'fixed' | 'per_nail' | 'per_piece' | 'per_set';
          duration_min: number;
          slot_count: number;
          warranty_days: number;
          requires_booking: boolean;
          commission_pct: number;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
      };
      staff_profiles: {
        Row: {
          id: string;
          user_id: string;
          specialties: string[];
          base_salary: number;
          commission_pct: number;
          is_active: boolean;
          hire_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['staff_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['staff_profiles']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          staff_id: string | null;
          status: 'pending' | 'confirmed' | 'in_progress' | 'done' | 'cancelled' | 'no_show';
          booking_type: 'appointment' | 'walk_in';
          scheduled_at: string;
          end_at: string;
          slot_count: number;
          notes: string | null;
          internal_notes: string | null;
          cancelled_at: string | null;
          cancel_reason: string | null;
          late_cancel: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      booking_services: {
        Row: {
          id: string;
          booking_id: string;
          service_id: string;
          service_name: string;
          quantity: number;
          price: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['booking_services']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['booking_services']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          booking_id: string | null;
          customer_id: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          staff_id: string | null;
          subtotal: number;
          discount_amount: number;
          total: number;
          voucher_id: string | null;
          voucher_code: string | null;
          payment_method: 'cash' | 'transfer' | 'card';
          paid_at: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          service_id: string | null;
          service_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      vouchers: {
        Row: {
          id: string;
          code: string;
          customer_id: string | null;
          discount_type: 'percentage' | 'fixed_amount';
          discount_value: number;
          min_order_amount: number;
          applicable_categories: string[] | null;
          required_member_tier: 'new' | 'regular' | 'vip' | null;
          max_uses: number | null;
          used_count: number;
          expires_at: string | null;
          status: 'draft' | 'active' | 'expired' | 'disabled';
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vouchers']['Row'], 'id' | 'created_at' | 'updated_at' | 'used_count'>;
        Update: Partial<Database['public']['Tables']['vouchers']['Insert']>;
      };
      leave_requests: {
        Row: {
          id: string;
          staff_id: string;
          leave_date: string;
          reason: string | null;
          status: 'pending' | 'approved' | 'rejected';
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leave_requests']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['leave_requests']['Insert']>;
      };
      rate_limit_log: {
        Row: {
          id: string;
          key: string;
          created_at: string;
        };
        Insert: { key: string };
        Update: never;
      };
    };
  };
}
