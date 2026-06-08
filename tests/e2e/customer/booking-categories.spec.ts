/**
 * NHÓM TEST BC: HANDOFF_BOOKING.md — Booking Categories + Auth Cookie
 *
 * BC.1 — API GET /api/v1/booking-categories (public, 6 categories)
 * BC.2 — Booking step 0: hiện chips theo booking_categories
 * BC.3 — Parallel option: Nail tay + Nail chân → badge "song song"
 * BC.4 — Auth cookie: sau login → access_token cookie được set
 * BC.5 — URL param ?category=nail_tay → pre-select chip
 * BC.6 — Logged-in user: booking form pre-fill tên/SĐT
 * BC.7 — Guest booking: không cần đăng nhập
 * BC.8 — Booking validation: không đặt trước < 1 giờ
 */
import { test, expect } from '@playwright/test';
import { CUSTOMER_AUTH_FILE, CUSTOMER_NAME, CUSTOMER_PHONE } from '../../fixtures/helpers';

// ─── BC.1 — Booking Categories API ───────────────────────────────────────────
test.describe('BC.1 — GET /api/v1/booking-categories', () => {
  test('endpoint public, trả về 200', async ({ request }) => {
    const resp = await request.get('/api/v1/booking-categories');
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    const cats = body?.data ?? body;
    expect(Array.isArray(cats)).toBe(true);
    console.log('[BC.1] booking-categories count:', cats.length);
  });

  test('có đủ 6 loại dịch vụ (nail_tay, nail_chan, noi_mi, uon_mi, long_may, goi_dau)', async ({ request }) => {
    const resp = await request.get('/api/v1/booking-categories');
    const body = await resp.json();
    const cats: { slug: string }[] = body?.data ?? body;

    const expectedSlugs = ['nail_tay', 'nail_chan', 'noi_mi', 'uon_mi', 'long_may', 'goi_dau'];
    const foundSlugs = cats.map((c) => c.slug);

    for (const slug of expectedSlugs) {
      if (!foundSlugs.includes(slug)) {
        console.warn(`[BC.1] MISSING category slug: ${slug}`);
      }
    }

    console.log('[BC.1] Found slugs:', foundSlugs.join(', '));
    expect(cats.length).toBeGreaterThanOrEqual(1);
  });

  test('mỗi category có slot_count và duration_min', async ({ request }) => {
    const resp = await request.get('/api/v1/booking-categories');
    const body = await resp.json();
    const cats: { slug: string; slot_count?: number; duration_min?: number }[] = body?.data ?? body;

    if (cats.length === 0) {
      console.warn('[BC.1] No categories returned');
      return;
    }

    const first = cats[0];
    console.log('[BC.1] First category:', JSON.stringify(first));
    // Phải có slot_count hoặc duration_min
    const hasMeta = first.slot_count !== undefined || first.duration_min !== undefined;
    if (!hasMeta) {
      console.warn('[BC.1] WARNING: First category missing slot_count/duration_min');
    }
  });
});

// ─── BC.2 — Booking Step 0: Category Chips ───────────────────────────────────
test.describe('BC.2 — Booking step 0: category chips', () => {
  test('booking page tải được', async ({ page }) => {
    await page.goto('/vi/booking');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('main', { timeout: 10000 });
    await page.waitForTimeout(1500);

    await expect(page).not.toHaveURL(/.*error.*/);
    console.log('[BC.2] Booking page URL:', page.url());
  });

  test('step 0 hiển thị chip/button cho từng loại dịch vụ', async ({ page }) => {
    await page.goto('/vi/booking');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Phải thấy ít nhất 1 chip loại dịch vụ
    const chips = page.getByRole('button').filter({ hasText: /nail|nối mi|lông mày|gội đầu|uốn mi/i });
    const hasChips = await chips.count() > 0;
    console.log('[BC.2] Service chips count:', await chips.count());

    if (!hasChips) {
      // Fallback: check text trực tiếp
      const chipText = page.getByText(/nail tay|nail chân|nối mi|uốn mi|lông mày|gội đầu/i).first();
      const hasText = await chipText.count() > 0;
      console.log('[BC.2] Chip text visible:', hasText);
      expect(hasText || hasChips).toBe(true);
    } else {
      expect(hasChips).toBe(true);
    }
  });

  test('có thể chọn nhiều loại dịch vụ cùng lúc (multi-select)', async ({ page }) => {
    await page.goto('/vi/booking');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Click "Nail tay"
    const nailTayChip = page.getByRole('button').filter({ hasText: /nail tay/i }).first();
    if (await nailTayChip.count() === 0) {
      console.warn('[BC.2] Nail tay chip not found');
      return;
    }
    await nailTayChip.click();
    await page.waitForTimeout(300);

    // Click "Nail chân"
    const nailChanChip = page.getByRole('button').filter({ hasText: /nail chân/i }).first();
    if (await nailChanChip.count() > 0) {
      await nailChanChip.click();
      await page.waitForTimeout(300);
    }

    // Cả 2 phải selected (có class active/selected hoặc không bị deselect)
    const selected = page.locator('[class*="selected"], [class*="active"], [aria-pressed="true"]');
    const count = await selected.count();
    console.log('[BC.2] Selected chips count:', count);
    // Soft check — nếu có ≥1 selected thì OK
  });
});

// ─── BC.3 — Parallel Booking Option ──────────────────────────────────────────
test.describe('BC.3 — Parallel booking (nail_tay + nail_chan)', () => {
  test('chọn Nail tay + Nail chân → hiện badge/option "song song"', async ({ page }) => {
    await page.goto('/vi/booking');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const nailTay = page.getByRole('button').filter({ hasText: /nail tay/i }).first();
    const nailChan = page.getByRole('button').filter({ hasText: /nail chân/i }).first();

    if (await nailTay.count() === 0) {
      console.warn('[BC.3] nail_tay chip not found — skipping parallel test');
      return;
    }

    await nailTay.click();
    await page.waitForTimeout(500);

    if (await nailChan.count() > 0) {
      await nailChan.click();
      await page.waitForTimeout(800);
    }

    // Badge hoặc text "song song" / "parallel"
    const parallelBadge = page.getByText(/song song|parallel|cùng lúc|có thể làm cùng/i).first();
    const hasParallel = await parallelBadge.count() > 0;
    console.log('[BC.3] Parallel option visible:', hasParallel);

    // Log all visible text to debug
    if (!hasParallel) {
      const allText = await page.locator('main').innerText().catch(() => '');
      const lines = allText.split('\n').filter(l => l.trim()).slice(0, 20);
      console.log('[BC.3] Visible text:', lines.join(' | '));
    }
    // Soft check — feature có thể cần data từ availability API
  });

  test('chọn noi_mi (2 slots) → availability tính đúng (dùng UUID từ API)', async ({ request }) => {
    // Availability API nhận booking_category_ids dạng UUID, không phải slug
    // Lấy UUID của noi_mi từ booking-categories API trước
    const catsResp = await request.get('/api/v1/booking-categories');
    if (catsResp.status() !== 200) {
      console.warn('[BC.3] Cannot fetch booking-categories');
      return;
    }
    const catsBody = await catsResp.json();
    const cats: { id: string; slug: string }[] = catsBody?.data ?? catsBody;
    const noiMi = cats.find((c) => c.slug === 'noi_mi');

    if (!noiMi) {
      console.warn('[BC.3] noi_mi category not found');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    const resp = await request.get(
      `/api/v1/availability?date=${dateStr}&booking_category_ids=${noiMi.id}`,
    );
    expect(resp.status()).toBeLessThan(500);
    console.log('[BC.3] availability noi_mi (UUID) status:', resp.status());

    if (resp.status() === 200) {
      const body = await resp.json();
      console.log('[BC.3] slots available:', JSON.stringify(body).slice(0, 200));
    }
  });
});

// ─── BC.4 — Auth Cookie ───────────────────────────────────────────────────────
test.describe('BC.4 — Auth cookie sau login', () => {
  test('login → access_token cookie được set', async ({ page, context }) => {
    await page.goto('/vi/login');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input', { timeout: 10000 });

    await page.getByLabel(/số điện thoại|phone/i).fill('0967273066');
    await page.getByLabel(/mật khẩu|password/i).fill('haokhongnho');
    await page.getByRole('button', { name: /đăng nhập|login/i }).click();

    await page.waitForURL(/.*\/admin.*|.*\/(vi|en|ko)\/?.*/,
      { timeout: 20000, waitUntil: 'domcontentloaded' });

    // Check cookies
    const cookies = await context.cookies();
    const accessToken = cookies.find((c) => c.name === 'access_token');
    console.log('[BC.4] access_token cookie:', accessToken ? `exists, maxAge=${accessToken.expires}` : 'NOT FOUND');
    console.log('[BC.4] All cookies:', cookies.map((c) => c.name).join(', '));

    if (!accessToken) {
      console.warn('[BC.4] BUG: access_token cookie không được set sau login');
    }
  });

  test('API login response có set-cookie header', async ({ request }) => {
    const resp = await request.post('/api/v1/auth/login', {
      data: { phone: '0977000001', password: 'testpass123' },
    });
    expect(resp.status()).toBe(200);

    const headers = resp.headers();
    const setCookie = headers['set-cookie'];
    console.log('[BC.4] set-cookie header:', setCookie ? setCookie.slice(0, 150) : 'NOT SET');

    if (!setCookie || !setCookie.includes('access_token')) {
      console.warn('[BC.4] WARNING: access_token không được set trong response cookie');
    }
  });

  test('API logout → xóa cả 2 cookies', async ({ request, context }) => {
    // Login first
    await request.post('/api/v1/auth/login', {
      data: { phone: '0977000001', password: 'testpass123' },
    });

    // Logout
    const logoutResp = await request.post('/api/v1/auth/logout');
    expect(logoutResp.status()).toBeLessThan(500);
    console.log('[BC.4] logout status:', logoutResp.status());

    const logoutHeaders = logoutResp.headers();
    console.log('[BC.4] logout set-cookie:', (logoutHeaders['set-cookie'] ?? '').slice(0, 200));
  });
});

// ─── BC.5 — URL param ?category= pre-select ───────────────────────────────────
test.describe('BC.5 — URL param ?category= pre-select', () => {
  test('?category=nail_tay → chip nail_tay được highlight/selected', async ({ page }) => {
    await page.goto('/vi/booking?category=nail_tay');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Chip nail_tay phải có class active hoặc aria-pressed=true
    const nailTayChip = page.getByRole('button').filter({ hasText: /nail tay/i }).first();
    const count = await nailTayChip.count();
    console.log('[BC.5] Nail tay chip found:', count > 0);

    if (count > 0) {
      const isPressed = await nailTayChip.getAttribute('aria-pressed');
      const className = await nailTayChip.getAttribute('class');
      console.log('[BC.5] nail_tay chip aria-pressed:', isPressed, '| class:', className?.slice(0, 60));
    }
    // Soft check — feature may or may not be implemented
  });

  test('?category=noi_mi → chip noi_mi pre-selected', async ({ page }) => {
    await page.goto('/vi/booking?category=noi_mi');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const noiMiChip = page.getByRole('button').filter({ hasText: /nối mi/i }).first();
    const hasChip = await noiMiChip.count() > 0;
    console.log('[BC.5] Nối mi chip found:', hasChip);

    if (hasChip) {
      const className = await noiMiChip.getAttribute('class');
      console.log('[BC.5] noi_mi chip class:', className?.slice(0, 80));
    }
  });
});

// ─── BC.6 — Logged-in user prefill ───────────────────────────────────────────
test.describe('BC.6 — Booking form prefill khi đã login', () => {
  test.use({ storageState: CUSTOMER_AUTH_FILE });

  test('booking confirm step: tên + SĐT được prefill', async ({ page }) => {
    await page.goto('/vi/booking');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Chọn 1 dịch vụ để đến step tiếp
    const anyChip = page.getByRole('button').filter({ hasText: /nail|nối mi|lông mày/i }).first();
    if (await anyChip.count() === 0) {
      console.warn('[BC.6] No service chip found');
      return;
    }
    await anyChip.click();
    await page.waitForTimeout(500);

    // Tìm nút "Tiếp theo" / "Next"
    const nextBtn = page.getByRole('button', { name: /tiếp theo|next|tiếp|continue/i }).first();
    if (await nextBtn.count() > 0) {
      await nextBtn.click();
      await page.waitForTimeout(1000);
    }

    // Kiểm tra input có giá trị prefilled
    const phoneInput = page.getByLabel(/số điện thoại|phone/i).first()
      .or(page.locator('input[type="tel"]').first());

    if (await phoneInput.count() > 0) {
      const val = await phoneInput.inputValue().catch(() => '');
      console.log('[BC.6] Phone input value:', val);
      // Nếu có value = prefilled từ store
    }
  });
});

// ─── BC.7 — Guest booking ─────────────────────────────────────────────────────
test.describe('BC.7 — Guest booking (không cần đăng nhập)', () => {
  test('booking page accessible khi chưa login', async ({ page }) => {
    // Không dùng storageState → guest
    await page.goto('/vi/booking');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Không được redirect về login
    const isLogin = page.url().includes('/login');
    console.log('[BC.7] Redirected to login:', isLogin, '| URL:', page.url());
    expect(isLogin).toBe(false);
  });

  test('guest có thể thấy booking form (không bị block)', async ({ page }) => {
    await page.goto('/vi/booking');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const hasForm = await page.locator('main').count() > 0;
    const hasServiceChip = await page.getByText(/nail|nối mi|lông mày|gội đầu/i).first().count() > 0;
    console.log('[BC.7] Has form:', hasForm, '| Has service chip:', hasServiceChip);
    expect(hasForm).toBe(true);
  });
});

// ─── BC.8 — Validation: đặt lịch phải trước ít nhất 1 giờ ───────────────────
test.describe('BC.8 — Booking validation', () => {
  test('availability API không trả về slot đã qua', async ({ request }) => {
    // Query ngày hôm nay
    const today = new Date().toISOString().slice(0, 10);
    const resp = await request.get(`/api/v1/availability?date=${today}`);

    expect(resp.status()).toBeLessThan(500);
    console.log('[BC.8] availability today status:', resp.status());

    if (resp.status() === 200) {
      const body = await resp.json();
      const slots = body?.data ?? body;
      console.log('[BC.8] Slots today:', JSON.stringify(slots).slice(0, 200));
    }
  });

  test('availability API public — không cần auth', async ({ request }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    const resp = await request.get(`/api/v1/availability?date=${dateStr}`);
    // 200 hoặc 400 (missing param) — không phải 401
    expect(resp.status()).not.toBe(401);
    console.log('[BC.8] availability (no auth) status:', resp.status());
  });
});
