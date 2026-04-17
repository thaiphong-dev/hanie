'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Printer, ChevronLeft, Calendar, User,  Tag, CreditCard, Banknote } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { useParams } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InvoiceDetail() {
  const params = useParams();
  const id = params?.id as string;
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    void fetch(`/api/v1/admin/orders/${id}`)
      .then(r => r.json())
      .then(j => {
        setOrder(j.data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-10 text-center font-body text-text-muted">Đang tải hoá đơn...</div>;
  if (!order) return <div className="p-10 text-center font-body text-red-500">Không tìm thấy hoá đơn</div>;

  const commission = Math.round(order.total * 0.1); // Giả định hoa hồng 10%

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header / Actions */}
      <div className="flex items-center justify-between no-print">
        <Link 
          href="/admin/invoices"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-text-muted hover:bg-bg-secondary transition-colors font-body text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          <Printer className="w-4 h-4" />
          In hoá đơn
        </button>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-3xl border border-bg-secondary shadow-sm overflow-hidden print:border-0 print:shadow-none">
        {/* Brand Header */}
        <div className="bg-bg-dark px-8 py-10 flex border-b border-white/10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <span className="font-display text-lg text-bg-dark font-bold">H</span>
              </div>
              <h1 className="font-display text-2xl text-text-inverse tracking-wide">Hanie Studio</h1>
            </div>
            <div className="space-y-1 font-body text-sm text-text-muted">
              <p>55 Nguyễn Nhạc, Quy Nhơn</p>
              <p>Hotline: 09xx xxx xxx</p>
              <p>Facebook.com/hanie.studio</p>
            </div>
          </div>
          <div className="text-right flex flex-col justify-end">
            <p className="font-display text-3xl text-text-inverse mb-2">HOÁ ĐƠN</p>
            <p className="font-body text-sm text-accent">#{order.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="px-8 py-8 grid grid-cols-2 gap-8 border-b border-bg-secondary">
          <div className="space-y-4">
            <div>
              <p className="font-body text-xs text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3 h-3" /> Khách hàng
              </p>
              <p className="font-body text-base font-semibold text-text-primary">{order.customer?.full_name || 'Khách lẻ'}</p>
              {order.customer?.phone && <p className="font-body text-sm text-text-secondary mt-0.5">{order.customer.phone}</p>}
            </div>
            <div>
              <p className="font-body text-xs text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> Hạng thành viên
              </p>
              <span className="px-2 py-0.5 rounded bg-bg-secondary font-body text-xs font-medium text-text-primary border border-bg-secondary">
                {order.customer?.member_tier.toUpperCase() || 'NEW'}
              </span>
            </div>
          </div>
          <div className="space-y-4 text-right md:text-left md:ml-auto">
            <div className="md:text-right">
              <p className="font-body text-xs text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5 justify-end">
                <Calendar className="w-3 h-3" /> Ngày thanh toán
              </p>
              <p className="font-body text-sm text-text-primary">{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            <div className="md:text-right">
              <p className="font-body text-xs text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5 justify-end">
                Cách thức
              </p>
              <p className="font-body text-sm text-text-primary flex items-center gap-2 justify-end">
                {order.method === 'cash' ? <Banknote className="w-4 h-4 text-orange-500" /> : <CreditCard className="w-4 h-4 text-blue-500" />}
                {order.method === 'cash' ? 'Tiền mặt' : order.method === 'transfer' ? 'Chuyển khoản' : 'Thẻ'}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-8 py-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-bg-dark/10">
                <th className="py-3 text-left font-body text-xs font-semibold text-text-muted uppercase tracking-wider">Dịch vụ</th>
                <th className="py-3 text-center font-body text-xs font-semibold text-text-muted uppercase tracking-wider">SL</th>
                <th className="py-3 text-right font-body text-xs font-semibold text-text-muted uppercase tracking-wider">Đơn giá</th>
                <th className="py-3 text-right font-body text-xs font-semibold text-text-muted uppercase tracking-wider">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-secondary">
              {order.order_items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4">
                    <p className="font-body text-sm font-medium text-text-primary">{item.service_name}</p>
                    {item.note && <p className="font-body text-xs text-text-muted italic">{item.note}</p>}
                  </td>
                  <td className="py-4 text-center font-body text-sm text-text-secondary">{item.quantity}</td>
                  <td className="py-4 text-right font-body text-sm text-text-secondary">{formatVND(item.price)}</td>
                  <td className="py-4 text-right font-body text-sm font-semibold text-text-primary">{formatVND(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-8 py-8 bg-bg-secondary/30 flex justify-end">
          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-between items-center text-text-secondary">
              <span className="font-body text-sm">Tạm tính</span>
              <span className="font-body text-sm">{formatVND(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="font-body text-sm flex items-center gap-1.5">
                  Giảm giá {order.voucher?.code && <small className="text-[10px] bg-green-100 px-1 rounded">({order.voucher.code})</small>}
                </span>
                <span className="font-body text-sm">-{formatVND(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-bg-secondary">
              <span className="font-display text-lg text-text-primary">Tổng cộng</span>
              <span className="font-display text-xl text-accent">{formatVND(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Admin Footer / Staff Info */}
        <div className="px-8 py-6 border-t border-bg-secondary flex flex-wrap justify-between items-center gap-4 bg-white no-print">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-text-muted" />
             </div>
             <div>
                <p className="font-body text-[10px] text-text-muted uppercase tracking-wide">Nhân viên thực hiện</p>
                <p className="font-body text-sm font-medium text-text-primary">{order.staff?.full_name || 'Hệ thống'}</p>
             </div>
          </div>
          <div className="text-right">
             <p className="font-body text-[10px] text-text-muted uppercase tracking-wide">Hoa hồng dự tính</p>
             <p className="font-body text-sm font-semibold text-emerald-600">{formatVND(commission)}</p>
          </div>
        </div>

        {/* Print Thank You */}
        <div className="hidden print:block px-8 py-10 text-center border-t border-dashed border-bg-secondary">
          <p className="font-display text-base text-text-primary mb-1">Cảm ơn quý khách!</p>
          <p className="font-body text-xs text-text-muted">Hẹn gặp lại trong lần tới</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
}
