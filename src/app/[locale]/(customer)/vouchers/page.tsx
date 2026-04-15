'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Ticket, CalendarX, CheckCircle } from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Link } from '@/lib/navigation';
import { formatPrice, formatDate } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database';
import type { Locale } from '@/lib/navigation';

type VoucherRow = Database['public']['Tables']['vouchers']['Row'];
type CustomerVoucherStatus = Database['public']['Tables']['customer_vouchers']['Row']['status'];

interface CustomerVoucher {
  id: string;
  status: CustomerVoucherStatus;
  used_at: string | null;
  created_at: string;
  voucher: Pick<
    VoucherRow,
    'id' | 'code' | 'name' | 'name_i18n' | 'discount_type' | 'discount_value' | 'min_order_amount' | 'expires_at'
  > | null;
}

const STATUS_STYLES: Record<CustomerVoucherStatus, string> = {
  available: 'border-accent/40 bg-bg-primary',
  used: 'border-border bg-bg-secondary opacity-60',
  expired: 'border-border bg-bg-secondary opacity-60',
};

export default function VouchersPage() {
  return (
    <AuthGuard>
      <VouchersContent />
    </AuthGuard>
  );
}

function VouchersContent() {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const [vouchers, setVouchers] = useState<CustomerVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    fetch('/api/v1/vouchers/mine', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json: { data: CustomerVoucher[] | null }) => {
        setVouchers(json.data ?? []);
      })
      .catch(() => setVouchers([]))
      .finally(() => setLoading(false));
  }, []);

  function isExpiringSoon(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
  }

  function getDiscountLabel(voucher: CustomerVoucher['voucher']): string {
    if (!voucher) return '';
    if (voucher.discount_type === 'percent') {
      return t('vouchers.discount_pct', { pct: voucher.discount_value });
    }
    return t('vouchers.discount_fixed', { amount: formatPrice(voucher.discount_value, locale) });
  }

  function getVoucherName(voucher: CustomerVoucher['voucher']): string {
    if (!voucher) return '';
    const i18n = voucher.name_i18n as Record<string, string>;
    return i18n?.[locale] ?? voucher.name;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="pt-24 pb-6 px-4 bg-bg-secondary">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl text-text-primary">{t('vouchers.title')}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-36 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && vouchers.length === 0 && (
          <div className="text-center py-20">
            <Ticket size={48} className="mx-auto mb-4 text-text-muted opacity-40" />
            <p className="font-display text-xl text-text-muted mb-2">{t('vouchers.empty')}</p>
            <p className="font-body text-sm text-text-muted">{t('vouchers.empty_desc')}</p>
          </div>
        )}

        {/* Voucher cards */}
        {!loading && vouchers.length > 0 && (
          <div className="space-y-4">
            {vouchers.map((cv) => {
              const v = cv.voucher;
              const isAvailable = cv.status === 'available';
              const expiringSoon = isAvailable && isExpiringSoon(v?.expires_at ?? null);

              return (
                <div
                  key={cv.id}
                  className={cn(
                    'relative border rounded-2xl overflow-hidden transition-all',
                    STATUS_STYLES[cv.status],
                  )}
                >
                  {/* Dashed left accent */}
                  <div
                    className={cn(
                      'absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl',
                      isAvailable ? 'bg-accent' : 'bg-border',
                    )}
                  />

                  <div className="pl-6 pr-5 py-5">
                    {/* Top row: code + status badge */}
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono text-xs tracking-widest text-text-muted uppercase">
                        {v?.code}
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        {cv.status === 'used' && (
                          <span className="flex items-center gap-1 font-body text-xs text-text-muted">
                            <CheckCircle size={12} /> {t('vouchers.used')}
                          </span>
                        )}
                        {cv.status === 'expired' && (
                          <span className="flex items-center gap-1 font-body text-xs text-text-muted">
                            <CalendarX size={12} /> {t('vouchers.expired')}
                          </span>
                        )}
                        {expiringSoon && (
                          <span className="font-body text-xs text-red-500 font-medium animate-pulse">
                            {t('vouchers.expires_soon')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Voucher name */}
                    <p className="font-display text-lg text-text-primary mb-1">
                      {getVoucherName(v)}
                    </p>

                    {/* Discount label */}
                    <p className="font-body text-2xl font-bold text-accent mb-3">
                      {getDiscountLabel(v)}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-xs text-text-muted">
                      {v?.min_order_amount != null && v.min_order_amount > 0 && (
                        <span>
                          {t('vouchers.min_order', {
                            amount: formatPrice(v.min_order_amount, locale),
                          })}
                        </span>
                      )}
                      {v?.expires_at && (
                        <span>
                          {t('vouchers.expires', {
                            date: formatDate(new Date(v.expires_at), locale),
                          })}
                        </span>
                      )}
                    </div>

                    {/* CTA — only for available vouchers */}
                    {isAvailable && (
                      <div className="mt-4">
                        <Link
                          href="/booking"
                          className="inline-block font-body text-xs font-medium tracking-widest uppercase
                            text-accent hover:text-accent-dark transition-colors"
                        >
                          {t('vouchers.use_now')}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
