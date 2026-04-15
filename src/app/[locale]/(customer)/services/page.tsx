'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ServiceCard } from '@/components/customer/ServiceCard';
import { SkeletonServiceGrid } from '@/components/shared/SkeletonServiceGrid';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { getLocaleText, formatPrice } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database';
import type { Locale } from '@/lib/navigation';

type ServiceRow = Database['public']['Tables']['services']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface ServiceWithCategory extends ServiceRow {
  category?: { id: string; name: string; name_i18n: Record<string, string>; slug: string } | null;
}

interface CategoryGroup {
  categoryId: string;
  slug: string;
  name: string;
  services: ServiceWithCategory[];
  addons: ServiceWithCategory[];
}

export default function ServicesPage() {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const [loading, setLoading] = useState(true);
  const [allServices, setAllServices] = useState<ServiceWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          fetch('/api/v1/services?active=true'),
          fetch('/api/v1/categories'),
        ]);

        const [servicesJson, categoriesJson] = await Promise.all([
          servicesRes.json() as Promise<{ data: ServiceWithCategory[] | null }>,
          categoriesRes.json() as Promise<{ data: CategoryRow[] | null }>,
        ]);

        setAllServices(servicesJson.data ?? []);
        setCategories(categoriesJson.data ?? []);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  // Group services by category ID
  const categoryGroups: CategoryGroup[] = [];
  const categoryMap = new Map<string, CategoryGroup>();

  for (const svc of allServices) {
    const catId = svc.category_id;
    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        categoryId: catId,
        slug: svc.category?.slug ?? catId,
        name: svc.category ? getLocaleText(svc.category.name_i18n, locale) || svc.category.name : catId,
        services: [],
        addons: [],
      });
      categoryGroups.push(categoryMap.get(catId)!);
    }
    const group = categoryMap.get(catId)!;
    if (svc.service_type === 'addon') {
      group.addons.push(svc);
    } else {
      group.services.push(svc);
    }
  }

  // Sort groups by categories sort_order
  categoryGroups.sort((a, b) => {
    const catA = categories.find((c) => c.id === a.categoryId);
    const catB = categories.find((c) => c.id === b.categoryId);
    return (catA?.sort_order ?? 99) - (catB?.sort_order ?? 99);
  });

  const filteredGroups =
    activeFilter === 'all'
      ? categoryGroups
      : categoryGroups.filter((g) => g.categoryId === activeFilter);

  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <div className="bg-bg-secondary py-12 px-4 mb-0">
        <div className="mx-auto max-w-7xl text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-3">
            {t('home.services_eyebrow')}
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-text-primary">
            {t('home.services_title')}
          </h1>
          <p className="font-body text-sm text-text-muted mt-4 max-w-xl mx-auto">
            {t('home.services_desc')}
          </p>
        </div>
      </div>

      {/* Sticky filter tabs — built from DB categories */}
      <div className="sticky top-16 z-30 bg-bg-primary/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-none py-3">
            {/* "All" tab */}
            <button
              onClick={() => setActiveFilter('all')}
              className={cn(
                'flex-shrink-0 font-body text-sm px-5 py-2 rounded-full transition-colors duration-200',
                activeFilter === 'all'
                  ? 'bg-accent text-text-inverse'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary',
              )}
            >
              {t('common.all')}
            </button>

            {/* Category tabs from DB */}
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={cn(
                  'flex-shrink-0 font-body text-sm px-5 py-2 rounded-full transition-colors duration-200',
                  activeFilter === cat.id
                    ? 'bg-accent text-text-inverse'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary',
                )}
              >
                {getLocaleText(cat.name_i18n, locale) || cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 space-y-16">
        {loading && <SkeletonServiceGrid count={6} />}

        {!loading && filteredGroups.length === 0 && (
          <div className="text-center py-20">
            <p className="font-body text-text-muted">{t('common.error')}</p>
          </div>
        )}

        {!loading &&
          filteredGroups.map((group) => (
            <section key={group.categoryId}>
              <ScrollReveal className="mb-8">
                <h2 className="font-display text-2xl md:text-3xl text-text-primary border-b border-border pb-4">
                  {group.name}
                </h2>
              </ScrollReveal>

              {/* Main services grid */}
              {group.services.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {group.services.map((svc) => (
                    <ServiceCard key={svc.id} service={svc} locale={locale} />
                  ))}
                </div>
              )}

              {/* Addon table */}
              {group.addons.length > 0 && (
                <div className="bg-bg-secondary rounded-2xl overflow-hidden border border-border">
                  <div className="px-5 py-3 border-b border-border">
                    <p className="font-body text-xs tracking-widest uppercase text-text-muted">
                      Add-on
                    </p>
                  </div>
                  <table className="w-full">
                    <tbody>
                      {group.addons.map((addon, idx) => {
                        const addonName = getLocaleText(addon.name_i18n, locale) || addon.name;
                        const addonPrice =
                          addon.price_min === addon.price_max
                            ? formatPrice(addon.price_min, locale)
                            : `${formatPrice(addon.price_min, locale)} – ${formatPrice(addon.price_max, locale)}`;
                        return (
                          <tr
                            key={addon.id}
                            className={idx % 2 === 0 ? '' : 'bg-bg-primary/50'}
                          >
                            <td className="px-5 py-3 font-body text-sm text-text-primary">
                              {addonName}
                            </td>
                            <td className="px-5 py-3 font-body text-sm text-accent text-right">
                              {addonPrice}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
      </div>
    </div>
  );
}
