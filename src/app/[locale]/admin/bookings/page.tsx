'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import {
  format, addDays, startOfWeek, isSameDay, parseISO,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Check, PlayCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StaffUser { id: string; full_name: string; }

interface BookingService { service_name: string | null; price: number; }

interface Booking {
  id: string;
  status: string;
  scheduled_at: string;
  end_at: string;
  slot_count: number;
  staff_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  notes: string | null;
  internal_notes: string | null;
  staff: StaffUser | null;
  booking_services: BookingService[];
}

// Staff color palette (cycling)
const STAFF_COLORS = [
  'bg-pink-100 border-pink-300 text-pink-900',
  'bg-blue-100 border-blue-300 text-blue-900',
  'bg-violet-100 border-violet-300 text-violet-900',
  'bg-amber-100 border-amber-300 text-amber-900',
  'bg-teal-100 border-teal-300 text-teal-900',
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08–19
const SLOT_HEIGHT = 60; // px per hour

function getStatusLabel(status: string, tStatus: (k: string) => string) {
  try { return tStatus(status); } catch { return status; }
}

function getStatusBtnColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-blue-500 hover:bg-blue-600';
    case 'confirmed': return 'bg-purple-500 hover:bg-purple-600';
    case 'in_progress': return 'bg-green-500 hover:bg-green-600';
    default: return 'bg-gray-400';
  }
}

function nextStatus(status: string): string | null {
  switch (status) {
    case 'pending': return 'confirmed';
    case 'confirmed': return 'in_progress';
    case 'in_progress': return 'done';
    default: return null;
  }
}

function nextStatusLabel(status: string, t: (k: string) => string) {
  switch (status) {
    case 'pending': return t('booking_action_confirm');
    case 'confirmed': return t('booking_action_start');
    case 'in_progress': return t('booking_action_done');
    default: return '';
  }
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

// ── BookingCard placed in calendar grid ──────────────────────────────────────

function BookingCard({ booking, colorClass, onClick }: {
  booking: Booking;
  colorClass: string;
  onClick: () => void;
}) {
  const start = parseISO(booking.scheduled_at);
  const end = parseISO(booking.end_at);
  const startHour = start.getHours() + start.getMinutes() / 60;
  const durationH = (end.getTime() - start.getTime()) / 3_600_000;
  const top = (startHour - 8) * SLOT_HEIGHT;
  const height = Math.max(durationH * SLOT_HEIGHT - 2, 20);

  return (
    <button
      onClick={onClick}
      style={{ top, height }}
      className={cn(
        'absolute inset-x-0.5 rounded-lg border px-2 py-1 text-left overflow-hidden cursor-pointer hover:shadow-md transition-shadow',
        colorClass,
      )}
    >
      <p className="font-body text-[11px] font-semibold leading-tight truncate">{booking.customer_name ?? 'Khách'}</p>
      <p className="font-body text-[10px] leading-tight truncate opacity-80">
        {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
      </p>
      {booking.staff && (
        <p className="font-body text-[10px] leading-tight truncate opacity-70">{booking.staff.full_name}</p>
      )}
    </button>
  );
}

// ── Detail Sheet ──────────────────────────────────────────────────────────────

function BookingSheet({ booking, onClose, onStatusChange }: {
  booking: Booking;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const t = useTranslations('admin');
  const tStatus = useTranslations('booking_status');
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelNote, setCancelNote] = useState('');

  const ns = nextStatus(booking.status);
  const total = booking.booking_services.reduce((s, bs) => s + bs.price, 0);

  async function doAction(status: string, note?: string) {
    setLoading(true);
    await onStatusChange(booking.id, status);
    setLoading(false);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-secondary">
          <h2 className="font-display text-base text-text-primary">{t('booking_detail')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-3 py-1 rounded-full font-body text-xs font-medium',
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
              booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
              booking.status === 'done' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800',
            )}>
              {getStatusLabel(booking.status, (k) => tStatus(k as Parameters<typeof tStatus>[0]))}
            </span>
          </div>

          {/* Customer */}
          <div className="bg-bg-secondary rounded-xl p-4 space-y-1">
            <p className="font-body text-xs text-text-muted">Khách hàng</p>
            <p className="font-body text-sm font-semibold text-text-primary">{booking.customer_name ?? 'Khách walk-in'}</p>
            <p className="font-body text-sm text-text-secondary">{booking.customer_phone ?? '—'}</p>
          </div>

          {/* Time + Staff */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-secondary rounded-xl p-4">
              <p className="font-body text-xs text-text-muted mb-1">Thời gian</p>
              <p className="font-body text-sm text-text-primary">
                {format(parseISO(booking.scheduled_at), 'HH:mm')} – {format(parseISO(booking.end_at), 'HH:mm')}
              </p>
              <p className="font-body text-xs text-text-muted">{format(parseISO(booking.scheduled_at), 'dd/MM/yyyy')}</p>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4">
              <p className="font-body text-xs text-text-muted mb-1">Kỹ thuật viên</p>
              <p className="font-body text-sm text-text-primary">{booking.staff?.full_name ?? 'Chưa gán'}</p>
            </div>
          </div>

          {/* Services */}
          {booking.booking_services.length > 0 && (
            <div>
              <p className="font-body text-xs text-text-muted mb-2">Dịch vụ</p>
              <div className="space-y-1">
                {booking.booking_services.map((bs, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="font-body text-sm text-text-primary">{bs.service_name ?? 'Dịch vụ'}</span>
                    <span className="font-body text-sm text-text-secondary">{formatVND(bs.price)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-bg-secondary">
                  <span className="font-body text-sm font-semibold text-text-primary">Tổng</span>
                  <span className="font-body text-sm font-semibold text-accent">{formatVND(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="bg-bg-secondary rounded-xl p-3">
              <p className="font-body text-xs text-text-muted mb-1">Ghi chú khách</p>
              <p className="font-body text-sm text-text-primary">{booking.notes}</p>
            </div>
          )}

          {/* Cancel form */}
          {cancelMode && (
            <div className="space-y-2">
              <input
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                placeholder={t('cancel_reason_placeholder')}
                className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        {!['done', 'cancelled', 'no_show'].includes(booking.status) && (
          <div className="p-4 border-t border-bg-secondary space-y-2">
            {ns && (
              <button
                onClick={() => void doAction(ns)}
                disabled={loading}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-body text-sm font-medium transition-colors disabled:opacity-50',
                  getStatusBtnColor(booking.status),
                )}
              >
                {booking.status === 'pending' && <Check className="w-4 h-4" />}
                {booking.status === 'confirmed' && <PlayCircle className="w-4 h-4" />}
                {booking.status === 'in_progress' && <CheckCircle className="w-4 h-4" />}
                {nextStatusLabel(booking.status, (k) => t(k as Parameters<typeof t>[0]))}
              </button>
            )}

            {cancelMode ? (
              <div className="flex gap-2">
                <button
                  onClick={() => { setCancelMode(false); setCancelNote(''); }}
                  className="flex-1 py-2.5 rounded-xl border border-bg-secondary font-body text-sm text-text-secondary"
                >
                  Huỷ bỏ
                </button>
                <button
                  onClick={() => void doAction('cancelled', cancelNote)}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-body text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  Xác nhận huỷ
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCancelMode(true)}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-body text-sm hover:bg-red-50 transition-colors"
              >
                {t('booking_action_cancel')}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [bookingsByDate, setBookingsByDate] = useState<Record<string, Booking[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [filterStaffId, setFilterStaffId] = useState<string>('');

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Assign colors by staff
  const staffColorMap = new Map<string, string>();
  staffList.forEach((s, i) => staffColorMap.set(s.id, STAFF_COLORS[i % STAFF_COLORS.length]!));

  const fetchWeek = useCallback(async () => {
    setLoading(true);
    const byDate: Record<string, Booking[]> = {};
    await Promise.all(
      weekDays.map(async (day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const params = new URLSearchParams({ date: dateStr });
        if (filterStaffId) params.set('staff_id', filterStaffId);
        const res = await fetch(`/api/v1/admin/bookings?${params}`);
        const json = await res.json() as { data: Booking[] };
        byDate[dateStr] = json.data ?? [];
      }),
    );
    setBookingsByDate(byDate);
    setLoading(false);
  }, [weekStart, filterStaffId]);

  useEffect(() => { void fetchWeek(); }, [fetchWeek]);

  useEffect(() => {
    void fetch('/api/v1/staff').then((r) => r.json()).then((j: { data: StaffUser[] }) => setStaffList(j.data ?? []));
  }, []);

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/v1/admin/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    void fetchWeek();
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <button onClick={() => setWeekStart((d) => addDays(d, -7))} className="p-2 hover:bg-bg-secondary rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <span className="font-body text-sm text-text-primary min-w-[160px] text-center">
            {format(weekStart, 'dd/MM')} – {format(addDays(weekStart, 6), 'dd/MM/yyyy')}
          </span>
          <button onClick={() => setWeekStart((d) => addDays(d, 7))} className="p-2 hover:bg-bg-secondary rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <button
          onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
          className="px-3 py-1.5 rounded-lg border border-bg-secondary font-body text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
        >
          {t('today')}
        </button>

        <select
          value={filterStaffId}
          onChange={(e) => setFilterStaffId(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-bg-secondary font-body text-sm text-text-primary bg-white"
        >
          <option value="">{t('all_staff')}</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>{s.full_name}</option>
          ))}
        </select>

        <button
          onClick={() => {/* walk-in modal */}}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('new_booking')}
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-bg-secondary overflow-auto">
        {/* Day headers */}
        <div className="grid border-b border-bg-secondary" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
          <div className="border-r border-bg-secondary" />
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                'py-2 px-2 text-center border-r border-bg-secondary last:border-r-0',
                isSameDay(day, new Date()) && 'bg-accent/10',
              )}
            >
              <p className="font-body text-xs text-text-muted">{format(day, 'EEE', { locale: vi })}</p>
              <p className={cn(
                'font-display text-sm',
                isSameDay(day, new Date()) ? 'text-accent font-bold' : 'text-text-primary',
              )}>
                {format(day, 'dd')}
              </p>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="relative overflow-y-auto" style={{ maxHeight: '65vh' }}>
          <div className="grid" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
            {/* Hour labels column */}
            <div className="border-r border-bg-secondary">
              {HOURS.map((h) => (
                <div key={h} style={{ height: SLOT_HEIGHT }} className="border-b border-bg-secondary flex items-start justify-end pr-2 pt-1">
                  <span className="font-body text-[10px] text-text-muted">{String(h).padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayBookings = bookingsByDate[dateStr] ?? [];
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'border-r border-bg-secondary last:border-r-0 relative',
                    isSameDay(day, new Date()) && 'bg-accent/5',
                  )}
                  style={{ height: HOURS.length * SLOT_HEIGHT }}
                >
                  {/* Hour grid lines */}
                  {HOURS.map((h) => (
                    <div key={h} style={{ top: (h - 8) * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                      className="absolute inset-x-0 border-b border-bg-secondary" />
                  ))}

                  {/* Bookings */}
                  {loading ? null : dayBookings.map((b) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      colorClass={b.staff_id ? (staffColorMap.get(b.staff_id) ?? STAFF_COLORS[0]!) : STAFF_COLORS[0]!}
                      onClick={() => setSelectedBooking(b)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Sheet */}
      {selectedBooking && (
        <BookingSheet
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
