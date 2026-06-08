/**
 * global.setup.ts — Seed test accounts trước khi chạy tests
 *
 * Vì key đã đổi, bcrypt hash cũ không còn đúng.
 * Setup này dùng service role key để reset password cho admin + staff
 * và tạo test customer mới.
 */
import { test as setup, request } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Load .env.local
function loadEnv(): Record<string, string> {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};
  return fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .reduce((acc, line) => {
      const [k, ...v] = line.split('=');
      if (k && v.length) acc[k.trim()] = v.join('=').trim();
      return acc;
    }, {} as Record<string, string>);
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const BASE_URL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

setup('seed test accounts', async () => {
  // ── 1. Reset passwords cho admin + staff (dùng service role key) ──────────
  if (SERVICE_KEY) {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Admin mới: 0967273066 / haokhongnho (sau khi chạy reset_and_new_admin.sql)
    // Kiểm tra admin tồn tại, nếu không thì tạo lại
    const { data: adminUser } = await supabase
      .from('users')
      .select('id, phone')
      .eq('phone', '0967273066')
      .single();

    if (!adminUser) {
      const adminHash = await bcrypt.hash('haokhongnho', 10);
      const { error } = await supabase.from('users').insert({
        phone: '0967273066',
        password_hash: adminHash,
        role: 'admin',
        full_name: 'Hanie Admin',
        is_active: true,
      });
      if (error) {
        console.warn('[global.setup] Create admin error:', error.message);
      } else {
        console.log('[global.setup] Admin created: 0967273066/haokhongnho ✓');
      }
    } else {
      console.log('[global.setup] Admin exists: 0967273066/haokhongnho ✓');
    }

    // Tạo/kiểm tra staff test accounts
    const staffAccounts = [
      { phone: '0912345678', name: 'Hanie', password: 'hanie2026' },
      { phone: '0923456789', name: 'Lan', password: 'hanie2026' },
    ];
    for (const acc of staffAccounts) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('phone', acc.phone)
        .single();
      if (!existing) {
        const hash = await bcrypt.hash(acc.password, 10);
        const { error } = await supabase.from('users').insert({
          phone: acc.phone,
          password_hash: hash,
          role: 'staff',
          full_name: acc.name,
          is_active: true,
        });
        if (error) console.warn(`[global.setup] Staff ${acc.phone} error:`, error.message);
        else console.log(`[global.setup] Staff created: ${acc.phone}/${acc.password} ✓`);
      } else {
        console.log(`[global.setup] Staff exists: ${acc.phone} ✓`);
      }
    }
  } else {
    console.warn('[global.setup] No SUPABASE_SERVICE_ROLE_KEY — skipping password reset');
  }

  // ── 2. Tạo test customer 0977000001 (nếu chưa có) ──────────────────────
  const ctx = await request.newContext({ baseURL: BASE_URL });

  const res = await ctx.post('/api/v1/auth/register', {
    data: {
      phone: '0977000001',
      password: 'testpass123',
      full_name: 'QC Tester',
    },
  });

  const body = await res.json().catch(() => ({}));

  if (res.status() === 201) {
    console.log('[global.setup] Test customer created: 0977000001 ✓');
  } else if (res.status() === 409 || (res.status() === 400 && body?.error?.code === 'PHONE_ALREADY_EXISTS')) {
    // Đã tồn tại → reset password
    if (SERVICE_KEY) {
      const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
      const customerHash = await bcrypt.hash('testpass123', 10);
      await supabase
        .from('users')
        .update({ password_hash: customerHash, full_name: 'QC Tester' })
        .eq('phone', '0977000001');
      console.log('[global.setup] Test customer password reset: 0977000001/testpass123 ✓');
    } else {
      console.log('[global.setup] Test customer already exists (cannot reset without service key)');
    }
  } else {
    console.warn('[global.setup] Register response:', res.status(), body);
  }

  await ctx.dispose();
  console.log('[global.setup] Done ✓');
});
