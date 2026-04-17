/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  format, addDays, startOfWeek, isSameDay, parseISO,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { AdminBookingModal } from './AdminBookingModal';
import { ChevronLeft, ChevronRight, Plus, X, Check, PlayCircle,  Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StaffUser { id: string; full_name: string; }

interface BookingService { service_name: string | null; price: number; }

export interface Booking {
  id: string;
  status: string;
  scheduled_at: string;
  end_at: string;
  // Layout info
  left?: number;
  width?: number;
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

function BookingCard({ booking, staffColorClass, onClick }: {
  booking: Booking;
  staffColorClass: string;
  onClick: () => void;
}) {
  const { left = 0, width = 100 } = booking;
  const start = parseISO(booking.scheduled_at);
  const end = parseISO(booking.end_at);
  const startHour = start.getHours() + start.getMinutes() / 60;
  const durationH = (end.getTime() - start.getTime()) / 3_600_000;
  const top = (startHour - 8) * SLOT_HEIGHT;
  const height = Math.max(durationH * SLOT_HEIGHT - 2, 20);

  // Status mapping to colors
  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-slate-50 border-slate-200 text-slate-700',
    confirmed: 'bg-sky-50 border-sky-200 text-sky-800',
    in_progress: 'bg-amber-50 border-amber-200 text-amber-800',
    done: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    cancelled: 'bg-rose-50 border-rose-200 text-rose-800',
    no_show: 'bg-slate-200 border-slate-300 text-slate-500',
  };

  const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
  const serviceName = booking.booking_services?.[0]?.service_name || 'Dịch vụ';

  return (
    <button
      onClick={onClick}
      style={{ 
        top, 
        height,
        left: `${left}%`,
        width: `${width}%`,
      }}
      className={cn(
        'absolute rounded-lg border-l-4 px-2 py-1 text-left overflow-hidden cursor-pointer hover:shadow-md transition-shadow z-10',
        statusStyle,
      )}
    >
      <div className="flex justify-between items-start gap-1">
        <p className="font-body text-[10px] sm:text-[11px] font-bold leading-tight truncate flex-1">
          {booking.customer_name ?? 'Khách'}
        </p>
        <div className={cn('w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 mt-0.5 border border-white/20', staffColorClass.split(' ')[0])} title={booking.staff?.full_name} />
      </div>
      
      <p className="font-body text-[9px] sm:text-[10px] leading-tight truncate opacity-90 mt-0.5 hidden xs:block">
        {booking.customer_phone}
      </p>
      
      <p className="font-body text-[9px] sm:text-[10px] leading-tight truncate font-medium mt-1">
        {serviceName}
      </p>

      {booking.staff && height > 35 && (
        <p className="font-body text-[8px] sm:text-[9px] leading-tight truncate opacity-80 italic mt-0.5">
          {booking.staff.full_name}
        </p>
      )}

      {height > 50 && (
        <p className="absolute bottom-1 right-2 font-body text-[8px] sm:text-[9px] opacity-60">
          {format(start, 'HH:mm')}
        </p>
      )}
    </button>
  );
}

// ── Detail Sheet ──────────────────────────────────────────────────────────────

function BookingSheet({ booking, onClose, onStatusChange, staffList, onAssignStaff }: {
  booking: Booking;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
  staffList: StaffUser[];
  onAssignStaff: (bookingId: string, staffId: string) => Promise<void>;
}) {
  const t = useTranslations('admin');
  const tStatus = useTranslations('booking_status');
  const [loading, setLoading] = useState(false);
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelNote, setCancelNote] = useState('');

  const ns = nextStatus(booking.status);
  const total = booking.booking_services.reduce((s, bs) => s + bs.price, 0);

  async function doAction(status: string) {
    setLoading(true);
    await onStatusChange(booking.id, status);
    setLoading(false);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 m-0!" onClick={onClose} />
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
          <div className="flex items-center justify-between">
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
            
            <p className="font-body text-xs text-text-muted">ID: {booking.id.slice(0, 8)}</p>
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
              {booking.staff ? (
                <p className="font-body text-sm text-text-primary font-medium">{booking.staff.full_name}</p>
              ) : (
                <div className="space-y-2">
                  <p className="font-body text-xs text-red-500 italic">Chưa gán</p>
                  <select
                    className="w-full bg-white border border-bg-secondary rounded-lg px-2 py-1.5 font-body text-xs"
                    onChange={(e) => {
                      if (e.target.value) {
                        void onAssignStaff(booking.id, e.target.value);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">-- Gán nhân viên --</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </div>
              )}
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
                onClick={() => {
                  if (booking.status === 'in_progress') {
                    // Redirect to POS with details
                    const params = new URLSearchParams({
                      booking_id: booking.id,
                      customer_name: booking.customer_name || 'Khách walk-in',
                      customer_phone: booking.customer_phone || '',
                      staff_id: booking.staff_id || '',
                    });
                    window.location.href = `/admin/pos?${params.toString()}`;
                  } else {
                    void doAction(ns);
                  }
                }}
                disabled={loading}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-body text-sm font-medium transition-colors disabled:opacity-50',
                  getStatusBtnColor(booking.status),
                )}
              >
                {booking.status === 'pending' && <Check className="w-4 h-4" />}
                {booking.status === 'confirmed' && <PlayCircle className="w-4 h-4" />}
                {booking.status === 'in_progress' && <Receipt className="w-4 h-4" />}
                {booking.status === 'in_progress' ? t('booking_action_pos') : nextStatusLabel(booking.status, (k) => t(k as Parameters<typeof t>[0]))}
              </button>
            )}

            {!['confirmed', 'in_progress'].includes(booking.status) && (
              cancelMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setCancelMode(false); setCancelNote(''); }}
                    className="flex-1 py-2.5 rounded-xl border border-bg-secondary font-body text-sm text-text-secondary"
                  >
                    Huỷ bỏ
                  </button>
                  <button
                    onClick={() => void doAction('cancelled')}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-body text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    Huỷ lịch
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCancelMode(true)}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-body text-sm hover:bg-red-50 transition-colors"
                >
                  {t('booking_action_cancel')}
                </button>
              )
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

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [bookingsByDate, setBookingsByDate] = useState<Record<string, Booking[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [filterStaffId, setFilterStaffId] = useState<string>('');
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);

  const calculateLayout = (bookings: Booking[]): Booking[] => {
    if (!bookings.length) return [];

    // Sort by start time
    const sorted = [...bookings].sort((a, b) => 
      parseISO(a.scheduled_at).getTime() - parseISO(b.scheduled_at).getTime()
    );

    const clusters: Booking[][] = [];
    let currentCluster: Booking[] = [];
    let maxEnd: number = 0;

    for (const b of sorted) {
      const start = parseISO(b.scheduled_at).getTime();
      const end = parseISO(b.end_at).getTime();

      if (currentCluster.length > 0 && start < maxEnd) {
        currentCluster.push(b);
        maxEnd = Math.max(maxEnd, end);
      } else {
        if (currentCluster.length > 0) clusters.push(currentCluster);
        currentCluster = [b];
        maxEnd = end;
      }
    }
    if (currentCluster.length > 0) clusters.push(currentCluster);

    // Process each cluster to assign columns
    const result: Booking[] = [];
    for (const cluster of clusters) {
      const columns: Booking[][] = [];
      
      for (const b of cluster) {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          const lastInCol = columns[i]![columns[i]!.length - 1]!;
          if (parseISO(b.scheduled_at).getTime() >= parseISO(lastInCol.end_at).getTime()) {
            columns[i]!.push(b);
            placed = true;
            break;
          }
        }
        if (!placed) {
          columns.push([b]);
        }
      }

      const colCount = columns.length;
      for (let i = 0; i < colCount; i++) {
        for (const b of columns[i]!) {
          b.width = 100 / colCount;
          b.left = (i / colCount) * 100;
          result.push(b);
        }
      }
    }

    return result;
  };

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
        byDate[dateStr] = calculateLayout(json.data ?? []);
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
    <div className="">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap py-4 ">
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
          onClick={() => setIsNewBookingModalOpen(true)}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('new_booking')}
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-bg-secondary overflow-hidden flex flex-col">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[900px] lg:min-w-full">
            {/* Day headers - Sticky */}
            <div className="grid border-b border-bg-secondary sticky top-0 bg-white z-30" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
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
                      staffColorClass={b.staff_id ? (staffColorMap.get(b.staff_id) ?? STAFF_COLORS[0]!) : STAFF_COLORS[0]!}
                      onClick={() => setSelectedBooking(b)}
                    />
                  ))}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Detail Sheet */}
      {selectedBooking && (
        <BookingSheet
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={handleStatusChange}
          staffList={staffList}
          onAssignStaff={async (bid, sid) => {
            await fetch(`/api/v1/admin/bookings/${bid}/assign`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ staff_id: sid }),
            });
            void fetchWeek();
            setSelectedBooking(prev => prev ? { ...prev, staff_id: sid, staff: staffList.find(s => s.id === sid) || null } : null);
          }}
        />
      )}

      <AdminBookingModal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        onSuccess={() => {
          void fetchWeek();
          setIsNewBookingModalOpen(false);
        }}
        staffList={staffList}
      />
    </div>
  );
}
