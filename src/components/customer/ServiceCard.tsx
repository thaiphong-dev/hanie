'use client';

import { Clock, ShieldCheck } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { ImageWithSkeleton } from '@/components/shared/ImageWithSkeleton';
import { getLocaleText, formatPrice } from '@/lib/i18n-helpers';
import type { Database } from '@/types/database';
import type { Locale } from '@/lib/navigation';

type ServiceRow = Database['public']['Tables']['services']['Row'];

interface ServiceWithCategory extends ServiceRow {
  category?: {
    id: string;
    name: string;
    name_i18n: Record<string, string>;
    slug: string;
  } | null;
}

interface ServiceCardProps {
  service: ServiceWithCategory;
  locale: Locale;
}

export function ServiceCard({ service, locale }: ServiceCardProps) {
  const t = useTranslations('services');

  const name = getLocaleText(service.name_i18n, locale) || service.name;
  const priceLabel =
    service.price_min === service.price_max
      ? formatPrice(service.price_min, locale)
      : t('price_range', {
          min: formatPrice(service.price_min, locale),
          max: formatPrice(service.price_max, locale),
        });

  return (
    <div className="bg-bg-primary border border-border rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3]">
        <ImageWithSkeleton
          src={service.image_url ?? null}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-5 space-y-2">
        <h3 className="font-display text-lg leading-snug text-text-primary">{name}</h3>

        <p className="font-body text-base font-semibold text-accent">{priceLabel}</p>

        <div className="flex items-center gap-4 text-text-muted">
          {service.duration_min > 0 && (
            <span className="flex items-center gap-1.5 font-body text-xs">
              <Clock size={12} strokeWidth={1.5} />
              {t('duration', { minutes: service.duration_min })}
            </span>
          )}
          {service.warranty_days > 0 && (
            <span className="flex items-center gap-1.5 font-body text-xs">
              <ShieldCheck size={12} strokeWidth={1.5} />
              {t('warranty', { days: service.warranty_days })}
            </span>
          )}
        </div>

        <Link
          href={`/booking?service=${service.id}`}
          className="inline-block mt-3 font-body text-xs font-medium tracking-widest uppercase
            text-accent border border-accent hover:bg-accent hover:text-text-inverse
            px-4 py-2 rounded-full transition-colors duration-200"
        >
          {t('book_service')}
        </Link>
      </div>
    </div>
  );
}
