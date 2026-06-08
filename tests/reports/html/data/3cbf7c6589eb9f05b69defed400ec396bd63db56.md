# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security\security.spec.ts >> 5.4 — Rate limit login >> 6 lần login sai cùng SĐT → lần 6 trả 429
- Location: tests\e2e\security\security.spec.ts:201:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 429
Received: 401
```

# Test source

```ts
  125 |     let dialogFired = false;
  126 |     page.on('dialog', async (dialog) => {
  127 |       dialogFired = true;
  128 |       await dialog.dismiss(); // dismiss để không block
  129 |     });
  130 | 
  131 |     const booking = new BookingPage(page);
  132 |     await booking.goto('vi');
  133 | 
  134 |     // Bước 0
  135 |     await booking.selectService('Nail tay');
  136 |     await booking.nextStep();
  137 | 
  138 |     // Bước 1
  139 |     await booking.selectDate(getTomorrow());
  140 |     await booking.selectTimeSlot('09:00');
  141 |     await booking.nextStep();
  142 | 
  143 |     // Bước 2
  144 |     await booking.selectStaff('Bất kỳ');
  145 |     await booking.nextStep();
  146 | 
  147 |     // XSS payload
  148 |     await booking.fillCustomerInfo({
  149 |       name: '<script>alert("xss")</script>',
  150 |       phone: uniquePhone(),
  151 |       notes: '<img src=x onerror=alert("xss2")>',
  152 |     });
  153 |     await booking.confirmBooking();
  154 | 
  155 |     // Đợi để chắc chắn alert không fire
  156 |     await page.waitForTimeout(2000);
  157 | 
  158 |     // XSS không được trigger
  159 |     expect(dialogFired).toBe(false);
  160 | 
  161 |     // Booking vẫn thành công (tên được sanitize/escape)
  162 |     await booking.expectSuccess();
  163 |   });
  164 | 
  165 |   test('XSS trong notes: admin panel hiển thị text thuần, không execute script', async ({ page, request }) => {
  166 |     // Tạo booking với XSS payload
  167 |     const xssPhone = uniquePhone();
  168 |     const bookingRes = await request.post('/api/v1/bookings', {
  169 |       data: {
  170 |         booking_category_ids: ['nail_tay'], // slug hoặc ID
  171 |         scheduled_at: `${getTomorrow()}T09:00:00+07:00`,
  172 |         customer_name: 'XSS Test User',
  173 |         customer_phone: xssPhone,
  174 |         notes: '<script>alert("admin_xss")</script>',
  175 |       },
  176 |     });
  177 | 
  178 |     // Booking tạo thành công (dù ID không đúng format → có thể fail, bỏ qua)
  179 |     if (bookingRes.status() !== 201) {
  180 |       test.skip(true, `Cannot create booking for XSS test: ${bookingRes.status()}`);
  181 |       return;
  182 |     }
  183 | 
  184 |     // Trong admin panel — dialog không fire khi xem booking có XSS notes
  185 |     let adminDialogFired = false;
  186 |     page.on('dialog', async (dialog) => {
  187 |       adminDialogFired = true;
  188 |       await dialog.dismiss();
  189 |     });
  190 | 
  191 |     await page.goto('/vi/admin/bookings');
  192 |     await page.waitForLoadState('networkidle');
  193 |     await page.waitForTimeout(2000);
  194 | 
  195 |     expect(adminDialogFired).toBe(false);
  196 |   });
  197 | });
  198 | 
  199 | // ─── Test 5.4 — Rate limit login ─────────────────────────────────────────────
  200 | test.describe('5.4 — Rate limit login', () => {
  201 |   test('6 lần login sai cùng SĐT → lần 6 trả 429', async ({ request }) => {
  202 |     const testPhone = '0977999888'; // Phone không tồn tại → sai password
  203 | 
  204 |     let lastStatus = 0;
  205 | 
  206 |     for (let i = 0; i < 6; i++) {
  207 |       const res = await request.post('/api/v1/auth/login', {
  208 |         data: {
  209 |           phone: testPhone,
  210 |           password: `wrongpass_${i}`,
  211 |         },
  212 |       });
  213 |       lastStatus = res.status();
  214 |       console.log(`[5.4] Attempt ${i + 1}: status ${lastStatus}`);
  215 | 
  216 |       if (lastStatus === 429) {
  217 |         break;
  218 |       }
  219 | 
  220 |       // Nhỏ delay để không bị network throttle
  221 |       await new Promise(resolve => setTimeout(resolve, 100));
  222 |     }
  223 | 
  224 |     // Lần thứ 5-6 phải là 429 (theo spec: 5/phone/15min)
> 225 |     expect(lastStatus).toBe(429);
      |                        ^ Error: expect(received).toBe(expected) // Object.is equality
  226 |   });
  227 | 
  228 |   test('429 response có message thích hợp', async ({ request }) => {
  229 |     const testPhone = '0977999777';
  230 | 
  231 |     let response429: Awaited<ReturnType<typeof request.post>> | null = null;
  232 | 
  233 |     for (let i = 0; i < 6; i++) {
  234 |       const res = await request.post('/api/v1/auth/login', {
  235 |         data: {
  236 |           phone: testPhone,
  237 |           password: `wrongpass_${i}`,
  238 |         },
  239 |       });
  240 | 
  241 |       if (res.status() === 429) {
  242 |         response429 = res;
  243 |         break;
  244 |       }
  245 |       await new Promise(resolve => setTimeout(resolve, 100));
  246 |     }
  247 | 
  248 |     if (!response429) {
  249 |       console.warn('[5.4] Rate limit not triggered within 6 attempts — rate_limit_log patch chưa chạy?');
  250 |       return;
  251 |     }
  252 | 
  253 |     const body = await response429.json();
  254 |     expect(body).toHaveProperty('error');
  255 | 
  256 |     const errorMsg = body.error?.message ?? body.error ?? '';
  257 |     expect(typeof errorMsg).toBe('string');
  258 |     expect(errorMsg.length).toBeGreaterThan(0);
  259 |     console.log('[5.4] Rate limit message:', errorMsg);
  260 |   });
  261 | });
  262 | 
```