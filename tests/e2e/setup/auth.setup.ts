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
// Credentials: 0967273066 / haokhongnho (sau reset_and_new_admin.sql)
setup('authenticate as admin', async ({ page }) => {
  await page.goto('/vi/login');
  await page.waitForLoadState('networkidle');

  // Fill form
  await page.getByLabel(/số điện thoại|phone/i).fill('0967273066');
  await page.getByLabel(/mật khẩu|password/i).fill('haokhongnho');
  await page.getByRole('button', { name: /đăng nhập|login/i }).click();

  // Đợi redirect về admin dashboard — dùng domcontentloaded để không bị block bởi slow API calls
  await page.waitForURL('**/admin/**', { timeout: 30000, waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/.*\/admin.*/);

  console.log('[auth.setup] Admin logged in, URL:', page.url());
  await page.context().storageState({ path: path.join(authDir, 'admin.json') });
  console.log('[auth.setup] Admin auth state saved');
});

// ===== Customer auth =====
setup('authenticate as customer', async ({ page }) => {
  await page.goto('/vi/login');
  await page.waitForLoadState('networkidle');

  // Đợi login form sẵn sàng
  await page.waitForSelector('input', { timeout: 15000 });

  // Fill form
  await page.getByLabel(/số điện thoại|phone/i).fill('0977000001');
  await page.getByLabel(/mật khẩu|password/i).fill('testpass123');
  await page.getByRole('button', { name: /đăng nhập|login/i }).click();

  // Customer → redirect về home /vi — dùng domcontentloaded + timeout dài hơn
  await page.waitForURL(/\/(vi|en|ko)\/?$/, { timeout: 20000, waitUntil: 'domcontentloaded' });

  console.log('[auth.setup] Customer logged in, URL:', page.url());
  await page.context().storageState({ path: path.join(authDir, 'customer.json') });
  console.log('[auth.setup] Customer auth state saved');
});
