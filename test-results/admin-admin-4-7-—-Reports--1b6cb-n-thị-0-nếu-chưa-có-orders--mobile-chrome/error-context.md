# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\admin.spec.ts >> 4.7 — Reports >> tháng hiện tại → dữ liệu hiển thị (0 nếu chưa có orders)
- Location: tests\e2e\admin\admin.spec.ts:382:7

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /.*\/login.*/
Received string: "http://localhost:3000/vi/login?callbackUrl=%2Fvi%2Fadmin%2Freports"
Timeout: 5000ms

Call log:
  - Expect "not toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:3000/vi/login?callbackUrl=%2Fvi%2Fadmin%2Freports"

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
  286 |     if (await leaveBtn.count() > 0) {
  287 |       await leaveBtn.click();
  288 |       await page.waitForTimeout(300);
  289 | 
  290 |       // Fill form leave request
  291 |       const dateInput = page.getByLabel(/ngày nghỉ|date|leave.*date/i).first();
  292 |       if (await dateInput.count() > 0) {
  293 |         await dateInput.fill(getTomorrow());
  294 |       }
  295 | 
  296 |       const submitBtn = page.getByRole('button', { name: /gửi|submit|tạo đơn/i }).first();
  297 |       if (await submitBtn.count() > 0) {
  298 |         await submitBtn.click();
  299 |         await page.waitForTimeout(1000);
  300 |       }
  301 |     }
  302 | 
  303 |     // Kiểm tra pending leave requests qua API
  304 |     const token = await page.evaluate(() => sessionStorage.getItem('access_token'));
  305 |     if (token) {
  306 |       const res = await request.get('/api/v1/admin/leave-requests?status=pending', {
  307 |         headers: { Authorization: `Bearer ${token}` },
  308 |       });
  309 |       if (res.status() === 200) {
  310 |         const body = await res.json();
  311 |         console.log('[4.5] Pending leave requests:', body.data?.length);
  312 |       }
  313 |     }
  314 |   });
  315 | });
  316 | 
  317 | // ─── Test 4.6 — Services CRUD ────────────────────────────────────────────────
  318 | test.describe('4.6 — Services CRUD', () => {
  319 |   test('danh sách services hiển thị đúng', async ({ page }) => {
  320 |     await page.goto('/vi/admin/services');
  321 |     await page.waitForLoadState('networkidle');
  322 | 
  323 |     await expect(page).not.toHaveURL(/.*\/login.*/);
  324 | 
  325 |     // Phải có ít nhất 1 service
  326 |     const serviceItems = page.locator('[data-testid*="service"], [class*="service-item"], tr').first();
  327 |     await expect(serviceItems).toBeVisible({ timeout: 5000 });
  328 |   });
  329 | 
  330 |   test('click "Chỉnh sửa" → sheet form mở', async ({ page }) => {
  331 |     await page.goto('/vi/admin/services');
  332 |     await page.waitForLoadState('networkidle');
  333 | 
  334 |     const editBtn = page.getByRole('button', { name: /chỉnh sửa|edit|sửa/i }).first();
  335 |     await expect(editBtn).toBeVisible({ timeout: 5000 });
  336 |     await editBtn.click();
  337 | 
  338 |     // Sheet/modal mở
  339 |     await expect(
  340 |       page.locator('[role="dialog"], [data-testid="service-form"]').first()
  341 |     ).toBeVisible({ timeout: 5000 });
  342 |   });
  343 | 
  344 |   test('sửa giá → lưu → thấy giá mới trong list', async ({ page }) => {
  345 |     await page.goto('/vi/admin/services');
  346 |     await page.waitForLoadState('networkidle');
  347 | 
  348 |     // Lấy giá hiện tại
  349 |     const editBtn = page.getByRole('button', { name: /chỉnh sửa|edit/i }).first();
  350 |     if (await editBtn.count() === 0) {
  351 |       test.skip(true, 'No edit button found');
  352 |       return;
  353 |     }
  354 | 
  355 |     await editBtn.click();
  356 |     await page.waitForTimeout(500);
  357 | 
  358 |     // Tìm price input trong form
  359 |     const priceInput = page.getByLabel(/giá|price|min.*price/i).first();
  360 |     if (await priceInput.count() === 0) {
  361 |       // Sheet mở nhưng không tìm thấy price input
  362 |       console.warn('[4.6] Price input not found in edit sheet');
  363 |       return;
  364 |     }
  365 | 
  366 |     const newPrice = '99000';
  367 |     await priceInput.clear();
  368 |     await priceInput.fill(newPrice);
  369 | 
  370 |     // Save
  371 |     const saveBtn = page.getByRole('button', { name: /lưu|save|cập nhật|update/i }).first();
  372 |     await saveBtn.click();
  373 |     await page.waitForTimeout(1000);
  374 | 
  375 |     // Kiểm tra giá mới trong list
  376 |     await expect(page.getByText(/99\.000|99000/i).first()).toBeVisible({ timeout: 5000 });
  377 |   });
  378 | });
  379 | 
  380 | // ─── Test 4.7 — Reports ──────────────────────────────────────────────────────
  381 | test.describe('4.7 — Reports', () => {
  382 |   test('tháng hiện tại → dữ liệu hiển thị (0 nếu chưa có orders)', async ({ page }) => {
  383 |     await page.goto('/vi/admin/reports');
  384 |     await page.waitForLoadState('networkidle');
  385 | 
> 386 |     await expect(page).not.toHaveURL(/.*\/login.*/);
      |                            ^ Error: expect(page).not.toHaveURL(expected) failed
  387 | 
  388 |     // Phải có nội dung report
  389 |     const reportContent = page.locator('main').first();
  390 |     await expect(reportContent).toBeVisible();
  391 | 
  392 |     // Có số liệu (dù là 0)
  393 |     await expect(
  394 |       page.getByText(/doanh thu|revenue|0đ|0 VND/i).first()
  395 |     ).toBeVisible({ timeout: 5000 });
  396 |   });
  397 | 
  398 |   test('SVG bar chart hiển thị', async ({ page }) => {
  399 |     await page.goto('/vi/admin/reports');
  400 |     await page.waitForLoadState('networkidle');
  401 | 
  402 |     // Chart phải là SVG
  403 |     const chart = page.locator('svg').first();
  404 |     await expect(chart).toBeVisible({ timeout: 5000 });
  405 |   });
  406 | });
  407 | 
```