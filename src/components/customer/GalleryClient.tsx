"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
  EffectFade,
} from "swiper/modules";
import { ZoomIn, ArrowRight } from "lucide-react";
import { Link } from "@/lib/navigation";
import { getLocaleText } from "@/lib/i18n-helpers";
import { cn } from "@/lib/utils";
import { ImageWithSkeleton } from "@/components/shared/ImageWithSkeleton";
import { GalleryLightbox } from "@/components/shared/GalleryLightbox";
import type { Database } from "@/types/database";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-fade";

type GalleryImage = Database["public"]["Tables"]["gallery_images"]["Row"];
type CategoryFilter = "all" | "nail" | "mi" | "long_may" | "goi_dau" | "studio";

interface GalleryClientProps {
  initialImages: GalleryImage[];
  locale: string;
}

const BATCH_SIZE = 10;
const ROTATION_MS = 10_000;
const STAGGER_MS = 150;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function GalleryClient({ initialImages, locale }: GalleryClientProps) {
  const t = useTranslations("gallery");
  const [activeTab, setActiveTab] = useState<CategoryFilter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeNailIndex, setActiveNailIndex] = useState(0);
  const nailSwiperRef = useRef<SwiperType | null>(null);
  const staggerTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // "Tất cả" tab — 10-image rotating batch
  const [displayBatch, setDisplayBatch] = useState<GalleryImage[]>(() =>
    shuffleArray(initialImages).slice(
      0,
      Math.min(BATCH_SIZE, initialImages.length),
    ),
  );

  const filteredImages = useMemo(() => {
    if (activeTab === "all") return initialImages;
    return initialImages.filter((img) => img.category === activeTab);
  }, [initialImages, activeTab]);

  const featuredImages = useMemo(
    () => initialImages.slice(0, 8),
    [initialImages],
  );

  // Staggered per-slot rotation — only active on "Tất cả" tab
  useEffect(() => {
    if (activeTab !== "all" || initialImages.length <= BATCH_SIZE) return;

    const doRotate = () => {
      staggerTimersRef.current.forEach(clearTimeout);
      staggerTimersRef.current = [];

      const newBatch = shuffleArray(initialImages).slice(0, BATCH_SIZE);

      newBatch.forEach((img, idx) => {
        const timer = setTimeout(() => {
          setDisplayBatch((prev) => {
            const next = [...prev];
            next[idx] = img;
            return next;
          });
        }, idx * STAGGER_MS);
        staggerTimersRef.current.push(timer);
      });
    };

    const interval = setInterval(doRotate, ROTATION_MS);
    return () => {
      clearInterval(interval);
      staggerTimersRef.current.forEach(clearTimeout);
    };
  }, [activeTab, initialImages]);

  const openLightbox = useCallback(
    (id: string) => {
      const idx = filteredImages.findIndex((img) => img.id === id);
      if (idx !== -1) setLightboxIndex(idx);
    },
    [filteredImages],
  );

  const tabs: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: t("tab_all") },
    { id: "nail", label: t("filter_nail") },
    { id: "mi", label: t("filter_lash") },
    { id: "long_may", label: t("filter_brow") },
  ];

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      {/* Featured Coverflow — only "Tất cả" tab */}
      {featuredImages.length > 0 && (
        <section className="px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <span className="font-body text-xs font-semibold tracking-[0.2em] text-accent uppercase mb-3 block">
                {t("featured_title")}
              </span>
              <h2 className="font-display text-3xl md:text-5xl text-text-primary">
                {t("featured_subtitle")}
              </h2>
            </div>

            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
              effect="coverflow"
              grabCursor
              centeredSlides
              slidesPerView="auto"
              loop
              coverflowEffect={{
                rotate: 35,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              pagination={{ clickable: true, dynamicBullets: true }}
              navigation
              className="featured-swiper pb-12 !px-4"
            >
              {featuredImages.map((img) => (
                <SwiperSlide
                  key={img.id}
                  className="max-w-[300px] md:max-w-[450px]"
                >
                  <div
                    className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
                    onClick={() => openLightbox(img.id)}
                  >
                    <ImageWithSkeleton
                      src={img.image_url}
                      alt={
                        getLocaleText(img.alt_text, locale) || "Featured work"
                      }
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 300px, 450px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                      <p className="text-text-inverse font-display text-xl mb-1">
                        {getLocaleText(img.alt_text, locale)}
                      </p>
                      <p className="text-accent-light font-body text-xs uppercase tracking-widest">
                        {img.category.replace("_", " ")}
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
          <div className="flex justify-center items-center h-16 gap-8 md:gap-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative h-full flex items-center font-body text-sm font-medium tracking-widest uppercase transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-primary",
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Gallery */}
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
                  <p className="font-display text-2xl text-text-muted mb-4">
                    {t("empty")}
                  </p>
                  <Link href="/booking" className="btn-ghost">
                    {t("cta_button")}
                  </Link>
                </div>
              ) : (
                renderTabContent()
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-bg-dark text-text-inverse p-8 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <span className="font-display text-[10rem] leading-none">H</span>
          </div>
          <span className="font-body text-xs font-semibold tracking-[0.3em] text-accent-light uppercase mb-6 block">
            Hanie Studio
          </span>
          <h2 className="font-display text-3xl md:text-5xl mb-8 leading-tight">
            {t("cta_title")}
          </h2>
          <p className="font-body text-text-inverse/70 max-w-xl mx-auto mb-12 text-sm md:text-base leading-relaxed">
            {t("cta_desc")}
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-3 px-10 py-4 bg-accent hover:bg-accent-dark text-text-inverse rounded-full font-body text-sm font-semibold tracking-widest uppercase transition-all hover:scale-105"
          >
            {t("cta_button")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

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
    switch (activeTab) {
      case "nail":
        return renderNailLayout();
      case "mi":
        return renderLashLayout();
      case "long_may":
        return renderBrowLayout();
      default:
        return renderAllLayout();
    }
  }

  // ─── Tab "Tất cả": 10-slot grid, từng slot fade in/out riêng lẻ ──────────
  function renderAllLayout() {
    const slots =
      initialImages.length <= BATCH_SIZE ? initialImages : displayBatch;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {slots.map((img, slotIdx) => (
          <div
            key={`slot-${slotIdx}`}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl group"
            onClick={() => {
              const idx = filteredImages.findIndex((fi) => fi.id === img.id);
              setLightboxIndex(idx >= 0 ? idx : 0);
            }}
          >
            {/* Per-slot AnimatePresence: ảnh thay đổi theo từng slot */}
            <AnimatePresence mode="wait">
              <motion.div
                key={img.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <ImageWithSkeleton
                  src={img.image_url}
                  alt={getLocaleText(img.alt_text, locale)}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </motion.div>
            </AnimatePresence>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-bg-dark/0 group-hover:bg-bg-dark/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-10 pointer-events-none">
              <ZoomIn className="text-text-inverse w-7 h-7" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── Tab "Nail": hero constrained + blur backdrop + thumbnail strip ───────
  function renderNailLayout() {
    const loop = filteredImages.length > 1;

    return (
      <div className="flex flex-col gap-3">
        {/* Hero — max-w-3xl để không bị quá rộng trên PC */}
        <div
          className="max-w-3xl mx-auto w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{ height: "clamp(300px, 50vw, 520px)" }}
        >
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            effect="fade"
            loop={loop}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation
            onSwiper={(s) => {
              nailSwiperRef.current = s;
            }}
            onSlideChange={(s) => setActiveNailIndex(s.realIndex)}
            className="h-full"
          >
            {filteredImages.map((img, idx) => (
              <SwiperSlide key={`nm-${img.id}`} style={{ height: "100%" }}>
                <div
                  className="relative w-full h-full cursor-pointer bg-bg-secondary"
                  onClick={() => setLightboxIndex(idx)}
                >
                  {/* Blurred backdrop — fill letterbox area */}
                  <div className="absolute inset-0 overflow-hidden">
                    <ImageWithSkeleton
                      src={img.image_url}
                      alt=""
                      fill
                      className="object-cover blur-xl scale-110 opacity-50"
                      sizes="10px"
                    />
                  </div>

                  {/* Main image — object-contain, không crop */}
                  <div className="absolute inset-0">
                    <ImageWithSkeleton
                      src={img.image_url}
                      alt={getLocaleText(img.alt_text, locale) || "Nail art"}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 60vw"
                      priority={idx === 0}
                    />
                  </div>

                  {/* Caption */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-dark/75 to-transparent p-5 md:p-8 z-10">
                    <p className="font-body text-[10px] uppercase tracking-[0.3em] text-accent-light mb-1">
                      Nail Art · Hanie Studio
                    </p>
                    <p className="font-display text-lg md:text-2xl text-text-inverse">
                      {getLocaleText(img.alt_text, locale) ||
                        `Design #${String(idx + 1).padStart(2, "0")}`}
                    </p>
                    <div className="w-8 h-px bg-accent mt-2" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Thumbnail strip */}
        <div className="max-w-3xl mx-auto w-full flex gap-2 overflow-x-auto no-scrollbar py-1">
          {filteredImages.map((img, idx) => (
            <button
              key={`nt-${img.id}`}
              aria-label={`Nail design ${idx + 1}`}
              onClick={() => {
                setActiveNailIndex(idx);
                if (loop) nailSwiperRef.current?.slideToLoop(idx);
                else nailSwiperRef.current?.slideTo(idx);
              }}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden transition-all duration-200",
                activeNailIndex === idx
                  ? "ring-2 ring-accent ring-offset-2 opacity-100 scale-105"
                  : "opacity-50 hover:opacity-80",
              )}
            >
              <ImageWithSkeleton
                src={img.image_url}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Tab "Nối mi": coverflow lớn + 2 panel cuộn dọc (lg+), mobile ẩn panel ─
  function renderLashLayout() {
    const mid = Math.min(
      Math.ceil(filteredImages.length / 3),
      filteredImages.length - 1,
    );
    const end = Math.min(
      Math.ceil((filteredImages.length * 2) / 3),
      filteredImages.length - 1,
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main coverflow — full width on mobile */}
        <div className="lg:col-span-2 h-[500px] md:h-[600px]">
          <Swiper
            modules={[Autoplay, Pagination, EffectCoverflow]}
            effect="coverflow"
            centeredSlides
            slidesPerView={1}
            loop={filteredImages.length > 1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
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

        {/* Right panels — hidden on mobile, 2 vertical auto-scroll swipers */}
        <div className="hidden lg:flex flex-col gap-6 h-[600px]">
          {/* Top panel: cuộn xuống, bắt đầu từ 1/3 */}
          <div className="flex-1 rounded-2xl overflow-hidden shadow-md">
            <Swiper
              modules={[Autoplay]}
              direction="vertical"
              slidesPerView={1}
              loop={filteredImages.length > 1}
              initialSlide={mid}
              autoplay={{ delay: 2600, disableOnInteraction: false }}
              className="h-full"
            >
              {filteredImages.map((img) => (
                <SwiperSlide key={`rpt-${img.id}`} style={{ height: "100%" }}>
                  <div
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => openLightbox(img.id)}
                  >
                    <ImageWithSkeleton
                      src={img.image_url}
                      alt="Lash work"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="30vw"
                    />
                    <div className="absolute inset-0 bg-bg-dark/10 group-hover:bg-bg-dark/30 transition-colors" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Bottom panel: cuộn ngược, bắt đầu từ 2/3 */}
          <div className="flex-1 rounded-2xl overflow-hidden shadow-md">
            <Swiper
              modules={[Autoplay]}
              direction="vertical"
              slidesPerView={1}
              loop={filteredImages.length > 1}
              initialSlide={end}
              autoplay={{
                delay: 3200,
                disableOnInteraction: false,
                reverseDirection: true,
              }}
              className="h-full"
            >
              {filteredImages.map((img) => (
                <SwiperSlide key={`rpb-${img.id}`} style={{ height: "100%" }}>
                  <div
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => openLightbox(img.id)}
                  >
                    <ImageWithSkeleton
                      src={img.image_url}
                      alt="Lash work"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="30vw"
                    />
                    <div className="absolute inset-0 bg-bg-dark/10 group-hover:bg-bg-dark/30 transition-colors" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    );
  }

  // ─── Tab "Lông mày": masonry grid to hơn, tương tự "Tất cả" ─────────────
  function renderBrowLayout() {
    return (
      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        {filteredImages.map((img, idx) => (
          <div
            key={img.id}
            className="relative break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
            onClick={() => setLightboxIndex(idx)}
          >
            <ImageWithSkeleton
              src={img.image_url}
              alt={getLocaleText(img.alt_text, locale)}
              width={500}
              height={700}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-bg-dark/0 group-hover:bg-bg-dark/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <ZoomIn className="text-text-inverse w-7 h-7" />
            </div>
          </div>
        ))}
      </div>
    );
  }
}
