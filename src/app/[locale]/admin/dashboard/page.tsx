'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

interface BookingItem {
  id: string;
  status: string;
  scheduled_at: string;
  end_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  staff_id: string | null;
  staff: { id: string; full_name: string } | null;
}

interface LeaveRequest {
  id: string;
  date: string;
  reason: string;
  staff: { id: string; full_name: string; phone: string } | null;
}

interface DashboardData {
  revenue_today: number;
  revenue_yesterday: number;
  revenue_change_pct: number | null;
  bookings_today: BookingItem[];
  bookings_today_count: number;
  bookings_pending: number;
  new_customers_month: number;
  pending_leaves: LeaveRequest[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-purple-100 text-purple-800';
    case 'done': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

// ── MetricCard ────────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  trend,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | null;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className={cn(
      'rounded-2xl p-5 border',
      accent ? 'bg-accent text-bg-dark border-accent' : 'bg-white border-bg-secondary',
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('font-body text-xs mb-1', accent ? 'text-bg-dark/70' : 'text-text-muted')}>{label}</p>
          <p className={cn('font-display text-2xl font-bold', accent ? 'text-bg-dark' : 'text-text-primary')}>{value}</p>
          {sub && (
            <p className={cn('font-body text-xs mt-1 flex items-center gap-1', accent ? 'text-bg-dark/70' : 'text-text-muted')}>
              {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
              {sub}
            </p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', accent ? 'bg-bg-dark/20' : 'bg-bg-secondary')}>
          <Icon className={cn('w-5 h-5', accent ? 'text-bg-dark' : 'text-text-secondary')} />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 border border-bg-secondary bg-white animate-pulse">
      <div className="h-3 w-24 bg-bg-secondary rounded mb-3" />
      <div className="h-7 w-32 bg-bg-secondary rounded mb-2" />
      <div className="h-3 w-20 bg-bg-secondary rounded" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const t = useTranslations('admin');
  const tStatus = useTranslations('booking_status');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/dashboard');
      const json = await res.json() as { data: DashboardData | null; error: { message: string } | null };
      if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Error');
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  async function handleLeaveAction(id: string, status: 'approved' | 'rejected') {
    const note = status === 'rejected' ? rejectNote : undefined;
    setApproving(status === 'approved' ? id : null);
    setRejecting(status === 'rejected' ? id : null);
    try {
      const res = await fetch(`/api/v1/admin/leave-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, review_note: note }),
      });
      const json = await res.json() as { data: unknown; error: { message: string } | null };
      if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Error');
      void fetchDashboard();
      setRejectNote('');
    } catch {
      // ignore
    } finally {
      setApproving(null);
      setRejecting(null);
    }
  }

  const changePct = data?.revenue_change_pct;
  const changeTrend = changePct == null ? undefined : changePct >= 0 ? 'up' : 'down';

  return (
    <div className="space-y-6 ">
      <h2 className="font-display text-xl text-text-primary">{t('dashboard')}</h2>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard
              label={t('today_revenue')}
              value={formatVND(data?.revenue_today ?? 0)}
              sub={changePct != null ? `${changePct > 0 ? '+' : ''}${changePct}% ${t('yesterday_revenue').toLowerCase()}` : undefined}
              trend={changeTrend}
              icon={TrendingUp}
              accent
            />
            <MetricCard
              label={t('bookings_today')}
              value={String(data?.bookings_today_count ?? 0)}
              sub={`${data?.bookings_pending ?? 0} ${t('pending_bookings').toLowerCase()}`}
              icon={CalendarDays}
            />
            <MetricCard
              label={t('new_customers_month')}
              value={String(data?.new_customers_month ?? 0)}
              icon={Users}
            />
            <MetricCard
              label={t('pending_approval')}
              value={String(data?.pending_leaves?.length ?? 0)}
              icon={AlertCircle}
            />
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 font-body text-sm">{error}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Timeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-bg-secondary p-5">
          <h3 className="font-display text-base text-text-primary mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-muted" />
            {t('bookings_today')} — {format(new Date(), 'dd/MM/yyyy')}
          </h3>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-bg-secondary animate-pulse" />
              ))}
            </div>
          ) : (data?.bookings_today ?? []).length === 0 ? (
            <div className="flex items-center justify-center h-32 text-text-muted font-body text-sm">
              {t('no_bookings_today')}
            </div>
          ) : (
            <div className="space-y-2">
              {(data?.bookings_today ?? []).map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-secondary transition-colors">
                  <div className="w-16 shrink-0 text-center">
                    <p className="font-body text-xs text-text-muted">{format(new Date(b.scheduled_at), 'HH:mm')}</p>
                    <p className="font-body text-xs text-text-muted">→ {format(new Date(b.end_at), 'HH:mm')}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-text-primary font-medium truncate">
                      {b.customer_name ?? 'Khách'}
                    </p>
                    <p className="font-body text-xs text-text-muted truncate">
                      {b.staff?.full_name ?? '—'}
                    </p>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-full font-body text-xs', getStatusColor(b.status))}>
                    {tStatus(b.status as Parameters<typeof tStatus>[0])}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave Requests Panel */}
        <div className="bg-white rounded-2xl border border-bg-secondary p-5">
          <h3 className="font-display text-base text-text-primary mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-text-muted" />
            {t('leave_request_title')}
          </h3>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-bg-secondary animate-pulse" />
              ))}
            </div>
          ) : (data?.pending_leaves ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <p className="font-body text-sm text-text-muted">{t('no_leave_requests')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.pending_leaves ?? []).map((lr) => (
                <div key={lr.id} className="border border-bg-secondary rounded-xl p-3 space-y-2">
                  <div>
                    <p className="font-body text-sm font-medium text-text-primary">
                      {lr.staff?.full_name ?? '—'}
                    </p>
                    <p className="font-body text-xs text-text-muted">
                      {t('leave_date', { date: format(new Date(lr.date), 'dd/MM/yyyy') })}
                    </p>
                    <p className="font-body text-xs text-text-secondary mt-1 line-clamp-2">{lr.reason}</p>
                  </div>

                  {rejecting === lr.id && (
                    <input
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder={t('reject_note_placeholder')}
                      className="w-full border border-bg-secondary rounded-lg px-3 py-1.5 font-body text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => void handleLeaveAction(lr.id, 'approved')}
                      disabled={approving === lr.id}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white font-body text-xs hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {t('approve')}
                    </button>
                    <button
                      onClick={() => {
                        if (rejecting === lr.id) {
                          void handleLeaveAction(lr.id, 'rejected');
                        } else {
                          setRejecting(lr.id);
                          setApproving(null);
                        }
                      }}
                      disabled={rejecting === lr.id && !rejectNote && approving !== null}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white font-body text-xs hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      {t('reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
