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
        - button "Open menu" [ref=e7] [cursor=pointer]:
          - img [ref=e8]
    - main [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]:
          - paragraph [ref=e12]: THƯ VIỆN ẢNH
          - heading "Tác phẩm từ Hanie Studio" [level=1] [ref=e13]
        - generic [ref=e16]:
          - button "Tất cả" [ref=e17] [cursor=pointer]
          - button "Lông mày" [ref=e18] [cursor=pointer]
          - button "Gội đầu" [ref=e19] [cursor=pointer]
          - button "Studio" [ref=e20] [cursor=pointer]
          - button "Nối mi" [ref=e21] [cursor=pointer]
          - button "Nail" [ref=e22] [cursor=pointer]
        - generic [ref=e24]:
          - img [ref=e25] [cursor=pointer]
          - img [ref=e28] [cursor=pointer]
          - img [ref=e31] [cursor=pointer]
          - img [ref=e34] [cursor=pointer]
          - img [ref=e37] [cursor=pointer]
          - img [ref=e40] [cursor=pointer]
          - img [ref=e43] [cursor=pointer]
          - img [ref=e46] [cursor=pointer]
          - img [ref=e49] [cursor=pointer]
    - contentinfo [ref=e52]:
      - generic [ref=e53]:
        - generic [ref=e54]:
          - generic [ref=e55]:
            - img "Hanie Studio" [ref=e56]
            - paragraph [ref=e57]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e58]:
            - heading "Dịch vụ" [level=4] [ref=e59]
            - list [ref=e60]:
              - listitem [ref=e61]:
                - link "Nail" [ref=e62] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e63]:
                - link "Nối mi" [ref=e64] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e65]:
                - link "Lông mày" [ref=e66] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e67]:
                - link "Gội đầu" [ref=e68] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e69]:
            - heading "Thông tin" [level=4] [ref=e70]
            - list [ref=e71]:
              - listitem [ref=e72]:
                - img [ref=e73]
                - generic [ref=e76]: 55 Nguyễn Nhạc, Quy Nhơn
              - listitem [ref=e77]:
                - img [ref=e78]
                - link "0901 234 567" [ref=e80] [cursor=pointer]:
                  - /url: tel:0901234567
              - listitem [ref=e81]:
                - img [ref=e82]
                - generic [ref=e85]: 08:00 – 20:00 hàng ngày
          - generic [ref=e86]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e87]
            - link "Đặt lịch ngay" [ref=e88] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e90]: © 2026 Hanie Studio. All rights reserved.
    - navigation [ref=e91]:
      - generic [ref=e92]:
        - link "Trang chủ" [ref=e93] [cursor=pointer]:
          - /url: /vi
          - img [ref=e94]
          - generic [ref=e97]: Trang chủ
        - link "Đặt lịch" [ref=e98] [cursor=pointer]:
          - /url: /vi/booking
          - img [ref=e99]
          - generic [ref=e102]: Đặt lịch
        - link "Lịch sử" [ref=e103] [cursor=pointer]:
          - /url: /vi/history
          - img [ref=e104]
          - generic [ref=e107]: Lịch sử
        - link "Voucher" [ref=e108] [cursor=pointer]:
          - /url: /vi/vouchers
          - img [ref=e109]
          - generic [ref=e112]: Voucher
        - link "Tôi" [ref=e113] [cursor=pointer]:
          - /url: /vi/profile
          - img [ref=e114]
          - generic [ref=e117]: Tôi
  - alert [ref=e118]
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