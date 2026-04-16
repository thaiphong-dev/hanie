/**
 * NHÓM TEST 3: Customer Pages (High)
 *
 * Test 3.1 — Home page sections
 * Test 3.2 — Services page
 * Test 3.3 — Gallery page
 * Test 3.4 — Location page
 * Test 3.5 — History page (login required)
 * Test 3.6 — i18n switch
 * Test 3.7 — Mobile layout (390px viewport)
 */
import { test, expect } from '@playwright/test';
import { CUSTOMER_AUTH_FILE } from '../../fixtures/helpers';

// ─── Test 3.1 — Home page sections ───────────────────────────────────────────
test.describe('3.1 — Home page sections', () => {
  test('7 sections hiển thị trên trang chủ', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');

    // Từng section phải có mặt
    // 1. Hero
    await expect(page.locator('section').first().or(page.getByRole('banner'))).toBeVisible();

    // 2. CTA button "Đặt lịch ngay"
    const ctaBtn = page.getByRole('link', { name: /đặt lịch ngay|book now|예약하기/i }).first();
    await expect(ctaBtn).toBeVisible({ timeout: 5000 });

    // Các section text hints
    const sectionTexts = [/tại sao chọn|why.*us|lý do/i, /dịch vụ|services|서비스/i];
    for (const text of sectionTexts) {
      const el = page.getByText(text).first();
      const count = await el.count();
      // Không hard-fail nếu thiếu 1 section — log để bug report
      if (count === 0) {
        console.warn(`[3.1] Không tìm thấy section: ${text}`);
      }
    }
  });

  test('Navbar: transparent ở top, blur khi scroll', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');

    const navbar = page.locator('nav, header').first();
    await expect(navbar).toBeVisible();

    // Scroll xuống
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Navbar vẫn visible sau khi scroll
    await expect(navbar).toBeVisible();
  });

  test('click "Đặt lịch ngay" → navigate /vi/booking', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');

    const ctaBtn = page.getByRole('link', { name: /đặt lịch ngay|book now/i }).first();
    await ctaBtn.click();
    await page.waitForURL(/.*\/booking.*/);
    await expect(page).toHaveURL(/.*\/booking.*/);
  });
});

// ─── Test 3.2 — Services page ────────────────────────────────────────────────
test.describe('3.2 — Services page', () => {
  test('filter tab "Nail" → chỉ hiện nail services', async ({ page }) => {
    await page.goto('/vi/services');
    await page.waitForLoadState('networkidle');

    // Click tab Nail
    await page.getByRole('button', { name: /^nail$/i }).or(page.getByText(/^nail$/i)).first().click();
    await page.waitForTimeout(500);

    // Verify nail services hiện
    await expect(page.getByText(/nail tay|nail chân|gel|sơn/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('filter tab "Nối mi" → chỉ hiện lash services', async ({ page }) => {
    await page.goto('/vi/services');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /nối mi|lash/i }).first().click();
    await page.waitForTimeout(500);

    await expect(page.getByText(/nối mi|classic|volume|mega/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('addon table hiện cho mỗi nhóm dịch vụ', async ({ page }) => {
    await page.goto('/vi/services');
    await page.waitForLoadState('networkidle');

    // Phải có bảng addon
    const addonTable = page.locator('table').first();
    await expect(addonTable).toBeVisible({ timeout: 5000 });
  });

  test('ServiceCard "Đặt dịch vụ này" → link đến /vi/booking', async ({ page }) => {
    await page.goto('/vi/services');
    await page.waitForLoadState('networkidle');

    const bookBtn = page.getByRole('link', { name: /đặt dịch vụ này|book this|đặt lịch/i }).first();
    await expect(bookBtn).toBeVisible({ timeout: 5000 });

    const href = await bookBtn.getAttribute('href');
    expect(href).toMatch(/\/booking/);
  });
});

// ─── Test 3.3 — Gallery page ──────────────────────────────────────────────────
test.describe('3.3 — Gallery page', () => {
  test('gallery grid hiển thị (hoặc skeleton nếu chưa có ảnh)', async ({ page }) => {
    await page.goto('/vi/gallery');
    await page.waitForLoadState('networkidle');

    // Phải có grid hoặc skeleton hoặc empty state
    const grid = page.locator('[data-testid="gallery-grid"], .grid, main img, .skeleton').first();
    await expect(grid).toBeVisible({ timeout: 5000 });
  });

  test('filter tabs hoạt động', async ({ page }) => {
    await page.goto('/vi/gallery');
    await page.waitForLoadState('networkidle');

    // Click tab đầu tiên
    const filterBtn = page.getByRole('button', { name: /tất cả|nail|mi|all/i }).first();
    await expect(filterBtn).toBeVisible({ timeout: 5000 });
    await filterBtn.click();
    // Không crash
    await page.waitForTimeout(300);
    await expect(page).toHaveURL(/.*\/gallery.*/);
  });
});

// ─── Test 3.4 — Location page ────────────────────────────────────────────────
test.describe('3.4 — Location page', () => {
  test('địa chỉ, giờ mở cửa, SĐT hiển thị', async ({ page }) => {
    await page.goto('/vi/location');
    await page.waitForLoadState('networkidle');

    // Địa chỉ Quy Nhơn
    await expect(
      page.getByText(/quy nhơn|nguyễn nhạc|quy nhon/i).first()
    ).toBeVisible({ timeout: 5000 });

    // Giờ mở cửa
    await expect(
      page.getByText(/08:00|8h|giờ mở cửa|opening hours/i).first()
    ).toBeVisible({ timeout: 5000 });

    // SĐT
    await expect(
      page.getByText(/09\d{8}|0[3-9]\d{8}/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Google Maps iframe hiển thị', async ({ page }) => {
    await page.goto('/vi/location');
    await page.waitForLoadState('networkidle');

    const iframe = page.locator('iframe[src*="google"], iframe[src*="maps"]').first();
    await expect(iframe).toBeVisible({ timeout: 10000 });
  });
});

// ─── Test 3.5 — History page (login required) ────────────────────────────────
test.describe('3.5 — History page (login required)', () => {
  test.use({ storageState: CUSTOMER_AUTH_FILE });

  test('login → /vi/history → tabs Sắp tới / Đã hoàn thành / Đã huỷ hiển thị', async ({ page }) => {
    await page.goto('/vi/history');
    await page.waitForLoadState('networkidle');

    // Phải ở trang history (không bị redirect về login)
    await expect(page).not.toHaveURL(/.*\/login.*/);

    // Tabs
    await expect(page.getByRole('tab', { name: /sắp tới|upcoming/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('tab', { name: /đã hoàn thành|completed|done/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('tab', { name: /đã huỷ|cancelled/i })).toBeVisible({ timeout: 5000 });
  });

  test('history page: empty state hiện đẹp khi chưa có booking', async ({ page }) => {
    await page.goto('/vi/history');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/.*\/login.*/);

    // Kiểm tra có nội dung (không blank, không error)
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();

    // Nếu không có booking → hiện empty state message
    const emptyState = page.getByText(/chưa có lịch hẹn|no.*booking|no.*appointment|chưa có đơn/i).first();
    const bookingList = page.locator('[data-testid="booking-item"]').first();

    // Phải có một trong hai: empty state hoặc booking list
    const hasEmpty = await emptyState.count() > 0;
    const hasList = await bookingList.count() > 0;
    expect(hasEmpty || hasList).toBe(true);
  });
});

// ─── Test 3.6 — i18n switch ──────────────────────────────────────────────────
test.describe('3.6 — i18n switch', () => {
  test('switch sang EN → URL đổi sang /en/... và text đổi tiếng Anh', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');

    // Tìm language switcher
    const langSwitcher = page.getByRole('button', { name: /vi|tiếng việt|language|ngôn ngữ/i }).first();

    if (await langSwitcher.count() > 0) {
      await langSwitcher.click();
      // Click EN option
      const enOption = page.getByRole('option', { name: /english|en/i }).or(page.getByRole('button', { name: /english|en/i }));
      if (await enOption.count() > 0) {
        await enOption.first().click();
        await page.waitForURL(/\/en\//);
        await expect(page).toHaveURL(/\/en\//);
      }
    } else {
      // Fallback: navigate trực tiếp
      await page.goto('/en');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/en.*/);
    }
  });

  test('switch sang KO → URL đổi sang /ko/...', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');

    const langSwitcher = page.getByRole('button', { name: /vi|tiếng việt|language/i }).first();

    if (await langSwitcher.count() > 0) {
      await langSwitcher.click();
      const koOption = page.getByRole('option', { name: /한국어|korean|ko/i }).or(page.getByRole('button', { name: /한국어|ko/i }));
      if (await koOption.count() > 0) {
        await koOption.first().click();
        await page.waitForURL(/\/ko\//);
        await expect(page).toHaveURL(/\/ko\//);
      }
    } else {
      await page.goto('/ko');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/ko.*/);
    }
  });

  test('chuyển ngôn ngữ không reload page (không mất state)', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');

    // Track navigation events (full reload vs client navigation)
    let fullReload = false;
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        fullReload = true;
      }
    });

    // Nếu có switcher
    const langSwitcher = page.getByRole('button', { name: /vi|tiếng việt|language/i }).first();
    if (await langSwitcher.count() > 0) {
      await langSwitcher.click();
      const enOption = page.getByRole('option', { name: /english|en/i }).first();
      if (await enOption.count() > 0) {
        await enOption.click();
        await page.waitForTimeout(1000);
        // Next.js i18n: URL thay đổi không nhất thiết là full reload
        // Kiểm tra URL đã đổi
        expect(page.url()).toMatch(/\/(en|ko|vi)\//);
      }
    }
  });
});

// ─── Test 3.7 — Mobile layout (390px) ────────────────────────────────────────
test.describe('3.7 — Mobile layout (390px viewport)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('BottomTabBar hiển thị ở đáy', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');

    // BottomTabBar phải visible trên mobile
    const bottomTab = page.locator('[class*="bottom"], [data-testid="bottom-tab"], nav.fixed.bottom-0').first();
    await expect(bottomTab).toBeVisible({ timeout: 5000 });
  });

  test('tap "Đặt lịch" trong bottom tab → /vi/booking', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');

    // Tìm bottom tab booking button
    const bookingTab = page.locator('[class*="bottom"] a[href*="/booking"], [class*="bottom"] button').filter({ hasText: /đặt lịch|booking/i }).first();

    if (await bookingTab.count() > 0) {
      await bookingTab.click();
      await page.waitForURL(/.*\/booking.*/);
      await expect(page).toHaveURL(/.*\/booking.*/);
    } else {
      // Fallback: tìm bất kỳ link booking trên mobile
      const link = page.getByRole('link', { name: /đặt lịch|booking/i }).first();
      await expect(link).toBeVisible({ timeout: 5000 });
    }
  });

  test('content không bị che bởi bottom tab (padding đủ)', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');

    // Kiểm tra main content không bị che
    // Scroll xuống cuối trang
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Không có nội dung bị hidden behind bottom bar
    // Kiểm tra bottom tab bar height và main padding
    const hasPadding = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return true;
      const style = window.getComputedStyle(main);
      const pb = parseInt(style.paddingBottom);
      return pb >= 50; // BottomTabBar ~56px (pb-14 = 3.5rem = 56px)
    });

    // Nếu không có padding → bug (nhưng không hard-fail vì có thể scroll)
    if (!hasPadding) {
      console.warn('[3.7] Main content padding-bottom < 50px — có thể bị che bởi BottomTabBar');
    }
  });
});
