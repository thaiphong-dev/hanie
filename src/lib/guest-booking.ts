// Guest booking helper — Node.js only (imports bcryptjs via dynamic import)
// Gọi hàm này trong POST /api/v1/bookings trước khi tạo booking
import { createServerClient } from '@/lib/supabase/server';

const DEFAULT_GUEST_PASSWORD = 'hanie2020xinchao';

// Regex SĐT Việt Nam
const PHONE_REGEX = /^(0[35789])+([0-9]{8})$/;

/**
 * Tìm user theo SĐT — nếu có trả về id, nếu chưa có tạo mới.
 * Booking không cần đăng nhập — hàm này xử lý hoàn toàn server-side.
 */
export async function resolveGuestCustomer(phone: string, fullName: string): Promise<string> {
  // Validate SĐT
  if (!PHONE_REGEX.test(phone)) {
    throw new Error('INVALID_PHONE');
  }

  const supabase = createServerClient();

  // 1. Tìm user theo SĐT
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('phone', phone)
    .single();

  if (existing) return existing.id; // Đã có tài khoản → dùng luôn

  // 2. Chưa có → tạo tài khoản mới với default password
  // Dynamic import để tránh Edge Runtime (password.ts dùng bcryptjs — Node.js only)
  const { hashPassword } = await import('@/lib/password');
  const passwordHash = await hashPassword(DEFAULT_GUEST_PASSWORD);

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      phone,
      password_hash: passwordHash,
      role: 'customer' as const,
      full_name: fullName,
      is_active: true,
    })
    .select('id')
    .single();

  if (error) throw new Error(`CREATE_USER_FAILED: ${error.message}`);
  if (!newUser) throw new Error('CREATE_USER_FAILED: No data returned');

  return newUser.id;
}
