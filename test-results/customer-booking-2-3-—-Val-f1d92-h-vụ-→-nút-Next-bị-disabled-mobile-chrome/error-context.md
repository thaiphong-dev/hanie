# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer\booking.spec.ts >> 2.3 — Validation booking >> không chọn dịch vụ → nút Next bị disabled
- Location: tests\e2e\customer\booking.spec.ts:194:7

# Error details

```
Error: expect(locator).toBeDisabled() failed

Locator: getByRole('button', { name: /tiếp theo|next/i })
Expected: disabled
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeDisabled" with timeout 5000ms
  - waiting for getByRole('button', { name: /tiếp theo|next/i })

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
        - button "Open menu" [ref=e7] [cursor=pointer]:
          - img [ref=e8]
    - main [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e13]:
          - generic [ref=e16]: "1"
          - generic [ref=e20]: "2"
          - generic [ref=e24]: "3"
          - generic [ref=e28]: "4"
        - generic [ref=e29]:
          - generic [ref=e30]:
            - heading "Chọn dịch vụ" [level=2] [ref=e31]
            - generic [ref=e32]:
              - button "Nail tay ~60 phút · 1 slot" [ref=e33] [cursor=pointer]:
                - generic [ref=e34]:
                  - paragraph [ref=e35]: Nail tay
                  - paragraph [ref=e36]: ~60 phút · 1 slot
              - button "Nail chân ~60 phút · 1 slot" [ref=e37] [cursor=pointer]:
                - generic [ref=e38]:
                  - paragraph [ref=e39]: Nail chân
                  - paragraph [ref=e40]: ~60 phút · 1 slot
              - button "Nối mi ~90 phút · 2 slot" [ref=e41] [cursor=pointer]:
                - generic [ref=e42]:
                  - paragraph [ref=e43]: Nối mi
                  - paragraph [ref=e44]: ~90 phút · 2 slot
              - button "Uốn mi ~40 phút · 1 slot" [ref=e45] [cursor=pointer]:
                - generic [ref=e46]:
                  - paragraph [ref=e47]: Uốn mi
                  - paragraph [ref=e48]: ~40 phút · 1 slot
              - button "Lông mày ~30 phút · 1 slot" [ref=e49] [cursor=pointer]:
                - generic [ref=e50]:
                  - paragraph [ref=e51]: Lông mày
                  - paragraph [ref=e52]: ~30 phút · 1 slot
              - button "Gội đầu ~30 phút · 1 slot" [ref=e53] [cursor=pointer]:
                - generic [ref=e54]:
                  - paragraph [ref=e55]: Gội đầu
                  - paragraph [ref=e56]: ~30 phút · 1 slot
          - button "Xác nhận" [disabled] [ref=e58]:
            - text: Xác nhận
            - img [ref=e59]
    - contentinfo [ref=e61]:
      - generic [ref=e62]:
        - generic [ref=e63]:
          - generic [ref=e64]:
            - img "Hanie Studio" [ref=e65]
            - paragraph [ref=e66]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e67]:
            - heading "Dịch vụ" [level=4] [ref=e68]
            - list [ref=e69]:
              - listitem [ref=e70]:
                - link "Nail" [ref=e71] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e72]:
                - link "Nối mi" [ref=e73] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e74]:
                - link "Lông mày" [ref=e75] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e76]:
                - link "Gội đầu" [ref=e77] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e78]:
            - heading "Thông tin" [level=4] [ref=e79]
            - list [ref=e80]:
              - listitem [ref=e81]:
                - img [ref=e82]
                - generic [ref=e85]: 55 Nguyễn Nhạc, Quy Nhơn
              - listitem [ref=e86]:
                - img [ref=e87]
                - link "0901 234 567" [ref=e89] [cursor=pointer]:
                  - /url: tel:0901234567
              - listitem [ref=e90]:
                - img [ref=e91]
                - generic [ref=e94]: 08:00 – 20:00 hàng ngày
          - generic [ref=e95]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e96]
            - link "Đặt lịch ngay" [ref=e97] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e99]: © 2026 Hanie Studio. All rights reserved.
    - navigation [ref=e100]:
      - generic [ref=e101]:
        - link "Trang chủ" [ref=e102] [cursor=pointer]:
          - /url: /vi
          - img [ref=e103]
          - generic [ref=e106]: Trang chủ
        - link "Đặt lịch" [ref=e107] [cursor=pointer]:
          - /url: /vi/booking
          - img [ref=e108]
          - generic [ref=e111]: Đặt lịch
        - link "Lịch sử" [ref=e112] [cursor=pointer]:
          - /url: /vi/history
          - img [ref=e113]
          - generic [ref=e116]: Lịch sử
        - link "Voucher" [ref=e117] [cursor=pointer]:
          - /url: /vi/vouchers
          - img [ref=e118]
          - generic [ref=e121]: Voucher
        - link "Tôi" [ref=e122] [cursor=pointer]:
          - /url: /vi/profile
          - img [ref=e123]
          - generic [ref=e126]: Tôi
  - alert [ref=e127]
```

# Test source

```ts
  100 |     await booking.nextStep();
  101 | 
  102 |     // Bước 1
  103 |     await booking.selectDate(getTomorrow());
  104 | 
  105 |     // Chọn parallel option
  106 |     await booking.selectParallelOption();
  107 |     await booking.selectTimeSlot('10:00');
  108 |     await booking.nextStep();
  109 | 
  110 |     // Bước 2
  111 |     await booking.selectStaff('Bất kỳ');
  112 |     await booking.nextStep();
  113 | 
  114 |     // Bước 3
  115 |     const phone = uniquePhone();
  116 |     await booking.fillCustomerInfo({ name: 'Parallel Test', phone });
  117 |     await booking.confirmBooking();
  118 | 
  119 |     await booking.expectSuccess();
  120 |   });
  121 | });
  122 | 
  123 | // ─── Test 2.3 — Validation ───────────────────────────────────────────────────
  124 | test.describe('2.3 — Validation booking', () => {
  125 |   test('SĐT sai format → lỗi "Số điện thoại không hợp lệ"', async ({ page }) => {
  126 |     const booking = new BookingPage(page);
  127 |     await booking.goto('vi');
  128 | 
  129 |     await booking.selectService('Nail tay');
  130 |     await booking.nextStep();
  131 |     await booking.selectDate(getTomorrow());
  132 |     await booking.selectTimeSlot('09:00');
  133 |     await booking.nextStep();
  134 |     await booking.selectStaff('Bất kỳ');
  135 |     await booking.nextStep();
  136 | 
  137 |     // Nhập SĐT sai format
  138 |     await booking.fillCustomerInfo({ name: 'Test User', phone: '12345' });
  139 |     await booking.confirmBooking();
  140 | 
  141 |     await expect(
  142 |       page.getByText(/số điện thoại không hợp lệ|invalid.*phone|phone.*invalid/i)
  143 |     ).toBeVisible({ timeout: 5000 });
  144 |   });
  145 | 
  146 |   test('slot trong vòng 1 giờ tới → lỗi đặt trước ít nhất 1 giờ', async ({ page }) => {
  147 |     const booking = new BookingPage(page);
  148 |     await booking.goto('vi');
  149 | 
  150 |     await booking.selectService('Nail tay');
  151 |     await booking.nextStep();
  152 | 
  153 |     // Chọn ngày hôm nay
  154 |     const todayDate = new Date();
  155 |     const todayStr = todayDate.toISOString().split('T')[0];
  156 |     await booking.selectDate(todayStr);
  157 | 
  158 |     // Nếu có cảnh báo về 1 giờ → pass
  159 |     const hasWarning = await page.getByText(/đặt trước ít nhất 1 giờ|at least 1 hour|book.*advance/i).count();
  160 | 
  161 |     // Nếu chưa hiện warning ở step chọn ngày, thử chọn slot gần nhất
  162 |     if (hasWarning === 0) {
  163 |       // Tìm slot đầu tiên enabled
  164 |       const firstSlot = page.locator('button[data-available="true"]').first();
  165 |       if (await firstSlot.count() > 0) {
  166 |         const slotText = await firstSlot.textContent();
  167 |         if (slotText) {
  168 |           await firstSlot.click();
  169 |           await booking.nextStep();
  170 |           await booking.selectStaff('Bất kỳ');
  171 |           await booking.nextStep();
  172 |           await booking.fillCustomerInfo({ name: 'Test', phone: uniquePhone() });
  173 |           await booking.confirmBooking();
  174 | 
  175 |           // Có thể lỗi ở API level
  176 |           const errMsg = page.getByText(/đặt trước ít nhất 1 giờ|booking too soon|too.*soon/i);
  177 |           // Nếu lỗi → pass test; nếu không lỗi (slot valid) → cũng OK
  178 |         }
  179 |       }
  180 | 
  181 |       // Kiểm tra cảnh báo trên UI (disabled slots)
  182 |       await expect(
  183 |         page.getByText(/đặt trước ít nhất 1 giờ|at least 1 hour|vui lòng đặt trước/i)
  184 |           .or(page.locator('button[disabled]').first())
  185 |       ).toBeDefined();
  186 |     }
  187 | 
  188 |     // Cảnh báo phải hiện
  189 |     if (hasWarning > 0) {
  190 |       await expect(page.getByText(/đặt trước ít nhất 1 giờ|at least 1 hour/i)).toBeVisible();
  191 |     }
  192 |   });
  193 | 
  194 |   test('không chọn dịch vụ → nút Next bị disabled', async ({ page }) => {
  195 |     const booking = new BookingPage(page);
  196 |     await booking.goto('vi');
  197 | 
  198 |     // Không chọn dịch vụ nào
  199 |     const nextBtn = page.getByRole('button', { name: /tiếp theo|next/i });
> 200 |     await expect(nextBtn).toBeDisabled({ timeout: 5000 });
      |                           ^ Error: expect(locator).toBeDisabled() failed
  201 |   });
  202 | });
  203 | 
  204 | // ─── Test 2.4 — Login rồi booking (prefill) ──────────────────────────────────
  205 | test.describe('2.4 — Login rồi booking', () => {
  206 |   test.use({ storageState: CUSTOMER_AUTH_FILE });
  207 | 
  208 |   test('đã login → booking step cuối tự prefill tên + SĐT', async ({ page }) => {
  209 |     const booking = new BookingPage(page);
  210 |     await booking.goto('vi');
  211 | 
  212 |     // Bước 0 — Chọn dịch vụ
  213 |     await booking.selectService('Nail tay');
  214 |     await booking.nextStep();
  215 | 
  216 |     // Bước 1
  217 |     await booking.selectDate(getTomorrow());
  218 |     await booking.selectTimeSlot('09:00');
  219 |     await booking.nextStep();
  220 | 
  221 |     // Bước 2
  222 |     await booking.selectStaff('Bất kỳ');
  223 |     await booking.nextStep();
  224 | 
  225 |     // Bước 3 — Tên + SĐT phải tự điền sẵn
  226 |     await booking.expectPrefilled(CUSTOMER_NAME, CUSTOMER_PHONE);
  227 |   });
  228 | });
  229 | 
  230 | // ─── Test 2.5 — URL param pre-select ─────────────────────────────────────────
  231 | test.describe('2.5 — URL param pre-select', () => {
  232 |   test('?category=nail_tay → step 0 "Nail tay" đã được chọn sẵn', async ({ page }) => {
  233 |     const booking = new BookingPage(page);
  234 |     await booking.goto('vi', '?category=nail_tay');
  235 | 
  236 |     // Nail tay phải ở trạng thái selected (checked / active)
  237 |     // Kiểm tra checkbox checked hoặc card có aria-selected / data-selected
  238 |     const nailTaySelected = await page.evaluate(() => {
  239 |       // Tìm element có text Nail tay và kiểm tra trạng thái
  240 |       const elements = document.querySelectorAll('[role="checkbox"], button, [data-selected]');
  241 |       for (const el of elements) {
  242 |         if (el.textContent?.includes('Nail tay')) {
  243 |           return (
  244 |             el.getAttribute('aria-checked') === 'true' ||
  245 |             el.getAttribute('data-selected') === 'true' ||
  246 |             el.getAttribute('data-state') === 'checked' ||
  247 |             el.classList.contains('selected') ||
  248 |             el.classList.contains('active') ||
  249 |             (el as HTMLInputElement).checked === true
  250 |           );
  251 |         }
  252 |       }
  253 |       return false;
  254 |     });
  255 | 
  256 |     // Hoặc kiểm tra checkmark icon hiển thị
  257 |     const hasCheckmark = await page.locator('[data-service="nail_tay"] .checkmark, [data-service="nail_tay"] [aria-checked="true"]').count() > 0;
  258 | 
  259 |     // Ít nhất một trong hai phải đúng, hoặc Next button phải enabled
  260 |     const nextEnabled = await page.getByRole('button', { name: /tiếp theo|next/i }).isEnabled().catch(() => false);
  261 | 
  262 |     expect(nailTaySelected || hasCheckmark || nextEnabled).toBe(true);
  263 |   });
  264 | });
  265 | 
```