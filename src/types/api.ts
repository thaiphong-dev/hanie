export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string | Record<string, string[]>;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'done'
  | 'cancelled'
  | 'no_show';

export type BookingType = 'appointment' | 'walk_in';

export type UserRole = 'admin' | 'staff' | 'customer';

export type MemberTier = 'new' | 'regular' | 'vip';

export type ServiceType = 'main' | 'addon';

export type PriceUnit = 'fixed' | 'per_nail' | 'per_piece' | 'per_set';

export type VoucherStatus = 'draft' | 'active' | 'expired' | 'disabled';

export type VoucherType = 'percentage' | 'fixed_amount';

export type PaymentMethod = 'cash' | 'transfer' | 'card';
