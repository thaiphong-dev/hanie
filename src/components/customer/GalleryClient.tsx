'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { 
  Navigation, 
  Pagination, 
  Autoplay, 
  EffectCoverflow, 
  EffectFade 
} from 'swiper/modules';
import { ZoomIn, ArrowRight } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { getLocaleText } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import { ImageWithSkeleton } from '@/components/shared/ImageWithSkeleton';
import { GalleryLightbox } from '@/components/shared/GalleryLightbox';
import type { Database } from '@/types/database';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-fade';

type GalleryImage = Database['public']['Tables']['gallery_images']['Row'];
type CategoryFilter = 'all' | 'nail' | 'mi' | 'long_may' | 'goi_dau' | 'studio';

interface GalleryClientProps {
  initialImages: GalleryImage[];
  locale: string;
}

export function GalleryClient({ initialImages, locale }: GalleryClientProps) {
  const t = useTranslations('gallery');
  const [activeTab, setActiveTab] = useState<CategoryFilter>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages = useMemo(() => {
    if (activeTab === 'all') return initialImages;
    return initialImages.filter(img => img.category === activeTab);
  }, [initialImages, activeTab]);

  const featuredImages = useMemo(() => {
    return initialImages.slice(0, 8); // Top 8 images for the coverflow
  }, [initialImages]);

  const openLightbox = useCallback((id: string) => {
    const idx = filteredImages.findIndex(img => img.id === id);
    if (idx !== -1) setLightboxIndex(idx);
  }, [filteredImages]);

  const tabs: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: t('tab_all') },
    { id: 'nail', label: t('filter_nail') },
    { id: 'mi', label: t('filter_lash') },
    { id: 'long_may', label: t('filter_brow') },
    { id: 'goi_dau', label: t('filter_hair_wash') },
    { id: 'studio', label: t('filter_studio') },
  ];

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      {/* Featured Carousel - Only on 'all' tab or as a top section */}
      {activeTab === 'all' && featuredImages.length > 0 && (
        <section className="px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <span className="font-body text-xs font-semibold tracking-[0.2em] text-accent uppercase mb-3 block">
                {t('featured_title')}
              </span>
              <h2 className="font-display text-3xl md:text-5xl text-text-primary">
                {t('featured_subtitle')}
              </h2>
            </div>

            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              slidesPerView="auto"
              loop={true}
              coverflowEffect={{
                rotate: 35,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              navigation={true}
              className="featured-swiper pb-12 !px-4"
            >
              {featuredImages.map((img) => (
                <SwiperSlide key={img.id} className="max-w-[300px] md:max-w-[450px]">
                  <div 
                    className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
                    onClick={() => openLightbox(img.id)}
                  >
                    <ImageWithSkeleton
                      src={img.image_url}
                      alt={getLocaleText(img.alt_text, locale) || 'Featured work'}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 300px, 450px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                      <p className="text-text-inverse font-display text-xl mb-1">
                        {getLocaleText(img.alt_text, locale)}
                      </p>
                      <p className="text-accent-light font-body text-xs uppercase tracking-widest">
                        {img.category.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* Sticky Filter Tabs */}
      <section className="sticky top-[64px] z-40 bg-bg-primary/90 backdrop-blur-md border-y border-border">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex justify-center md:justify-center items-center h-16 gap-8 md:gap-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative h-full flex items-center font-body text-sm font-medium tracking-widest uppercase transition-colors whitespace-nowrap",
                  activeTab === tab.id ? "text-text-primary" : "text-text-muted hover:text-text-primary"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Gallery Display */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="min-h-[40vh]"
            >
              {filteredImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <p className="font-display text-2xl text-text-muted mb-4">{t('empty')}</p>
                  <Link href="/booking" className="btn-ghost">
                    {t('cta_button')}
                  </Link>
                </div>
              ) : (
                renderTabContent()
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-bg-dark text-text-inverse p-8 md:p-20 text-center relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <span className="font-display text-[10rem] leading-none">H</span>
          </div>

          <span className="font-body text-xs font-semibold tracking-[0.3em] text-accent-light uppercase mb-6 block">
            Hanie Studio
          </span>
          <h2 className="font-display text-3xl md:text-5xl mb-8 leading-tight">
            {t('cta_title')}
          </h2>
          <p className="font-body text-text-inverse/70 max-w-xl mx-auto mb-12 text-sm md:text-base leading-relaxed">
            {t('cta_desc')}
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-3 px-10 py-4 bg-accent hover:bg-accent-dark text-text-inverse rounded-full font-body text-sm font-semibold tracking-widest uppercase transition-all hover:scale-105"
          >
            {t('cta_button')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Lightbox Overlay */}
      <GalleryLightbox
        images={filteredImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(idx) => setLightboxIndex(idx)}
        locale={locale}
      />
    </div>
  );

  function renderTabContent() {
    // Dynamic layouts based on category
    switch (activeTab) {
      case 'nail':
        return renderNailLayout();
      case 'mi':
        return renderLashLayout();
      case 'long_may':
        return renderMasonryLayout();
      case 'studio':
        return renderStudioLayout();
      default:
        return renderMasonryLayout();
    }
  }

  function renderNailLayout() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[700px]">
        {/* Left: Vertical Carousel */}
        <div className="lg:col-span-5 h-[500px] lg:h-full">
          <Swiper
            modules={[Autoplay, Pagination]}
            direction="vertical"
            spaceBetween={20}
            slidesPerView={2}
            autoplay={{ delay: 3000 }}
            pagination={{ clickable: true }}
            className="h-full rounded-2xl overflow-hidden"
          >
            {filteredImages.map((img) => (
              <SwiperSlide key={`v-${img.id}`}>
                <div 
                  className="relative h-full rounded-2xl overflow-hidden group cursor-pointer"
                  onClick={() => openLightbox(img.id)}
                >
                  <ImageWithSkeleton
                    src={img.image_url}
                    alt="Nail art"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-bg-dark/20 group-hover:bg-bg-dark/40 transition-colors" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Right: Featured Fade Carousel */}
        <div className="lg:col-span-7 h-[500px] lg:h-full">
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            autoplay={{ delay: 5000 }}
            pagination={{ clickable: true }}
            className="h-full rounded-2xl overflow-hidden shadow-2xl"
          >
            {[...filteredImages].reverse().map((img) => (
              <SwiperSlide key={`f-${img.id}`}>
                <div 
                  className="relative h-full rounded-2xl overflow-hidden group cursor-pointer"
                  onClick={() => openLightbox(img.id)}
                >
                  <ImageWithSkeleton
                    src={img.image_url}
                    alt="Nail art featured"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent flex flex-col justify-end p-10">
                    <p className="font-display text-2xl text-text-inverse mb-2">Beautiful Nail Design</p>
                    <div className="w-12 h-px bg-accent" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    );
  }

  function renderLashLayout() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[500px] md:h-[600px]">
          <Swiper
            modules={[Autoplay, Pagination, EffectCoverflow]}
            effect="coverflow"
            centeredSlides={true}
            slidesPerView={1}
            autoplay={{ delay: 4000 }}
            pagination={{ clickable: true }}
            coverflowEffect={{
              rotate: 30,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            className="h-full rounded-2xl overflow-hidden"
          >
            {filteredImages.map((img) => (
              <SwiperSlide key={`l-${img.id}`}>
                <div 
                  className="relative h-full cursor-pointer"
                  onClick={() => openLightbox(img.id)}
                >
                  <ImageWithSkeleton
                    src={img.image_url}
                    alt="Lash extension"
                    fill
                    className="object-cover"
                    sizes="80vw"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          {filteredImages.slice(0, 2).map((img) => (
            <div 
              key={`ls-${img.id}`}
              className="relative h-[240px] md:h-full lg:h-[285px] rounded-2xl overflow-hidden group cursor-pointer"
              onClick={() => openLightbox(img.id)}
            >
              <ImageWithSkeleton
                src={img.image_url}
                alt="Lash work"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 50vw, 30vw"
              />
              <div className="absolute inset-0 bg-bg-dark/10 group-hover:bg-bg-dark/30 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderStudioLayout() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredImages.map((img) => (
          <div 
            key={img.id}
            className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer shadow-lg"
            onClick={() => openLightbox(img.id)}
          >
            <ImageWithSkeleton
              src={img.image_url}
              alt="Studio view"
              fill
              className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-bg-dark/10 group-hover:bg-bg-dark/20 transition-colors" />
          </div>
        ))}
      </div>
    );
  }

  function renderMasonryLayout() {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            className="relative break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
            onClick={() => openLightbox(img.id)}
          >
            <ImageWithSkeleton
              src={img.image_url}
              alt={getLocaleText(img.alt_text, locale)}
              width={500}
              height={700}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <ZoomIn className="text-text-inverse w-8 h-8" />
            </div>
          </div>
        ))}
      </div>
    );
  }
}
