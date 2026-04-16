# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer\pages.spec.ts >> 3.1 — Home page sections >> 7 sections hiển thị trên trang chủ
- Location: tests\e2e\customer\pages.spec.ts:17:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('section').first().or(getByRole('banner'))
Expected: visible
Error: strict mode violation: locator('section').first().or(getByRole('banner')) resolved to 2 elements:
    1) <header class="fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-transparent">…</header> aka getByRole('banner')
    2) <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-bg-dark">…</section> aka locator('section').filter({ hasText: 'Hanie in Quy Nhon · Studio Là' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('section').first().or(getByRole('banner'))

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
      - generic [ref=e23]:
        - paragraph [ref=e24]: Hanie in Quy Nhon · Studio Làm Đẹp
        - heading "Đôi mắt đẹp hơn mỗi sáng thức dậy" [level=1] [ref=e25]
        - paragraph [ref=e26]: Nối mi · Lông mày · Gội đầu · Nail 55 Nguyễn Nhạc, Quy Nhơn
        - generic [ref=e27]:
          - link "Đặt lịch ngay" [ref=e28] [cursor=pointer]:
            - /url: /vi/booking
          - link "Xem dịch vụ" [ref=e29] [cursor=pointer]:
            - /url: /vi/services
      - generic [ref=e31]:
        - generic [ref=e32]:
          - paragraph [ref=e33]: TẠI SAO CHỌN HANIE
          - heading "Tại sao chọn Hanie?" [level=2] [ref=e34]
        - generic [ref=e35]:
          - generic [ref=e37]:
            - img [ref=e39]
            - heading "Kỹ thuật viên chuyên nghiệp" [level=3] [ref=e41]
            - paragraph [ref=e42]: Đội ngũ được đào tạo bài bản, cập nhật xu hướng mới nhất.
          - generic [ref=e44]:
            - img [ref=e46]
            - heading "Chất liệu cao cấp" [level=3] [ref=e49]
            - paragraph [ref=e50]: Sử dụng sản phẩm nhập khẩu chính hãng, an toàn cho sức khỏe.
          - generic [ref=e52]:
            - img [ref=e54]
            - heading "Không gian sang trọng" [level=3] [ref=e56]
            - paragraph [ref=e57]: Môi trường sạch sẽ, riêng tư, mang lại trải nghiệm thư giãn tuyệt vời.
          - generic [ref=e59]:
            - img [ref=e61]
            - heading "Bảo hành kỹ thuật" [level=3] [ref=e64]
            - paragraph [ref=e65]: Cam kết bảo hành cho mọi dịch vụ, đảm bảo sự hài lòng của khách.
      - generic [ref=e67]:
        - generic [ref=e68]:
          - generic [ref=e69]:
            - paragraph [ref=e70]: DỊCH VỤ
            - heading "Trải nghiệm làm đẹp đẳng cấp" [level=2] [ref=e71]
          - link "Xem tất cả dịch vụ" [ref=e72] [cursor=pointer]:
            - /url: /vi/services
            - text: Xem tất cả dịch vụ
            - img [ref=e73]
        - generic [ref=e75]:
          - generic [ref=e79]:
            - heading "Cắt da nữ" [level=3] [ref=e80]
            - paragraph [ref=e81]: 30.000 ₫ – 40.000 ₫
            - generic [ref=e83]:
              - img [ref=e84]
              - text: 20 phút
            - link "Đặt dịch vụ này" [ref=e87] [cursor=pointer]:
              - /url: /vi/booking?service=71518cac-eedd-4c5f-aaf0-9754db7f25c1
          - generic [ref=e91]:
            - heading "Nối mi Classic (1:1)" [level=3] [ref=e92]
            - paragraph [ref=e93]: 200.000 ₫ – 250.000 ₫
            - generic [ref=e94]:
              - generic [ref=e95]:
                - img [ref=e96]
                - text: 100 phút
              - generic [ref=e99]:
                - img [ref=e100]
                - text: Bảo hành 7 ngày
            - link "Đặt dịch vụ này" [ref=e103] [cursor=pointer]:
              - /url: /vi/booking?service=2d2f09d8-e7d6-49ac-b91a-6de76380dde1
          - generic [ref=e107]:
            - heading "Tạo hình lông mày" [level=3] [ref=e108]
            - paragraph [ref=e109]: 50.000 ₫ – 80.000 ₫
            - generic [ref=e111]:
              - img [ref=e112]
              - text: 25 phút
            - link "Đặt dịch vụ này" [ref=e115] [cursor=pointer]:
              - /url: /vi/booking?service=2547eeab-5d4f-4d3e-83da-ac66ab419589
          - generic [ref=e119]:
            - heading "Gội đầu thường + sấy" [level=3] [ref=e120]
            - paragraph [ref=e121]: 80.000 ₫ – 120.000 ₫
            - generic [ref=e123]:
              - img [ref=e124]
              - text: 40 phút
            - link "Đặt dịch vụ này" [ref=e127] [cursor=pointer]:
              - /url: /vi/booking?service=29f84370-5f04-4b86-8a9f-a50d973216da
      - generic [ref=e129]:
        - heading "Thư viện ảnh" [level=2] [ref=e131]
        - link "Thư viện ảnh" [ref=e140] [cursor=pointer]:
          - /url: /vi/gallery
          - text: Thư viện ảnh
          - img [ref=e141]
      - generic [ref=e146]:
        - paragraph [ref=e147]: HANIE STUDIO
        - heading "Sẵn sàng trải nghiệm?" [level=2] [ref=e148]
        - paragraph [ref=e149]: Đặt lịch ngay hôm nay và nhận ưu đãi đặc biệt cho lần đầu.
        - link "Đặt lịch ngay" [ref=e150] [cursor=pointer]:
          - /url: /vi/booking
      - generic [ref=e154]:
        - generic [ref=e156]:
          - text: ✦
          - heading "Kỹ thuật viên chuyên nghiệp" [level=3] [ref=e157]
          - paragraph [ref=e158]: Đội ngũ được đào tạo bài bản, cập nhật xu hướng mới nhất.
        - generic [ref=e160]:
          - text: ✦
          - heading "Chất liệu cao cấp" [level=3] [ref=e161]
          - paragraph [ref=e162]: Sử dụng sản phẩm nhập khẩu chính hãng, an toàn cho sức khỏe.
        - generic [ref=e164]:
          - text: ✦
          - heading "Không gian sang trọng" [level=3] [ref=e165]
          - paragraph [ref=e166]: Môi trường sạch sẽ, riêng tư, mang lại trải nghiệm thư giãn tuyệt vời.
      - generic [ref=e169]:
        - heading "Sẵn sàng trải nghiệm?" [level=2] [ref=e170]
        - paragraph [ref=e171]: Đặt lịch ngay hôm nay và nhận ưu đãi đặc biệt cho lần đầu.
        - link "Đặt lịch ngay" [ref=e172] [cursor=pointer]:
          - /url: /vi/booking
    - contentinfo [ref=e173]:
      - generic [ref=e174]:
        - generic [ref=e175]:
          - generic [ref=e176]:
            - img "Hanie Studio" [ref=e177]
            - paragraph [ref=e178]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e179]:
            - heading "Dịch vụ" [level=4] [ref=e180]
            - list [ref=e181]:
              - listitem [ref=e182]:
                - link "Nail" [ref=e183] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e184]:
                - link "Nối mi" [ref=e185] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e186]:
                - link "Lông mày" [ref=e187] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e188]:
                - link "Gội đầu" [ref=e189] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e190]:
            - heading "Thông tin" [level=4] [ref=e191]
            - list [ref=e192]:
              - listitem [ref=e193]:
                - img [ref=e194]
                - generic [ref=e197]: 55 Nguyễn Nhạc, Quy Nhơn
              - listitem [ref=e198]:
                - img [ref=e199]
                - link "0901 234 567" [ref=e201] [cursor=pointer]:
                  - /url: tel:0901234567
              - listitem [ref=e202]:
                - img [ref=e203]
                - generic [ref=e206]: 08:00 – 20:00 hàng ngày
          - generic [ref=e207]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e208]
            - link "Đặt lịch ngay" [ref=e209] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e211]: © 2026 Hanie Studio. All rights reserved.
  - alert [ref=e212]
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
> 23  |     await expect(page.locator('section').first().or(page.getByRole('banner'))).toBeVisible();
      |                                                                                ^ Error: expect(locator).toBeVisible() failed
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
  116 |     await page.waitForLoadState('networkidle');
  117 | 
  118 |     // Phải có grid hoặc skeleton hoặc empty state
  119 |     const grid = page.locator('[data-testid="gallery-grid"], .grid, main img, .skeleton').first();
  120 |     await expect(grid).toBeVisible({ timeout: 5000 });
  121 |   });
  122 | 
  123 |   test('filter tabs hoạt động', async ({ page }) => {
```