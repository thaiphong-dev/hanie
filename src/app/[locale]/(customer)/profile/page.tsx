'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  User,
  Crown,
  LogOut,
  Clock,
  Tag,
  CalendarDays,
  Ticket,
  CalendarX,
  CheckCircle,
  Receipt,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Link } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDate, getLocaleText } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database';
import type { Locale } from '@/lib/navigation';

// ── Types ─────────────────────────────────────────────────────────────────────

type UserRow = Database['public']['Tables']['users']['Row'];
type ProfileData = Pick<
  UserRow,
  'id' | 'full_name' | 'phone' | 'avatar_url' | 'member_tier' | 'total_spent' | 'loyalty_points'
>;

type BookingRow = Database['public']['Tables']['bookings']['Row'];
type BookingStatus = BookingRow['status'];
interface BookingWithServices extends BookingRow {
  booking_services?: Array<{
    booking_category_id: string;
    price: number;
    quantity: number;
    booking_categories: {
      name: string;
      name_i18n: Record<string, string>;
      slug: string;
    };
  }>;
}

type VoucherRow = Database['public']['Tables']['vouchers']['Row'];
type CustomerVoucherStatus = Database['public']['Tables']['customer_vouchers']['Row']['status'];
interface CustomerVoucher {
  id: string;
  status: CustomerVoucherStatus;
  used_at: string | null;
  created_at: string;
  voucher: Pick<
    VoucherRow,
    | 'id'
    | 'code'
    | 'name'
    | 'name_i18n'
    | 'discount_type'
    | 'discount_value'
    | 'min_order_amount'
    | 'expires_at'
  > | null;
}

// ── Payment History Types ─────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  service_name: string;
  price: number;
  quantity: number;
  unit: string;
}

interface CustomerOrder {
  id: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  method: 'cash' | 'transfer' | 'card';
  voucher_code: string | null;
  created_at: string;
  order_items: OrderItem[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

type TabKey = 'history' | 'payments' | 'vouchers' | 'account';

type BookingTabKey = 'upcoming' | 'completed' | 'cancelled';
const TAB_STATUSES: Record<BookingTabKey, BookingStatus[]> = {
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

const VOUCHER_STATUS_STYLES: Record<CustomerVoucherStatus, string> = {
  available: 'border-accent/40 bg-bg-primary',
  used: 'border-border bg-bg-secondary opacity-60',
  expired: 'border-border bg-bg-secondary opacity-60',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

function ProfileContent() {
  const t = useTranslations();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('history');

  const TABS: Array<{ key: TabKey; label: string; icon: React.ElementType }> = [
    { key: 'history', label: t('history.title'), icon: Clock },
    { key: 'payments', label: t('payments.title'), icon: Receipt },
    { key: 'vouchers', label: t('vouchers.title'), icon: Tag },
    { key: 'account', label: t('profile.title'), icon: User },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="pt-24 pb-6 px-4 bg-bg-secondary">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <User size={22} className="text-accent" />
            </div>
            <div>
              <p className="font-display text-xl text-text-primary">
                {user?.full_name ?? ''}
              </p>
              <p className="font-body text-sm text-text-muted">{user?.phone ?? ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-bg-secondary/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 font-body text-sm py-3.5 border-b-2 transition-colors',
                  activeTab === key
                    ? 'border-accent text-text-primary font-medium'
                    : 'border-transparent text-text-muted hover:text-text-primary',
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'vouchers' && <VouchersTab />}
        {activeTab === 'account' && <AccountTab />}
      </div>
    </div>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────

function HistoryTab() {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const [activeTab, setActiveTab] = useState<BookingTabKey>('upcoming');
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
      .then((json: { data: { bookings: BookingWithServices[] } | null }) => {
        setBookings(json.data?.bookings ?? []);
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  const bookingTabKeys: BookingTabKey[] = ['upcoming', 'completed', 'cancelled'];
  const filtered = bookings.filter((b) => TAB_STATUSES[activeTab].includes(b.status));

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex border-b border-border mb-6">
        {bookingTabKeys.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 font-body text-xs py-2.5 border-b-2 transition-colors',
              activeTab === tab
                ? 'border-accent text-text-primary font-medium'
                : 'border-transparent text-text-muted hover:text-text-primary',
            )}
          >
            {t(`history.tab_${tab}` as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>

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
              bg-accent hover:bg-accent-dark text-text-inverse px-8 py-4 rounded-full transition-colors"
          >
            {t('common.book_now')}
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((booking) => {
          const canCancel =
            activeTab === 'upcoming' && ['pending', 'confirmed'].includes(booking.status);
          const serviceNames = booking.booking_services
            ?.map((s) => getLocaleText(s.booking_categories.name_i18n, locale))
            .join(', ');
          const totalPrice = booking.booking_services?.reduce((sum, s) => sum + (s.price * (s.quantity || 1)), 0);

          return (
            <div key={booking.id} className="bg-bg-primary border border-border rounded-2xl p-5">
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

              <p className="font-display text-base text-text-primary mb-2">
                {serviceNames || booking.customer_name}
              </p>

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
              </div>

              <div className="flex gap-3">
                {canCancel && (
                  <button
                    onClick={() => void handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="font-body text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    {cancellingId === booking.id ? t('common.loading') : t('history.cancel_btn')}
                  </button>
                )}
                <Link
                  href={`/booking?category=${booking.booking_services?.[0]?.booking_categories.slug ?? ''}`}
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
  );
}

// ── Payments Tab ──────────────────────────────────────────────────────────────

function OrderDetailModal({
  order,
  onClose,
}: {
  order: CustomerOrder;
  onClose: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const METHOD_LABEL: Record<CustomerOrder['method'], string> = {
    cash: t('payments.method_cash'),
    transfer: t('payments.method_transfer'),
    card: t('payments.method_card'),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-bg-primary rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="font-display text-base text-text-primary">{t('payments.detail_title')}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-bg-secondary rounded-lg text-text-muted transition-colors"
            aria-label={t('payments.close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Meta */}
          <div className="flex items-center justify-between text-xs font-body text-text-muted">
            <span>
              {new Date(order.created_at).toLocaleDateString(locale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-md font-medium uppercase text-[10px]',
                order.method === 'cash'
                  ? 'bg-orange-100 text-orange-700'
                  : order.method === 'transfer'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700',
              )}
            >
              {METHOD_LABEL[order.method]}
            </span>
          </div>

          {/* Items */}
          <div className="border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-bg-secondary/50 border-b border-border">
                  <th className="px-4 py-2.5 text-left font-body text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    {t('payments.items_label')}
                  </th>
                  <th className="px-3 py-2.5 text-center font-body text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    {t('payments.qty_label')}
                  </th>
                  <th className="px-4 py-2.5 text-right font-body text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    {t('payments.amount_label')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.order_items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-body text-sm text-text-primary">{item.service_name}</td>
                    <td className="px-3 py-3 text-center font-body text-sm text-text-secondary">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-body text-sm font-semibold text-text-primary">
                      {formatPrice(item.price * item.quantity, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex justify-between font-body text-sm text-text-secondary">
              <span>{t('payments.subtotal')}</span>
              <span>{formatPrice(order.subtotal, locale)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between font-body text-sm text-green-600">
                <span>{t('payments.discount')}</span>
                <span>-{formatPrice(order.discount_amount, locale)}</span>
              </div>
            )}
            {order.voucher_code && (
              <p className="font-body text-xs text-text-muted">
                {t('payments.voucher_used', { code: order.voucher_code })}
              </p>
            )}
            <div className="flex justify-between font-display text-base text-text-primary border-t border-border pt-2">
              <span>{t('payments.total')}</span>
              <span className="text-accent">{formatPrice(order.total, locale)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsTab() {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const limit = 20;

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ page: page.toString() });
    fetch(`/api/v1/orders/mine?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(
        (json: {
          data: CustomerOrder[] | null;
          meta: { total: number } | null;
        }) => {
          setOrders(Array.isArray(json.data) ? json.data : []);
          setTotalCount(json.meta?.total ?? 0);
        },
      )
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [page]);

  const METHOD_LABEL: Record<CustomerOrder['method'], string> = {
    cash: t('payments.method_cash'),
    transfer: t('payments.method_transfer'),
    card: t('payments.method_card'),
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <Receipt size={48} className="mx-auto mb-4 text-text-muted opacity-40" />
        <p className="font-display text-xl text-text-muted mb-2">{t('payments.empty')}</p>
        <p className="font-body text-sm text-text-muted">{t('payments.empty_desc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const serviceNames = order.order_items.map((i) => i.service_name).join(', ');
        return (
          <button
            key={order.id}
            onClick={() => setSelectedOrder(order)}
            className="w-full text-left bg-bg-primary border border-border rounded-2xl p-5 hover:border-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="font-body text-xs text-text-muted">
                {new Date(order.created_at).toLocaleDateString(locale, {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
                {' '}
                {new Date(order.created_at).toLocaleTimeString(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-md text-[10px] font-medium uppercase shrink-0',
                  order.method === 'cash'
                    ? 'bg-orange-100 text-orange-700'
                    : order.method === 'transfer'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700',
                )}
              >
                {METHOD_LABEL[order.method]}
              </span>
            </div>
            <p className="font-body text-sm text-text-primary truncate mb-3">{serviceNames || '—'}</p>
            <div className="flex items-center justify-between">
              <p className="font-body text-xs text-text-muted">
                {order.order_items.length} {order.order_items.length === 1 ? 'dịch vụ' : 'dịch vụ'}
                {order.discount_amount > 0 && (
                  <span className="ml-2 text-green-600">
                    -{formatPrice(order.discount_amount, locale)}
                  </span>
                )}
              </p>
              <p className="font-display text-base text-accent">
                {formatPrice(order.total, locale)}
              </p>
            </div>
          </button>
        );
      })}

      {/* Pagination */}
      {totalCount > limit && (
        <div className="flex items-center justify-between pt-2">
          <p className="font-body text-xs text-text-muted">
            {orders.length}/{totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 border border-border rounded-lg disabled:opacity-30 transition-opacity"
              aria-label="previous"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-body text-sm font-medium">{page}</span>
            <button
              disabled={page * limit >= totalCount}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 border border-border rounded-lg disabled:opacity-30 transition-opacity"
              aria-label="next"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

// ── Vouchers Tab ──────────────────────────────────────────────────────────────

function VouchersTab() {
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
        setVouchers(Array.isArray(json.data) ? json.data : []);
      })
      .catch(() => setVouchers([]))
      .finally(() => setLoading(false));
  }, []);

  function isExpiringSoon(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
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

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-36 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="text-center py-20">
        <Ticket size={48} className="mx-auto mb-4 text-text-muted opacity-40" />
        <p className="font-display text-xl text-text-muted mb-2">{t('vouchers.empty')}</p>
        <p className="font-body text-sm text-text-muted">{t('vouchers.empty_desc')}</p>
      </div>
    );
  }

  return (
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
              VOUCHER_STATUS_STYLES[cv.status],
            )}
          >
            <div
              className={cn(
                'absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl',
                isAvailable ? 'bg-accent' : 'bg-border',
              )}
            />
            <div className="pl-6 pr-5 py-5">
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

              <p className="font-display text-lg text-text-primary mb-1">{getVoucherName(v)}</p>
              <p className="font-body text-2xl font-bold text-accent mb-3">
                {getDiscountLabel(v)}
              </p>

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
  );
}

// ── Account Tab ───────────────────────────────────────────────────────────────

function AccountTab() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [nameValue, setNameValue] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user?.full_name) setNameValue(user.full_name);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setProfile({
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: null,
      member_tier: 'new',
      total_spent: 0,
      loyalty_points: 0,
    });

    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    fetch('/api/v1/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json: { data: ProfileData | null } | null) => {
        if (json?.data) {
          setProfile(json.data);
          setNameValue(json.data.full_name);
        }
      })
      .catch(() => {
        // Not critical — profile already bootstrapped from auth state
      });
  }, [user]);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!nameValue.trim()) return;
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    setNameSaving(true);
    setNameError('');
    setNameSuccess(false);

    try {
      const res = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: nameValue.trim() }),
      });
      const json = (await res.json()) as {
        data: ProfileData | null;
        error: { message: string } | null;
      };
      if (!res.ok || json.error) {
        setNameError(json.error?.message ?? t('common.error'));
      } else {
        setNameSuccess(true);
        if (json.data) {
          setProfile(json.data);
          setNameValue(json.data.full_name);
        }
        sessionStorage.setItem('user_name', nameValue.trim());
      }
    } catch {
      setNameError(t('common.error'));
    } finally {
      setNameSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    setPwSaving(true);
    setPwError('');
    setPwSuccess(false);

    try {
      const res = await fetch('/api/v1/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      const json = (await res.json()) as { data: unknown; error: { message: string } | null };
      if (!res.ok || json.error) {
        setPwError(json.error?.message ?? t('common.error'));
      } else {
        setPwSuccess(true);
        setOldPassword('');
        setNewPassword('');
      }
    } catch {
      setPwError(t('common.error'));
    } finally {
      setPwSaving(false);
    }
  }

  function handleLogout() {
    if (!confirm(t('profile.logout_confirm'))) return;
    void logout();
  }

  const tierLabel: Record<string, string> = {
    new: t('profile.tier_new'),
    regular: t('profile.tier_regular'),
    vip: t('profile.tier_vip'),
  };

  const tier = profile?.member_tier ?? 'new';

  return (
    <div className="space-y-8">
      {/* Member tier card */}
      {user?.role === 'customer' && (
        <div className="bg-bg-secondary border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Crown size={16} className="text-accent" />
            <p className="font-body text-sm font-medium text-text-primary uppercase tracking-wider">
              {t('profile.member_tier')}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'font-display text-base px-3 py-1 rounded-full',
                tier === 'vip'
                  ? 'bg-amber-100 text-amber-700'
                  : tier === 'regular'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600',
              )}
            >
              {tierLabel[tier] ?? tier}
            </span>
            <div className="text-right space-y-1">
              <div>
                <p className="font-body text-xs text-text-muted">{t('profile.total_spent')}</p>
                <p className="font-display text-base text-accent">
                  {formatPrice(profile?.total_spent ?? 0, locale)}
                </p>
              </div>
              <div>
                <p className="font-body text-xs text-text-muted">{t('loyalty.points_label')}</p>
                <p className="font-display text-base text-accent">
                  ⭐ {t('loyalty.points', { count: profile?.loyalty_points ?? 0 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update name */}
      <section>
        <h2 className="font-display text-lg text-text-primary mb-4">{t('profile.change_name')}</h2>
        <form onSubmit={(e) => void handleSaveName(e)} className="space-y-3">
          <div>
            <label htmlFor="full_name" className="block font-body text-sm text-text-muted mb-1">
              {t('profile.name_label')}
            </label>
            <input
              id="full_name"
              type="text"
              value={nameValue}
              onChange={(e) => {
                setNameValue(e.target.value);
                setNameSuccess(false);
              }}
              className="w-full font-body text-sm bg-bg-secondary border border-border rounded-xl
                px-4 py-3 text-text-primary placeholder-text-muted
                focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          {nameError && <p className="font-body text-xs text-red-500">{nameError}</p>}
          {nameSuccess && <p className="font-body text-xs text-green-600">{t('common.success')}</p>}
          <button
            type="submit"
            disabled={nameSaving || !nameValue.trim()}
            className="font-body text-sm font-medium tracking-widest uppercase
              bg-accent hover:bg-accent-dark disabled:opacity-50
              text-text-inverse px-6 py-3 rounded-full transition-colors"
          >
            {nameSaving ? t('common.loading') : t('profile.save_changes')}
          </button>
        </form>
      </section>

      {/* Change password */}
      <section>
        <h2 className="font-display text-lg text-text-primary mb-4">
          {t('profile.change_password')}
        </h2>
        <form onSubmit={(e) => void handleChangePassword(e)} className="space-y-3">
          <div>
            <label htmlFor="old_password" className="block font-body text-sm text-text-muted mb-1">
              {t('profile.old_password')}
            </label>
            <input
              id="old_password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full font-body text-sm bg-bg-secondary border border-border rounded-xl
                px-4 py-3 text-text-primary placeholder-text-muted
                focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label htmlFor="new_password" className="block font-body text-sm text-text-muted mb-1">
              {t('profile.new_password')}
            </label>
            <input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full font-body text-sm bg-bg-secondary border border-border rounded-xl
                px-4 py-3 text-text-primary placeholder-text-muted
                focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          {pwError && <p className="font-body text-xs text-red-500">{pwError}</p>}
          {pwSuccess && <p className="font-body text-xs text-green-600">{t('common.success')}</p>}
          <button
            type="submit"
            disabled={pwSaving || !oldPassword || !newPassword}
            className="font-body text-sm font-medium tracking-widest uppercase
              bg-accent hover:bg-accent-dark disabled:opacity-50
              text-text-inverse px-6 py-3 rounded-full transition-colors"
          >
            {pwSaving ? t('common.loading') : t('profile.save_changes')}
          </button>
        </form>
      </section>

      {/* Logout */}
      <section className="pt-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 font-body text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          <LogOut size={16} />
          {t('profile.logout')}
        </button>
      </section>
    </div>
  );
}
