'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { getLocaleText } from '@/lib/i18n-helpers';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import type { Database } from '@/types/database';

type GalleryImage = Database['public']['Tables']['gallery_images']['Row'];

interface GalleryLightboxProps {
  images: GalleryImage[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  locale: string;
}

export function GalleryLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
  locale
}: GalleryLightboxProps) {
  const t = useTranslations('gallery');

  const activeImage = currentIndex !== null ? images[currentIndex] : null;

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex !== null && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex !== null && currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, images.length, onNavigate]);

  // Keyboard support
  useEffect(() => {
    if (currentIndex === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, onClose, handlePrev, handleNext]);

  // Prevent background scroll
  useEffect(() => {
    if (currentIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [currentIndex]);

  return (
    <AnimatePresence>
      {currentIndex !== null && activeImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-bg-dark/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-text-inverse transition-colors z-[110]"
          >
            <X size={24} />
          </button>

          {/* Navigation Buttons */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-text-inverse transition-colors z-[110]"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {currentIndex < images.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-text-inverse transition-colors z-[110]"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Content Area */}
          <div 
            className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              key={activeImage.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full flex-grow flex items-center justify-center"
            >
              <ImageWithSkeleton
                src={activeImage.image_url}
                alt={getLocaleText(activeImage.alt_text, locale) || 'Gallery image'}
                width={1200}
                height={900}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                sizes="90vw"
              />
            </motion.div>

            {/* Info and CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-3xl bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex-grow text-center md:text-left">
                <p className="font-display text-xl text-text-inverse mb-1">
                  {getLocaleText(activeImage.alt_text, locale) || t('page_title')}
                </p>
                <p className="font-body text-sm text-text-inverse/50 uppercase tracking-widest">
                  {activeImage.category.replace('_', ' ')}
                </p>
              </div>

              <Link
                href="/booking"
                onClick={onClose}
                className="flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent-dark text-text-inverse rounded-full font-body text-sm font-medium tracking-wider uppercase transition-all hover:scale-105"
              >
                {t('lightbox_book')}
                <ExternalLink size={16} />
              </Link>
            </motion.div>

            {/* Pagination Dots */}
            <div className="flex flex-wrap justify-center gap-2 max-w-full px-4">
              {images.length <= 20 ? (
                images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onNavigate(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentIndex ? 'bg-accent w-6' : 'bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))
              ) : (
                <p className="text-text-inverse/40 text-xs font-body">
                  {currentIndex + 1} / {images.length}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
