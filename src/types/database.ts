// database.ts — Supabase types khớp với migration.sql
// Cập nhật: 2026-04-15 — Thêm booking_categories; booking_services: thêm
//           booking_category_id, làm service_id nullable, bỏ service_name

export interface Database {
  public: {
    Tables: {
      // ── USERS ───────────────────────────────────────────────────────────────
      users: {
        Row: {
          id: string;
          phone: string;
          password_hash: string;
          role: 'admin' | 'staff' | 'customer';
          full_name: string;
          zalo_id: string | null;
          birthday: string | null;        // date ISO string
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

      // ── REFRESH_TOKENS ───────────────────────────────────────────────────────
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

      // ── CATEGORIES (tên bảng thật trong DB là "categories") ──────────────────
      categories: {
        Row: {
          id: string;
          name: string;
          name_i18n: Record<string, string>;
          slug: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };

      // ── SERVICES ────────────────────────────────────────────────────────────
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

      // ── STAFF_PROFILES (id = user id — PK references users.id) ──────────────
      // Cột: id, specialties, base_salary, commission_pct, color, created_at, updated_at
      staff_profiles: {
        Row: {
          id: string;           // = user id (PK references users.id)
          specialties: string[];
          base_salary: number;
          commission_pct: number;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['staff_profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['staff_profiles']['Insert']>;
      };

      // ── STAFF_SCHEDULES ──────────────────────────────────────────────────────
      staff_schedules: {
        Row: {
          id: string;
          staff_id: string;
          date: string;        // YYYY-MM-DD
          start_time: string;  // HH:mm:ss
          end_time: string;    // HH:mm:ss
          is_day_off: boolean;
          note: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['staff_schedules']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['staff_schedules']['Insert']>;
      };

      // ── LEAVE_REQUESTS ───────────────────────────────────────────────────────
      // Cột thật: date (không phải leave_date), có review_note và updated_at
      leave_requests: {
        Row: {
          id: string;
          staff_id: string;
          date: string;         // YYYY-MM-DD (tên thật trong DB là "date")
          reason: string;
          status: 'pending' | 'approved' | 'rejected';
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leave_requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leave_requests']['Insert']>;
      };

      // ── BOOKINGS ────────────────────────────────────────────────────────────
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

      // ── BOOKING_CATEGORIES ───────────────────────────────────────────────────
      // Loại hình dịch vụ granular cho đặt lịch — tách biệt với categories
      // (categories = catalog display; booking_categories = booking flow)
      booking_categories: {
        Row: {
          id: string;
          category_id: string;           // FK → categories (broad: Nail, Mi, ...)
          name: string;
          name_i18n: Record<string, string>;
          slug: string;                  // 'nail_tay' | 'nail_chan' | 'noi_mi' | ...
          slot_count: number;
          duration_min: number;
          parallel_group: string | null; // 'nail' = nail tay+chân có thể làm song song
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['booking_categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['booking_categories']['Insert']>;
      };

      // ── BOOKING_SERVICES ─────────────────────────────────────────────────────
      // Cập nhật 2026-04-15: thêm booking_category_id, service_id nullable,
      //                      bỏ service_name (denormalized, không cần thiết)
      // Cập nhật 2026-04-15 patch5: thêm service_name cho POS backward compat
      booking_services: {
        Row: {
          id: string;
          booking_id: string;
          service_id: string | null;              // nullable — backward compat
          booking_category_id: string | null;     // FK → booking_categories
          service_name: string | null;            // denormalized cho POS display
          price: number;
          quantity: number;
          note: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['booking_services']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['booking_services']['Insert']>;
      };

      // ── BOOKING_ADDONS ───────────────────────────────────────────────────────
      booking_addons: {
        Row: {
          id: string;
          booking_service_id: string;
          addon_service_id: string;
          quantity: number;
          price_per_unit: number;
          total_price: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['booking_addons']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['booking_addons']['Insert']>;
      };

      // ── PAYMENTS ────────────────────────────────────────────────────────────
      payments: {
        Row: {
          id: string;
          booking_id: string;
          amount: number;
          discount_amount: number;
          final_amount: number;
          method: 'cash' | 'transfer' | 'card';
          status: 'pending' | 'paid' | 'refunded';
          voucher_id: string | null;
          paid_at: string | null;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };

      // ── MONTHLY_PAYROLL ──────────────────────────────────────────────────────
      monthly_payroll: {
        Row: {
          id: string;
          staff_id: string;
          year: number;
          month: number;
          base_salary: number;
          total_bill: number;
          commission_pct: number;
          commission_amount: number;
          total_salary: number;
          note: string | null;
          finalized: boolean;
          finalized_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['monthly_payroll']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['monthly_payroll']['Insert']>;
      };

      // ── CUSTOMER_NOTES ───────────────────────────────────────────────────────
      customer_notes: {
        Row: {
          id: string;
          customer_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customer_notes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['customer_notes']['Insert']>;
      };

      // ── VOUCHERS ─────────────────────────────────────────────────────────────
      // discount_type: 'percent' | 'fixed' (theo migration.sql)
      vouchers: {
        Row: {
          id: string;
          code: string;
          name: string;
          name_i18n: Record<string, string>;
          discount_type: 'percent' | 'fixed';
          discount_value: number;
          min_order_amount: number;
          applicable_categories: string[] | null;
          required_member_tier: 'new' | 'regular' | 'vip' | null;
          total_issued: number;
          max_issue: number | null;
          expires_at: string | null;
          status: 'draft' | 'active' | 'expired' | 'disabled';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vouchers']['Row'], 'id' | 'created_at' | 'updated_at' | 'total_issued'>;
        Update: Partial<Database['public']['Tables']['vouchers']['Insert']>;
      };

      // ── CUSTOMER_VOUCHERS ────────────────────────────────────────────────────
      customer_vouchers: {
        Row: {
          id: string;
          voucher_id: string;
          customer_id: string;
          status: 'available' | 'used' | 'expired';
          used_at: string | null;
          used_in_payment_id: string | null;
          sent_via_zalo: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customer_vouchers']['Row'], 'id' | 'created_at' | 'sent_via_zalo'>;
        Update: Partial<Database['public']['Tables']['customer_vouchers']['Insert']>;
      };

      // ── GALLERY_IMAGES ───────────────────────────────────────────────────────
      gallery_images: {
        Row: {
          id: string;
          image_url: string;
          alt_text: Record<string, string>;
          category: 'nail' | 'mi' | 'long_may' | 'goi_dau' | 'studio';
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['gallery_images']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['gallery_images']['Insert']>;
      };

      // ── RATE_LIMIT_LOG ───────────────────────────────────────────────────────
      // Thêm bằng migration patch (xem patch bên dưới)
      rate_limit_log: {
        Row: {
          id: string;
          key: string;
          created_at: string;
        };
        Insert: { key: string };
        Update: never;
      };

      // ── ORDERS (POS receipts) ────────────────────────────────────────────────
      orders: {
        Row: {
          id: string;
          booking_id: string | null;
          customer_id: string | null;
          staff_id: string | null;
          subtotal: number;
          discount_amount: number;
          total: number;
          method: 'cash' | 'transfer' | 'card' | null;
          voucher_code: string | null;
          voucher_id: string | null;
          status: 'draft' | 'paid' | 'refunded';
          note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };

      // ── ORDER_ITEMS ──────────────────────────────────────────────────────────
      order_items: {
        Row: {
          id: string;
          order_id: string;
          service_id: string | null;
          service_name: string;
          price: number;
          quantity: number;
          unit: 'fixed' | 'per_nail' | 'per_piece' | 'per_set';
          note: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };

      // ── INVENTORY (PENDING — schema giữ chỗ) ─────────────────────────────────
      inventory_items: {
        Row: {
          id: string;
          name: string;
          unit: string;
          current_stock: number;
          min_stock: number;
          category: string | null;
          note: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['inventory_items']['Insert']>;
      };
    };
  };
}
