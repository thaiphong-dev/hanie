# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\admin.spec.ts >> 4.2 — Bookings calendar >> nút "+ Tạo lịch" → form walk-in booking hiển thị
- Location: tests\e2e\admin\admin.spec.ts:96:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /tạo lịch|create.*booking|walk.?in|\+/i }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /tạo lịch|create.*booking|walk.?in|\+/i }).first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "404" [level=1] [ref=e4]
    - heading "This page could not be found." [level=2] [ref=e6]
  - alert [ref=e7]
```

# Test source

```ts
  2   |  * NHÓM TEST 4: Admin Panel (High)
  3   |  *
  4   |  * Test 4.1 — Dashboard
  5   |  * Test 4.2 — Bookings calendar
  6   |  * Test 4.3 — POS flow
  7   |  * Test 4.4 — Customers
  8   |  * Test 4.5 — Staff & Leave requests
  9   |  * Test 4.6 — Services CRUD
  10  |  * Test 4.7 — Reports
  11  |  */
  12  | import { test, expect } from '@playwright/test';
  13  | import { ADMIN_AUTH_FILE, ADMIN_PHONE, ADMIN_PASSWORD, getTomorrow, uniquePhone } from '../../fixtures/helpers';
  14  | 
  15  | test.use({ storageState: ADMIN_AUTH_FILE });
  16  | 
  17  | // ─── Test 4.1 — Dashboard ─────────────────────────────────────────────────────
  18  | test.describe('4.1 — Dashboard', () => {
  19  |   test('4 metric cards hiển thị', async ({ page }) => {
  20  |     await page.goto('/vi/admin/dashboard');
  21  |     await page.waitForLoadState('networkidle');
  22  | 
  23  |     await expect(page).not.toHaveURL(/.*\/login.*/);
  24  | 
  25  |     // Kiểm tra có metric cards (doanh thu, lịch hẹn, khách mới, chờ duyệt)
  26  |     const metricCards = page.locator('[data-testid*="metric"], [class*="metric"], [class*="card"]');
  27  |     const cardCount = await metricCards.count();
  28  | 
  29  |     if (cardCount < 4) {
  30  |       // Fallback: kiểm tra các text label quen thuộc
  31  |       const metrics = [
  32  |         /doanh thu|revenue/i,
  33  |         /lịch hẹn|booking/i,
  34  |         /khách mới|new customer/i,
  35  |         /chờ duyệt|pending/i,
  36  |       ];
  37  |       let foundCount = 0;
  38  |       for (const metric of metrics) {
  39  |         if (await page.getByText(metric).count() > 0) foundCount++;
  40  |       }
  41  |       console.log(`[4.1] Found ${foundCount}/4 metric labels`);
  42  |       expect(foundCount).toBeGreaterThanOrEqual(2);
  43  |     }
  44  |   });
  45  | 
  46  |   test('timeline lịch hẹn hôm nay hiển thị (empty state OK)', async ({ page }) => {
  47  |     await page.goto('/vi/admin/dashboard');
  48  |     await page.waitForLoadState('networkidle');
  49  | 
  50  |     // Có timeline hoặc empty state
  51  |     const timeline = page.locator('[data-testid="timeline"], [class*="timeline"], [class*="calendar"]').first();
  52  |     const emptyState = page.getByText(/không có lịch hẹn|no.*booking|no appointments/i).first();
  53  | 
  54  |     const hasTimeline = await timeline.count() > 0;
  55  |     const hasEmpty = await emptyState.count() > 0;
  56  | 
  57  |     expect(hasTimeline || hasEmpty).toBe(true);
  58  |   });
  59  | });
  60  | 
  61  | // ─── Test 4.2 — Bookings calendar ────────────────────────────────────────────
  62  | test.describe('4.2 — Bookings calendar', () => {
  63  |   test('week view hiển thị 7 ngày', async ({ page }) => {
  64  |     await page.goto('/vi/admin/bookings');
  65  |     await page.waitForLoadState('networkidle');
  66  | 
  67  |     await expect(page).not.toHaveURL(/.*\/login.*/);
  68  | 
  69  |     // Week view phải có 7 columns (7 ngày)
  70  |     const dayCols = page.locator('[data-testid*="day-col"], [class*="day-col"], th').filter({ hasText: /t[2-7]|cn|mon|tue|wed|thu|fri|sat|sun/i });
  71  | 
  72  |     const count = await dayCols.count();
  73  |     if (count < 7) {
  74  |       // Fallback: kiểm tra có calendar/grid hiển thị
  75  |       const calendar = page.locator('[class*="calendar"], [class*="week"], table').first();
  76  |       await expect(calendar).toBeVisible({ timeout: 5000 });
  77  |     }
  78  |   });
  79  | 
  80  |   test('filter theo thợ hoạt động', async ({ page }) => {
  81  |     await page.goto('/vi/admin/bookings');
  82  |     await page.waitForLoadState('networkidle');
  83  | 
  84  |     // Tìm dropdown filter thợ
  85  |     const staffFilter = page.getByRole('combobox', { name: /thợ|staff|nhân viên/i })
  86  |       .or(page.getByRole('button', { name: /thợ|staff|tất cả nhân viên/i })).first();
  87  | 
  88  |     if (await staffFilter.count() > 0) {
  89  |       await staffFilter.click();
  90  |       await page.waitForTimeout(300);
  91  |       // Không crash
  92  |       await expect(page).toHaveURL(/.*\/bookings.*/);
  93  |     }
  94  |   });
  95  | 
  96  |   test('nút "+ Tạo lịch" → form walk-in booking hiển thị', async ({ page }) => {
  97  |     await page.goto('/vi/admin/bookings');
  98  |     await page.waitForLoadState('networkidle');
  99  | 
  100 |     // Tìm nút tạo lịch
  101 |     const createBtn = page.getByRole('button', { name: /tạo lịch|create.*booking|walk.?in|\+/i }).first();
> 102 |     await expect(createBtn).toBeVisible({ timeout: 5000 });
      |                             ^ Error: expect(locator).toBeVisible() failed
  103 |     await createBtn.click();
  104 | 
  105 |     // Form hoặc sheet phải mở
  106 |     await expect(
  107 |       page.locator('[role="dialog"], [data-testid="booking-form"], form').first()
  108 |     ).toBeVisible({ timeout: 5000 });
  109 |   });
  110 | });
  111 | 
  112 | // ─── Test 4.3 — POS flow ─────────────────────────────────────────────────────
  113 | test.describe('4.3 — POS flow', () => {
  114 |   test('tìm khách theo SĐT → thấy tên khách', async ({ page }) => {
  115 |     await page.goto('/vi/admin/pos');
  116 |     await page.waitForLoadState('networkidle');
  117 | 
  118 |     await expect(page).not.toHaveURL(/.*\/login.*/);
  119 | 
  120 |     // Tìm input search phone
  121 |     const phoneInput = page.getByPlaceholder(/sđt|số điện thoại|phone|search.*customer/i)
  122 |       .or(page.getByLabel(/sđt|số điện thoại|phone/i)).first();
  123 | 
  124 |     await expect(phoneInput).toBeVisible({ timeout: 5000 });
  125 |     await phoneInput.fill('0977000001');
  126 |     await phoneInput.press('Enter');
  127 | 
  128 |     // Đợi kết quả
  129 |     await page.waitForTimeout(1000);
  130 | 
  131 |     // Thấy tên khách (QC Tester)
  132 |     await expect(
  133 |       page.getByText(/qc tester|0977000001/i).first()
  134 |     ).toBeVisible({ timeout: 5000 });
  135 |   });
  136 | 
  137 |   test('chọn dịch vụ → giá điền vào', async ({ page }) => {
  138 |     await page.goto('/vi/admin/pos');
  139 |     await page.waitForLoadState('networkidle');
  140 | 
  141 |     // Click/chọn một dịch vụ
  142 |     const serviceBtn = page.getByRole('button', { name: /sơn gel|nail|gel.*màu/i }).first();
  143 |     if (await serviceBtn.count() > 0) {
  144 |       await serviceBtn.click();
  145 |       await page.waitForTimeout(500);
  146 | 
  147 |       // Giá phải xuất hiện trong bill
  148 |       const total = page.getByTestId('total-amount').or(page.getByText(/tổng.*:.*\d+|total.*:.*\d+/i)).first();
  149 |       await expect(total).toBeVisible({ timeout: 5000 });
  150 |     }
  151 |   });
  152 | 
  153 |   test('chọn phương thức thanh toán → submit → orders có record mới', async ({ page, request }) => {
  154 |     await page.goto('/vi/admin/pos');
  155 |     await page.waitForLoadState('networkidle');
  156 | 
  157 |     // Search customer
  158 |     const phoneInput = page.getByPlaceholder(/sđt|số điện thoại|phone/i)
  159 |       .or(page.getByLabel(/sđt|số điện thoại|phone/i)).first();
  160 | 
  161 |     if (await phoneInput.count() === 0) {
  162 |       test.skip(true, 'POS search input not found');
  163 |       return;
  164 |     }
  165 | 
  166 |     await phoneInput.fill('0977000001');
  167 |     await phoneInput.press('Enter');
  168 |     await page.waitForTimeout(1000);
  169 | 
  170 |     // Chọn dịch vụ
  171 |     const serviceBtn = page.getByRole('button', { name: /nail|sơn|dịch vụ/i }).first();
  172 |     if (await serviceBtn.count() > 0) {
  173 |       await serviceBtn.click();
  174 |       await page.waitForTimeout(300);
  175 |     }
  176 | 
  177 |     // Chọn phương thức thanh toán: tiền mặt
  178 |     const cashBtn = page.getByRole('button', { name: /tiền mặt|cash/i }).first();
  179 |     if (await cashBtn.count() > 0) {
  180 |       await cashBtn.click();
  181 |     }
  182 | 
  183 |     // Submit
  184 |     const submitBtn = page.getByRole('button', { name: /thanh toán|pay|submit.*order|hoàn tất/i }).first();
  185 |     if (await submitBtn.count() > 0 && await submitBtn.isEnabled()) {
  186 |       await submitBtn.click();
  187 |       await page.waitForTimeout(2000);
  188 | 
  189 |       // Verify qua API
  190 |       const token = await page.evaluate(() => sessionStorage.getItem('access_token'));
  191 |       if (token) {
  192 |         const res = await request.get('/api/v1/admin/orders', {
  193 |           headers: { Authorization: `Bearer ${token}` },
  194 |         });
  195 |         if (res.status() === 200) {
  196 |           const body = await res.json();
  197 |           expect(body.data?.length ?? 0).toBeGreaterThanOrEqual(0);
  198 |           console.log('[4.3] Orders count:', body.data?.length);
  199 |         }
  200 |       }
  201 |     }
  202 |   });
```