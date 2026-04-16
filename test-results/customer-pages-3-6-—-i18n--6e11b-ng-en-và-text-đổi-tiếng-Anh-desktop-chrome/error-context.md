# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer\pages.spec.ts >> 3.6 — i18n switch >> switch sang EN → URL đổi sang /en/... và text đổi tiếng Anh
- Location: tests\e2e\customer\pages.spec.ts:208:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
  navigated to "http://localhost:3000/en"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Hanie Studio" [ref=e5] [cursor=pointer]:
        - /url: /en
        - img "Hanie Studio" [ref=e6]
      - navigation [ref=e7]:
        - link "Home" [ref=e8] [cursor=pointer]:
          - /url: /en
        - link "Services" [ref=e9] [cursor=pointer]:
          - /url: /en/services
        - link "Gallery" [ref=e10] [cursor=pointer]:
          - /url: /en/gallery
        - link "Book" [ref=e11] [cursor=pointer]:
          - /url: /en/booking
        - link "Location" [ref=e12] [cursor=pointer]:
          - /url: /en/location
      - generic [ref=e13]:
        - generic [ref=e14]:
          - button "Switch to VI" [ref=e15] [cursor=pointer]: VI
          - button "Switch to EN" [ref=e16] [cursor=pointer]: EN
          - button "Switch to KO" [ref=e17] [cursor=pointer]: KO
        - link "Book now" [ref=e18] [cursor=pointer]:
          - /url: /en/booking
  - main [ref=e19]:
    - generic [ref=e23]:
      - paragraph [ref=e24]: Hanie in Quy Nhon · Beauty Studio
      - heading "Wake up beautiful every morning" [level=1] [ref=e25]
      - paragraph [ref=e26]: Lash Extensions · Brows · Hair Wash · Nail 55 Nguyen Nhac, Quy Nhon
      - generic [ref=e27]:
        - link "Book Now" [ref=e28] [cursor=pointer]:
          - /url: /en/booking
        - link "View Services" [ref=e29] [cursor=pointer]:
          - /url: /en/services
    - generic [ref=e31]:
      - generic [ref=e32]:
        - paragraph [ref=e33]: WHY HANIE
        - heading "Why choose Hanie?" [level=2] [ref=e34]
      - generic [ref=e35]:
        - generic [ref=e37]:
          - img [ref=e39]
          - heading "Expert Technicians" [level=3] [ref=e41]
          - paragraph [ref=e42]: Professionally trained team, always up to date with the latest trends.
        - generic [ref=e44]:
          - img [ref=e46]
          - heading "Premium Materials" [level=3] [ref=e49]
          - paragraph [ref=e50]: Genuine imported products, safe for your health.
        - generic [ref=e52]:
          - img [ref=e54]
          - heading "Luxurious Space" [level=3] [ref=e56]
          - paragraph [ref=e57]: Clean, private environment for a truly relaxing experience.
        - generic [ref=e59]:
          - img [ref=e61]
          - heading "Service Warranty" [level=3] [ref=e64]
          - paragraph [ref=e65]: Warranty guaranteed on all services for your satisfaction.
    - generic [ref=e67]:
      - generic [ref=e68]:
        - generic [ref=e69]:
          - paragraph [ref=e70]: SERVICES
          - heading "Premium beauty experiences" [level=2] [ref=e71]
        - link "View all services" [ref=e72] [cursor=pointer]:
          - /url: /en/services
          - text: View all services
          - img [ref=e73]
      - generic [ref=e75]:
        - generic [ref=e79]:
          - heading "Female Cuticle Cut" [level=3] [ref=e80]
          - paragraph [ref=e81]: 30,000 ₫ – 40,000 ₫
          - generic [ref=e83]:
            - img [ref=e84]
            - text: 20 min
          - link "Book this service" [ref=e87] [cursor=pointer]:
            - /url: /en/booking?service=71518cac-eedd-4c5f-aaf0-9754db7f25c1
        - generic [ref=e91]:
          - heading "Classic One by One" [level=3] [ref=e92]
          - paragraph [ref=e93]: 200,000 ₫ – 250,000 ₫
          - generic [ref=e94]:
            - generic [ref=e95]:
              - img [ref=e96]
              - text: 100 min
            - generic [ref=e99]:
              - img [ref=e100]
              - text: 7-day warranty
          - link "Book this service" [ref=e103] [cursor=pointer]:
            - /url: /en/booking?service=2d2f09d8-e7d6-49ac-b91a-6de76380dde1
        - generic [ref=e107]:
          - heading "Brow Shaping" [level=3] [ref=e108]
          - paragraph [ref=e109]: 50,000 ₫ – 80,000 ₫
          - generic [ref=e111]:
            - img [ref=e112]
            - text: 25 min
          - link "Book this service" [ref=e115] [cursor=pointer]:
            - /url: /en/booking?service=2547eeab-5d4f-4d3e-83da-ac66ab419589
        - generic [ref=e119]:
          - heading "Regular Wash & Blow Dry" [level=3] [ref=e120]
          - paragraph [ref=e121]: 80,000 ₫ – 120,000 ₫
          - generic [ref=e123]:
            - img [ref=e124]
            - text: 40 min
          - link "Book this service" [ref=e127] [cursor=pointer]:
            - /url: /en/booking?service=29f84370-5f04-4b86-8a9f-a50d973216da
    - generic [ref=e129]:
      - heading "Gallery" [level=2] [ref=e131]
      - link "Gallery" [ref=e140] [cursor=pointer]:
        - /url: /en/gallery
        - text: Gallery
        - img [ref=e141]
    - generic [ref=e146]:
      - paragraph [ref=e147]: HANIE STUDIO
      - heading "Ready to experience?" [level=2] [ref=e148]
      - paragraph [ref=e149]: Book today and receive special offers for first-time visitors.
      - link "Book Now" [ref=e150] [cursor=pointer]:
        - /url: /en/booking
    - generic [ref=e154]:
      - generic [ref=e156]:
        - text: ✦
        - heading "Expert Technicians" [level=3] [ref=e157]
        - paragraph [ref=e158]: Professionally trained team, always up to date with the latest trends.
      - generic [ref=e160]:
        - text: ✦
        - heading "Premium Materials" [level=3] [ref=e161]
        - paragraph [ref=e162]: Genuine imported products, safe for your health.
      - generic [ref=e164]:
        - text: ✦
        - heading "Luxurious Space" [level=3] [ref=e165]
        - paragraph [ref=e166]: Clean, private environment for a truly relaxing experience.
    - generic [ref=e169]:
      - heading "Ready to experience?" [level=2] [ref=e170]
      - paragraph [ref=e171]: Book today and receive special offers for first-time visitors.
      - link "Book Now" [ref=e172] [cursor=pointer]:
        - /url: /en/booking
  - contentinfo [ref=e173]:
    - generic [ref=e174]:
      - generic [ref=e175]:
        - generic [ref=e176]:
          - img "Hanie Studio" [ref=e177]
          - paragraph [ref=e178]: Beauty studio in Quy Nhon. Lashes · Eyebrows · Hair Wash · Nail.
        - generic [ref=e179]:
          - heading "Services" [level=4] [ref=e180]
          - list [ref=e181]:
            - listitem [ref=e182]:
              - link "Nail" [ref=e183] [cursor=pointer]:
                - /url: /en/services#nail
            - listitem [ref=e184]:
              - link "Lash Extensions" [ref=e185] [cursor=pointer]:
                - /url: /en/services#lash
            - listitem [ref=e186]:
              - link "Eyebrows" [ref=e187] [cursor=pointer]:
                - /url: /en/services#brow
            - listitem [ref=e188]:
              - link "Hair Wash" [ref=e189] [cursor=pointer]:
                - /url: /en/services#hair_wash
        - generic [ref=e190]:
          - heading "Information" [level=4] [ref=e191]
          - list [ref=e192]:
            - listitem [ref=e193]:
              - img [ref=e194]
              - generic [ref=e197]: 55 Nguyen Nhac, Quy Nhon
            - listitem [ref=e198]:
              - img [ref=e199]
              - link "0901 234 567" [ref=e201] [cursor=pointer]:
                - /url: tel:0901234567
            - listitem [ref=e202]:
              - img [ref=e203]
              - generic [ref=e206]: 08:00 – 20:00 daily
        - generic [ref=e207]:
          - heading "Quick Book" [level=4] [ref=e208]
          - link "Book now" [ref=e209] [cursor=pointer]:
            - /url: /en/booking
      - paragraph [ref=e211]: © 2026 Hanie Studio. All rights reserved.
```

# Test source

```ts
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
  217 |       // Click EN option
  218 |       const enOption = page.getByRole('option', { name: /english|en/i }).or(page.getByRole('button', { name: /english|en/i }));
  219 |       if (await enOption.count() > 0) {
  220 |         await enOption.first().click();
> 221 |         await page.waitForURL(/\/en\//);
      |                    ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
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
  290 |     const bottomTab = page.locator('[class*="bottom"], [data-testid="bottom-tab"], nav.fixed.bottom-0').first();
  291 |     await expect(bottomTab).toBeVisible({ timeout: 5000 });
  292 |   });
  293 | 
  294 |   test('tap "Đặt lịch" trong bottom tab → /vi/booking', async ({ page }) => {
  295 |     await page.goto('/vi');
  296 |     await page.waitForLoadState('networkidle');
  297 | 
  298 |     // Tìm bottom tab booking button
  299 |     const bookingTab = page.locator('[class*="bottom"] a[href*="/booking"], [class*="bottom"] button').filter({ hasText: /đặt lịch|booking/i }).first();
  300 | 
  301 |     if (await bookingTab.count() > 0) {
  302 |       await bookingTab.click();
  303 |       await page.waitForURL(/.*\/booking.*/);
  304 |       await expect(page).toHaveURL(/.*\/booking.*/);
  305 |     } else {
  306 |       // Fallback: tìm bất kỳ link booking trên mobile
  307 |       const link = page.getByRole('link', { name: /đặt lịch|booking/i }).first();
  308 |       await expect(link).toBeVisible({ timeout: 5000 });
  309 |     }
  310 |   });
  311 | 
  312 |   test('content không bị che bởi bottom tab (padding đủ)', async ({ page }) => {
  313 |     await page.goto('/vi');
  314 |     await page.waitForLoadState('networkidle');
  315 | 
  316 |     // Kiểm tra main content không bị che
  317 |     // Scroll xuống cuối trang
  318 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  319 |     await page.waitForTimeout(300);
  320 | 
  321 |     // Không có nội dung bị hidden behind bottom bar
```