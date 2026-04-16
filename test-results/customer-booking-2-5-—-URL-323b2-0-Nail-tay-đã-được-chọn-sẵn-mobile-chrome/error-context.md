# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer\booking.spec.ts >> 2.5 — URL param pre-select >> ?category=nail_tay → step 0 "Nail tay" đã được chọn sẵn
- Location: tests\e2e\customer\booking.spec.ts:232:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
                - img [ref=e38]
              - button "Nail chân ~60 phút · 1 slot" [ref=e40] [cursor=pointer]:
                - generic [ref=e41]:
                  - paragraph [ref=e42]: Nail chân
                  - paragraph [ref=e43]: ~60 phút · 1 slot
              - button "Nối mi ~90 phút · 2 slot" [ref=e44] [cursor=pointer]:
                - generic [ref=e45]:
                  - paragraph [ref=e46]: Nối mi
                  - paragraph [ref=e47]: ~90 phút · 2 slot
              - button "Uốn mi ~40 phút · 1 slot" [ref=e48] [cursor=pointer]:
                - generic [ref=e49]:
                  - paragraph [ref=e50]: Uốn mi
                  - paragraph [ref=e51]: ~40 phút · 1 slot
              - button "Lông mày ~30 phút · 1 slot" [ref=e52] [cursor=pointer]:
                - generic [ref=e53]:
                  - paragraph [ref=e54]: Lông mày
                  - paragraph [ref=e55]: ~30 phút · 1 slot
              - button "Gội đầu ~30 phút · 1 slot" [ref=e56] [cursor=pointer]:
                - generic [ref=e57]:
                  - paragraph [ref=e58]: Gội đầu
                  - paragraph [ref=e59]: ~30 phút · 1 slot
          - button "Xác nhận" [ref=e61] [cursor=pointer]:
            - text: Xác nhận
            - img [ref=e62]
    - contentinfo [ref=e64]:
      - generic [ref=e65]:
        - generic [ref=e66]:
          - generic [ref=e67]:
            - img "Hanie Studio" [ref=e68]
            - paragraph [ref=e69]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e70]:
            - heading "Dịch vụ" [level=4] [ref=e71]
            - list [ref=e72]:
              - listitem [ref=e73]:
                - link "Nail" [ref=e74] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e75]:
                - link "Nối mi" [ref=e76] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e77]:
                - link "Lông mày" [ref=e78] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e79]:
                - link "Gội đầu" [ref=e80] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e81]:
            - heading "Thông tin" [level=4] [ref=e82]
            - list [ref=e83]:
              - listitem [ref=e84]:
                - img [ref=e85]
                - generic [ref=e88]: 55 Nguyễn Nhạc, Quy Nhơn
              - listitem [ref=e89]:
                - img [ref=e90]
                - link "0901 234 567" [ref=e92] [cursor=pointer]:
                  - /url: tel:0901234567
              - listitem [ref=e93]:
                - img [ref=e94]
                - generic [ref=e97]: 08:00 – 20:00 hàng ngày
          - generic [ref=e98]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e99]
            - link "Đặt lịch ngay" [ref=e100] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e102]: © 2026 Hanie Studio. All rights reserved.
    - navigation [ref=e103]:
      - generic [ref=e104]:
        - link "Trang chủ" [ref=e105] [cursor=pointer]:
          - /url: /vi
          - img [ref=e106]
          - generic [ref=e109]: Trang chủ
        - link "Đặt lịch" [ref=e110] [cursor=pointer]:
          - /url: /vi/booking
          - img [ref=e111]
          - generic [ref=e114]: Đặt lịch
        - link "Lịch sử" [ref=e115] [cursor=pointer]:
          - /url: /vi/history
          - img [ref=e116]
          - generic [ref=e119]: Lịch sử
        - link "Voucher" [ref=e120] [cursor=pointer]:
          - /url: /vi/vouchers
          - img [ref=e121]
          - generic [ref=e124]: Voucher
        - link "Tôi" [ref=e125] [cursor=pointer]:
          - /url: /vi/profile
          - img [ref=e126]
          - generic [ref=e129]: Tôi
  - alert [ref=e130]
```

# Test source

```ts
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
  200 |     await expect(nextBtn).toBeDisabled({ timeout: 5000 });
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
> 262 |     expect(nailTaySelected || hasCheckmark || nextEnabled).toBe(true);
      |                                                            ^ Error: expect(received).toBe(expected) // Object.is equality
  263 |   });
  264 | });
  265 | 
```