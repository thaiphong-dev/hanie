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
          - paragraph [ref=e22]: ĐỊA CHỈ STUDIO
          - heading "Tìm đường đến Hanie Studio" [level=1] [ref=e23]
        - generic [ref=e24]:
          - generic [ref=e25]:
            - generic [ref=e26]:
              - generic [ref=e27]:
                - img [ref=e29]
                - generic [ref=e32]:
                  - paragraph [ref=e33]: Địa chỉ
                  - paragraph [ref=e34]: 55 Nguyễn Nhạc, Quy Nhơn
              - generic [ref=e35]:
                - img [ref=e37]
                - generic [ref=e40]:
                  - paragraph [ref=e41]: Giờ mở cửa
                  - paragraph [ref=e42]: "Thứ 2 – Chủ nhật: 08:00 – 20:00"
              - generic [ref=e43]:
                - img [ref=e45]
                - generic [ref=e47]:
                  - paragraph [ref=e48]: Liên hệ
                  - paragraph [ref=e49]: 0901 234 567
              - generic [ref=e50]:
                - link "Gọi ngay" [ref=e51] [cursor=pointer]:
                  - /url: tel:0901234567
                  - img [ref=e52]
                  - text: Gọi ngay
                - link "Mở Google Maps" [ref=e54] [cursor=pointer]:
                  - /url: https://maps.google.com/?q=55+Nguy%E1%BB%85n+Nh%E1%BA%A1c+Quy+Nh%C6%A1n
                  - img [ref=e55]
                  - text: Mở Google Maps
                - link "Đặt lịch ngay" [ref=e59] [cursor=pointer]:
                  - /url: /vi/booking
            - iframe [ref=e61]:
              - generic [active] [ref=f1e1]:
                - link "Xem đường đi (mở trong thẻ mới)" [ref=f1e6] [cursor=pointer]:
                  - /url: https://www.google.com/maps/dir//''/data=!4m7!4m6!1m1!4e2!1m2!1m1!1s0x316f6c934064720b:0xb5669c49858b14d!3e0?g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYASAA
                  - img [ref=f1e10]
                - generic [ref=f1e13]:
                  - generic:
                    - button "Phím tắt"
                  - region "Bản đồ" [ref=f1e14]
                  - generic [ref=f1e15]:
                    - iframe [ref=f1e46]:
                      
                    - button "Các chế độ điều khiển camera trên bản đồ" [ref=f1e48] [cursor=pointer]
                    - button "Hiển thị hình ảnh qua vệ tinh" [ref=f1e51] [cursor=pointer]:
                      - generic [ref=f1e55]:
                        - region [ref=f1e56]
                        - iframe [ref=f1e62]:
                          
                    - img "Google" [ref=f1e64]
                    - generic [ref=f1e65]:
                      - button "Phím tắt" [ref=f1e71] [cursor=pointer]
                      - generic [ref=f1e76]: Dữ liệu bản đồ ©2026
                      - link "Điều khoản (mở trong thẻ mới)" [ref=f1e81] [cursor=pointer]:
                        - /url: https://www.google.com/intl/vi-VN_US/help/terms_maps.html
                        - text: Điều khoản
                      - link "Báo cáo một lỗi bản đồ" [ref=f1e86] [cursor=pointer]:
                        - /url: https://www.google.com/maps/@13.7646308,109.2191816,16z/data=!10m1!1e1!12b1?source=apiv3&rapsrc=apiv3
          - heading "Không gian studio" [level=2] [ref=e63]
    - contentinfo [ref=e69]:
      - generic [ref=e70]:
        - generic [ref=e71]:
          - generic [ref=e72]:
            - img "Hanie Studio" [ref=e73]
            - paragraph [ref=e74]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e75]:
            - heading "Dịch vụ" [level=4] [ref=e76]
            - list [ref=e77]:
              - listitem [ref=e78]:
                - link "Nail" [ref=e79] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e80]:
                - link "Nối mi" [ref=e81] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e82]:
                - link "Lông mày" [ref=e83] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e84]:
                - link "Gội đầu" [ref=e85] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e86]:
            - heading "Thông tin" [level=4] [ref=e87]
            - list [ref=e88]:
              - listitem [ref=e89]:
                - img [ref=e90]
                - generic [ref=e93]: 55 Nguyễn Nhạc, Quy Nhơn
              - listitem [ref=e94]:
                - img [ref=e95]
                - link "0901 234 567" [ref=e97] [cursor=pointer]:
                  - /url: tel:0901234567
              - listitem [ref=e98]:
                - img [ref=e99]
                - generic [ref=e102]: 08:00 – 20:00 hàng ngày
          - generic [ref=e103]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e104]
            - link "Đặt lịch ngay" [ref=e105] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e107]: © 2026 Hanie Studio. All rights reserved.
  - alert [ref=e108]
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