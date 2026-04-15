import { getTranslations, getLocale } from 'next-intl/server';
import { Phone, MapPin, Clock, ExternalLink } from 'lucide-react';
import { ImageWithSkeleton } from '@/components/shared/ImageWithSkeleton';
import { Link } from '@/lib/navigation';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const titles: Record<string, string> = {
    vi: 'Địa chỉ & Bản đồ | Hanie Studio Quy Nhơn',
    en: 'Location & Map | Hanie Studio Quy Nhon',
    ko: '위치 & 지도 | Hanie Studio Quy Nhon',
  };
  return { title: titles[locale] ?? titles['vi'] };
}

export default async function LocationPage() {
  const t = await getTranslations();

  const PHONE_NUMBER = '0901234567';
  const ZALO_OA_ID = process.env.NEXT_PUBLIC_ZALO_OA_ID ?? '';
  const GOOGLE_MAPS_URL =
    'https://maps.google.com/?q=55+Nguy%E1%BB%85n+Nh%E1%BA%A1c+Quy+Nh%C6%A1n';
  const GOOGLE_MAPS_EMBED =
    'https://maps.google.com/maps?q=55+Nguy%E1%BB%85n+Nh%E1%BA%A1c,+Quy+Nh%C6%A1n&output=embed';

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="pt-24 pb-10 px-4 text-center bg-bg-secondary">
        <p className="font-body text-xs tracking-widest uppercase text-accent mb-3">
          {t('location.eyebrow')}
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-text-primary">
          {t('location.title')}
        </h1>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Info column */}
          <div className="space-y-8">
            {/* Address */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-accent" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-text-muted mb-1">
                  {t('location.address_label')}
                </p>
                <p className="font-display text-lg text-text-primary">
                  {t('location.address_value')}
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-accent" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-text-muted mb-1">
                  {t('location.hours_label')}
                </p>
                <p className="font-display text-lg text-text-primary">
                  {t('location.hours_value')}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-accent" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-text-muted mb-1">
                  {t('location.phone_label')}
                </p>
                <p className="font-display text-lg text-text-primary">
                  {t('location.phone_value')}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="flex items-center justify-center gap-2 font-body text-sm font-medium
                  tracking-widest uppercase px-6 py-3.5 rounded-full
                  bg-accent hover:bg-accent-dark text-text-inverse transition-colors"
              >
                <Phone size={16} />
                {t('location.call_btn')}
              </a>

              {ZALO_OA_ID && (
                <a
                  href={`https://zalo.me/${ZALO_OA_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 font-body text-sm font-medium
                    tracking-widest uppercase px-6 py-3.5 rounded-full border border-accent
                    text-accent hover:bg-accent hover:text-text-inverse transition-colors"
                >
                  {t('location.zalo_btn')}
                </a>
              )}

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 font-body text-sm
                  text-text-muted hover:text-text-primary transition-colors py-2"
              >
                <ExternalLink size={14} />
                {t('location.maps_btn')}
              </a>

              <Link
                href="/booking"
                className="flex items-center justify-center font-body text-sm font-medium
                  tracking-widest uppercase px-6 py-3.5 rounded-full
                  bg-bg-secondary hover:bg-bg-secondary/80 text-text-primary transition-colors border border-border"
              >
                {t('common.book_now')}
              </Link>
            </div>
          </div>

          {/* Map column */}
          <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
            <iframe
              src={GOOGLE_MAPS_EMBED}
              width="100%"
              height="420"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hanie Studio location"
            />
          </div>
        </div>

        {/* Studio photos */}
        <div className="mt-16">
          <h2 className="font-display text-2xl text-text-primary mb-6">
            {t('location.studio_photos')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <ImageWithSkeleton
                  src={null}
                  alt={`Studio ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
