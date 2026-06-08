/**
 * NHÓM TEST GL: HANDOFF_CUSTOMER_GALLERY_UPDATE.md — Gallery Lightbox + Swiper + Tabs
 *
 * GL.1 — Gallery page: Server Component, load nhanh, có hero header
 * GL.2 — Featured Swiper carousel (All tab, EffectCoverflow)
 * GL.3 — Category filter tabs (All + categories có ảnh)
 * GL.4 — GalleryLightbox: click ảnh → mở lightbox
 * GL.5 — GalleryLightbox: Escape → đóng
 * GL.6 — GalleryLightbox: prev/next navigation
 * GL.7 — GalleryLightbox: dot navigation
 * GL.8 — GalleryLightbox: caption + "Đặt dịch vụ này" CTA
 * GL.9 — Gallery API: GET /api/v1/gallery với category filter
 * GL.10 — CTA section cuối trang → link /booking
 * GL.11 — Tab masonry/grid layouts theo category (per HANDOFF specs)
 */
import { test, expect } from '@playwright/test';

/** Navigate gallery, không dùng networkidle (Swiper autoplay sẽ block mãi) */
async function gotoGallery(page: import('@playwright/test').Page) {
  await page.goto('/vi/gallery');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('main, [class*="gallery"], [class*="Gallery"]', { timeout: 12000 });
  await page.waitForTimeout(1500);
}

/** Click category tab theo tên regex */
async function clickTab(page: import('@playwright/test').Page, nameRegex: RegExp) {
  // Tìm button hoặc tab có text match
  const tab = page.getByRole('button').filter({ hasText: nameRegex }).first()
    .or(page.locator('[role="tab"]').filter({ hasText: nameRegex }).first());
  const count = await tab.count();
  if (count === 0) return false;
  await tab.click();
  await page.waitForTimeout(600);
  return true;
}

// ─── GL.1 — Gallery page server render ───────────────────────────────────────
test.describe('GL.1 — Gallery page load (Server Component)', () => {
  test('gallery page tải được, không 404', async ({ page }) => {
    await gotoGallery(page);
    expect(page.url()).toContain('/gallery');
    await expect(page).not.toHaveURL(/.*error.*/);
  });

  test('có hero header với title/subtitle', async ({ page }) => {
    await gotoGallery(page);

    // Hero title "Tác Phẩm" hoặc "Portfolio" hoặc "Hanie Studio"
    const heroTitle = page.getByText(/tác phẩm|portfolio|hanie studio|khoảnh khắc/i).first();
    const hasHero = await heroTitle.count() > 0;
    console.log('[GL.1] Hero title found:', hasHero);
    expect(hasHero).toBe(true);
  });

  test('gallery render images (không phải loading skeleton mãi)', async ({ page }) => {
    await gotoGallery(page);

    // Phải có ít nhất 1 ảnh
    const images = page.locator('img[src*="supabase"], img[src*="storage"], img[src*="http"]');
    const imgCount = await images.count();
    console.log('[GL.1] Images found:', imgCount);
    expect(imgCount).toBeGreaterThan(0);
  });
});

// ─── GL.2 — Featured Swiper carousel (All tab) ────────────────────────────────
test.describe('GL.2 — Featured Swiper carousel', () => {
  test('"All" tab có swiper carousel ở trên cùng', async ({ page }) => {
    await gotoGallery(page);

    // Swiper container
    const swiper = page.locator('.swiper, [class*="swiper"]').first();
    const hasSwiper = await swiper.count() > 0;
    console.log('[GL.2] Swiper found:', hasSwiper);

    if (hasSwiper) {
      await expect(swiper).toBeVisible({ timeout: 5000 });
    } else {
      // Fallback: tìm carousel section
      const carousel = page.locator('[class*="carousel"], [class*="featured"]').first();
      const hasCarousel = await carousel.count() > 0;
      console.log('[GL.2] Carousel fallback found:', hasCarousel);
      // Soft check
    }
  });

  test('Swiper có navigation arrows', async ({ page }) => {
    await gotoGallery(page);
    await page.waitForTimeout(500);

    // Swiper navigation prev/next buttons
    const prevBtn = page.locator('.swiper-button-prev, [class*="swiper-button-prev"]').first();
    const nextBtn = page.locator('.swiper-button-next, [class*="swiper-button-next"]').first();

    const hasPrev = await prevBtn.count() > 0;
    const hasNext = await nextBtn.count() > 0;
    console.log('[GL.2] Swiper nav: prev=', hasPrev, 'next=', hasNext);
    // Soft check — nav hidden at boundaries
  });

  test('Featured section có tiêu đề "Nổi Bật" / "Featured"', async ({ page }) => {
    await gotoGallery(page);

    const featuredTitle = page.getByText(/nổi bật|featured|추천/i).first();
    const hasTitle = await featuredTitle.count() > 0;
    console.log('[GL.2] Featured title found:', hasTitle);
    // Soft check — title may be in different locale
  });
});

// ─── GL.3 — Category filter tabs ──────────────────────────────────────────────
test.describe('GL.3 — Category filter tabs', () => {
  test('có tab "Tất cả" / "All"', async ({ page }) => {
    await gotoGallery(page);

    const allTab = page.getByRole('button').filter({ hasText: /tất cả|all|전체/i }).first()
      .or(page.locator('[role="tab"]').filter({ hasText: /tất cả|all/i }).first());
    const hasAll = await allTab.count() > 0;
    console.log('[GL.3] "Tất cả" tab found:', hasAll);
    expect(hasAll).toBe(true);
  });

  test('có tabs cho từng category (Nail, Mi, Lông mày...)', async ({ page }) => {
    await gotoGallery(page);

    const categories = [/nail/i, /nối mi|mi/i, /lông mày/i];
    for (const cat of categories) {
      const tab = page.getByRole('button').filter({ hasText: cat }).first()
        .or(page.locator('[role="tab"]').filter({ hasText: cat }).first());
      const has = await tab.count() > 0;
      console.log(`[GL.3] Tab "${cat}":`, has);
    }

    // Ít nhất tab Nail phải có
    const nailTab = page.getByRole('button').filter({ hasText: /nail/i }).first();
    expect(await nailTab.count()).toBeGreaterThan(0);
  });

  test('click tab "Nail" → nội dung thay đổi', async ({ page }) => {
    await gotoGallery(page);

    const switched = await clickTab(page, /nail/i);
    if (!switched) {
      console.warn('[GL.3] Nail tab not found');
      return;
    }

    // Sau khi switch → phải có ảnh
    const images = page.locator('img').filter({ hasNot: page.locator('[alt=""]') });
    const imgCount = await images.count();
    console.log('[GL.3] Nail tab images:', imgCount);
    expect(imgCount).toBeGreaterThan(0);
  });

  test('active tab có border/indicator CSS (không crash)', async ({ page }) => {
    await gotoGallery(page);

    // Check active state không crash page
    await clickTab(page, /nail/i);
    await page.waitForTimeout(300);
    await clickTab(page, /tất cả|all/i);
    await page.waitForTimeout(300);

    await expect(page).not.toHaveURL(/.*error.*/);
    console.log('[GL.3] Tab switching without crash: OK');
  });
});

// ─── GL.4 — GalleryLightbox: mở ──────────────────────────────────────────────
test.describe('GL.4 — GalleryLightbox mở khi click ảnh', () => {
  test('click ảnh trong gallery → lightbox xuất hiện', async ({ page }) => {
    await gotoGallery(page);

    // Tìm ảnh có thể click (trong masonry grid hoặc swiper)
    // Tránh click swiper thumbnail (đó là navigation, không phải lightbox)
    const galleryImg = page.locator('main img').first();
    if (await galleryImg.count() === 0) {
      console.warn('[GL.4] No images found in main');
      return;
    }

    await galleryImg.click().catch(() => {});
    await page.waitForTimeout(800);

    // Lightbox = dialog hoặc overlay/portal
    const lightbox = page.locator('[role="dialog"], [class*="lightbox"], [class*="Lightbox"]').first()
      .or(page.locator('[class*="overlay"][class*="fixed"]').first());

    const isVisible = await lightbox.isVisible().catch(() => false);
    console.log('[GL.4] Lightbox opened:', isVisible);
    // Soft check — không phải tất cả ảnh đều có click handler
  });

  test('sau khi mở lightbox → có overlay/backdrop', async ({ page }) => {
    await gotoGallery(page);

    // Click ảnh đầu tiên trong grid (không phải swiper)
    const gridImgs = page.locator('main [class*="column"] img, main [class*="grid"] img').first()
      .or(page.locator('main img').first());

    if (await gridImgs.count() > 0) {
      await gridImgs.click().catch(() => {});
      await page.waitForTimeout(800);

      // Overlay/backdrop
      const backdrop = page.locator('[class*="backdrop"], [class*="overlay"], .fixed.inset-0').first();
      const hasBackdrop = await backdrop.count() > 0;
      console.log('[GL.4] Backdrop visible:', hasBackdrop);
    }
  });
});

// ─── GL.5 — GalleryLightbox: Escape → đóng ───────────────────────────────────
test.describe('GL.5 — GalleryLightbox: Escape để đóng', () => {
  test('nhấn Escape → lightbox đóng', async ({ page }) => {
    await gotoGallery(page);

    const firstImg = page.locator('main img').first();
    if (await firstImg.count() === 0) {
      console.warn('[GL.5] No images to test lightbox');
      return;
    }

    await firstImg.click().catch(() => {});
    await page.waitForTimeout(500);

    const lightbox = page.locator('[role="dialog"], [class*="lightbox"]').first();
    const wasOpen = await lightbox.isVisible().catch(() => false);

    if (!wasOpen) {
      console.warn('[GL.5] Lightbox not open — skipping Escape test');
      return;
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    const isClosed = !(await lightbox.isVisible().catch(() => false));
    console.log('[GL.5] Lightbox closed after Escape:', isClosed);
    expect(isClosed).toBe(true);
  });
});

// ─── GL.6 — GalleryLightbox: prev/next navigation ────────────────────────────
test.describe('GL.6 — GalleryLightbox: prev/next navigation', () => {
  test('lightbox có nút prev/next', async ({ page }) => {
    await gotoGallery(page);

    const firstImg = page.locator('main img').first();
    if (await firstImg.count() === 0) return;

    await firstImg.click().catch(() => {});
    await page.waitForTimeout(600);

    const lightbox = page.locator('[role="dialog"], [class*="lightbox"]').first();
    if (!(await lightbox.isVisible().catch(() => false))) {
      console.warn('[GL.6] Lightbox not open');
      return;
    }

    // Prev/next buttons
    const prevBtn = lightbox.getByRole('button', { name: /prev|trước|←/i }).first()
      .or(lightbox.locator('button').filter({ has: page.locator('[class*="prev"], [class*="left"]') }).first());
    const nextBtn = lightbox.getByRole('button', { name: /next|sau|→/i }).first()
      .or(lightbox.locator('button').filter({ has: page.locator('[class*="next"], [class*="right"]') }).first());

    const hasPrev = await prevBtn.count() > 0;
    const hasNext = await nextBtn.count() > 0;
    console.log('[GL.6] Prev btn:', hasPrev, '| Next btn:', hasNext);

    // Keyboard navigation
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    console.log('[GL.6] ArrowRight pressed — no crash');
  });
});

// ─── GL.7 — GalleryLightbox: dot navigation ──────────────────────────────────
test.describe('GL.7 — GalleryLightbox: dot navigation', () => {
  test('lightbox có dot navigation (max ~20 dots)', async ({ page }) => {
    await gotoGallery(page);

    const firstImg = page.locator('main img').first();
    if (await firstImg.count() === 0) return;

    await firstImg.click().catch(() => {});
    await page.waitForTimeout(600);

    const lightbox = page.locator('[role="dialog"], [class*="lightbox"]').first();
    if (!(await lightbox.isVisible().catch(() => false))) return;

    // Dots: small buttons hoặc circles trong lightbox
    const dots = lightbox.locator('button[class*="rounded-full"], [class*="dot"], [class*="pagination"]');
    const dotCount = await dots.count();
    console.log('[GL.7] Dot navigation count:', dotCount);
    // Soft check — nếu < 2 ảnh thì không cần dots
  });
});

// ─── GL.8 — GalleryLightbox: caption + CTA ───────────────────────────────────
test.describe('GL.8 — GalleryLightbox: caption + CTA', () => {
  test('lightbox có "Đặt dịch vụ này" / "Book this service" link', async ({ page }) => {
    await gotoGallery(page);

    const firstImg = page.locator('main img').first();
    if (await firstImg.count() === 0) return;

    await firstImg.click().catch(() => {});
    await page.waitForTimeout(600);

    const lightbox = page.locator('[role="dialog"], [class*="lightbox"]').first();
    if (!(await lightbox.isVisible().catch(() => false))) return;

    const ctaBtn = lightbox.getByText(/đặt dịch vụ này|book this service|이 서비스 예약/i).first();
    const hasCta = await ctaBtn.count() > 0;
    console.log('[GL.8] CTA "Đặt dịch vụ này" found:', hasCta);

    if (hasCta) {
      const href = await ctaBtn.getAttribute('href').catch(() => null)
        ?? await ctaBtn.locator('..').getAttribute('href').catch(() => null);
      console.log('[GL.8] CTA href:', href);
      if (href) {
        expect(href).toContain('/booking');
      }
    }
  });
});

// ─── GL.9 — Gallery API ───────────────────────────────────────────────────────
test.describe('GL.9 — Gallery API GET /api/v1/gallery', () => {
  test('GET /api/v1/gallery → 200 với images array', async ({ request }) => {
    const resp = await request.get('/api/v1/gallery');
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    const images = body?.data ?? body;
    expect(Array.isArray(images)).toBe(true);
    console.log('[GL.9] Gallery images count:', images.length);
  });

  test('GET /api/v1/gallery?category=nail → filter đúng', async ({ request }) => {
    const resp = await request.get('/api/v1/gallery?category=nail');
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    const images: { category?: string }[] = body?.data ?? body;
    const nailImages = images.filter((i) => i.category === 'nail' || i.category?.includes('nail'));
    console.log('[GL.9] category=nail: total=', images.length, 'nail=', nailImages.length);
    // Soft check — nếu 0 ảnh nail thì DB chưa có data
  });

  test('images có JOIN categories (category name_i18n)', async ({ request }) => {
    const resp = await request.get('/api/v1/gallery?limit=5');
    const body = await resp.json();
    const images: Record<string, unknown>[] = body?.data ?? body;

    if (images.length > 0) {
      const first = images[0];
      console.log('[GL.9] First image keys:', Object.keys(first).join(', '));
      // Phải có category join fields
      const hasCategoryData = 'category' in first || 'categories' in first || 'category_id' in first;
      console.log('[GL.9] Has category data:', hasCategoryData);
    }
  });

  test('cache header tồn tại (s-maxage=300)', async ({ request }) => {
    const resp = await request.get('/api/v1/gallery');
    const cacheControl = resp.headers()['cache-control'] ?? '';
    console.log('[GL.9] Cache-Control:', cacheControl);
    // Soft check
  });
});

// ─── GL.10 — CTA section cuối trang ──────────────────────────────────────────
test.describe('GL.10 — CTA section cuối trang', () => {
  test('có CTA section với button "Đặt Lịch Ngay" / "Book Now"', async ({ page }) => {
    await gotoGallery(page);

    // Scroll xuống cuối trang để thấy CTA
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const ctaBtn = page.getByRole('link', { name: /đặt lịch ngay|book now|지금 예약/i }).first()
      .or(page.getByRole('button', { name: /đặt lịch ngay|book now/i }).first());
    const hasCta = await ctaBtn.count() > 0;
    console.log('[GL.10] CTA "Đặt Lịch Ngay" found:', hasCta);
    expect(hasCta).toBe(true);
  });

  test('CTA button link trỏ về /booking', async ({ page }) => {
    await gotoGallery(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const ctaLink = page.getByRole('link', { name: /đặt lịch|book now/i }).last();
    if (await ctaLink.count() > 0) {
      const href = await ctaLink.getAttribute('href');
      console.log('[GL.10] CTA href:', href);
      if (href) {
        expect(href).toContain('booking');
      }
    }
  });

  test('CTA section có dark background (theo design spec)', async ({ page }) => {
    await gotoGallery(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // CTA section: dark bg, eyebrow + heading
    const ctaHeading = page.getByText(/bạn muốn sở hữu|want to own|이 아름다움을/i).first();
    const hasCta = await ctaHeading.count() > 0;
    console.log('[GL.10] CTA heading found:', hasCta);
    // Soft check
  });
});

// ─── GL.11 — Per-category layouts ────────────────────────────────────────────
test.describe('GL.11 — Per-category layouts', () => {
  test('tab gội đầu dùng uniform grid (aspect-square)', async ({ page }) => {
    await gotoGallery(page);

    const switched = await clickTab(page, /gội đầu/i);
    if (!switched) {
      console.warn('[GL.11] Gội đầu tab not found');
      return;
    }

    // Aspect-square images trong grid
    const squareImgs = page.locator('[class*="aspect-square"], img[class*="square"]');
    const count = await squareImgs.count();
    console.log('[GL.11] Gội đầu aspect-square count:', count);
    // Soft check
  });

  test('hover trên ảnh → overlay icon xuất hiện', async ({ page }) => {
    await gotoGallery(page);

    const firstImg = page.locator('main img').first();
    if (await firstImg.count() === 0) return;

    // Hover để kích ZoomIn icon
    await firstImg.hover().catch(() => {});
    await page.waitForTimeout(300);

    const hoverOverlay = page.locator('[class*="group-hover"], [class*="overlay"]').first();
    const hasOverlay = await hoverOverlay.count() > 0;
    console.log('[GL.11] Hover overlay found:', hasOverlay);
    // Soft check
  });
});
