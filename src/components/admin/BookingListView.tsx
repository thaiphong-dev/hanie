'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Booking, StaffUser } from '@/app/[locale]/admin/bookings/page';

const STATUS_LABELS: Record<string, string> = {
  all: 'Tất cả',
  pending: 'Chờ',
  confirmed: 'Đã xác nhận',
  in_progress: 'Đang làm',
  done: 'Hoàn thành',
  cancelled: 'Đã hủy',
  no_show: 'Không đến',
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  done: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-600',
};

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const PAGE_SIZE = 20;

interface ListFilters {
  dateFrom: string;
  dateTo: string;
  status: string;
  staffId: string;
  search: string;
}

interface BookingListViewProps {
  staffList: StaffUser[];
  onSelectBooking: (b: Booking) => void;
}

export function BookingListView({ staffList, onSelectBooking }: BookingListViewProps) {
  // Default: Monday–Sunday of the current week
  const weekMonday = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekSunday = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const [filters, setFilters] = useState<ListFilters>({
    dateFrom: weekMonday,
    dateTo: weekSunday,
    status: 'all',
    staffId: 'all',
    search: '',
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const fetchBookings = useCallback(async (f: ListFilters, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        date_from: f.dateFrom,
        date_to: f.dateTo,
        limit: String(PAGE_SIZE),
        offset: String((p - 1) * PAGE_SIZE),
      });
      if (f.status !== 'all') params.set('status', f.status);
      if (f.staffId !== 'all') params.set('staff_id', f.staffId);
      if (f.search.trim()) params.set('search', f.search.trim());

      const res = await fetch(`/api/v1/admin/bookings?${params}`);
      const json = await res.json() as { data: Booking[]; total?: number };
      setBookings(json.data ?? []);
      setTotal(json.total ?? json.data?.length ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    void fetchBookings(filters, 1);
  }, [filters, fetchBookings]);

  useEffect(() => {
    void fetchBookings(filters, page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: searchInput }));
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col gap-1">
          <span className="font-body text-xs text-text-muted">Từ ngày</span>
          <input
            type="date"
            value={filters.dateFrom}
            max={filters.dateTo}
            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
            className="border border-bg-secondary rounded-lg px-2.5 py-1.5 font-body text-sm text-text-primary focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-body text-xs text-text-muted">Đến ngày</span>
          <input
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom}
            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
            className="border border-bg-secondary rounded-lg px-2.5 py-1.5 font-body text-sm text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-body text-xs text-text-muted">Trạng thái</span>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="border border-bg-secondary rounded-lg px-2.5 py-1.5 font-body text-sm text-text-primary focus:outline-none focus:border-accent"
          >
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {staffList.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="font-body text-xs text-text-muted">Nhân viên</span>
            <select
              value={filters.staffId}
              onChange={(e) => setFilters((f) => ({ ...f, staffId: e.target.value }))}
              className="border border-bg-secondary rounded-lg px-2.5 py-1.5 font-body text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="all">Tất cả</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="flex gap-1 ml-auto">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tên, SĐT..."
            className="border border-bg-secondary rounded-lg px-2.5 py-1.5 font-body text-sm text-text-primary focus:outline-none focus:border-accent w-36"
          />
          <button
            type="submit"
            className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
          >
            <Search className="w-4 h-4 text-accent" />
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-bg-secondary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-secondary bg-bg-secondary/50">
                <th className="text-left px-4 py-3 font-body text-xs text-text-muted font-medium">Thời gian</th>
                <th className="text-left px-4 py-3 font-body text-xs text-text-muted font-medium">Khách hàng</th>
                <th className="text-left px-4 py-3 font-body text-xs text-text-muted font-medium hidden md:table-cell">Dịch vụ</th>
                <th className="text-left px-4 py-3 font-body text-xs text-text-muted font-medium hidden lg:table-cell">Nhân viên</th>
                <th className="text-left px-4 py-3 font-body text-xs text-text-muted font-medium hidden md:table-cell">Tổng tiền</th>
                <th className="text-left px-4 py-3 font-body text-xs text-text-muted font-medium">Trạng thái</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-secondary/50">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center font-body text-sm text-text-muted">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading && bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center font-body text-sm text-text-muted">
                    Không có lịch hẹn nào
                  </td>
                </tr>
              )}
              {!loading && bookings.map((b) => {
                const total = b.booking_services.reduce((s, bs) => s + bs.price, 0);
                const serviceName = b.booking_services[0]?.service_name ?? '—';
                const moreCount = b.booking_services.length - 1;
                return (
                  <tr key={b.id} className="hover:bg-bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-body text-xs font-medium text-text-primary">
                        {format(parseISO(b.scheduled_at), 'dd/MM/yyyy')}
                      </p>
                      <p className="font-body text-xs text-text-muted">
                        {format(parseISO(b.scheduled_at), 'HH:mm')} – {format(parseISO(b.end_at), 'HH:mm')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-body text-xs font-medium text-text-primary truncate max-w-[120px]">
                        {b.customer_name ?? 'Khách walk-in'}
                      </p>
                      <p className="font-body text-xs text-text-muted">{b.customer_phone ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="font-body text-xs text-text-primary truncate max-w-[140px]">{serviceName}</p>
                      {moreCount > 0 && (
                        <p className="font-body text-[10px] text-text-muted">+{moreCount} dịch vụ</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="font-body text-xs text-text-primary">
                        {b.staff?.full_name ?? <span className="text-red-400 italic">Chưa gán</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">
                      <span className="font-body text-xs text-text-primary">
                        {total > 0 ? formatVND(total) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full font-body text-[10px] font-medium whitespace-nowrap', STATUS_BADGE[b.status] ?? 'bg-gray-100 text-gray-600')}>
                        {STATUS_LABELS[b.status] ?? b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelectBooking(b)}
                        className="font-body text-xs text-accent hover:underline whitespace-nowrap"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-bg-secondary bg-bg-secondary/30">
            <span className="font-body text-xs text-text-muted">
              {total} lịch hẹn · Trang {page}/{totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-bg-secondary disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-text-secondary" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-bg-secondary disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
