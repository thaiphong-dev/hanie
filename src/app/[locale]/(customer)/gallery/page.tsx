'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithSkeleton } from '@/components/shared/ImageWithSkeleton';
import { Link } from '@/lib/navigation';
import { getLocaleText } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database';
import type { Locale } from '@/lib/navigation';

type GalleryImage = Database['public']['Tables']['gallery_images']['Row'];
type GalleryCategory = GalleryImage['category'];

type CategoryFilter = 'all' | GalleryCategory;

// i18n key mapping for each gallery category enum value
const CATEGORY_I18N: Record<GalleryCategory, string> = {
  nail: 'gallery.filter_nail',
  mi: 'gallery.filter_lash',
  long_may: 'gallery.filter_brow',
  goi_dau: 'gallery.filter_hair_wash',
  studio: 'gallery.filter_studio',
};

export default function GalleryPage() {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/v1/gallery')
      .then((r) => r.json())
      .then((json: { data: GalleryImage[] | null }) => {
        setImages(json.data ?? []);
      })
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  // Derive unique categories from loaded images (preserving order of first appearance)
  const availableCategories: GalleryCategory[] = [];
  const seenCats = new Set<GalleryCategory>();
  for (const img of images) {
    if (!seenCats.has(img.category)) {
      seenCats.add(img.category);
      availableCategories.push(img.category);
    }
  }

  const filtered = activeFilter === 'all'
    ? images
    : images.filter((img) => img.category === activeFilter);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const prevImage = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const nextImage = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i));
  }, [filtered.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, closeLightbox, prevImage, nextImage]);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="pt-24 pb-10 px-4 text-center">
        <p className="font-body text-xs tracking-widest uppercase text-accent mb-3">
          {t('gallery.eyebrow')}
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-text-primary">
          {t('gallery.page_title')}
        </h1>
      </div>

      {/* Filter tabs — derived from actual DB data (only categories with images) */}
      <div className="sticky top-16 z-30 bg-bg-primary/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-6 overflow-x-auto no-scrollbar py-3">
            {/* "All" tab — always shown */}
            <button
              onClick={() => setActiveFilter('all')}
              className={cn(
                'font-body text-sm whitespace-nowrap pb-1 border-b-2 transition-colors',
                activeFilter === 'all'
                  ? 'border-accent text-text-primary font-medium'
                  : 'border-transparent text-text-muted hover:text-text-primary',
              )}
            >
              {t('gallery.filter_all')}
            </button>

            {/* Category tabs — only for categories that have images */}
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={cn(
                  'font-body text-sm whitespace-nowrap pb-1 border-b-2 transition-colors',
                  activeFilter === cat
                    ? 'border-accent text-text-primary font-medium'
                    : 'border-transparent text-text-muted hover:text-text-primary',
                )}
              >
                {t(CATEGORY_I18N[cat] as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Masonry grid */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        {loading && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="skeleton rounded-xl break-inside-avoid"
                style={{ height: `${150 + (i % 3) * 80}px` }}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-xl text-text-muted">{t('gallery.empty')}</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
            {filtered.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="relative break-inside-avoid mb-3 group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="relative overflow-hidden rounded-xl">
                  <ImageWithSkeleton
                    src={image.image_url}
                    alt={getLocaleText(image.alt_text, locale) || `Gallery ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/40 transition-colors duration-300 flex items-center justify-center">
                    <ZoomIn
                      size={28}
                      className="text-text-inverse opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-dark/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-bg-primary/20 flex items-center justify-center text-text-inverse hover:bg-bg-primary/40 transition-colors"
              aria-label={t('common.close')}
            >
              <X size={20} />
            </button>

            {/* Prev */}
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bg-primary/20 flex items-center justify-center text-text-inverse hover:bg-bg-primary/40 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Next */}
            {lightboxIndex < filtered.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bg-primary/20 flex items-center justify-center text-text-inverse hover:bg-bg-primary/40 transition-colors"
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-3xl w-full max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageWithSkeleton
                src={filtered[lightboxIndex].image_url}
                alt={getLocaleText(filtered[lightboxIndex].alt_text, locale) || 'Gallery image'}
                width={900}
                height={700}
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
                sizes="90vw"
              />

              {/* Caption + CTA */}
              <div className="mt-4 flex items-center justify-between">
                <p className="font-body text-sm text-text-inverse/70">
                  {getLocaleText(filtered[lightboxIndex].alt_text, locale)}
                </p>
                <Link
                  href="/booking"
                  onClick={closeLightbox}
                  className="font-body text-xs font-medium tracking-widest uppercase
                    bg-accent hover:bg-accent-dark text-text-inverse
                    px-5 py-2.5 rounded-full transition-colors"
                >
                  {t('gallery.book_this')}
                </Link>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-1.5 mt-4">
                {filtered.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-colors',
                      i === lightboxIndex ? 'bg-accent' : 'bg-text-inverse/30',
                    )}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
