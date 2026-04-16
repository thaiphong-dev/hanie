# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer\pages.spec.ts >> 3.5 — History page (login required) >> history page: empty state hiện đẹp khi chưa có booking
- Location: tests\e2e\customer\pages.spec.ts:185:7

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /.*\/login.*/
Received string: "http://localhost:3000/vi/login?callbackUrl=%2Fvi%2Fhistory"
Timeout: 5000ms

Call log:
  - Expect "not toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:3000/vi/login?callbackUrl=%2Fvi%2Fhistory"

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
          - generic [ref=e14]:
            - generic [ref=e15]: Mật khẩu
            - textbox "Mật khẩu" [ref=e16]:
              - /placeholder: Nhập mật khẩu
          - button "Đăng nhập" [ref=e17] [cursor=pointer]
        - paragraph [ref=e18]:
          - text: Chưa có tài khoản?
          - link "Đăng ký ngay" [ref=e19] [cursor=pointer]:
            - /url: /vi/register
    - contentinfo [ref=e20]:
      - paragraph [ref=e21]: © 2026 Hanie Studio
  - alert [ref=e22]
```

# Test source

```ts
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
> 189 |     await expect(page).not.toHaveURL(/.*\/login.*/);
      |                            ^ Error: expect(page).not.toHaveURL(expected) failed
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
  257 |     // Track navigation events (full reload vs client navigation)
  258 |     let fullReload = false;
  259 |     page.on('framenavigated', (frame) => {
  260 |       if (frame === page.mainFrame()) {
  261 |         fullReload = true;
  262 |       }
  263 |     });
  264 | 
  265 |     // Nếu có switcher
  266 |     const langSwitcher = page.getByRole('button', { name: /vi|tiếng việt|language/i }).first();
  267 |     if (await langSwitcher.count() > 0) {
  268 |       await langSwitcher.click();
  269 |       const enOption = page.getByRole('option', { name: /english|en/i }).first();
  270 |       if (await enOption.count() > 0) {
  271 |         await enOption.click();
  272 |         await page.waitForTimeout(1000);
  273 |         // Next.js i18n: URL thay đổi không nhất thiết là full reload
  274 |         // Kiểm tra URL đã đổi
  275 |         expect(page.url()).toMatch(/\/(en|ko|vi)\//);
  276 |       }
  277 |     }
  278 |   });
  279 | });
  280 | 
  281 | // ─── Test 3.7 — Mobile layout (390px) ────────────────────────────────────────
  282 | test.describe('3.7 — Mobile layout (390px viewport)', () => {
  283 |   test.use({ viewport: { width: 390, height: 844 } });
  284 | 
  285 |   test('BottomTabBar hiển thị ở đáy', async ({ page }) => {
  286 |     await page.goto('/vi');
  287 |     await page.waitForLoadState('networkidle');
  288 | 
  289 |     // BottomTabBar phải visible trên mobile
```