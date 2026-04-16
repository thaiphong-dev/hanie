/**
 * Test helper utilities — QC support functions
 */
import { addDays, format } from 'date-fns';

/** Trả về ngày mai dạng YYYY-MM-DD (UTC+7) */
export function getTomorrow(): string {
  const tomorrow = addDays(new Date(), 1);
  return format(tomorrow, 'yyyy-MM-dd');
}

/** Trả về hôm nay dạng YYYY-MM-DD */
export function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** Trả về ngày làm việc gần nhất (ngày mai hoặc ngày kế tiếp) */
export function getNextWeekday(): string {
  // Tiệm mở cả 7 ngày → dùng ngày mai
  return getTomorrow();
}

/** Trả về ngày N ngày từ hôm nay */
export function getDaysFromNow(n: number): string {
  return format(addDays(new Date(), n), 'yyyy-MM-dd');
}

/** Giờ "sớm" — 30 phút từ bây giờ, làm tròn lên giờ (dạng HH:00) */
export function getSoonTime(minutesFromNow: number): string {
  const d = new Date(Date.now() + minutesFromNow * 60_000);
  return format(d, 'HH:00');
}

/** Tạo SĐT Việt Nam hợp lệ để test (unique theo timestamp) */
export function uniquePhone(): string {
  const suffix = String(Date.now()).slice(-8);
  return `09${suffix}`;
}

/** Admin credentials (seeded in DB) */
export const ADMIN_PHONE = '0901234567';
export const ADMIN_PASSWORD = 'hanie2026';

/** Test customer (tạo bằng global.setup.ts) */
export const CUSTOMER_PHONE = '0977000001';
export const CUSTOMER_PASSWORD = 'testpass123';
export const CUSTOMER_NAME = 'QC Tester';

/** Auth state paths */
export const AUTH_DIR = 'tests/e2e/.auth';
export const ADMIN_AUTH_FILE = `${AUTH_DIR}/admin.json`;
export const CUSTOMER_AUTH_FILE = `${AUTH_DIR}/customer.json`;
