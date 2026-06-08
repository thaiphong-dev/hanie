# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\admin.spec.ts >> 4.6 — Services CRUD >> click "Chỉnh sửa" → sheet form mở
- Location: tests\e2e\admin\admin.spec.ts:343:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[role="dialog"], [data-testid="service-form"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[role="dialog"], [data-testid="service-form"]').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e3]:
    - banner [ref=e4]:
      - link "Hanie Studio" [ref=e5] [cursor=pointer]:
        - /url: /vi
        - img "Hanie Studio" [ref=e6]
    - main [ref=e7]:
      - generic [ref=e9]:
        - heading "Đăng nhập" [level=1] [ref=e10]
        - generic [ref=e11]:
          - generic [ref=e12]:
            - generic [ref=e13]: Số điện thoại
            - textbox "Số điện thoại" [ref=e14]:
              - /placeholder: 0901 234 567
          - generic [ref=e15]:
            - generic [ref=e16]: Mật khẩu
            - textbox "Mật khẩu" [ref=e17]:
              - /placeholder: Nhập mật khẩu
          - button "Đăng nhập" [ref=e18] [cursor=pointer]
        - paragraph [ref=e19]:
          - text: Chưa có tài khoản?
          - link "Đăng ký ngay" [ref=e20] [cursor=pointer]:
            - /url: /vi/register
    - contentinfo [ref=e21]:
      - paragraph [ref=e22]: © 2026 Hanie Studio
```

# Test source

```ts
  258 |       await searchInput.fill('0977000001');
  259 |       await page.waitForTimeout(1000);
  260 |     }
  261 | 
  262 |     // Click xem hồ sơ
  263 |     const profileBtn = page.getByRole('button', { name: /xem hồ sơ|view profile|chi tiết/i }).first()
  264 |       .or(page.getByRole('link', { name: /xem hồ sơ|view profile/i }).first());
  265 | 
  266 |     if (await profileBtn.count() > 0) {
  267 |       await profileBtn.click();
  268 |       await page.waitForLoadState('networkidle');
  269 | 
  270 |       // 3 tabs
  271 |       await expect(page.getByRole('tab', { name: /profile|thông tin/i })).toBeVisible({ timeout: 5000 });
  272 |       await expect(page.getByRole('tab', { name: /history|lịch sử/i })).toBeVisible({ timeout: 5000 });
  273 |       await expect(page.getByRole('tab', { name: /notes|ghi chú/i })).toBeVisible({ timeout: 5000 });
  274 |     }
  275 |   });
  276 | });
  277 | 
  278 | // ─── Test 4.5 — Staff & Leave requests ───────────────────────────────────────
  279 | test.describe('4.5 — Staff & Leave requests', () => {
  280 |   test('danh sách staff hiển thị (Hanie, Lan)', async ({ page }) => {
  281 |     await page.goto('/vi/admin/staff');
  282 |     await page.waitForLoadState('networkidle');
  283 | 
  284 |     await expect(page).not.toHaveURL(/.*\/login.*/);
  285 | 
  286 |     // Phải có 2 staff
  287 |     await expect(page.getByText(/hanie/i).first()).toBeVisible({ timeout: 5000 });
  288 |     await expect(page.getByText(/lan/i).first()).toBeVisible({ timeout: 5000 });
  289 |   });
  290 | 
  291 |   test('tạo leave request test → Approve → staff_schedules.is_day_off = true', async ({ page, request }) => {
  292 |     await page.goto('/vi/admin/staff');
  293 |     await page.waitForLoadState('networkidle');
  294 | 
  295 |     // Tìm nút tạo đơn nghỉ
  296 |     const leaveBtn = page.getByRole('button', { name: /xin nghỉ|leave.*request|nghỉ phép/i }).first();
  297 | 
  298 |     if (await leaveBtn.count() > 0) {
  299 |       await leaveBtn.click();
  300 |       await page.waitForTimeout(300);
  301 | 
  302 |       // Fill form leave request
  303 |       const dateInput = page.getByLabel(/ngày nghỉ|date|leave.*date/i).first();
  304 |       if (await dateInput.count() > 0) {
  305 |         await dateInput.fill(getTomorrow());
  306 |       }
  307 | 
  308 |       const submitBtn = page.getByRole('button', { name: /gửi|submit|tạo đơn/i }).first();
  309 |       if (await submitBtn.count() > 0) {
  310 |         await submitBtn.click();
  311 |         await page.waitForTimeout(1000);
  312 |       }
  313 |     }
  314 | 
  315 |     // Kiểm tra pending leave requests qua API
  316 |     const token = await page.evaluate(() => sessionStorage.getItem('access_token'));
  317 |     if (token) {
  318 |       const res = await request.get('/api/v1/admin/leave-requests?status=pending', {
  319 |         headers: { Authorization: `Bearer ${token}` },
  320 |       });
  321 |       if (res.status() === 200) {
  322 |         const body = await res.json();
  323 |         console.log('[4.5] Pending leave requests:', body.data?.length);
  324 |       }
  325 |     }
  326 |   });
  327 | });
  328 | 
  329 | // ─── Test 4.6 — Services CRUD ────────────────────────────────────────────────
  330 | test.describe('4.6 — Services CRUD', () => {
  331 |   test('danh sách services hiển thị đúng', async ({ page }) => {
  332 |     await page.goto('/vi/admin/services');
  333 |     await page.waitForLoadState('networkidle');
  334 | 
  335 |     await expect(page).not.toHaveURL(/.*\/login.*/);
  336 | 
  337 |     // Services page dùng list (không phải table)
  338 |     // Tìm bất kỳ service name quen thuộc
  339 |     const serviceList = page.getByText(/cắt da|sơn gel|nail|nối mi/i).first();
  340 |     await expect(serviceList).toBeVisible({ timeout: 5000 });
  341 |   });
  342 | 
  343 |   test('click "Chỉnh sửa" → sheet form mở', async ({ page }) => {
  344 |     await page.goto('/vi/admin/services');
  345 |     await page.waitForLoadState('networkidle');
  346 | 
  347 |     // Edit button là icon pencil (SVG) — không có text label
  348 |     // Tìm bằng aria-label hoặc title, hoặc là button trong row
  349 |     const editBtn = page.getByRole('button', { name: /chỉnh sửa|edit|sửa/i })
  350 |       .or(page.locator('button[aria-label*="edit"], button[title*="edit"], button[title*="sửa"]'))
  351 |       .or(page.locator('button:has(svg)').first()).first();
  352 |     await expect(editBtn).toBeVisible({ timeout: 5000 });
  353 |     await editBtn.click();
  354 | 
  355 |     // Sheet/modal mở
  356 |     await expect(
  357 |       page.locator('[role="dialog"], [data-testid="service-form"]').first()
> 358 |     ).toBeVisible({ timeout: 5000 });
      |       ^ Error: expect(locator).toBeVisible() failed
  359 |   });
  360 | 
  361 |   test('sửa giá → lưu → thấy giá mới trong list', async ({ page }) => {
  362 |     await page.goto('/vi/admin/services');
  363 |     await page.waitForLoadState('networkidle');
  364 | 
  365 |     // Lấy giá hiện tại
  366 |     const editBtn = page.getByRole('button', { name: /chỉnh sửa|edit/i }).first();
  367 |     if (await editBtn.count() === 0) {
  368 |       test.skip(true, 'No edit button found');
  369 |       return;
  370 |     }
  371 | 
  372 |     await editBtn.click();
  373 |     await page.waitForTimeout(500);
  374 | 
  375 |     // Tìm price input trong form
  376 |     const priceInput = page.getByLabel(/giá|price|min.*price/i).first();
  377 |     if (await priceInput.count() === 0) {
  378 |       // Sheet mở nhưng không tìm thấy price input
  379 |       console.warn('[4.6] Price input not found in edit sheet');
  380 |       return;
  381 |     }
  382 | 
  383 |     const newPrice = '99000';
  384 |     await priceInput.clear();
  385 |     await priceInput.fill(newPrice);
  386 | 
  387 |     // Save
  388 |     const saveBtn = page.getByRole('button', { name: /lưu|save|cập nhật|update/i }).first();
  389 |     await saveBtn.click();
  390 |     await page.waitForTimeout(1000);
  391 | 
  392 |     // Kiểm tra giá mới trong list
  393 |     await expect(page.getByText(/99\.000|99000/i).first()).toBeVisible({ timeout: 5000 });
  394 |   });
  395 | });
  396 | 
  397 | // ─── Test 4.7 — Reports ──────────────────────────────────────────────────────
  398 | test.describe('4.7 — Reports', () => {
  399 |   test('tháng hiện tại → dữ liệu hiển thị (0 nếu chưa có orders)', async ({ page }) => {
  400 |     await page.goto('/vi/admin/reports');
  401 |     await page.waitForLoadState('networkidle');
  402 | 
  403 |     await expect(page).not.toHaveURL(/.*\/login.*/);
  404 | 
  405 |     // Phải có nội dung report
  406 |     const reportContent = page.locator('main').first();
  407 |     await expect(reportContent).toBeVisible();
  408 | 
  409 |     // Có số liệu (dù là 0)
  410 |     await expect(
  411 |       page.getByText(/doanh thu|revenue|0đ|0 VND/i).first()
  412 |     ).toBeVisible({ timeout: 5000 });
  413 |   });
  414 | 
  415 |   test('SVG bar chart hiển thị', async ({ page }) => {
  416 |     await page.goto('/vi/admin/reports');
  417 |     await page.waitForLoadState('networkidle');
  418 | 
  419 |     // Chart phải là SVG
  420 |     const chart = page.locator('svg').first();
  421 |     await expect(chart).toBeVisible({ timeout: 5000 });
  422 |   });
  423 | });
  424 | 
```