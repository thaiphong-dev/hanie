'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Search, Filter, Printer, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { OrderDetailsModal } from '@/components/admin/OrderDetailsModal';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  method: string;
  created_at: string;
  customer: { full_name: string; phone: string } | null;
  order_items: { service_name: string; price: number; quantity: number }[];
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const t = useTranslations('admin');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const user = useAuthStore(s => s.user);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Filters
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [staffId, setStaffId] = useState('');
  const [method, setMethod] = useState('');
  const [search, setSearch] = useState('');
  const [staffList, setStaffList] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    void fetch('/api/v1/staff').then(r => r.json()).then(j => setStaffList(j.data ?? []));
  }, []);

  // Sync staffId if user is staff
  useEffect(() => {
    if (user?.role === 'staff') {
      setStaffId(user.id);
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      date_from: dateFrom ? `${dateFrom}T00:00:00Z` : '',
      date_to: dateTo ? `${dateTo}T23:59:59Z` : '',
      staff_id: staffId,
      method: method,
      q: search,
    });
    const res = await fetch(`/api/v1/admin/orders?${params}`);
    const json = await res.json();
    setOrders(json.data ?? []);
    setTotalCount(json.meta?.total ?? 0);
    setLoading(false);
  };

  useEffect(() => { void fetchOrders(); }, [page, dateFrom, dateTo, staffId, method]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-text-primary">Quản lý Hoá đơn</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              placeholder="Tìm mã đơn, voucher..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-bg-secondary font-body text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark transition-colors"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-bg-secondary p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="font-body text-xs text-text-muted">Từ</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-bg-secondary rounded-lg px-2 py-1.5 font-body text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-body text-xs text-text-muted">Đến</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-bg-secondary rounded-lg px-2 py-1.5 font-body text-sm outline-none focus:border-accent"
          />
        </div>
        {user?.role === 'admin' && (
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="border border-bg-secondary rounded-lg px-3 py-1.5 font-body text-sm outline-none focus:border-accent bg-white"
          >
            <option value="">-- Tất cả nhân viên --</option>
            {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
        )}
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="border border-bg-secondary rounded-lg px-3 py-1.5 font-body text-sm outline-none focus:border-accent bg-white"
        >
          <option value="">-- Phương thức --</option>
          <option value="cash">Tiền mặt</option>
          <option value="transfer">Chuyển khoản</option>
          <option value="card">Thẻ</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-bg-secondary p-4">
          <p className="font-body text-xs text-text-muted uppercase tracking-wider mb-1">Số lượng đơn</p>
          <p className="font-display text-xl text-text-primary">{totalCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-bg-secondary p-4">
          <p className="font-body text-xs text-text-muted uppercase tracking-wider mb-1">Tổng doanh thu (trang này)</p>
          <p className="font-display text-xl text-accent">{formatVND(totalRevenue)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-bg-secondary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-bg-secondary/50 border-b border-bg-secondary">
                <th className="px-5 py-4 text-left font-body text-xs font-semibold text-text-muted uppercase tracking-wider">Thời gian</th>
                <th className="px-5 py-4 text-left font-body text-xs font-semibold text-text-muted uppercase tracking-wider">Khách hàng</th>
                <th className="px-5 py-4 text-left font-body text-xs font-semibold text-text-muted uppercase tracking-wider">Dịch vụ</th>
                <th className="px-5 py-4 text-right font-body text-xs font-semibold text-text-muted uppercase tracking-wider">Tổng tiền</th>
                <th className="px-5 py-4 text-center font-body text-xs font-semibold text-text-muted uppercase tracking-wider">Thanh toán</th>
                <th className="px-5 py-4 text-center font-body text-xs font-semibold text-text-muted uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-secondary">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center font-body text-sm text-text-muted">Đang tải dữ liệu...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center font-body text-sm text-text-muted">Không tìm thấy hoá đơn nào</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-bg-secondary/30 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-body text-sm text-text-primary">{format(new Date(order.created_at), 'dd/MM/yyyy')}</p>
                      <p className="font-body text-[11px] text-text-muted">{format(new Date(order.created_at), 'HH:mm')}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-sm font-medium text-text-primary">{order.customer?.full_name || 'Khách lẻ'}</p>
                      <p className="font-body text-xs text-text-muted">{order.customer?.phone || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-sm text-text-secondary truncate max-w-[200px]">
                        {order.order_items.map(item => item.service_name).join(', ')}
                      </p>
                      <p className="font-body text-[11px] text-text-muted">{order.order_items.length} món</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-body text-sm font-semibold text-text-primary">{formatVND(order.total)}</p>
                      {order.discount_amount > 0 && (
                        <p className="font-body text-[10px] text-green-600">-{formatVND(order.discount_amount)}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn(
                        'px-2 py-1 rounded-md text-[10px] font-medium uppercase',
                        order.method === 'cash' ? 'bg-orange-100 text-orange-700' :
                        order.method === 'transfer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      )}>
                        {order.method === 'cash' ? 'Tiền mặt' : order.method === 'transfer' ? 'Chuyển khoản' : 'Thẻ'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="p-2 hover:bg-accent/10 rounded-lg text-accent transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/invoices/${order.id}`}
                          className="p-2 hover:bg-bg-secondary rounded-lg text-text-muted transition-colors"
                          title="In hoá đơn"
                        >
                          <Printer className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalCount > limit && (
          <div className="px-5 py-4 border-t border-bg-secondary flex items-center justify-between">
            <p className="font-body text-xs text-text-muted">
              Hiển thị {orders.length} trên {totalCount} hoá đơn
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-bg-secondary rounded-lg disabled:opacity-30 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-body text-sm font-medium">{page}</span>
              <button
                disabled={page * limit >= totalCount}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-bg-secondary rounded-lg disabled:opacity-30 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrderId && (
        <OrderDetailsModal 
          orderId={selectedOrderId} 
          onClose={() => setSelectedOrderId(null)} 
        />
      )}
    </div>
  );
}
