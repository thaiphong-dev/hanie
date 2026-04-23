'use client';

import { Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
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
  const description = getLocaleText(service.desc_i18n, locale);

  const priceLabel =
    service.price_min === service.price_max
      ? formatPrice(service.price_min, locale)
      : t('price_range', {
          min: formatPrice(service.price_min, locale),
          max: formatPrice(service.price_max, locale),
        });

  return (
    <div className="bg-bg-primary border border-border rounded-2xl overflow-hidden group hover:shadow-lg hover:border-accent/30 transition-all duration-300 flex flex-col">
      {/* Accent top bar */}
      <div className="h-1 bg-gradient-to-r from-accent/60 to-accent w-full" />

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Name + price */}
        <div>
          <h3 className="font-display text-lg leading-snug text-text-primary mb-1.5">
            {name}
          </h3>
          <p className="font-body text-base font-semibold text-accent">{priceLabel}</p>
        </div>

        {/* Description */}
        {description && (
          <p className="font-body text-sm text-text-muted leading-relaxed line-clamp-3 flex-1">
            {description}
          </p>
        )}

        {/* Meta badges */}
        {(service.duration_min > 0 || service.warranty_days > 0) && (
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
        )}

        {/* CTA */}
        <Link
          href={`/booking?service=${service.id}`}
          className="inline-flex items-center gap-1.5 mt-auto font-body text-xs font-medium tracking-widest uppercase
            text-accent border border-accent hover:bg-accent hover:text-text-inverse
            px-4 py-2 rounded-full transition-colors duration-200 self-start"
        >
          {t('book_service')}
          <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}
