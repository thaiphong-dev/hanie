import { z } from 'zod';

export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 1000);
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(0, 11);
}

const sanitize = (str: string) => str.trim().replace(/[<>]/g, '');

export const BookingInputSchema = z.object({
  customer_name: z.string().min(2).max(100).transform(sanitize),
  customer_phone: z
    .string()
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ')
    .transform((s) => s.replace(/\D/g, '')),
  notes: z.string().max(1000).transform(sanitize).nullable().default(null),
});

export const LoginSchema = z.object({
  phone: z
    .string()
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export const RegisterSchema = z.object({
  phone: z
    .string()
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  full_name: z.string().min(2).max(100).transform(sanitize),
});
