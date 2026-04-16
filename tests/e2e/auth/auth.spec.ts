/**
 * NHÓM TEST 1: Auth Flow (Critical)
 *
 * Test 1.1 — Đăng ký tài khoản mới
 * Test 1.2 — Đăng nhập
 * Test 1.3 — Protected routes redirect
 * Test 1.4 — Admin guard
 * Test 1.5 — Logout
 */
import { test, expect } from '@playwright/test';
import { uniquePhone, ADMIN_PHONE, ADMIN_PASSWORD, CUSTOMER_PHONE, CUSTOMER_PASSWORD } from '../../fixtures/helpers';

// ─── Test 1.1 — Đăng ký tài khoản mới ───────────────────────────────────────
test.describe('1.1 — Đăng ký tài khoản mới', () => {
  test('register → redirect về home, KHÔNG về /login', async ({ page }) => {
    const phone = uniquePhone();

    await page.goto('/vi/register');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/họ tên|tên|name/i).fill('Test Register User');
    await page.getByLabel(/số điện thoại|phone/i).fill(phone);
    await page.getByLabel(/mật khẩu|password/i).fill('password123');
    await page.getByRole('button', { name: /đăng ký|register/i }).click();

    // Phải redirect về home, KHÔNG về /login
    await page.waitForURL(/\/(vi|en|ko)\/?$/, { timeout: 10000 });
    await expect(page).not.toHaveURL(/.*\/login.*/);
    await expect(page).not.toHaveURL(/.*\/register.*/);
  });

  test('đăng ký xong → reload → vẫn còn logged in', async ({ page }) => {
    const phone = uniquePhone();

    await page.goto('/vi/register');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/họ tên|tên|name/i).fill('Reload Test User');
    await page.getByLabel(/số điện thoại|phone/i).fill(phone);
    await page.getByLabel(/mật khẩu|password/i).fill('password123');
    await page.getByRole('button', { name: /đăng ký|register/i }).click();

    await page.waitForURL(/\/(vi|en|ko)\/?$/, { timeout: 10000 });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Vào protected route → không bị redirect về login (chứng tỏ vẫn logged in)
    await page.goto('/vi/profile');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/.*\/login.*/);
  });
});

// ─── Test 1.2 — Đăng nhập ────────────────────────────────────────────────────
test.describe('1.2 — Đăng nhập', () => {
  test('đăng nhập đúng → redirect về home hoặc callbackUrl', async ({ page }) => {
    await page.goto('/vi/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/số điện thoại|phone/i).fill(CUSTOMER_PHONE);
    await page.getByLabel(/mật khẩu|password/i).fill(CUSTOMER_PASSWORD);
    await page.getByRole('button', { name: /đăng nhập|login/i }).click();

    // Redirect về home
    await page.waitForURL(/\/(vi|en|ko)\/?$/, { timeout: 10000 });
    await expect(page).not.toHaveURL(/.*\/login.*/);
  });

  test('đăng nhập với callbackUrl → redirect đúng nơi', async ({ page }) => {
    await page.goto('/vi/login?callbackUrl=%2Fvi%2Fhistory');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/số điện thoại|phone/i).fill(CUSTOMER_PHONE);
    await page.getByLabel(/mật khẩu|password/i).fill(CUSTOMER_PASSWORD);
    await page.getByRole('button', { name: /đăng nhập|login/i }).click();

    // Redirect về callbackUrl
    await page.waitForURL(/.*\/history.*/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/history.*/);
  });

  test('sai mật khẩu → thấy error message, KHÔNG crash', async ({ page }) => {
    await page.goto('/vi/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/số điện thoại|phone/i).fill(CUSTOMER_PHONE);
    await page.getByLabel(/mật khẩu|password/i).fill('wrongpassword_xyz');
    await page.getByRole('button', { name: /đăng nhập|login/i }).click();

    // Vẫn ở trang login
    await expect(page).toHaveURL(/.*\/login.*/);

    // Thấy error message
    await expect(
      page.getByText(/sai mật khẩu|incorrect.*password|invalid.*credentials|mật khẩu không đúng|không tìm thấy/i)
    ).toBeVisible({ timeout: 5000 });
  });
});

// ─── Test 1.3 — Protected routes redirect ────────────────────────────────────
test.describe('1.3 — Protected routes redirect (chưa login)', () => {
  test('/vi/history → redirect /vi/login?callbackUrl=...', async ({ page }) => {
    // Đảm bảo không có auth cookie
    await page.context().clearCookies();
    await page.context().clearPermissions();

    await page.goto('/vi/history');
    await page.waitForURL(/.*\/login.*/, { timeout: 8000 });
    await expect(page).toHaveURL(/.*\/login.*/);
    // callbackUrl phải có trong query
    expect(page.url()).toContain('callbackUrl');
  });

  test('/vi/profile → redirect /vi/login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/vi/profile');
    await page.waitForURL(/.*\/login.*/, { timeout: 8000 });
    await expect(page).toHaveURL(/.*\/login.*/);
  });

  test('/vi/admin → redirect /vi/login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/vi/admin');
    await page.waitForURL(/.*\/login.*/, { timeout: 8000 });
    await expect(page).toHaveURL(/.*\/login.*/);
  });
});

// ─── Test 1.4 — Admin guard ───────────────────────────────────────────────────
test.describe('1.4 — Admin guard', () => {
  test('customer login → /vi/admin/dashboard → bị redirect, KHÔNG thấy dashboard', async ({ page }) => {
    // Login as customer
    await page.goto('/vi/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/số điện thoại|phone/i).fill(CUSTOMER_PHONE);
    await page.getByLabel(/mật khẩu|password/i).fill(CUSTOMER_PASSWORD);
    await page.getByRole('button', { name: /đăng nhập|login/i }).click();
    await page.waitForURL(/\/(vi|en|ko)\/?$/, { timeout: 10000 });

    // Thử vào admin
    await page.goto('/vi/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Không được vào dashboard — phải redirect
    await expect(page).not.toHaveURL(/.*\/admin\/dashboard/);
  });

  test('admin login → /vi/admin → thấy dashboard', async ({ page }) => {
    await page.goto('/vi/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/số điện thoại|phone/i).fill(ADMIN_PHONE);
    await page.getByLabel(/mật khẩu|password/i).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /đăng nhập|login/i }).click();

    // Admin → redirect về /admin/dashboard
    await page.waitForURL(/.*\/admin.*/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/admin.*/);

    // Trang có nội dung dashboard (không chỉ là login page)
    await expect(page.getByText(/dashboard|doanh thu|lịch hẹn|overview/i)).toBeVisible({ timeout: 5000 });
  });
});

// ─── Test 1.5 — Logout ────────────────────────────────────────────────────────
test.describe('1.5 — Logout', () => {
  test('login → logout → vào /vi/history → redirect về login', async ({ page }) => {
    // Login
    await page.goto('/vi/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/số điện thoại|phone/i).fill(CUSTOMER_PHONE);
    await page.getByLabel(/mật khẩu|password/i).fill(CUSTOMER_PASSWORD);
    await page.getByRole('button', { name: /đăng nhập|login/i }).click();
    await page.waitForURL(/\/(vi|en|ko)\/?$/, { timeout: 10000 });

    // Logout — thường qua Profile hoặc Navbar
    await page.goto('/vi/profile');
    await page.waitForLoadState('networkidle');

    // Click logout button
    const logoutBtn = page.getByRole('button', { name: /đăng xuất|logout|sign out/i });
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    await logoutBtn.click();

    // Đợi redirect
    await page.waitForLoadState('networkidle');

    // Bây giờ vào /history → phải redirect về login
    await page.goto('/vi/history');
    await page.waitForURL(/.*\/login.*/, { timeout: 8000 });
    await expect(page).toHaveURL(/.*\/login.*/);
  });
});
