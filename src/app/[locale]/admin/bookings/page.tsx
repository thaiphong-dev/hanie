/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  format, addDays, startOfWeek, isSameDay, parseISO,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { AdminBookingModal } from './AdminBookingModal';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, List } from 'lucide-react';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { BookingSheet } from '@/components/admin/BookingSheet';
import { BookingListView } from '@/components/admin/BookingListView';
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

type ViewMode = 'calendar' | 'list';

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

function calculateLayout(bookings: Booking[]): Booking[] {
  if (!bookings.length) return [];
  const sorted = [...bookings].sort((a, b) =>
    parseISO(a.scheduled_at).getTime() - parseISO(b.scheduled_at).getTime()
  );
  const clusters: Booking[][] = [];
  let currentCluster: Booking[] = [];
  let maxEnd = 0;
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
      if (!placed) columns.push([b]);
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

  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-slate-50 border-slate-200 text-slate-700',
    confirmed: 'bg-sky-50 border-sky-200 text-sky-800',
    in_progress: 'bg-amber-50 border-amber-200 text-amber-800',
    done: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    cancelled: 'bg-rose-50 border-rose-200 text-rose-800',
    no_show: 'bg-slate-200 border-slate-300 text-slate-500',
  };

  const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.pending!;
  const serviceName = booking.booking_services?.[0]?.service_name || 'Dịch vụ';

  return (
    <button
      onClick={onClick}
      style={{ top, height, left: `${left}%`, width: `${width}%` }}
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const t = useTranslations('admin');
  const searchParams = useSearchParams();

  // View toggle — persisted in localStorage
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('admin_bookings_view') as ViewMode) ?? 'calendar';
    }
    return 'calendar';
  });

  function switchView(v: ViewMode) {
    setView(v);
    localStorage.setItem('admin_bookings_view', v);
  }

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [bookingsByDate, setBookingsByDate] = useState<Record<string, Booking[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [filterStaffId, setFilterStaffId] = useState<string>('');
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);

  // ── Deep link: auto-open booking from ?booking_id= ────────────────────────
  const deepLinkBookingId = searchParams.get('booking_id');
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

  useEffect(() => {
    if (!deepLinkBookingId || deepLinkHandled) return;
    const fetchDeepLink = async () => {
      // Check if already loaded in calendar data
      for (const dayBookings of Object.values(bookingsByDate)) {
        const found = dayBookings.find((b) => b.id === deepLinkBookingId);
        if (found) {
          setSelectedBooking(found);
          setDeepLinkHandled(true);
          return;
        }
      }
      // Fetch single booking by ID
      try {
        const res = await fetch(`/api/v1/admin/bookings/${deepLinkBookingId}`);
        if (res.ok) {
          const json = await res.json() as { data: Booking | null };
          if (json.data) {
            setSelectedBooking(json.data);
            setDeepLinkHandled(true);
          }
        }
      } catch {
        // silently fail
      }
    };
    void fetchDeepLink();
  }, [deepLinkBookingId, bookingsByDate, deepLinkHandled]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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

  const refreshDay = useCallback(async (dateStr: string) => {
    const params = new URLSearchParams({ date: dateStr });
    if (filterStaffId) params.set('staff_id', filterStaffId);
    const res = await fetch(`/api/v1/admin/bookings?${params}`);
    const json = await res.json() as { data: Booking[] };
    setBookingsByDate((prev) => ({ ...prev, [dateStr]: calculateLayout(json.data ?? []) }));
  }, [filterStaffId]);

  const patchLocalBooking = useCallback((id: string, updates: Partial<Booking>) => {
    setBookingsByDate((prev) => {
      const next = { ...prev };
      for (const [dateStr, dayBookings] of Object.entries(next)) {
        const idx = dayBookings.findIndex((b) => b.id === id);
        if (idx !== -1) {
          const updated = [...dayBookings];
          updated[idx] = { ...updated[idx]!, ...updates };
          next[dateStr] = updated;
          break;
        }
      }
      return next;
    });
    setSelectedBooking((prev) => (prev?.id === id ? { ...prev, ...updates } : prev));
  }, []);

  useEffect(() => { void fetchWeek(); }, [fetchWeek]);

  useEffect(() => {
    void fetch('/api/v1/staff').then((r) => r.json()).then((j: { data: StaffUser[] }) => setStaffList(j.data ?? []));
  }, []);

  function handleStatusChange(id: string, status: string) {
    let dateStr = format(new Date(), 'yyyy-MM-dd');
    for (const [ds, dayBookings] of Object.entries(bookingsByDate)) {
      if (dayBookings.some((b) => b.id === id)) { dateStr = ds; break; }
    }
    patchLocalBooking(id, { status });
    void fetch(`/api/v1/admin/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(() => refreshDay(dateStr));
  }

  function handleAssignStaff(bookingId: string, staffId: string) {
    patchLocalBooking(bookingId, { staff_id: staffId, staff: staffList.find((s) => s.id === staffId) ?? null });
    void fetch(`/api/v1/admin/bookings/${bookingId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff_id: staffId }),
    });
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap py-4">
        {/* View toggle */}
        <div className="flex gap-0.5 rounded-lg border border-bg-secondary p-1">
          <button
            onClick={() => switchView('calendar')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-body transition-colors',
              view === 'calendar' ? 'bg-accent text-bg-dark' : 'text-text-secondary hover:text-text-primary',
            )}
            title="Lịch tuần"
          >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Lịch</span>
          </button>
          <button
            onClick={() => switchView('list')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-body transition-colors',
              view === 'list' ? 'bg-accent text-bg-dark' : 'text-text-secondary hover:text-text-primary',
            )}
            title="Danh sách"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Danh sách</span>
          </button>
        </div>

        {/* Calendar navigation — only show in calendar mode */}
        {view === 'calendar' && (
          <>
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
            <CustomSelect
              value={filterStaffId}
              onChange={setFilterStaffId}
              options={[
                { value: '', label: t('all_staff') },
                ...staffList.map((s) => ({ value: s.id, label: s.full_name })),
              ]}
              className="w-44"
            />
          </>
        )}

        <button
          onClick={() => setIsNewBookingModalOpen(true)}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('new_booking')}
        </button>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
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
                        {HOURS.map((h) => (
                          <div key={h} style={{ top: (h - 8) * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                            className="absolute inset-x-0 border-b border-bg-secondary" />
                        ))}
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
      )}

      {/* List View */}
      {view === 'list' && (
        <BookingListView
          staffList={staffList}
          onSelectBooking={setSelectedBooking}
        />
      )}

      {/* Detail Sheet (shared between calendar and list views) */}
      {selectedBooking && (
        <BookingSheet
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={handleStatusChange}
          staffList={staffList}
          onAssignStaff={handleAssignStaff}
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
