# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\admin.spec.ts >> 4.4 — Customers >> search theo SĐT → thấy đúng khách
- Location: tests\e2e\admin\admin.spec.ts:207:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByPlaceholder(/tìm kiếm|search|sđt|phone/i).or(getByRole('searchbox')).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByPlaceholder(/tìm kiếm|search|sđt|phone/i).or(getByRole('searchbox')).first()

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
> 216 |     await expect(searchInput).toBeVisible({ timeout: 5000 });
      |                               ^ Error: expect(locator).toBeVisible() failed
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
  275 |     await expect(page.getByText(/hanie/i).first()).toBeVisible({ timeout: 5000 });
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
```