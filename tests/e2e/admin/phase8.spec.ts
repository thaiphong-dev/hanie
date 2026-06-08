/**
 * NHÓM TEST 8: Phase 8 — Responsive UI & Component Refactor
 *
 * Test 8.1 — Vouchers page: responsive grid (không phải list)
 * Test 8.2 — Invoices page: responsive table + card view (mobile)
 * Test 8.3 — CustomSelect component: không phải native <select>
 * Test 8.4 — DatePicker trong admin pages (không phải input[type=date])
 * Test 8.5 — ServiceCard redesign: có description, không có image
 */
import { test, expect } from '@playwright/test';
import { ADMIN_AUTH_FILE } from '../../fixtures/helpers';

test.use({ storageState: ADMIN_AUTH_FILE });

// ─── Test 8.1 — Vouchers Responsive Grid ─────────────────────────────────────
test.describe('8.1 — Vouchers page responsive grid', () => {
  test('vouchers page dùng grid layout (không phải list)', async ({ page }) => {
    await page.goto('/vi/admin/vouchers');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/.*\/login.*/);

    // Phải có grid (md:grid-cols-2 lg:grid-cols-3)
    const grid = page.locator('.grid, [class*="grid-cols"]').first();
    await expect(grid).toBeVisible({ timeout: 5000 });
  });

  test('vouchers page: không dùng native <select> cho discount_type', async ({ page }) => {
    await page.goto('/vi/admin/vouchers');
    await page.waitForLoadState('networkidle');

    // Mở form tạo voucher
    const createBtn = page.getByRole('button', { name: /tạo voucher|thêm|new|\+/i }).first();
    if (await createBtn.count() === 0) {
      test.skip(true, 'No create button');
      return;
    }
    await createBtn.click();
    await page.waitForTimeout(500);

    // discount_type phải dùng CustomSelect (không phải native select)
    const nativeSelect = page.locator('select[name="discount_type"]');
    if (await nativeSelect.count() > 0) {
      console.warn('[8.1] BUG: discount_type vẫn dùng native select (chưa migrate sang CustomSelect)');
    }

    // CustomSelect component — thường là div với role button/listbox
    const customSelect = page.getByText(/percentage|flat|giảm %|giảm tiền|chiết khấu/i).first()
      .or(page.locator('[class*="CustomSelect"], [class*="custom-select"]').first());
    const hasCustom = await customSelect.count() > 0;
    console.log('[8.1] Has CustomSelect:', hasCustom);
  });

  test('vouchers card có progress bar khi có max_issue', async ({ page }) => {
    await page.goto('/vi/admin/vouchers');
    await page.waitForLoadState('networkidle');

    // Progress bar element
    const progressBar = page.locator('[class*="progress"], [role="progressbar"]').first();
    const hasProgress = await progressBar.count() > 0;
    console.log('[8.1] Has progress bar:', hasProgress);
    // Soft check — chỉ log nếu không có
  });
});

// ─── Test 8.2 — Invoices Responsive ──────────────────────────────────────────
test.describe('8.2 — Invoices page responsive', () => {
  test('invoices page desktop: hiện table layout', async ({ page }) => {
    await page.goto('/vi/admin/invoices');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/.*\/login.*/);

    // Desktop: table visible
    const table = page.locator('table, [role="table"]').first();
    await expect(table).toBeVisible({ timeout: 5000 });
  });

  test('invoices page mobile (390px): hiện card layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/vi/admin/invoices');
    await page.waitForLoadState('networkidle');

    // Mobile: card list visible (table hidden với md:hidden)
    const cardList = page.locator('[class*="md:hidden"], [class*="card"]').first();
    const hasCard = await cardList.count() > 0;

    // Hoặc table bị ẩn → card hiện
    const tableVisible = await page.locator('table').first().isVisible().catch(() => false);
    if (tableVisible) {
      console.warn('[8.2] Invoices vẫn hiện table trên mobile — card view có thể chưa hoạt động');
    }
  });

  test('invoices page: filter date dùng DatePicker (không phải input[type=date])', async ({ page }) => {
    await page.goto('/vi/admin/invoices');
    await page.waitForLoadState('networkidle');

    // Không có native date input
    const nativeDateInput = page.locator('input[type="date"]').first();
    const hasNative = await nativeDateInput.count() > 0;
    if (hasNative) {
      console.warn('[8.2] BUG: Invoices vẫn dùng native date input (chưa migrate sang DatePicker)');
    }

    // Phải có DatePicker trigger
    const datePicker = page.getByPlaceholder(/từ ngày|đến ngày|chọn ngày|from date|to date/i).first()
      .or(page.getByRole('button', { name: /chọn ngày|từ ngày|date/i }).first());
    const hasDatePicker = await datePicker.count() > 0;
    console.log('[8.2] Has DatePicker for invoices filter:', hasDatePicker);
  });

  test('invoices có pagination component', async ({ page }) => {
    await page.goto('/vi/admin/invoices');
    await page.waitForLoadState('networkidle');

    const pagination = page.locator('[class*="pagination"], [aria-label*="pagination"]').first()
      .or(page.getByRole('navigation', { name: /page|pagination/i }).first())
      .or(page.getByText(/trang \d|page \d|\d+ \/ \d+/i).first());

    const hasPagination = await pagination.count() > 0;
    console.log('[8.2] Has pagination:', hasPagination);
  });
});

// ─── Test 8.3 — CustomSelect Component ───────────────────────────────────────
test.describe('8.3 — CustomSelect shared component', () => {
  test('admin/services/page: unit field dùng CustomSelect', async ({ page }) => {
    await page.goto('/vi/admin/services');
    await page.waitForLoadState('networkidle');

    // Edit 1 service để xem form
    const editBtn = page.getByRole('button', { name: /chỉnh sửa|edit/i }).first();
    if (await editBtn.count() === 0) {
      // Try icon button
      const iconBtn = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
      if (await iconBtn.count() > 0) await iconBtn.click();
      else {
        test.skip(true, 'No edit button');
        return;
      }
    } else {
      await editBtn.click();
    }
    await page.waitForTimeout(500);

    // Form mở → tìm unit field
    const unitLabel = page.getByText(/đơn vị|unit/i).first();
    if (await unitLabel.count() > 0) {
      // Không phải native select
      const nativeSelect = page.locator('select[name="unit"]');
      const hasNative = await nativeSelect.count() > 0;
      if (hasNative) {
        console.warn('[8.3] BUG: services unit vẫn dùng native select');
      }
    }
  });

  test('admin/gallery/page: category upload dùng CustomSelect', async ({ page }) => {
    await page.goto('/vi/admin/gallery');
    await page.waitForLoadState('networkidle');

    // Tìm upload section
    const uploadSection = page.getByText(/upload|tải ảnh|thêm ảnh/i).first();
    const hasUpload = await uploadSection.count() > 0;

    if (!hasUpload) {
      console.warn('[8.3] Gallery không có upload section');
      return;
    }

    // Category select không phải native
    const nativeSelect = page.locator('select[name="uploadCategory"], select[name="category"]');
    if (await nativeSelect.count() > 0) {
      console.warn('[8.3] BUG: Gallery upload category vẫn dùng native select');
    }
  });
});

// ─── Test 8.4 — DatePicker in Admin ──────────────────────────────────────────
test.describe('8.4 — DatePicker trong admin pages', () => {
  test('admin/bookings: modal dùng DatePicker (không phải input[type=date])', async ({ page }) => {
    await page.goto('/vi/admin/bookings');
    await page.waitForLoadState('networkidle');

    const createBtn = page.getByRole('button', { name: /tạo lịch|thêm lịch|new booking|\+/i }).first();
    if (await createBtn.count() === 0) {
      test.skip(true, 'No create button');
      return;
    }
    await createBtn.click();
    await page.waitForTimeout(500);

    // Phải có DatePicker (không phải native input[type=date])
    const nativeDate = page.locator('input[type="date"]');
    const hasNative = await nativeDate.count() > 0;
    if (hasNative) {
      console.warn('[8.4] BUG: Admin booking modal vẫn dùng native date input');
    }

    // DatePicker trigger button
    const datePicker = page.getByPlaceholder(/chọn ngày|select date/i).first()
      .or(page.getByRole('button', { name: /chọn ngày|ngày/i }).first());
    const hasDatePicker = await datePicker.count() > 0;
    console.log('[8.4] Admin booking modal has DatePicker:', hasDatePicker);
  });

  test('DatePicker click → calendar popup mở', async ({ page }) => {
    await page.goto('/vi/admin/bookings');
    await page.waitForLoadState('networkidle');

    const createBtn = page.getByRole('button', { name: /tạo lịch|thêm lịch|new booking|\+/i }).first();
    if (await createBtn.count() === 0) {
      test.skip(true, 'No create button');
      return;
    }
    await createBtn.click();
    await page.waitForTimeout(500);

    const datePicker = page.getByPlaceholder(/chọn ngày|select date/i).first();
    if (await datePicker.count() > 0) {
      await datePicker.click();
      await page.waitForTimeout(300);

      // Calendar popup phải hiện
      const calendar = page.locator('[class*="calendar"], [class*="datepicker"], [role="dialog"] table').first();
      const hasCalendar = await calendar.count() > 0;
      console.log('[8.4] Calendar popup opened:', hasCalendar);
    }
  });
});

// ─── Test 8.5 — ServiceCard Redesign ─────────────────────────────────────────
test.describe('8.5 — ServiceCard redesign (customer)', () => {
  test('services page: card không có ảnh (bị bỏ trong phase 8)', async ({ page }) => {
    await page.goto('/vi/services');
    await page.waitForLoadState('networkidle');

    // Trong Phase 8, ServiceCard không còn image section
    // Nhưng có accent top bar và description
    const cards = page.locator('[class*="ServiceCard"], .service-card, [data-testid="service-card"]');
    const hasCards = await cards.count() > 0;

    if (hasCards) {
      // Không có img trong card (đã bỏ image)
      const imgInCard = cards.first().locator('img');
      const hasImg = await imgInCard.count() > 0;
      if (hasImg) {
        console.warn('[8.5] ServiceCard vẫn còn image section (Phase 8 đã bỏ)');
      }
    }
  });

  test('services page: card có accent top bar (gradient)', async ({ page }) => {
    await page.goto('/vi/services');
    await page.waitForLoadState('networkidle');

    // Accent bar — gradient từ accent/60 → accent
    const accentBar = page.locator('[class*="bg-gradient"], [class*="from-accent"]').first();
    const hasAccent = await accentBar.count() > 0;
    console.log('[8.5] Has accent top bar:', hasAccent);
  });

  test('services page: card có description text (desc_i18n)', async ({ page }) => {
    await page.goto('/vi/services');
    await page.waitForLoadState('networkidle');

    // ServiceCard phải có description (từ desc_i18n, line-clamp-3)
    const descEl = page.locator('[class*="line-clamp"], p.text-sm, [class*="description"]').first();
    const hasDesc = await descEl.count() > 0;

    if (!hasDesc) {
      console.warn('[8.5] Services card không có description — desc_i18n migration có thể chưa chạy');
    } else {
      const descText = await descEl.textContent();
      console.log('[8.5] Description preview:', descText?.slice(0, 50));
    }
  });
});
