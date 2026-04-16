# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer\pages.spec.ts >> 3.4 — Location page >> địa chỉ, giờ mở cửa, SĐT hiển thị
- Location: tests\e2e\customer\pages.spec.ts:139:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/09\d{8}|0[3-9]\d{8}/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/09\d{8}|0[3-9]\d{8}/i).first()

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
          - paragraph [ref=e12]: ĐỊA CHỈ STUDIO
          - heading "Tìm đường đến Hanie Studio" [level=1] [ref=e13]
        - generic [ref=e14]:
          - generic [ref=e15]:
            - generic [ref=e16]:
              - generic [ref=e17]:
                - img [ref=e19]
                - generic [ref=e22]:
                  - paragraph [ref=e23]: Địa chỉ
                  - paragraph [ref=e24]: 55 Nguyễn Nhạc, Quy Nhơn
              - generic [ref=e25]:
                - img [ref=e27]
                - generic [ref=e30]:
                  - paragraph [ref=e31]: Giờ mở cửa
                  - paragraph [ref=e32]: "Thứ 2 – Chủ nhật: 08:00 – 20:00"
              - generic [ref=e33]:
                - img [ref=e35]
                - generic [ref=e37]:
                  - paragraph [ref=e38]: Liên hệ
                  - paragraph [ref=e39]: 0901 234 567
              - generic [ref=e40]:
                - link "Gọi ngay" [ref=e41] [cursor=pointer]:
                  - /url: tel:0901234567
                  - img [ref=e42]
                  - text: Gọi ngay
                - link "Mở Google Maps" [ref=e44] [cursor=pointer]:
                  - /url: https://maps.google.com/?q=55+Nguy%E1%BB%85n+Nh%E1%BA%A1c+Quy+Nh%C6%A1n
                  - img [ref=e45]
                  - text: Mở Google Maps
                - link "Đặt lịch ngay" [ref=e49] [cursor=pointer]:
                  - /url: /vi/booking
            - iframe [ref=e51]:
              - generic [active] [ref=f1e1]:
                - link "Mở trong Maps (mở trong thẻ mới)" [ref=f1e4] [cursor=pointer]:
                  - /url: https://maps.google.com/maps?ll=13.764631,109.219182&z=16&t=m&hl=vi-VN&gl=US&mapclient=embed&q=55%20Nguy%E1%BB%85n%20Nh%E1%BA%A1c%20Ng%C3%B4%20M%C3%A2y%20Quy%20Nh%C6%A1n%20Nam%20Gia%20Lai
                  - text: Mở trong Maps
                  - img [ref=f1e6]
                - generic [ref=f1e9]:
                  - generic:
                    - button "Phím tắt"
                  - region "Bản đồ" [ref=f1e10]
                  - generic [ref=f1e11]:
                    - iframe [ref=f1e33]:
                      
                    - button "Các chế độ điều khiển camera trên bản đồ" [ref=f1e35] [cursor=pointer]
                    - button "Hiển thị hình ảnh qua vệ tinh" [ref=f1e38] [cursor=pointer]:
                      - generic [ref=f1e42]:
                        - region [ref=f1e43]
                        - iframe [ref=f1e49]:
                          
                    - img "Google" [ref=f1e51]
                    - generic [ref=f1e52]:
                      - button "Phím tắt" [ref=f1e58] [cursor=pointer]
                      - generic [ref=f1e63]: Dữ liệu bản đồ ©2026
                      - link "Điều khoản (mở trong thẻ mới)" [ref=f1e68] [cursor=pointer]:
                        - /url: https://www.google.com/intl/vi-VN_US/help/terms_maps.html
                        - text: Điều khoản
          - heading "Không gian studio" [level=2] [ref=e53]
    - contentinfo [ref=e59]:
      - generic [ref=e60]:
        - generic [ref=e61]:
          - generic [ref=e62]:
            - img "Hanie Studio" [ref=e63]
            - paragraph [ref=e64]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e65]:
            - heading "Dịch vụ" [level=4] [ref=e66]
            - list [ref=e67]:
              - listitem [ref=e68]:
                - link "Nail" [ref=e69] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e70]:
                - link "Nối mi" [ref=e71] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e72]:
                - link "Lông mày" [ref=e73] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e74]:
                - link "Gội đầu" [ref=e75] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e76]:
            - heading "Thông tin" [level=4] [ref=e77]
            - list [ref=e78]:
              - listitem [ref=e79]:
                - img [ref=e80]
                - generic [ref=e83]: 55 Nguyễn Nhạc, Quy Nhơn
              - listitem [ref=e84]:
                - img [ref=e85]
                - link "0901 234 567" [ref=e87] [cursor=pointer]:
                  - /url: tel:0901234567
              - listitem [ref=e88]:
                - img [ref=e89]
                - generic [ref=e92]: 08:00 – 20:00 hàng ngày
          - generic [ref=e93]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e94]
            - link "Đặt lịch ngay" [ref=e95] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e97]: © 2026 Hanie Studio. All rights reserved.
    - navigation [ref=e98]:
      - generic [ref=e99]:
        - link "Trang chủ" [ref=e100] [cursor=pointer]:
          - /url: /vi
          - img [ref=e101]
          - generic [ref=e104]: Trang chủ
        - link "Đặt lịch" [ref=e105] [cursor=pointer]:
          - /url: /vi/booking
          - img [ref=e106]
          - generic [ref=e109]: Đặt lịch
        - link "Lịch sử" [ref=e110] [cursor=pointer]:
          - /url: /vi/history
          - img [ref=e111]
          - generic [ref=e114]: Lịch sử
        - link "Voucher" [ref=e115] [cursor=pointer]:
          - /url: /vi/vouchers
          - img [ref=e116]
          - generic [ref=e119]: Voucher
        - link "Tôi" [ref=e120] [cursor=pointer]:
          - /url: /vi/profile
          - img [ref=e121]
          - generic [ref=e124]: Tôi
  - alert [ref=e125]
```

# Test source

```ts
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
> 156 |     ).toBeVisible({ timeout: 5000 });
      |       ^ Error: expect(locator).toBeVisible() failed
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
  217 |       // Click EN option
  218 |       const enOption = page.getByRole('option', { name: /english|en/i }).or(page.getByRole('button', { name: /english|en/i }));
  219 |       if (await enOption.count() > 0) {
  220 |         await enOption.first().click();
  221 |         await page.waitForURL(/\/en\//);
  222 |         await expect(page).toHaveURL(/\/en\//);
  223 |       }
  224 |     } else {
  225 |       // Fallback: navigate trực tiếp
  226 |       await page.goto('/en');
  227 |       await page.waitForLoadState('networkidle');
  228 |       await expect(page).toHaveURL(/\/en.*/);
  229 |     }
  230 |   });
  231 | 
  232 |   test('switch sang KO → URL đổi sang /ko/...', async ({ page }) => {
  233 |     await page.goto('/vi');
  234 |     await page.waitForLoadState('networkidle');
  235 | 
  236 |     const langSwitcher = page.getByRole('button', { name: /vi|tiếng việt|language/i }).first();
  237 | 
  238 |     if (await langSwitcher.count() > 0) {
  239 |       await langSwitcher.click();
  240 |       const koOption = page.getByRole('option', { name: /한국어|korean|ko/i }).or(page.getByRole('button', { name: /한국어|ko/i }));
  241 |       if (await koOption.count() > 0) {
  242 |         await koOption.first().click();
  243 |         await page.waitForURL(/\/ko\//);
  244 |         await expect(page).toHaveURL(/\/ko\//);
  245 |       }
  246 |     } else {
  247 |       await page.goto('/ko');
  248 |       await page.waitForLoadState('networkidle');
  249 |       await expect(page).toHaveURL(/\/ko.*/);
  250 |     }
  251 |   });
  252 | 
  253 |   test('chuyển ngôn ngữ không reload page (không mất state)', async ({ page }) => {
  254 |     await page.goto('/vi');
  255 |     await page.waitForLoadState('networkidle');
  256 | 
```