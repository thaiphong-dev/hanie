# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\auth.spec.ts >> 1.2 — Đăng nhập >> sai mật khẩu → thấy error message, KHÔNG crash
- Location: tests\e2e\auth\auth.spec.ts:84:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/sai mật khẩu|incorrect.*password|invalid.*credentials|mật khẩu không đúng|không tìm thấy/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/sai mật khẩu|incorrect.*password|invalid.*credentials|mật khẩu không đúng|không tìm thấy/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "Hanie Studio" [ref=e4] [cursor=pointer]:
        - /url: /vi
        - img "Hanie Studio" [ref=e5]
    - main [ref=e6]:
      - generic [ref=e8]:
        - heading "Đăng nhập" [level=1] [ref=e9]
        - generic [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e12]: Số điện thoại
            - textbox "Số điện thoại" [ref=e13]:
              - /placeholder: 0901 234 567
              - text: "0977000001"
          - generic [ref=e14]:
            - generic [ref=e15]: Mật khẩu
            - textbox "Mật khẩu" [ref=e16]:
              - /placeholder: Nhập mật khẩu
              - text: wrongpassword_xyz
          - paragraph [ref=e17]: Quá nhiều lần thử. Vui lòng đợi 15 phút.
          - button "Đăng nhập" [ref=e18] [cursor=pointer]
        - paragraph [ref=e19]:
          - text: Chưa có tài khoản?
          - link "Đăng ký ngay" [ref=e20] [cursor=pointer]:
            - /url: /vi/register
    - contentinfo [ref=e21]:
      - paragraph [ref=e22]: © 2026 Hanie Studio
  - alert [ref=e23]
```

# Test source

```ts
  1   | /**
  2   |  * NHÓM TEST 1: Auth Flow (Critical)
  3   |  *
  4   |  * Test 1.1 — Đăng ký tài khoản mới
  5   |  * Test 1.2 — Đăng nhập
  6   |  * Test 1.3 — Protected routes redirect
  7   |  * Test 1.4 — Admin guard
  8   |  * Test 1.5 — Logout
  9   |  */
  10  | import { test, expect } from '@playwright/test';
  11  | import { uniquePhone, ADMIN_PHONE, ADMIN_PASSWORD, CUSTOMER_PHONE, CUSTOMER_PASSWORD } from '../../fixtures/helpers';
  12  | 
  13  | // ─── Test 1.1 — Đăng ký tài khoản mới ───────────────────────────────────────
  14  | test.describe('1.1 — Đăng ký tài khoản mới', () => {
  15  |   test('register → redirect về home, KHÔNG về /login', async ({ page }) => {
  16  |     const phone = uniquePhone();
  17  | 
  18  |     await page.goto('/vi/register');
  19  |     await page.waitForLoadState('networkidle');
  20  | 
  21  |     await page.getByLabel(/họ tên|tên|name/i).fill('Test Register User');
  22  |     await page.getByLabel(/số điện thoại|phone/i).fill(phone);
  23  |     await page.getByLabel(/mật khẩu|password/i).fill('password123');
  24  |     await page.getByRole('button', { name: /đăng ký|register/i }).click();
  25  | 
  26  |     // Phải redirect về home, KHÔNG về /login
  27  |     await page.waitForURL(/\/(vi|en|ko)\/?$/, { timeout: 10000 });
  28  |     await expect(page).not.toHaveURL(/.*\/login.*/);
  29  |     await expect(page).not.toHaveURL(/.*\/register.*/);
  30  |   });
  31  | 
  32  |   test('đăng ký xong → reload → vẫn còn logged in', async ({ page }) => {
  33  |     const phone = uniquePhone();
  34  | 
  35  |     await page.goto('/vi/register');
  36  |     await page.waitForLoadState('networkidle');
  37  | 
  38  |     await page.getByLabel(/họ tên|tên|name/i).fill('Reload Test User');
  39  |     await page.getByLabel(/số điện thoại|phone/i).fill(phone);
  40  |     await page.getByLabel(/mật khẩu|password/i).fill('password123');
  41  |     await page.getByRole('button', { name: /đăng ký|register/i }).click();
  42  | 
  43  |     await page.waitForURL(/\/(vi|en|ko)\/?$/, { timeout: 10000 });
  44  | 
  45  |     // Reload page
  46  |     await page.reload();
  47  |     await page.waitForLoadState('networkidle');
  48  | 
  49  |     // Vào protected route → không bị redirect về login (chứng tỏ vẫn logged in)
  50  |     await page.goto('/vi/profile');
  51  |     await page.waitForLoadState('networkidle');
  52  |     await expect(page).not.toHaveURL(/.*\/login.*/);
  53  |   });
  54  | });
  55  | 
  56  | // ─── Test 1.2 — Đăng nhập ────────────────────────────────────────────────────
  57  | test.describe('1.2 — Đăng nhập', () => {
  58  |   test('đăng nhập đúng → redirect về home hoặc callbackUrl', async ({ page }) => {
  59  |     await page.goto('/vi/login');
  60  |     await page.waitForLoadState('networkidle');
  61  | 
  62  |     await page.getByLabel(/số điện thoại|phone/i).fill(CUSTOMER_PHONE);
  63  |     await page.getByLabel(/mật khẩu|password/i).fill(CUSTOMER_PASSWORD);
  64  |     await page.getByRole('button', { name: /đăng nhập|login/i }).click();
  65  | 
  66  |     // Redirect về home
  67  |     await page.waitForURL(/\/(vi|en|ko)\/?$/, { timeout: 10000 });
  68  |     await expect(page).not.toHaveURL(/.*\/login.*/);
  69  |   });
  70  | 
  71  |   test('đăng nhập với callbackUrl → redirect đúng nơi', async ({ page }) => {
  72  |     await page.goto('/vi/login?callbackUrl=%2Fvi%2Fhistory');
  73  |     await page.waitForLoadState('networkidle');
  74  | 
  75  |     await page.getByLabel(/số điện thoại|phone/i).fill(CUSTOMER_PHONE);
  76  |     await page.getByLabel(/mật khẩu|password/i).fill(CUSTOMER_PASSWORD);
  77  |     await page.getByRole('button', { name: /đăng nhập|login/i }).click();
  78  | 
  79  |     // Redirect về callbackUrl
  80  |     await page.waitForURL(/.*\/history.*/, { timeout: 10000 });
  81  |     await expect(page).toHaveURL(/.*\/history.*/);
  82  |   });
  83  | 
  84  |   test('sai mật khẩu → thấy error message, KHÔNG crash', async ({ page }) => {
  85  |     await page.goto('/vi/login');
  86  |     await page.waitForLoadState('networkidle');
  87  | 
  88  |     await page.getByLabel(/số điện thoại|phone/i).fill(CUSTOMER_PHONE);
  89  |     await page.getByLabel(/mật khẩu|password/i).fill('wrongpassword_xyz');
  90  |     await page.getByRole('button', { name: /đăng nhập|login/i }).click();
  91  | 
  92  |     // Vẫn ở trang login
  93  |     await expect(page).toHaveURL(/.*\/login.*/);
  94  | 
  95  |     // Thấy error message
  96  |     await expect(
  97  |       page.getByText(/sai mật khẩu|incorrect.*password|invalid.*credentials|mật khẩu không đúng|không tìm thấy/i)
> 98  |     ).toBeVisible({ timeout: 5000 });
      |       ^ Error: expect(locator).toBeVisible() failed
  99  |   });
  100 | });
  101 | 
  102 | // ─── Test 1.3 — Protected routes redirect ────────────────────────────────────
  103 | test.describe('1.3 — Protected routes redirect (chưa login)', () => {
  104 |   test('/vi/history → redirect /vi/login?callbackUrl=...', async ({ page }) => {
  105 |     // Đảm bảo không có auth cookie
  106 |     await page.context().clearCookies();
  107 |     await page.context().clearPermissions();
  108 | 
  109 |     await page.goto('/vi/history');
  110 |     await page.waitForURL(/.*\/login.*/, { timeout: 8000 });
  111 |     await expect(page).toHaveURL(/.*\/login.*/);
  112 |     // callbackUrl phải có trong query
  113 |     expect(page.url()).toContain('callbackUrl');
  114 |   });
  115 | 
  116 |   test('/vi/profile → redirect /vi/login', async ({ page }) => {
  117 |     await page.context().clearCookies();
  118 |     await page.goto('/vi/profile');
  119 |     await page.waitForURL(/.*\/login.*/, { timeout: 8000 });
  120 |     await expect(page).toHaveURL(/.*\/login.*/);
  121 |   });
  122 | 
  123 |   test('/vi/admin → redirect /vi/login', async ({ page }) => {
  124 |     await page.context().clearCookies();
  125 |     await page.goto('/vi/admin');
  126 |     await page.waitForURL(/.*\/login.*/, { timeout: 8000 });
  127 |     await expect(page).toHaveURL(/.*\/login.*/);
  128 |   });
  129 | });
  130 | 
  131 | // ─── Test 1.4 — Admin guard ───────────────────────────────────────────────────
  132 | test.describe('1.4 — Admin guard', () => {
  133 |   test('customer login → /vi/admin/dashboard → bị redirect, KHÔNG thấy dashboard', async ({ page }) => {
  134 |     // Login as customer
  135 |     await page.goto('/vi/login');
  136 |     await page.waitForLoadState('networkidle');
  137 |     await page.getByLabel(/số điện thoại|phone/i).fill(CUSTOMER_PHONE);
  138 |     await page.getByLabel(/mật khẩu|password/i).fill(CUSTOMER_PASSWORD);
  139 |     await page.getByRole('button', { name: /đăng nhập|login/i }).click();
  140 |     await page.waitForURL(/\/(vi|en|ko)\/?$/, { timeout: 10000 });
  141 | 
  142 |     // Thử vào admin
  143 |     await page.goto('/vi/admin/dashboard');
  144 |     await page.waitForLoadState('networkidle');
  145 | 
  146 |     // Không được vào dashboard — phải redirect
  147 |     await expect(page).not.toHaveURL(/.*\/admin\/dashboard/);
  148 |   });
  149 | 
  150 |   test('admin login → /vi/admin → thấy dashboard', async ({ page }) => {
  151 |     await page.goto('/vi/login');
  152 |     await page.waitForLoadState('networkidle');
  153 |     await page.getByLabel(/số điện thoại|phone/i).fill(ADMIN_PHONE);
  154 |     await page.getByLabel(/mật khẩu|password/i).fill(ADMIN_PASSWORD);
  155 |     await page.getByRole('button', { name: /đăng nhập|login/i }).click();
  156 | 
  157 |     // Admin → redirect về /admin/dashboard
  158 |     await page.waitForURL(/.*\/admin.*/, { timeout: 10000 });
  159 |     await expect(page).toHaveURL(/.*\/admin.*/);
  160 | 
  161 |     // Trang có nội dung dashboard (không chỉ là login page)
  162 |     await expect(page.getByText(/dashboard|doanh thu|lịch hẹn|overview/i)).toBeVisible({ timeout: 5000 });
  163 |   });
  164 | });
  165 | 
  166 | // ─── Test 1.5 — Logout ────────────────────────────────────────────────────────
  167 | test.describe('1.5 — Logout', () => {
  168 |   test('login → logout → vào /vi/history → redirect về login', async ({ page }) => {
  169 |     // Login
  170 |     await page.goto('/vi/login');
  171 |     await page.waitForLoadState('networkidle');
  172 |     await page.getByLabel(/số điện thoại|phone/i).fill(CUSTOMER_PHONE);
  173 |     await page.getByLabel(/mật khẩu|password/i).fill(CUSTOMER_PASSWORD);
  174 |     await page.getByRole('button', { name: /đăng nhập|login/i }).click();
  175 |     await page.waitForURL(/\/(vi|en|ko)\/?$/, { timeout: 10000 });
  176 | 
  177 |     // Logout — thường qua Profile hoặc Navbar
  178 |     await page.goto('/vi/profile');
  179 |     await page.waitForLoadState('networkidle');
  180 | 
  181 |     // Click logout button
  182 |     const logoutBtn = page.getByRole('button', { name: /đăng xuất|logout|sign out/i });
  183 |     await expect(logoutBtn).toBeVisible({ timeout: 5000 });
  184 |     await logoutBtn.click();
  185 | 
  186 |     // Đợi redirect
  187 |     await page.waitForLoadState('networkidle');
  188 | 
  189 |     // Bây giờ vào /history → phải redirect về login
  190 |     await page.goto('/vi/history');
  191 |     await page.waitForURL(/.*\/login.*/, { timeout: 8000 });
  192 |     await expect(page).toHaveURL(/.*\/login.*/);
  193 |   });
  194 | });
  195 | 
```