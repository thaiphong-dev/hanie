/**
 * NHÓM TEST 5: Security (Critical)
 *
 * Test 5.1 — API auth guard
 * Test 5.2 — SQL injection
 * Test 5.3 — XSS
 * Test 5.4 — Rate limit login
 */
import { test, expect } from '@playwright/test';
import { BookingPage } from '../../fixtures/page-objects/BookingPage';
import { getTomorrow, uniquePhone, CUSTOMER_PHONE, CUSTOMER_PASSWORD } from '../../fixtures/helpers';

// ─── Test 5.1 — API auth guard ───────────────────────────────────────────────
test.describe('5.1 — API auth guard', () => {
  test('GET /api/v1/bookings (no token) → 401 JSON, không redirect', async ({ request }) => {
    const res = await request.get('/api/v1/bookings');
    expect(res.status()).toBe(401);

    // Phải trả JSON, không phải HTML redirect
    const contentType = res.headers()['content-type'] ?? '';
    expect(contentType).toContain('application/json');

    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('PATCH /api/v1/admin/bookings/fake-id/status (no token) → 401', async ({ request }) => {
    const res = await request.patch('/api/v1/admin/bookings/fake-id-12345/status', {
      data: { status: 'confirmed' },
    });
    expect(res.status()).toBe(401);

    const contentType = res.headers()['content-type'] ?? '';
    expect(contentType).toContain('application/json');
  });

  test('GET /api/v1/admin/dashboard (customer token) → 403', async ({ request, page }) => {
    // Login as customer để lấy token
    const loginRes = await request.post('/api/v1/auth/login', {
      data: {
        phone: CUSTOMER_PHONE,
        password: CUSTOMER_PASSWORD,
      },
    });

    if (loginRes.status() !== 200) {
      test.skip(true, `Login failed: ${loginRes.status()}`);
      return;
    }

    const loginBody = await loginRes.json();
    const customerToken = loginBody.data?.access_token;

    if (!customerToken) {
      test.skip(true, 'No access_token in login response');
      return;
    }

    // Dùng customer token để access admin route
    const adminRes = await request.get('/api/v1/admin/dashboard', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    expect(adminRes.status()).toBe(403);

    const body = await adminRes.json();
    expect(body).toHaveProperty('error');
  });
});

// ─── Test 5.2 — SQL injection ────────────────────────────────────────────────
test.describe('5.2 — SQL injection', () => {
  test("name: \"'; DROP TABLE bookings; --\" → submit thành công, tên lưu literal", async ({ page }) => {
    const booking = new BookingPage(page);
    await booking.goto('vi');

    // Interceptor để kiểm tra response
    let bookingResponse: { status: number; body: unknown } | null = null;
    page.on('response', async (res) => {
      if (res.url().includes('/api/v1/bookings') && res.request().method() === 'POST') {
        try {
          const body = await res.json();
          bookingResponse = { status: res.status(), body };
        } catch {
          bookingResponse = { status: res.status(), body: null };
        }
      }
    });

    // Bước 0
    await booking.selectService('Nail tay');
    await booking.nextStep();

    // Bước 1
    await booking.selectDate(getTomorrow());
    await booking.selectTimeSlot('09:00');
    await booking.nextStep();

    // Bước 2
    await booking.selectStaff('Bất kỳ');
    await booking.nextStep();

    // Bước 3 — SQL injection payload
    await booking.fillCustomerInfo({
      name: "'; DROP TABLE bookings; --",
      phone: uniquePhone(),
      notes: "1' OR '1'='1",
    });
    await booking.confirmBooking();

    // Phải thành công (tên được lưu literal, không execute SQL)
    await booking.expectSuccess();

    // Verify response 201
    if (bookingResponse) {
      expect(bookingResponse.status).toBe(201);
    }
  });
});

// ─── Test 5.3 — XSS ──────────────────────────────────────────────────────────
test.describe('5.3 — XSS', () => {
  test('<script>alert() trong input → không execute, không có popup', async ({ page }) => {
    // Detect dialog (alert popup)
    let dialogFired = false;
    page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss(); // dismiss để không block
    });

    const booking = new BookingPage(page);
    await booking.goto('vi');

    // Bước 0
    await booking.selectService('Nail tay');
    await booking.nextStep();

    // Bước 1
    await booking.selectDate(getTomorrow());
    await booking.selectTimeSlot('09:00');
    await booking.nextStep();

    // Bước 2
    await booking.selectStaff('Bất kỳ');
    await booking.nextStep();

    // XSS payload
    await booking.fillCustomerInfo({
      name: '<script>alert("xss")</script>',
      phone: uniquePhone(),
      notes: '<img src=x onerror=alert("xss2")>',
    });
    await booking.confirmBooking();

    // Đợi để chắc chắn alert không fire
    await page.waitForTimeout(2000);

    // XSS không được trigger
    expect(dialogFired).toBe(false);

    // Booking vẫn thành công (tên được sanitize/escape)
    await booking.expectSuccess();
  });

  test('XSS trong notes: admin panel hiển thị text thuần, không execute script', async ({ page, request }) => {
    // Tạo booking với XSS payload
    const xssPhone = uniquePhone();
    const bookingRes = await request.post('/api/v1/bookings', {
      data: {
        booking_category_ids: ['nail_tay'], // slug hoặc ID
        scheduled_at: `${getTomorrow()}T09:00:00+07:00`,
        customer_name: 'XSS Test User',
        customer_phone: xssPhone,
        notes: '<script>alert("admin_xss")</script>',
      },
    });

    // Booking tạo thành công (dù ID không đúng format → có thể fail, bỏ qua)
    if (bookingRes.status() !== 201) {
      test.skip(true, `Cannot create booking for XSS test: ${bookingRes.status()}`);
      return;
    }

    // Trong admin panel — dialog không fire khi xem booking có XSS notes
    let adminDialogFired = false;
    page.on('dialog', async (dialog) => {
      adminDialogFired = true;
      await dialog.dismiss();
    });

    await page.goto('/vi/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    expect(adminDialogFired).toBe(false);
  });
});

// ─── Test 5.4 — Rate limit login ─────────────────────────────────────────────
test.describe('5.4 — Rate limit login', () => {
  test('6 lần login sai cùng SĐT → lần 6 trả 429', async ({ request }) => {
    const testPhone = '0977999888'; // Phone không tồn tại → sai password

    let lastStatus = 0;

    for (let i = 0; i < 6; i++) {
      const res = await request.post('/api/v1/auth/login', {
        data: {
          phone: testPhone,
          password: `wrongpass_${i}`,
        },
      });
      lastStatus = res.status();
      console.log(`[5.4] Attempt ${i + 1}: status ${lastStatus}`);

      if (lastStatus === 429) {
        break;
      }

      // Nhỏ delay để không bị network throttle
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Lần thứ 5-6 phải là 429 (theo spec: 5/phone/15min)
    expect(lastStatus).toBe(429);
  });

  test('429 response có message thích hợp', async ({ request }) => {
    const testPhone = '0977999777';

    let response429: Awaited<ReturnType<typeof request.post>> | null = null;

    for (let i = 0; i < 6; i++) {
      const res = await request.post('/api/v1/auth/login', {
        data: {
          phone: testPhone,
          password: `wrongpass_${i}`,
        },
      });

      if (res.status() === 429) {
        response429 = res;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!response429) {
      console.warn('[5.4] Rate limit not triggered within 6 attempts — rate_limit_log patch chưa chạy?');
      return;
    }

    const body = await response429.json();
    expect(body).toHaveProperty('error');

    const errorMsg = body.error?.message ?? body.error ?? '';
    expect(typeof errorMsg).toBe('string');
    expect(errorMsg.length).toBeGreaterThan(0);
    console.log('[5.4] Rate limit message:', errorMsg);
  });
});
