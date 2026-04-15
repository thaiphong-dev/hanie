'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CalendarDays, Clock, User } from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Link } from '@/lib/navigation';
import { formatDate, formatPrice } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database';
import type { Locale } from '@/lib/navigation';

type BookingRow = Database['public']['Tables']['bookings']['Row'];
type BookingStatus = BookingRow['status'];

interface BookingWithServices extends BookingRow {
  booking_services?: Array<{
    id: string;
    service_id: string;
    service_name: string;
    price: number;
  }>;
}

type TabKey = 'upcoming' | 'completed' | 'cancelled';

const TAB_STATUSES: Record<TabKey, BookingStatus[]> = {
  upcoming: ['pending', 'confirmed', 'in_progress'],
  completed: ['done'],
  cancelled: ['cancelled', 'no_show'],
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  done: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-600',
};

export default function HistoryPage() {
  return (
    <AuthGuard>
      <HistoryContent />
    </AuthGuard>
  );
}

function HistoryContent() {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [bookings, setBookings] = useState<BookingWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    setLoading(true);
    fetch('/api/v1/bookings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json: { data: BookingWithServices[] | null }) => {
        setBookings(json.data ?? []);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(bookingId: string) {
    if (!confirm(t('history.cancel_confirm'))) return;
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b)),
        );
      }
    } finally {
      setCancellingId(null);
    }
  }

  const tabKeys: TabKey[] = ['upcoming', 'completed', 'cancelled'];

  const filtered = bookings.filter((b) => TAB_STATUSES[activeTab].includes(b.status));

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="pt-24 pb-6 px-4 bg-bg-secondary">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl text-text-primary">{t('history.title')}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-bg-secondary/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex">
            {tabKeys.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 font-body text-sm py-3.5 border-b-2 transition-colors',
                  activeTab === tab
                    ? 'border-accent text-text-primary font-medium'
                    : 'border-transparent text-text-muted hover:text-text-primary',
                )}
              >
                {t(`history.tab_${tab}` as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display text-xl text-text-muted mb-2">{t('history.empty')}</p>
            <p className="font-body text-sm text-text-muted mb-8">{t('history.empty_desc')}</p>
            <Link
              href="/booking"
              className="inline-block font-body text-sm font-medium tracking-widest uppercase
                bg-accent hover:bg-accent-dark text-text-inverse
                px-8 py-4 rounded-full transition-colors"
            >
              {t('common.book_now')}
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((booking) => {
            const canCancel =
              activeTab === 'upcoming' &&
              ['pending', 'confirmed'].includes(booking.status);

            const serviceNames = booking.booking_services
              ?.map((s) => s.service_name)
              .join(', ');

            const totalPrice = booking.booking_services?.reduce(
              (sum, s) => sum + s.price,
              0,
            );

            return (
              <div
                key={booking.id}
                className="bg-bg-primary border border-border rounded-2xl p-5"
              >
                {/* Status badge */}
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={cn(
                      'font-body text-xs px-2.5 py-1 rounded-full font-medium',
                      STATUS_COLORS[booking.status],
                    )}
                  >
                    {t(`booking_status.${booking.status}` as Parameters<typeof t>[0])}
                  </span>
                  {totalPrice !== undefined && totalPrice > 0 && (
                    <span className="font-display text-sm text-accent">
                      {formatPrice(totalPrice, locale)}
                    </span>
                  )}
                </div>

                {/* Service name */}
                <p className="font-display text-base text-text-primary mb-2">
                  {serviceNames || booking.customer_name}
                </p>

                {/* Date + time */}
                <div className="flex items-center gap-4 text-text-muted font-body text-xs mb-4">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={12} />
                    {formatDate(new Date(booking.scheduled_at), locale)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {new Date(booking.scheduled_at).toLocaleTimeString(locale, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {booking.staff_id && (
                    <span className="flex items-center gap-1.5">
                      <User size={12} />
                      KTV
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {canCancel && (
                    <button
                      onClick={() => void handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="font-body text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      {cancellingId === booking.id
                        ? t('common.loading')
                        : t('history.cancel_btn')}
                    </button>
                  )}
                  <Link
                    href={`/booking?service=${booking.booking_services?.[0]?.service_id ?? ''}`}
                    className="font-body text-xs text-accent hover:text-accent-dark transition-colors ml-auto"
                  >
                    {t('history.rebook_btn')} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
