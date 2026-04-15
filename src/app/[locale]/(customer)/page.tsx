import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/lib/navigation';
import { Star, Award, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { ScrollReveal, StaggerGrid, StaggerItem } from '@/components/shared/ScrollReveal';
import { ServiceCard } from '@/components/customer/ServiceCard';
import { ImageWithSkeleton } from '@/components/shared/ImageWithSkeleton';
import { SkeletonServiceGrid } from '@/components/shared/SkeletonServiceGrid';
import type { Locale } from '@/lib/navigation';
import type { Database } from '@/types/database';

type ServiceRow = Database['public']['Tables']['services']['Row'];
interface ServiceWithCategory extends ServiceRow {
  category?: { id: string; name: string; name_i18n: Record<string, string>; slug: string } | null;
}

async function fetchFeaturedServices(): Promise<ServiceWithCategory[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/v1/services?active=true&type=main`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: ServiceWithCategory[] | null };
    return (json.data ?? []).slice(0, 4);
  } catch {
    return [];
  }
}

const WHY_US_ICONS = [Star, Award, Sparkles, ShieldCheck] as const;

export default async function HomePage() {
  const [t, locale, featuredServices] = await Promise.all([
    getTranslations(),
    getLocale(),
    fetchFeaturedServices(),
  ]);

  return (
    <>
      {/* ── Section 1: Hero ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-bg-dark">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-dark via-bg-dark/90 to-accent/20" />
        <div className="absolute inset-0 opacity-30">
          <ImageWithSkeleton src={null} alt="" fill sizes="100vw" className="object-cover" priority />
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            {t('home.hero_eyebrow')}
          </p>
          <h1 className="font-display text-4xl md:text-6xl leading-tight text-text-inverse mb-6 whitespace-pre-line">
            {t('home.hero_title')}
          </h1>
          <p className="font-body text-sm md:text-base text-text-inverse/60 mb-10 whitespace-pre-line leading-relaxed">
            {t('home.hero_sub')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="font-body text-sm font-medium tracking-widest uppercase
                bg-accent hover:bg-accent-dark text-text-inverse
                px-8 py-4 rounded-full transition-colors duration-200"
            >
              {t('home.cta_book')}
            </Link>
            <Link
              href="/services"
              className="font-body text-sm font-medium tracking-widest uppercase
                border border-text-inverse/30 text-text-inverse hover:border-text-inverse
                px-8 py-4 rounded-full transition-colors duration-200"
            >
              {t('home.cta_services')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 2: Why Us ── */}
      <section className="py-20 px-4 bg-bg-primary">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="text-center mb-14">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-3">
              {t('home.why_us_eyebrow')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-text-primary">
              {t('home.why_us_title')}
            </h2>
          </ScrollReveal>

          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {([1, 2, 3, 4] as const).map((i) => {
              const Icon = WHY_US_ICONS[i - 1];
              return (
                <StaggerItem key={i}>
                  <div className="text-center px-4">
                    <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-accent/10 flex items-center justify-center">
                      <Icon size={24} className="text-accent" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-display text-lg text-text-primary mb-2">
                      {t(`home.why_us_reason_${i}_title`)}
                    </h3>
                    <p className="font-body text-sm text-text-muted leading-relaxed">
                      {t(`home.why_us_reason_${i}_desc`)}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* ── Section 3: Services Preview ── */}
      <section className="py-20 px-4 bg-bg-secondary">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="flex items-end justify-between mb-12">
            <div>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-3">
                {t('home.services_eyebrow')}
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-text-primary whitespace-pre-line">
                {t('home.services_title')}
              </h2>
            </div>
            <Link
              href="/services"
              className="hidden md:flex items-center gap-2 font-body text-sm text-accent hover:text-accent-dark transition-colors"
            >
              {t('services.view_all')}
              <ArrowRight size={16} />
            </Link>
          </ScrollReveal>

          {featuredServices.length > 0 ? (
            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((service) => (
                <StaggerItem key={service.id}>
                  <ServiceCard service={service} locale={locale as Locale} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          ) : (
            <SkeletonServiceGrid count={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
          )}

          <div className="mt-10 text-center md:hidden">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 font-body text-sm text-accent"
            >
              {t('services.view_all')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 4: Gallery Preview ── */}
      <section className="py-20 px-4 bg-bg-primary">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl text-text-primary">
              {t('nav.gallery')}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl bg-bg-secondary ${
                  i === 0 || i === 5 ? 'aspect-[3/4]' : 'aspect-square'
                }`}
              >
                <ImageWithSkeleton
                  src={null}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 font-body text-sm font-medium tracking-widest uppercase
                border border-accent text-accent hover:bg-accent hover:text-text-inverse
                px-6 py-3 rounded-full transition-colors duration-200"
            >
              {t('nav.gallery')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 5: Mission (Dark) ── */}
      <section className="py-20 px-4 bg-bg-dark">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
                HANIE STUDIO
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-text-inverse mb-6">
                {t('home.cta_title')}
              </h2>
              <p className="font-body text-sm text-text-inverse/60 leading-relaxed mb-8">
                {t('home.cta_desc')}
              </p>
              <Link
                href="/booking"
                className="inline-block font-body text-sm font-medium tracking-widest uppercase
                  bg-accent hover:bg-accent-dark text-text-inverse
                  px-8 py-4 rounded-full transition-colors duration-200"
              >
                {t('home.cta_book')}
              </Link>
            </ScrollReveal>

            <ScrollReveal className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <ImageWithSkeleton
                src={null}
                alt="Hanie Studio"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Section 6: Core Values ── */}
      <section className="py-20 px-4 bg-bg-primary">
        <div className="mx-auto max-w-7xl">
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { title: t('home.why_us_reason_1_title'), desc: t('home.why_us_reason_1_desc') },
              { title: t('home.why_us_reason_2_title'), desc: t('home.why_us_reason_2_desc') },
              { title: t('home.why_us_reason_3_title'), desc: t('home.why_us_reason_3_desc') },
            ].map(({ title, desc }) => (
              <StaggerItem key={title}>
                <div className="px-6">
                  <span className="text-accent text-2xl">✦</span>
                  <h3 className="font-display text-xl text-text-primary mt-4 mb-3">{title}</h3>
                  <p className="font-body text-sm text-text-muted leading-relaxed">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── Section 7: CTA Banner ── */}
      <section className="py-16 px-4 bg-accent">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <h2 className="font-display text-3xl md:text-4xl text-text-inverse mb-6">
              {t('home.cta_title')}
            </h2>
            <p className="font-body text-sm text-text-inverse/80 mb-8">{t('home.cta_desc')}</p>
            <Link
              href="/booking"
              className="inline-block font-body text-sm font-medium tracking-widest uppercase
                bg-text-inverse text-accent hover:bg-text-inverse/90
                px-10 py-4 rounded-full transition-colors duration-200"
            >
              {t('home.cta_book')}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
