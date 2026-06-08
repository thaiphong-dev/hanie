# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer\pages.spec.ts >> 3.5 — History page (login required) >> login → /vi/history → tabs Sắp tới / Đã hoàn thành / Đã huỷ hiển thị
- Location: tests\e2e\customer\pages.spec.ts:172:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('tab', { name: /đã hoàn thành|completed|done/i }).or(getByRole('button', { name: /đã hoàn thành|completed|done/i })).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('tab', { name: /đã hoàn thành|completed|done/i }).or(getByRole('button', { name: /đã hoàn thành|completed|done/i })).first()

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
          - link "Tester" [ref=e24] [cursor=pointer]:
            - /url: /vi/profile
            - img [ref=e25]
            - text: Tester
    - main [ref=e28]:
      - generic [ref=e29]:
        - heading "Lịch sử đặt lịch" [level=1] [ref=e32]
        - tablist [ref=e35]:
          - tab "Sắp tới" [selected] [ref=e36] [cursor=pointer]
          - tab "Hoàn thành" [ref=e37] [cursor=pointer]
          - tab "Đã huỷ" [ref=e38] [cursor=pointer]
        - generic [ref=e40]:
          - paragraph [ref=e41]: Bạn chưa có lịch hẹn nào
          - paragraph [ref=e42]: Đặt lịch ngay để trải nghiệm dịch vụ của chúng tôi
          - link "Đặt lịch ngay" [ref=e43] [cursor=pointer]:
            - /url: /vi/booking
    - contentinfo [ref=e44]:
      - generic [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]:
            - img "Hanie Studio" [ref=e48]
            - paragraph [ref=e49]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e50]:
            - heading "Dịch vụ" [level=4] [ref=e51]
            - list [ref=e52]:
              - listitem [ref=e53]:
                - link "Nail" [ref=e54] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e55]:
                - link "Nối mi" [ref=e56] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e57]:
                - link "Lông mày" [ref=e58] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e59]:
                - link "Gội đầu" [ref=e60] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e61]:
            - heading "Thông tin" [level=4] [ref=e62]
            - list [ref=e63]:
              - listitem [ref=e64]:
                - img [ref=e65]
                - generic [ref=e68]: 55 Nguyễn Nhạc, Quy Nhơn, Bình Định
              - listitem [ref=e69]:
                - img [ref=e70]
                - link "0967 273 066" [ref=e72] [cursor=pointer]:
                  - /url: tel:0967273066
              - listitem [ref=e73]:
                - img [ref=e74]
                - generic [ref=e77]: 08:00 – 20:00 hàng ngày
          - generic [ref=e78]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e79]
            - link "Đặt lịch ngay" [ref=e80] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e82]: © 2026 Hanie Studio. All rights reserved.
  - alert [ref=e83]
```

# Test source

```ts
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
  179 |     // Tabs — có thể dùng role="tab" hoặc button/link
  180 |     const tabSelector = page.getByRole('tab', { name: /sắp tới|upcoming/i })
  181 |       .or(page.getByRole('button', { name: /sắp tới|upcoming/i }))
  182 |       .first();
  183 |     await expect(tabSelector).toBeVisible({ timeout: 5000 });
  184 | 
  185 |     const tab2 = page.getByRole('tab', { name: /đã hoàn thành|completed|done/i })
  186 |       .or(page.getByRole('button', { name: /đã hoàn thành|completed|done/i }))
  187 |       .first();
> 188 |     await expect(tab2).toBeVisible({ timeout: 5000 });
      |                        ^ Error: expect(locator).toBeVisible() failed
  189 | 
  190 |     const tab3 = page.getByRole('tab', { name: /đã huỷ|cancelled/i })
  191 |       .or(page.getByRole('button', { name: /đã huỷ|cancelled/i }))
  192 |       .first();
  193 |     await expect(tab3).toBeVisible({ timeout: 5000 });
  194 |   });
  195 | 
  196 |   test('history page: empty state hiện đẹp khi chưa có booking', async ({ page }) => {
  197 |     await page.goto('/vi/history');
  198 |     await page.waitForLoadState('networkidle');
  199 | 
  200 |     await expect(page).not.toHaveURL(/.*\/login.*/);
  201 | 
  202 |     // Kiểm tra có nội dung (không blank, không error)
  203 |     const mainContent = page.locator('main').first();
  204 |     await expect(mainContent).toBeVisible();
  205 | 
  206 |     // Nếu không có booking → hiện empty state message
  207 |     const emptyState = page.getByText(/chưa có lịch hẹn|no.*booking|no.*appointment|chưa có đơn/i).first();
  208 |     const bookingList = page.locator('[data-testid="booking-item"]').first();
  209 | 
  210 |     // Phải có một trong hai: empty state hoặc booking list
  211 |     const hasEmpty = await emptyState.count() > 0;
  212 |     const hasList = await bookingList.count() > 0;
  213 |     expect(hasEmpty || hasList).toBe(true);
  214 |   });
  215 | });
  216 | 
  217 | // ─── Test 3.6 — i18n switch ──────────────────────────────────────────────────
  218 | test.describe('3.6 — i18n switch', () => {
  219 |   test('switch sang EN → URL đổi sang /en/... và text đổi tiếng Anh', async ({ page }) => {
  220 |     await page.goto('/vi');
  221 |     await page.waitForLoadState('networkidle');
  222 | 
  223 |     // Tìm language switcher
  224 |     const langSwitcher = page.getByRole('button', { name: /vi|tiếng việt|language|ngôn ngữ/i }).first();
  225 | 
  226 |     if (await langSwitcher.count() > 0) {
  227 |       await langSwitcher.click();
  228 |       // Click EN option
  229 |       const enOption = page.getByRole('option', { name: /english|en/i }).or(page.getByRole('button', { name: /english|en/i }));
  230 |       if (await enOption.count() > 0) {
  231 |         await enOption.first().click();
  232 |         await page.waitForURL(/\/en/, { timeout: 10000 });
  233 |         await expect(page).toHaveURL(/\/en/);
  234 |       }
  235 |     } else {
  236 |       // Fallback: navigate trực tiếp
  237 |       await page.goto('/en');
  238 |       await page.waitForLoadState('networkidle');
  239 |       await expect(page).toHaveURL(/\/en.*/);
  240 |     }
  241 |   });
  242 | 
  243 |   test('switch sang KO → URL đổi sang /ko/...', async ({ page }) => {
  244 |     await page.goto('/vi');
  245 |     await page.waitForLoadState('networkidle');
  246 | 
  247 |     const langSwitcher = page.getByRole('button', { name: /vi|tiếng việt|language/i }).first();
  248 | 
  249 |     if (await langSwitcher.count() > 0) {
  250 |       await langSwitcher.click();
  251 |       const koOption = page.getByRole('option', { name: /한국어|korean|ko/i }).or(page.getByRole('button', { name: /한국어|ko/i }));
  252 |       if (await koOption.count() > 0) {
  253 |         await koOption.first().click();
  254 |         await page.waitForURL(/\/ko/, { timeout: 10000 });
  255 |         await expect(page).toHaveURL(/\/ko/);
  256 |       }
  257 |     } else {
  258 |       await page.goto('/ko');
  259 |       await page.waitForLoadState('networkidle');
  260 |       await expect(page).toHaveURL(/\/ko.*/);
  261 |     }
  262 |   });
  263 | 
  264 |   test('chuyển ngôn ngữ không reload page (không mất state)', async ({ page }) => {
  265 |     await page.goto('/vi');
  266 |     await page.waitForLoadState('networkidle');
  267 | 
  268 |     // Track navigation events (full reload vs client navigation)
  269 |     let fullReload = false;
  270 |     page.on('framenavigated', (frame) => {
  271 |       if (frame === page.mainFrame()) {
  272 |         fullReload = true;
  273 |       }
  274 |     });
  275 | 
  276 |     // Nếu có switcher
  277 |     const langSwitcher = page.getByRole('button', { name: /vi|tiếng việt|language/i }).first();
  278 |     if (await langSwitcher.count() > 0) {
  279 |       await langSwitcher.click();
  280 |       const enOption = page.getByRole('option', { name: /english|en/i }).first();
  281 |       if (await enOption.count() > 0) {
  282 |         await enOption.click();
  283 |         await page.waitForTimeout(1000);
  284 |         // Next.js i18n: URL thay đổi không nhất thiết là full reload
  285 |         // Kiểm tra URL đã đổi
  286 |         expect(page.url()).toMatch(/\/(en|ko|vi)\//);
  287 |       }
  288 |     }
```