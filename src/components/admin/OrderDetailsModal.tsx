'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Printer, X, Calendar, User,   CreditCard, Banknote } from 'lucide-react';

interface OrderDetail {
  id: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  method: 'cash' | 'transfer' | 'card';
  created_at: string;
  customer: { full_name: string; phone: string; member_tier: string } | null;
  staff: { full_name: string; phone: string } | null;
  order_items: {
    id: string;
    service_name: string;
    price: number;
    quantity: number;
    unit: string;
    note: string | null;
  }[];
  voucher: { code: string; discount_type: string; discount_value: number } | null;
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export function OrderDetailsModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    void fetch(`/api/v1/admin/orders/${orderId}`)
      .then(r => r.json())
      .then(j => {
        setOrder(j.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  if (!orderId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-secondary shrink-0 no-print">
          <h2 className="font-display text-base text-text-primary">Chi tiết hoá đơn</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 hover:bg-bg-secondary rounded-lg text-text-secondary transition-colors"
              title="In hoá đơn"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg-secondary rounded-lg text-text-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto print-area">
          {loading ? (
            <div className="p-20 text-center font-body text-sm text-text-muted">Đang tải...</div>
          ) : !order ? (
            <div className="p-20 text-center font-body text-sm text-red-500">Không tìm thấy hoá đơn</div>
          ) : (
            <div className="p-0 border-0">
              {/* Brand Header */}
              <div className="bg-bg-dark px-8 py-8 flex border-b border-white/10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <span className="font-display text-sm text-bg-dark font-bold">H</span>
                    </div>
                    <h1 className="font-display text-lg text-text-inverse tracking-wide">Hanie Studio</h1>
                  </div>
                  <div className="space-y-0.5 font-body text-[10px] text-text-muted">
                    <p>55 Nguyễn Nhạc, Quy Nhơn</p>
                    <p>Hotline: 09xx xxx xxx</p>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <p className="font-display text-xl text-text-inverse mb-1">HOÁ ĐƠN</p>
                  <p className="font-body text-[10px] text-accent">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="px-8 py-6 grid grid-cols-2 gap-6 border-b border-bg-secondary">
                <div className="space-y-3">
                  <div>
                    <p className="font-body text-[10px] text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" /> Khách hàng
                    </p>
                    <p className="font-body text-sm font-semibold text-text-primary">{order.customer?.full_name || 'Khách lẻ'}</p>
                    {order.customer?.phone && <p className="font-body text-xs text-text-secondary">{order.customer.phone}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-body text-[10px] text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3" /> Ngày
                  </p>
                  <p className="font-body text-sm text-text-primary">{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}</p>
                  <div className="flex items-center gap-1.5 justify-end mt-1">
                    {order.method === 'cash' ? <Banknote className="w-3.5 h-3.5 text-orange-500" /> : <CreditCard className="w-3.5 h-3.5 text-blue-500" />}
                    <span className="font-body text-xs text-text-secondary">
                      {order.method === 'cash' ? 'Tiền mặt' : order.method === 'transfer' ? 'Chuyển khoản' : 'Thẻ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="px-8 py-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-bg-secondary">
                      <th className="py-2 text-left font-body text-[10px] font-semibold text-text-muted uppercase tracking-wider">Dịch vụ</th>
                      <th className="py-2 text-center font-body text-[10px] font-semibold text-text-muted uppercase tracking-wider">SL</th>
                      <th className="py-2 text-right font-body text-[10px] font-semibold text-text-muted uppercase tracking-wider">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bg-secondary">
                    {order.order_items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3">
                          <p className="font-body text-sm text-text-primary">{item.service_name}</p>
                        </td>
                        <td className="py-3 text-center font-body text-sm text-text-secondary">{item.quantity}</td>
                        <td className="py-3 text-right font-body text-sm font-semibold text-text-primary">{formatVND(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="px-8 py-6 bg-bg-secondary/20 flex justify-end">
                <div className="w-full max-w-[180px] space-y-2">
                  <div className="flex justify-between items-center text-text-secondary">
                    <span className="font-body text-[11px]">Tạm tính</span>
                    <span className="font-body text-[11px]">{formatVND(order.subtotal)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="font-body text-[11px]">Giảm giá</span>
                      <span className="font-body text-[11px]">-{formatVND(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-bg-secondary">
                    <span className="font-display text-sm text-text-primary">Tổng</span>
                    <span className="font-display text-base text-accent">{formatVND(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Staff Info */}
              <div className="px-8 py-4 border-t border-bg-secondary flex justify-between items-center bg-white/50 no-print">
                <p className="font-body text-[10px] text-text-muted italic">KTV: {order.staff?.full_name || 'Hệ thống'}</p>
                <div className="text-right">
                   <p className="font-body text-[9px] text-text-muted uppercase">Hoa hồng dự tính</p>
                   <p className="font-body text-xs font-semibold text-emerald-600">{formatVND(Math.round(order.total * 0.1))}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .no-print { display: none !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            z-index: 9999 !important;
          }
        }
      `}</style>
    </div>
  );
}
