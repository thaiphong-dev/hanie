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
      - generic [ref=e20]:
        - generic [ref=e23]:
          - generic [ref=e25]:
            - generic [ref=e26]: "1"
            - generic [ref=e27]: Chọn dịch vụ
          - generic [ref=e30]:
            - generic [ref=e31]: "2"
            - generic [ref=e32]: Chọn ngày giờ
          - generic [ref=e35]:
            - generic [ref=e36]: "3"
            - generic [ref=e37]: Chọn kỹ thuật viên
          - generic [ref=e40]:
            - generic [ref=e41]: "4"
            - generic [ref=e42]: Xác nhận
        - generic [ref=e43]:
          - generic [ref=e44]:
            - heading "Chọn dịch vụ" [level=2] [ref=e45]
            - generic [ref=e46]:
              - button "Nail tay ~60 phút · 1 slot" [ref=e47] [cursor=pointer]:
                - generic [ref=e48]:
                  - paragraph [ref=e49]: Nail tay
                  - paragraph [ref=e50]: ~60 phút · 1 slot
                - img [ref=e52]
              - button "Nail chân ~60 phút · 1 slot" [ref=e54] [cursor=pointer]:
                - generic [ref=e55]:
                  - paragraph [ref=e56]: Nail chân
                  - paragraph [ref=e57]: ~60 phút · 1 slot
              - button "Nối mi ~90 phút · 2 slot" [ref=e58] [cursor=pointer]:
                - generic [ref=e59]:
                  - paragraph [ref=e60]: Nối mi
                  - paragraph [ref=e61]: ~90 phút · 2 slot
              - button "Uốn mi ~40 phút · 1 slot" [ref=e62] [cursor=pointer]:
                - generic [ref=e63]:
                  - paragraph [ref=e64]: Uốn mi
                  - paragraph [ref=e65]: ~40 phút · 1 slot
              - button "Lông mày ~30 phút · 1 slot" [ref=e66] [cursor=pointer]:
                - generic [ref=e67]:
                  - paragraph [ref=e68]: Lông mày
                  - paragraph [ref=e69]: ~30 phút · 1 slot
              - button "Gội đầu ~30 phút · 1 slot" [ref=e70] [cursor=pointer]:
                - generic [ref=e71]:
                  - paragraph [ref=e72]: Gội đầu
                  - paragraph [ref=e73]: ~30 phút · 1 slot
          - button "Xác nhận" [ref=e75] [cursor=pointer]:
            - text: Xác nhận
            - img [ref=e76]
    - contentinfo [ref=e78]:
      - generic [ref=e79]:
        - generic [ref=e80]:
          - generic [ref=e81]:
            - img "Hanie Studio" [ref=e82]
            - paragraph [ref=e83]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e84]:
            - heading "Dịch vụ" [level=4] [ref=e85]
            - list [ref=e86]:
              - listitem [ref=e87]:
                - link "Nail" [ref=e88] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e89]:
                - link "Nối mi" [ref=e90] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e91]:
                - link "Lông mày" [ref=e92] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e93]:
                - link "Gội đầu" [ref=e94] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e95]:
            - heading "Thông tin" [level=4] [ref=e96]
            - list [ref=e97]:
              - listitem [ref=e98]:
                - img [ref=e99]
                - generic [ref=e102]: 55 Nguyễn Nhạc, Quy Nhơn
              - listitem [ref=e103]:
                - img [ref=e104]
                - link "0901 234 567" [ref=e106] [cursor=pointer]:
                  - /url: tel:0901234567
              - listitem [ref=e107]:
                - img [ref=e108]
                - generic [ref=e111]: 08:00 – 20:00 hàng ngày
          - generic [ref=e112]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e113]
            - link "Đặt lịch ngay" [ref=e114] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e116]: © 2026 Hanie Studio. All rights reserved.
  - alert [ref=e117]
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