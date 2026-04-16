/**
 * auth.setup.ts — Lưu auth state cho admin & customer
 *
 * Admin:    0901234567 / hanie2026
 * Customer: 0977000001 / testpass123
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authDir = path.join(process.cwd(), 'tests/e2e/.auth');

// Đảm bảo thư mục .auth tồn tại
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

// ===== Admin auth =====
setup('authenticate as admin', async ({ page }) => {
  await page.goto('/vi/login');
  await page.waitForLoadState('networkidle');

  // Fill form
  await page.getByLabel(/số điện thoại|phone/i).fill('0901234567');
  await page.getByLabel(/mật khẩu|password/i).fill('hanie2026');
  await page.getByRole('button', { name: /đăng nhập|login/i }).click();

  // Đợi redirect về admin dashboard
  await page.waitForURL('**/admin/**', { timeout: 10000 });
  await expect(page).toHaveURL(/.*\/admin.*/);

  console.log('[auth.setup] Admin logged in, URL:', page.url());
  await page.context().storageState({ path: path.join(authDir, 'admin.json') });
  console.log('[auth.setup] Admin auth state saved');
});

// ===== Customer auth =====
setup('authenticate as customer', async ({ page }) => {
  await page.goto('/vi/login');
  await page.waitForLoadState('networkidle');

  // Fill form
  await page.getByLabel(/số điện thoại|phone/i).fill('0977000001');
  await page.getByLabel(/mật khẩu|password/i).fill('testpass123');
  await page.getByRole('button', { name: /đăng nhập|login/i }).click();

  // Customer → redirect về home /vi
  await page.waitForURL(/\/(vi|en|ko)\/?$/, { timeout: 10000 });

  console.log('[auth.setup] Customer logged in, URL:', page.url());
  await page.context().storageState({ path: path.join(authDir, 'customer.json') });
  console.log('[auth.setup] Customer auth state saved');
});
