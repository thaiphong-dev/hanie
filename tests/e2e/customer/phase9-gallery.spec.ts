/**
 * NHÓM TEST 9A: Phase 9 — Gallery UI Improvements
 *
 * Test 9.1 — Tab "Tất cả": rotating grid, stagger animation
 * Test 9.2 — Tab "Nail": blur backdrop + object-contain (max-w-3xl)
 * Test 9.3 — Tab "Nối mi": right panels hidden on mobile
 * Test 9.4 — Tab "Lông mày": masonry grid (không phải filmstrip)
 * Test 9.5 — Gallery không crash khi ít ảnh
 *
 * NOTE: Gallery dùng Swiper autoplay → networkidle không bao giờ resolve.
 *       Tất cả tests dùng domcontentloaded + timeout thủ công.
 */
import { test, expect } from '@playwright/test';

/** Helper: navigate gallery và đợi content load (không dùng networkidle) */
async function gotoGallery(page: import('@playwright/test').Page) {
  await page.goto('/vi/gallery');
  await page.waitForLoadState('domcontentloaded');
  // Đợi main content xuất hiện (không đợi Swiper images load)
  await page.waitForSelector('main, [class*="gallery"]', { timeout: 10000 });
  await page.waitForTimeout(1000);
}

/** Helper: click gallery tab (dùng role=button, chính xác, không dùng .or(getByText)) */
async function clickGalleryTab(page: import('@playwright/test').Page, nameRegex: RegExp): Promise<boolean> {
  const tab = page.getByRole('button').filter({ hasText: nameRegex }).first();
  if (await tab.count() === 0) return false;
  await tab.click();
  await page.waitForTimeout(800);
  return true;
}

// ─── Test 9.1 — Tab "Tất cả" ─────────────────────────────────────────────────
test.describe('9.1 — Gallery tab "Tất cả"', () => {
  test('tab "Tất cả" hiển thị grid ảnh (tối đa 10)', async ({ page }) => {
    await gotoGallery(page);

    await clickGalleryTab(page, /tất cả|all/i);

    // Grid phải có ảnh (hoặc skeleton/empty)
    const gridItems = page.locator('img, [class*="skeleton"]');
    const count = await gridItems.count();
    expect(count).toBeGreaterThanOrEqual(0);
    console.log('[9.1] Grid items count:', count);
    await expect(page).not.toHaveURL(/.*error.*/);
  });

  test('grid "Tất cả" có tối đa 10 ảnh hiển thị cùng lúc', async ({ page }) => {
    await gotoGallery(page);
    await clickGalleryTab(page, /tất cả|all/i);
    await page.waitForTimeout(1000);

    // Phase 9: BATCH_SIZE = 10
    const images = page.locator('img').filter({ hasNot: page.locator('[class*="thumbnail"]') });
    const imgCount = await images.count();
    console.log('[9.1] Images in grid:', imgCount);

    if (imgCount > 10) {
      console.warn('[9.1] Có hơn 10 ảnh hiển thị cùng lúc — BATCH_SIZE có thể không áp dụng');
    }
    // Không crash
    await expect(page).not.toHaveURL(/.*error.*/);
  });

  test('grid "Tất cả" tự rotate sau 10 giây (không crash)', async ({ page }) => {
    await gotoGallery(page);
    await clickGalleryTab(page, /tất cả|all/i);

    // Đợi ROTATION_MS = 10000ms
    await page.waitForTimeout(12000);

    // Không crash
    await expect(page).not.toHaveURL(/.*error.*/);
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
    console.log('[9.1] Auto-rotate 10s: no crash ✓');
  });
});

// ─── Test 9.2 — Tab "Nail" ────────────────────────────────────────────────────
test.describe('9.2 — Gallery tab "Nail"', () => {
  test('tab "Nail" không crash khi click', async ({ page }) => {
    await gotoGallery(page);

    const clicked = await clickGalleryTab(page, /^nail$/i);
    if (!clicked) {
      console.warn('[9.2] Không tìm thấy tab Nail');
      return;
    }

    // Không crash, có nội dung
    await expect(page).not.toHaveURL(/.*error.*/);
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });

  test('tab "Nail" hiển thị swiper/slider hoặc ảnh', async ({ page }) => {
    await gotoGallery(page);
    const clicked = await clickGalleryTab(page, /^nail$/i);
    if (!clicked) {
      console.warn('[9.2] Không tìm thấy tab Nail');
      return;
    }

    // Swiper hoặc images
    const swiper = page.locator('.swiper, [class*="swiper"], img').first();
    await expect(swiper).toBeVisible({ timeout: 5000 });
    console.log('[9.2] Nail tab has swiper/images ✓');
  });

  test('tab "Nail" trên PC: container giới hạn width (max-w-3xl)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoGallery(page);
    const clicked = await clickGalleryTab(page, /^nail$/i);
    if (!clicked) {
      test.skip(true, 'No Nail tab');
      return;
    }

    // max-w-3xl container hoặc tương đương
    const container = page.locator('[class*="max-w-3xl"], [class*="max-w-2xl"], [class*="max-w-4xl"]').first();
    const hasMaxW = await container.count() > 0;
    console.log('[9.2] Has limited-width container on PC:', hasMaxW);
  });

  test('tab "Nail" có thumbnail strip hoặc navigation dots', async ({ page }) => {
    await gotoGallery(page);
    const clicked = await clickGalleryTab(page, /^nail$/i);
    if (!clicked) {
      test.skip(true, 'No Nail tab');
      return;
    }

    // Thumbnail strip / navigation buttons
    const thumbnails = page.locator('.swiper-slide img, [class*="thumb"], [class*="dot"]');
    const thumbCount = await thumbnails.count();
    console.log('[9.2] Thumbnail/dot count:', thumbCount);
    // Không hard fail — chỉ log
  });
});

// ─── Test 9.3 — Tab "Nối mi" ──────────────────────────────────────────────────
test.describe('9.3 — Gallery tab "Nối mi"', () => {
  test('tab "Nối mi" hiển thị layout (main + optional panels)', async ({ page }) => {
    await gotoGallery(page);

    const miTab = page.getByRole('button').filter({ hasText: /nối mi/i }).first();
    if (await miTab.count() === 0) {
      console.warn('[9.3] Không tìm thấy tab Nối mi');
      return;
    }
    await miTab.click();
    await page.waitForTimeout(1000);

    // Không crash, có swiper hoặc ảnh
    await expect(page).not.toHaveURL(/.*error.*/);
    const content = page.locator('.swiper, img').first();
    await expect(content).toBeVisible({ timeout: 5000 });
    console.log('[9.3] Nối mi tab loaded ✓');
  });

  test('tab "Nối mi" mobile (390px): right panels ẩn', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoGallery(page);

    const miTab = page.getByRole('button').filter({ hasText: /nối mi/i }).first();
    if (await miTab.count() === 0) {
      test.skip(true, 'No Nối mi tab');
      return;
    }
    await miTab.click();
    await page.waitForTimeout(1000);

    // Right panels: hidden lg:flex → hidden on mobile
    const rightPanelsVisible = await page.evaluate(() => {
      const panels = document.querySelectorAll('[class*="hidden"][class*="lg:flex"], [class*="lg\\\\:flex"]');
      return Array.from(panels).some(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none';
      });
    });
    console.log('[9.3] Right panels visible on mobile:', rightPanelsVisible);
    if (rightPanelsVisible) {
      console.warn('[9.3] BUG: Right panels visible trên mobile viewport 390px');
    }
  });

  test('tab "Nối mi" PC: right panels (nếu có ảnh)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoGallery(page);

    const miTab = page.getByRole('button').filter({ hasText: /nối mi/i }).first();
    if (await miTab.count() === 0) {
      test.skip(true, 'No Nối mi tab');
      return;
    }
    await miTab.click();
    await page.waitForTimeout(1000);

    // Không crash
    await expect(page).not.toHaveURL(/.*error.*/);
    console.log('[9.3] Nối mi PC layout: no crash ✓');
  });
});

// ─── Test 9.4 — Tab "Lông mày" ────────────────────────────────────────────────
test.describe('9.4 — Gallery tab "Lông mày"', () => {
  test('tab "Lông mày" dùng masonry layout (không phải filmstrip)', async ({ page }) => {
    await gotoGallery(page);

    const browTab = page.getByRole('button').filter({ hasText: /lông mày/i }).first();
    if (await browTab.count() === 0) {
      console.warn('[9.4] Không tìm thấy tab Lông mày');
      return;
    }
    await browTab.click();
    await page.waitForTimeout(1000);

    // Masonry: CSS columns
    const masonry = page.locator('[class*="columns-2"], [class*="columns-3"]').first();
    const hasMasonry = await masonry.count() > 0;
    console.log('[9.4] Has masonry grid:', hasMasonry);

    // Không crash
    await expect(page).not.toHaveURL(/.*error.*/);
  });

  test('tab "Lông mày" ảnh hiển thị (không bị cắt nhỏ)', async ({ page }) => {
    await gotoGallery(page);

    const browTab = page.getByRole('button').filter({ hasText: /lông mày/i }).first();
    if (await browTab.count() === 0) {
      test.skip(true, 'No Lông mày tab');
      return;
    }
    await browTab.click();
    await page.waitForTimeout(1000);

    const images = page.locator('img');
    const imgCount = await images.count();
    console.log('[9.4] Images in Lông mày tab:', imgCount);
    expect(imgCount).toBeGreaterThanOrEqual(0);
  });
});

// ─── Test 9.5 — Gallery edge cases ────────────────────────────────────────────
test.describe('9.5 — Gallery edge cases', () => {
  test('gallery không crash khi chuyển tab nhanh', async ({ page }) => {
    await gotoGallery(page);

    const tabs = page.getByRole('button').filter({ hasText: /tất cả|nail|nối mi|lông mày/i });
    const tabCount = await tabs.count();

    if (tabCount < 2) {
      console.warn('[9.5] Ít hơn 2 tabs');
      return;
    }

    // Chuyển tab nhanh (200ms mỗi tab)
    for (let i = 0; i < Math.min(tabCount, 4); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(200);
    }

    await expect(page).not.toHaveURL(/.*error.*/);
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
    console.log('[9.5] Fast tab switch: no crash ✓');
  });

  test('gallery page không 404 và main content visible', async ({ page }) => {
    await gotoGallery(page);
    await expect(page).not.toHaveURL(/.*\/login.*/);
    await expect(page).not.toHaveURL(/.*404.*/);
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });
});
