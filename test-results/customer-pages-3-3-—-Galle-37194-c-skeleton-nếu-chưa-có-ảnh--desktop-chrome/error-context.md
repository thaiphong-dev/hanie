# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer\pages.spec.ts >> 3.3 — Gallery page >> gallery grid hiển thị (hoặc skeleton nếu chưa có ảnh)
- Location: tests\e2e\customer\pages.spec.ts:114:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
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
          - link "Đặt lịch ngay" [ref=e18] [cursor=pointer]:
            - /url: /vi/booking
    - main [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e21]:
          - paragraph [ref=e22]: THƯ VIỆN ẢNH
          - heading "Tác phẩm từ Hanie Studio" [level=1] [ref=e23]
        - generic [ref=e26]:
          - button "Tất cả" [ref=e27] [cursor=pointer]
          - button "Lông mày" [ref=e28] [cursor=pointer]
          - button "Gội đầu" [ref=e29] [cursor=pointer]
          - button "Studio" [ref=e30] [cursor=pointer]
          - button "Nối mi" [ref=e31] [cursor=pointer]
          - button "Nail" [ref=e32] [cursor=pointer]
        - generic [ref=e34]:
          - img [ref=e35] [cursor=pointer]
          - img [ref=e38] [cursor=pointer]
          - img [ref=e41] [cursor=pointer]
          - img [ref=e44] [cursor=pointer]
          - img [ref=e47] [cursor=pointer]
          - img [ref=e50] [cursor=pointer]
          - img [ref=e53] [cursor=pointer]
          - img [ref=e56] [cursor=pointer]
          - img [ref=e59] [cursor=pointer]
    - contentinfo [ref=e62]:
      - generic [ref=e63]:
        - generic [ref=e64]:
          - generic [ref=e65]:
            - img "Hanie Studio" [ref=e66]
            - paragraph [ref=e67]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e68]:
            - heading "Dịch vụ" [level=4] [ref=e69]
            - list [ref=e70]:
              - listitem [ref=e71]:
                - link "Nail" [ref=e72] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e73]:
                - link "Nối mi" [ref=e74] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e75]:
                - link "Lông mày" [ref=e76] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e77]:
                - link "Gội đầu" [ref=e78] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e79]:
            - heading "Thông tin" [level=4] [ref=e80]
            - list [ref=e81]:
              - listitem [ref=e82]:
                - img [ref=e83]
                - generic [ref=e86]: 55 Nguyễn Nhạc, Quy Nhơn
              - listitem [ref=e87]:
                - img [ref=e88]
                - link "0901 234 567" [ref=e90] [cursor=pointer]:
                  - /url: tel:0901234567
              - listitem [ref=e91]:
                - img [ref=e92]
                - generic [ref=e95]: 08:00 – 20:00 hàng ngày
          - generic [ref=e96]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e97]
            - link "Đặt lịch ngay" [ref=e98] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e100]: © 2026 Hanie Studio. All rights reserved.
  - alert [ref=e101]
```

# Test source

```ts
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
  78  |     await expect(page.getByText(/nail tay|nail chân|gel|sơn/i).first()).toBeVisible({ timeout: 5000 });
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
> 116 |     await page.waitForLoadState('networkidle');
      |                ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
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
  179 |     // Tabs
  180 |     await expect(page.getByRole('tab', { name: /sắp tới|upcoming/i })).toBeVisible({ timeout: 5000 });
  181 |     await expect(page.getByRole('tab', { name: /đã hoàn thành|completed|done/i })).toBeVisible({ timeout: 5000 });
  182 |     await expect(page.getByRole('tab', { name: /đã huỷ|cancelled/i })).toBeVisible({ timeout: 5000 });
  183 |   });
  184 | 
  185 |   test('history page: empty state hiện đẹp khi chưa có booking', async ({ page }) => {
  186 |     await page.goto('/vi/history');
  187 |     await page.waitForLoadState('networkidle');
  188 | 
  189 |     await expect(page).not.toHaveURL(/.*\/login.*/);
  190 | 
  191 |     // Kiểm tra có nội dung (không blank, không error)
  192 |     const mainContent = page.locator('main').first();
  193 |     await expect(mainContent).toBeVisible();
  194 | 
  195 |     // Nếu không có booking → hiện empty state message
  196 |     const emptyState = page.getByText(/chưa có lịch hẹn|no.*booking|no.*appointment|chưa có đơn/i).first();
  197 |     const bookingList = page.locator('[data-testid="booking-item"]').first();
  198 | 
  199 |     // Phải có một trong hai: empty state hoặc booking list
  200 |     const hasEmpty = await emptyState.count() > 0;
  201 |     const hasList = await bookingList.count() > 0;
  202 |     expect(hasEmpty || hasList).toBe(true);
  203 |   });
  204 | });
  205 | 
  206 | // ─── Test 3.6 — i18n switch ──────────────────────────────────────────────────
  207 | test.describe('3.6 — i18n switch', () => {
  208 |   test('switch sang EN → URL đổi sang /en/... và text đổi tiếng Anh', async ({ page }) => {
  209 |     await page.goto('/vi');
  210 |     await page.waitForLoadState('networkidle');
  211 | 
  212 |     // Tìm language switcher
  213 |     const langSwitcher = page.getByRole('button', { name: /vi|tiếng việt|language|ngôn ngữ/i }).first();
  214 | 
  215 |     if (await langSwitcher.count() > 0) {
  216 |       await langSwitcher.click();
```