# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\auth.spec.ts >> 1.5 — Logout >> login → logout → vào /vi/history → redirect về login
- Location: tests\e2e\auth\auth.spec.ts:168:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /đăng xuất|logout|sign out/i }).or(getByRole('link', { name: /đăng xuất|logout|sign out/i })).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /đăng xuất|logout|sign out/i }).or(getByRole('link', { name: /đăng xuất|logout|sign out/i })).first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "Hanie Studio" [ref=e5] [cursor=pointer]:
          - /url: /vi
          - img "Hanie Studio" [ref=e6]
        - navigation [ref=e7]:
          - link "Trang chủ" [ref=e8] [cursor=pointer]:
            - /url: /vi
          - link "Dịch vụ" [ref=e9] [cursor=pointer]:
            - /url: /vi/services
          - link "Thư viện ảnh" [ref=e10] [cursor=pointer]:
            - /url: /vi/gallery
          - link "Đặt lịch" [ref=e11] [cursor=pointer]:
            - /url: /vi/booking
          - link "Địa chỉ" [ref=e12] [cursor=pointer]:
            - /url: /vi/location
        - generic [ref=e13]:
          - generic [ref=e14]:
            - button "Switch to VI" [ref=e15] [cursor=pointer]: VI
            - button "Switch to EN" [ref=e16] [cursor=pointer]: EN
            - button "Switch to KO" [ref=e17] [cursor=pointer]: KO
          - button "Thông báo" [ref=e19] [cursor=pointer]:
            - img [ref=e20]
          - link "Đặt lịch ngay" [ref=e23] [cursor=pointer]:
            - /url: /vi/booking
          - link [ref=e24] [cursor=pointer]:
            - /url: /vi/profile
            - img [ref=e25]
    - main [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e32]:
          - img [ref=e34]
          - generic [ref=e37]:
            - paragraph
            - paragraph [ref=e38]: "0977000001"
        - generic [ref=e41]:
          - button "Lịch sử đặt lịch" [ref=e42] [cursor=pointer]:
            - img [ref=e43]
            - text: Lịch sử đặt lịch
          - button "Lịch sử thanh toán" [ref=e46] [cursor=pointer]:
            - img [ref=e47]
            - text: Lịch sử thanh toán
          - button "Voucher của tôi" [ref=e50] [cursor=pointer]:
            - img [ref=e51]
            - text: Voucher của tôi
          - button "Hồ sơ cá nhân" [ref=e54] [cursor=pointer]:
            - img [ref=e55]
            - text: Hồ sơ cá nhân
        - generic [ref=e59]:
          - tablist [ref=e60]:
            - tab "Sắp tới" [selected] [ref=e61] [cursor=pointer]
            - tab "Hoàn thành" [ref=e62] [cursor=pointer]
            - tab "Đã huỷ" [ref=e63] [cursor=pointer]
          - generic [ref=e64]:
            - paragraph [ref=e65]: Bạn chưa có lịch hẹn nào
            - paragraph [ref=e66]: Đặt lịch ngay để trải nghiệm dịch vụ của chúng tôi
            - link "Đặt lịch ngay" [ref=e67] [cursor=pointer]:
              - /url: /vi/booking
    - contentinfo [ref=e68]:
      - generic [ref=e69]:
        - generic [ref=e70]:
          - generic [ref=e71]:
            - img "Hanie Studio" [ref=e72]
            - paragraph [ref=e73]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e74]:
            - heading "Dịch vụ" [level=4] [ref=e75]
            - list [ref=e76]:
              - listitem [ref=e77]:
                - link "Nail" [ref=e78] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e79]:
                - link "Nối mi" [ref=e80] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e81]:
                - link "Lông mày" [ref=e82] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e83]:
                - link "Gội đầu" [ref=e84] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e85]:
            - heading "Thông tin" [level=4] [ref=e86]
            - list [ref=e87]:
              - listitem [ref=e88]:
                - img [ref=e89]
                - generic [ref=e92]: 55 Nguyễn Nhạc, Quy Nhơn, Bình Định
              - listitem [ref=e93]:
                - img [ref=e94]
                - link "0967 273 066" [ref=e96] [cursor=pointer]:
                  - /url: tel:0967273066
              - listitem [ref=e97]:
                - img [ref=e98]
                - generic [ref=e101]: 08:00 – 20:00 hàng ngày
          - generic [ref=e102]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e103]
            - link "Đặt lịch ngay" [ref=e104] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e106]: © 2026 Hanie Studio. All rights reserved.
  - alert [ref=e107]
```

# Test source

```ts
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
  98  |     ).toBeVisible({ timeout: 5000 });
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
  162 |     await expect(page.getByText(/dashboard|doanh thu|lịch hẹn|overview/i).first()).toBeVisible({ timeout: 5000 });
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
  181 |     // Click logout button — có thể là button, link, hoặc trong dropdown
  182 |     const logoutBtn = page.getByRole('button', { name: /đăng xuất|logout|sign out/i })
  183 |       .or(page.getByRole('link', { name: /đăng xuất|logout|sign out/i }))
  184 |       .first();
> 185 |     await expect(logoutBtn).toBeVisible({ timeout: 5000 });
      |                             ^ Error: expect(locator).toBeVisible() failed
  186 |     await logoutBtn.click();
  187 | 
  188 |     // Đợi redirect
  189 |     await page.waitForLoadState('networkidle');
  190 | 
  191 |     // Bây giờ vào /history → phải redirect về login
  192 |     await page.goto('/vi/history');
  193 |     await page.waitForURL(/.*\/login.*/, { timeout: 8000 });
  194 |     await expect(page).toHaveURL(/.*\/login.*/);
  195 |   });
  196 | });
  197 | 
```