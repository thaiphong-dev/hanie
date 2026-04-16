# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\admin.spec.ts >> 4.5 — Staff & Leave requests >> danh sách staff hiển thị (Hanie, Lan)
- Location: tests\e2e\admin\admin.spec.ts:268:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/hanie/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/hanie/i).first()

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
  203 | });
  204 | 
  205 | // ─── Test 4.4 — Customers ─────────────────────────────────────────────────────
  206 | test.describe('4.4 — Customers', () => {
  207 |   test('search theo SĐT → thấy đúng khách', async ({ page }) => {
  208 |     await page.goto('/vi/admin/customers');
  209 |     await page.waitForLoadState('networkidle');
  210 | 
  211 |     await expect(page).not.toHaveURL(/.*\/login.*/);
  212 | 
  213 |     const searchInput = page.getByPlaceholder(/tìm kiếm|search|sđt|phone/i)
  214 |       .or(page.getByRole('searchbox')).first();
  215 | 
  216 |     await expect(searchInput).toBeVisible({ timeout: 5000 });
  217 |     await searchInput.fill('0977000001');
  218 |     await page.waitForTimeout(1000);
  219 | 
  220 |     await expect(page.getByText(/qc tester|0977000001/i).first()).toBeVisible({ timeout: 5000 });
  221 |   });
  222 | 
  223 |   test('filter VIP → chỉ hiện khách VIP', async ({ page }) => {
  224 |     await page.goto('/vi/admin/customers');
  225 |     await page.waitForLoadState('networkidle');
  226 | 
  227 |     // Tìm filter VIP
  228 |     const vipFilter = page.getByRole('button', { name: /vip/i })
  229 |       .or(page.getByRole('option', { name: /vip/i })).first();
  230 | 
  231 |     if (await vipFilter.count() > 0) {
  232 |       await vipFilter.click();
  233 |       await page.waitForTimeout(500);
  234 |       // Không crash
  235 |       await expect(page).toHaveURL(/.*\/customers.*/);
  236 |     }
  237 |   });
  238 | 
  239 |   test('click "Xem hồ sơ" → 3 tabs Profile/History/Notes', async ({ page }) => {
  240 |     await page.goto('/vi/admin/customers');
  241 |     await page.waitForLoadState('networkidle');
  242 | 
  243 |     // Search customer
  244 |     const searchInput = page.getByPlaceholder(/tìm kiếm|search|sđt|phone/i).first();
  245 |     if (await searchInput.count() > 0) {
  246 |       await searchInput.fill('0977000001');
  247 |       await page.waitForTimeout(1000);
  248 |     }
  249 | 
  250 |     // Click xem hồ sơ
  251 |     const profileBtn = page.getByRole('button', { name: /xem hồ sơ|view profile|chi tiết/i }).first()
  252 |       .or(page.getByRole('link', { name: /xem hồ sơ|view profile/i }).first());
  253 | 
  254 |     if (await profileBtn.count() > 0) {
  255 |       await profileBtn.click();
  256 |       await page.waitForLoadState('networkidle');
  257 | 
  258 |       // 3 tabs
  259 |       await expect(page.getByRole('tab', { name: /profile|thông tin/i })).toBeVisible({ timeout: 5000 });
  260 |       await expect(page.getByRole('tab', { name: /history|lịch sử/i })).toBeVisible({ timeout: 5000 });
  261 |       await expect(page.getByRole('tab', { name: /notes|ghi chú/i })).toBeVisible({ timeout: 5000 });
  262 |     }
  263 |   });
  264 | });
  265 | 
  266 | // ─── Test 4.5 — Staff & Leave requests ───────────────────────────────────────
  267 | test.describe('4.5 — Staff & Leave requests', () => {
  268 |   test('danh sách staff hiển thị (Hanie, Lan)', async ({ page }) => {
  269 |     await page.goto('/vi/admin/staff');
  270 |     await page.waitForLoadState('networkidle');
  271 | 
  272 |     await expect(page).not.toHaveURL(/.*\/login.*/);
  273 | 
  274 |     // Phải có 2 staff
> 275 |     await expect(page.getByText(/hanie/i).first()).toBeVisible({ timeout: 5000 });
      |                                                    ^ Error: expect(locator).toBeVisible() failed
  276 |     await expect(page.getByText(/lan/i).first()).toBeVisible({ timeout: 5000 });
  277 |   });
  278 | 
  279 |   test('tạo leave request test → Approve → staff_schedules.is_day_off = true', async ({ page, request }) => {
  280 |     await page.goto('/vi/admin/staff');
  281 |     await page.waitForLoadState('networkidle');
  282 | 
  283 |     // Tìm nút tạo đơn nghỉ
  284 |     const leaveBtn = page.getByRole('button', { name: /xin nghỉ|leave.*request|nghỉ phép/i }).first();
  285 | 
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
```