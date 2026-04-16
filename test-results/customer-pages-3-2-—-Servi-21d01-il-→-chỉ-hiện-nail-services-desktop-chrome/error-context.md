# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer\pages.spec.ts >> 3.2 — Services page >> filter tab "Nail" → chỉ hiện nail services
- Location: tests\e2e\customer\pages.spec.ts:69:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/nail tay|nail chân|gel|sơn/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/nail tay|nail chân|gel|sơn/i).first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
          - link "Đặt lịch ngay" [ref=e18] [cursor=pointer]:
            - /url: /vi/booking
    - main [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e22]:
          - paragraph [ref=e23]: DỊCH VỤ
          - heading "Trải nghiệm làm đẹp đẳng cấp" [level=1] [ref=e24]
          - paragraph [ref=e25]: Chúng tôi mang đến dịch vụ làm đẹp chuyên nghiệp với đội ngũ kỹ thuật viên lành nghề.
        - generic [ref=e28]:
          - button "Tất cả" [ref=e29] [cursor=pointer]
          - button "Nail" [active] [ref=e30] [cursor=pointer]
          - button "Nối mi" [ref=e31] [cursor=pointer]
          - button "Lông mày" [ref=e32] [cursor=pointer]
          - button "Gội đầu" [ref=e33] [cursor=pointer]
        - paragraph [ref=e36]: Đã có lỗi xảy ra
    - contentinfo [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]:
            - img "Hanie Studio" [ref=e41]
            - paragraph [ref=e42]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e43]:
            - heading "Dịch vụ" [level=4] [ref=e44]
            - list [ref=e45]:
              - listitem [ref=e46]:
                - link "Nail" [ref=e47] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e48]:
                - link "Nối mi" [ref=e49] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e50]:
                - link "Lông mày" [ref=e51] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e52]:
                - link "Gội đầu" [ref=e53] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e54]:
            - heading "Thông tin" [level=4] [ref=e55]
            - list [ref=e56]:
              - listitem [ref=e57]:
                - img [ref=e58]
                - generic [ref=e61]: 55 Nguyễn Nhạc, Quy Nhơn
              - listitem [ref=e62]:
                - img [ref=e63]
                - link "0901 234 567" [ref=e65] [cursor=pointer]:
                  - /url: tel:0901234567
              - listitem [ref=e66]:
                - img [ref=e67]
                - generic [ref=e70]: 08:00 – 20:00 hàng ngày
          - generic [ref=e71]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e72]
            - link "Đặt lịch ngay" [ref=e73] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e75]: © 2026 Hanie Studio. All rights reserved.
  - alert [ref=e76]
```

# Test source

```ts
  1   | /**
  2   |  * NHÓM TEST 3: Customer Pages (High)
  3   |  *
  4   |  * Test 3.1 — Home page sections
  5   |  * Test 3.2 — Services page
  6   |  * Test 3.3 — Gallery page
  7   |  * Test 3.4 — Location page
  8   |  * Test 3.5 — History page (login required)
  9   |  * Test 3.6 — i18n switch
  10  |  * Test 3.7 — Mobile layout (390px viewport)
  11  |  */
  12  | import { test, expect } from '@playwright/test';
  13  | import { CUSTOMER_AUTH_FILE } from '../../fixtures/helpers';
  14  | 
  15  | // ─── Test 3.1 — Home page sections ───────────────────────────────────────────
  16  | test.describe('3.1 — Home page sections', () => {
  17  |   test('7 sections hiển thị trên trang chủ', async ({ page }) => {
  18  |     await page.goto('/vi');
  19  |     await page.waitForLoadState('networkidle');
  20  | 
  21  |     // Từng section phải có mặt
  22  |     // 1. Hero
  23  |     await expect(page.locator('section').first().or(page.getByRole('banner'))).toBeVisible();
  24  | 
  25  |     // 2. CTA button "Đặt lịch ngay"
  26  |     const ctaBtn = page.getByRole('link', { name: /đặt lịch ngay|book now|예약하기/i }).first();
  27  |     await expect(ctaBtn).toBeVisible({ timeout: 5000 });
  28  | 
  29  |     // Các section text hints
  30  |     const sectionTexts = [/tại sao chọn|why.*us|lý do/i, /dịch vụ|services|서비스/i];
  31  |     for (const text of sectionTexts) {
  32  |       const el = page.getByText(text).first();
  33  |       const count = await el.count();
  34  |       // Không hard-fail nếu thiếu 1 section — log để bug report
  35  |       if (count === 0) {
  36  |         console.warn(`[3.1] Không tìm thấy section: ${text}`);
  37  |       }
  38  |     }
  39  |   });
  40  | 
  41  |   test('Navbar: transparent ở top, blur khi scroll', async ({ page }) => {
  42  |     await page.goto('/vi');
  43  |     await page.waitForLoadState('networkidle');
  44  | 
  45  |     const navbar = page.locator('nav, header').first();
  46  |     await expect(navbar).toBeVisible();
  47  | 
  48  |     // Scroll xuống
  49  |     await page.evaluate(() => window.scrollTo(0, 500));
  50  |     await page.waitForTimeout(300);
  51  | 
  52  |     // Navbar vẫn visible sau khi scroll
  53  |     await expect(navbar).toBeVisible();
  54  |   });
  55  | 
  56  |   test('click "Đặt lịch ngay" → navigate /vi/booking', async ({ page }) => {
  57  |     await page.goto('/vi');
  58  |     await page.waitForLoadState('networkidle');
  59  | 
  60  |     const ctaBtn = page.getByRole('link', { name: /đặt lịch ngay|book now/i }).first();
  61  |     await ctaBtn.click();
  62  |     await page.waitForURL(/.*\/booking.*/);
  63  |     await expect(page).toHaveURL(/.*\/booking.*/);
  64  |   });
  65  | });
  66  | 
  67  | // ─── Test 3.2 — Services page ────────────────────────────────────────────────
  68  | test.describe('3.2 — Services page', () => {
  69  |   test('filter tab "Nail" → chỉ hiện nail services', async ({ page }) => {
  70  |     await page.goto('/vi/services');
  71  |     await page.waitForLoadState('networkidle');
  72  | 
  73  |     // Click tab Nail
  74  |     await page.getByRole('button', { name: /^nail$/i }).or(page.getByText(/^nail$/i)).first().click();
  75  |     await page.waitForTimeout(500);
  76  | 
  77  |     // Verify nail services hiện
> 78  |     await expect(page.getByText(/nail tay|nail chân|gel|sơn/i).first()).toBeVisible({ timeout: 5000 });
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  79  |   });
  80  | 
  81  |   test('filter tab "Nối mi" → chỉ hiện lash services', async ({ page }) => {
  82  |     await page.goto('/vi/services');
  83  |     await page.waitForLoadState('networkidle');
  84  | 
  85  |     await page.getByRole('button', { name: /nối mi|lash/i }).first().click();
  86  |     await page.waitForTimeout(500);
  87  | 
  88  |     await expect(page.getByText(/nối mi|classic|volume|mega/i).first()).toBeVisible({ timeout: 5000 });
  89  |   });
  90  | 
  91  |   test('addon table hiện cho mỗi nhóm dịch vụ', async ({ page }) => {
  92  |     await page.goto('/vi/services');
  93  |     await page.waitForLoadState('networkidle');
  94  | 
  95  |     // Phải có bảng addon
  96  |     const addonTable = page.locator('table').first();
  97  |     await expect(addonTable).toBeVisible({ timeout: 5000 });
  98  |   });
  99  | 
  100 |   test('ServiceCard "Đặt dịch vụ này" → link đến /vi/booking', async ({ page }) => {
  101 |     await page.goto('/vi/services');
  102 |     await page.waitForLoadState('networkidle');
  103 | 
  104 |     const bookBtn = page.getByRole('link', { name: /đặt dịch vụ này|book this|đặt lịch/i }).first();
  105 |     await expect(bookBtn).toBeVisible({ timeout: 5000 });
  106 | 
  107 |     const href = await bookBtn.getAttribute('href');
  108 |     expect(href).toMatch(/\/booking/);
  109 |   });
  110 | });
  111 | 
  112 | // ─── Test 3.3 — Gallery page ──────────────────────────────────────────────────
  113 | test.describe('3.3 — Gallery page', () => {
  114 |   test('gallery grid hiển thị (hoặc skeleton nếu chưa có ảnh)', async ({ page }) => {
  115 |     await page.goto('/vi/gallery');
  116 |     await page.waitForLoadState('networkidle');
  117 | 
  118 |     // Phải có grid hoặc skeleton hoặc empty state
  119 |     const grid = page.locator('[data-testid="gallery-grid"], .grid, main img, .skeleton').first();
  120 |     await expect(grid).toBeVisible({ timeout: 5000 });
  121 |   });
  122 | 
  123 |   test('filter tabs hoạt động', async ({ page }) => {
  124 |     await page.goto('/vi/gallery');
  125 |     await page.waitForLoadState('networkidle');
  126 | 
  127 |     // Click tab đầu tiên
  128 |     const filterBtn = page.getByRole('button', { name: /tất cả|nail|mi|all/i }).first();
  129 |     await expect(filterBtn).toBeVisible({ timeout: 5000 });
  130 |     await filterBtn.click();
  131 |     // Không crash
  132 |     await page.waitForTimeout(300);
  133 |     await expect(page).toHaveURL(/.*\/gallery.*/);
  134 |   });
  135 | });
  136 | 
  137 | // ─── Test 3.4 — Location page ────────────────────────────────────────────────
  138 | test.describe('3.4 — Location page', () => {
  139 |   test('địa chỉ, giờ mở cửa, SĐT hiển thị', async ({ page }) => {
  140 |     await page.goto('/vi/location');
  141 |     await page.waitForLoadState('networkidle');
  142 | 
  143 |     // Địa chỉ Quy Nhơn
  144 |     await expect(
  145 |       page.getByText(/quy nhơn|nguyễn nhạc|quy nhon/i).first()
  146 |     ).toBeVisible({ timeout: 5000 });
  147 | 
  148 |     // Giờ mở cửa
  149 |     await expect(
  150 |       page.getByText(/08:00|8h|giờ mở cửa|opening hours/i).first()
  151 |     ).toBeVisible({ timeout: 5000 });
  152 | 
  153 |     // SĐT
  154 |     await expect(
  155 |       page.getByText(/09\d{8}|0[3-9]\d{8}/i).first()
  156 |     ).toBeVisible({ timeout: 5000 });
  157 |   });
  158 | 
  159 |   test('Google Maps iframe hiển thị', async ({ page }) => {
  160 |     await page.goto('/vi/location');
  161 |     await page.waitForLoadState('networkidle');
  162 | 
  163 |     const iframe = page.locator('iframe[src*="google"], iframe[src*="maps"]').first();
  164 |     await expect(iframe).toBeVisible({ timeout: 10000 });
  165 |   });
  166 | });
  167 | 
  168 | // ─── Test 3.5 — History page (login required) ────────────────────────────────
  169 | test.describe('3.5 — History page (login required)', () => {
  170 |   test.use({ storageState: CUSTOMER_AUTH_FILE });
  171 | 
  172 |   test('login → /vi/history → tabs Sắp tới / Đã hoàn thành / Đã huỷ hiển thị', async ({ page }) => {
  173 |     await page.goto('/vi/history');
  174 |     await page.waitForLoadState('networkidle');
  175 | 
  176 |     // Phải ở trang history (không bị redirect về login)
  177 |     await expect(page).not.toHaveURL(/.*\/login.*/);
  178 | 
```