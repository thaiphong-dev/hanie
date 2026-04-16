'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServiceOption {
  id: string;
  name: string;
  name_i18n: Record<string, string>;
  price_min: number;
  price_max: number;
  unit: string;
  category_id: string;
  category_name?: string;
}

interface OrderLine {
  service_id: string | null;
  service_name: string;
  price: number;
  quantity: number;
  unit: string;
  note: string;
}

interface CustomerInfo {
  id: string | null;
  full_name: string;
  phone: string;
  member_tier: string;
}

type PaymentMethod = 'cash' | 'transfer' | 'card';

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

// ── Order Line Row ────────────────────────────────────────────────────────────

function OrderLineRow({ line, index, onChange, onRemove, services }: {
  line: OrderLine;
  index: number;
  onChange: (i: number, l: OrderLine) => void;
  onRemove: (i: number) => void;
  services: ServiceOption[];
}) {
  const t = useTranslations('pos');
  const matched = services.find((s) => s.id === line.service_id);

  return (
    <div className="border border-bg-secondary rounded-xl p-3 space-y-2">
      {/* Service picker */}
      <div className="flex items-center gap-2">
        <select
          value={line.service_id ?? ''}
          onChange={(e) => {
            const svc = services.find((s) => s.id === e.target.value);
            onChange(index, {
              ...line,
              service_id: e.target.value || null,
              service_name: svc?.name ?? line.service_name,
              price: svc ? svc.price_min : line.price,
              unit: svc?.unit ?? 'fixed',
            });
          }}
          className="flex-1 border border-bg-secondary rounded-lg px-3 py-2 font-body text-sm text-text-primary bg-white focus:outline-none focus:border-accent"
        >
          <option value="">-- Chọn dịch vụ --</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button onClick={() => onRemove(index)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Price + qty */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-body text-xs text-text-muted">
            Giá thực tế
            {matched && (
              <span className="ml-1 text-text-muted">
                ({t('suggested_price', { min: formatVND(matched.price_min), max: formatVND(matched.price_max) })})
              </span>
            )}
          </label>
          <input
            type="number"
            min={0}
            value={line.price}
            onChange={(e) => onChange(index, { ...line, price: parseInt(e.target.value) || 0 })}
            className="w-full mt-1 border border-bg-secondary rounded-lg px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="font-body text-xs text-text-muted">
            {line.unit === 'per_nail' ? 'Số ngón' : 'Số lượng'}
          </label>
          <input
            type="number"
            min={1}
            max={line.unit === 'per_nail' ? 10 : undefined}
            value={line.quantity}
            onChange={(e) => onChange(index, { ...line, quantity: parseInt(e.target.value) || 1 })}
            className="w-full mt-1 border border-bg-secondary rounded-lg px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Line total */}
      <div className="flex justify-end">
        <span className="font-body text-sm font-semibold text-accent">{formatVND(line.price * line.quantity)}</span>
      </div>
    </div>
  );
}

// ── Success Toast ─────────────────────────────────────────────────────────────

function SuccessScreen({ total, method, onReset }: { total: number; method: PaymentMethod; onReset: () => void }) {
  const t = useTranslations('pos');
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center gap-6 p-8">
      <CheckCircle2 className="w-20 h-20 text-green-500" />
      <div className="text-center">
        <p className="font-display text-2xl text-text-primary mb-2">{formatVND(total)}</p>
        <p className="font-body text-sm text-text-muted">
          {method === 'cash' ? 'Tiền mặt' : method === 'transfer' ? 'Chuyển khoản' : 'Thẻ'}
        </p>
      </div>
      <p className="font-display text-base text-text-secondary text-center">{t('thank_you')}</p>
      <button
        onClick={onReset}
        className="px-8 py-3 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark transition-colors"
      >
        Tạo đơn mới
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function POSPage() {
  const t = useTranslations('pos');
  const tAdmin = useTranslations('admin');
  const user = useAuthStore((s) => s.user);

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ total: number; method: PaymentMethod } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load services
  useEffect(() => {
    void fetch('/api/v1/services?limit=100')
      .then((r) => r.json())
      .then((j: { data: ServiceOption[] }) => setServices(j.data ?? []));
  }, []);

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  function addLine() {
    setLines((prev) => [...prev, { service_id: null, service_name: '', price: 0, quantity: 1, unit: 'fixed', note: '' }]);
  }

  function updateLine(i: number, l: OrderLine) {
    setLines((prev) => prev.map((item, idx) => idx === i ? l : item));
  }

  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function searchCustomer() {
    if (!phoneInput) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/customers?search=${encodeURIComponent(phoneInput)}`);
      const json = await res.json() as { data: CustomerInfo[] };
      const found = json.data?.[0];
      if (found) {
        setCustomer(found);
        setNameInput(found.full_name);
      } else {
        setCustomer({ id: null, full_name: nameInput, phone: phoneInput, member_tier: 'new' });
      }
    } finally {
      setSearchLoading(false);
    }
  }

  async function submit() {
    if (lines.length === 0) { setError('Chưa có dịch vụ nào'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        customer_id: customer?.id ?? null,
        staff_id: user?.id ?? null,
        items: lines.map((l) => ({
          service_id: l.service_id,
          service_name: l.service_name || 'Dịch vụ',
          price: l.price,
          quantity: l.quantity,
          unit: l.unit,
        })),
        method,
        voucher_code: voucherCode || undefined,
      };
      const res = await fetch('/api/v1/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json() as { data: { total: number; discount_amount: number } | null; error: { message: string } | null };
      if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Error');
      setSuccess({ total: json.data?.total ?? total, method });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setLines([]);
    setCustomer(null);
    setPhoneInput('');
    setNameInput('');
    setVoucherCode('');
    setDiscount(0);
    setSuccess(null);
    setError(null);
  }

  if (success) return <SuccessScreen total={success.total} method={success.method} onReset={reset} />;

  return (
    <div className="flex flex-col lg:flex-row gap-4 max-w-5xl">
      {/* LEFT: Order entry */}
      <div className="flex-1 space-y-4">
        <h2 className="font-display text-lg text-text-primary">{t('title')}</h2>

        {/* Customer search */}
        <div className="bg-white rounded-2xl border border-bg-secondary p-4 space-y-3">
          <p className="font-body text-xs text-text-muted uppercase tracking-wide">Khách hàng</p>
          <div className="flex gap-2">
            <input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder={tAdmin('search_customer')}
              className="flex-1 border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:border-accent"
              onKeyDown={(e) => e.key === 'Enter' && void searchCustomer()}
            />
            <button
              onClick={() => void searchCustomer()}
              disabled={searchLoading}
              className="px-4 py-2 rounded-xl bg-accent text-bg-dark font-body text-sm hover:bg-accent-dark transition-colors disabled:opacity-50"
            >
              Tìm
            </button>
          </div>
          {customer && (
            <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-xl">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <span className="font-body text-sm text-bg-dark font-semibold">{customer.full_name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="font-body text-sm font-medium text-text-primary">{customer.full_name}</p>
                <p className="font-body text-xs text-text-muted">{customer.phone} · {customer.member_tier.toUpperCase()}</p>
              </div>
              <button onClick={() => { setCustomer(null); setPhoneInput(''); }}>
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          )}
          {!customer && nameInput && (
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Tên khách hàng"
              className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          )}
        </div>

        {/* Service lines */}
        <div className="bg-white rounded-2xl border border-bg-secondary p-4 space-y-3">
          <p className="font-body text-xs text-text-muted uppercase tracking-wide">Dịch vụ</p>
          {lines.map((line, i) => (
            <OrderLineRow key={i} line={line} index={i} onChange={updateLine} onRemove={removeLine} services={services} />
          ))}
          <button
            onClick={addLine}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-accent text-accent font-body text-sm hover:bg-accent/5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('add_service')}
          </button>
        </div>

        {/* Voucher */}
        <div className="bg-white rounded-2xl border border-bg-secondary p-4 space-y-2">
          <p className="font-body text-xs text-text-muted uppercase tracking-wide">Voucher</p>
          <div className="flex gap-2">
            <input
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder={t('voucher_code')}
              className="flex-1 border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:border-accent"
            />
            <button
              onClick={() => {/* validate voucher */}}
              className="px-4 py-2 rounded-xl border border-bg-secondary font-body text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
            >
              {t('apply_voucher')}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Bill preview */}
      <div className="lg:w-72 xl:w-80 shrink-0">
        <div className="bg-white rounded-2xl border border-bg-secondary p-5 space-y-4 sticky top-4">
          {/* Header */}
          <div className="text-center border-b border-bg-secondary pb-4">
            <p className="font-display text-base text-text-primary">Hanie Studio</p>
            <p className="font-body text-xs text-text-muted">55 Nguyễn Nhạc, Quy Nhơn</p>
            <p className="font-body text-xs text-text-muted mt-1">{format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            {customer && <p className="font-body text-xs text-text-secondary mt-1">{customer.full_name}</p>}
          </div>

          {/* Items */}
          <div className="space-y-2 min-h-[60px]">
            {lines.length === 0 && (
              <p className="font-body text-xs text-text-muted text-center py-4">Chưa có dịch vụ</p>
            )}
            {lines.map((l, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="font-body text-sm text-text-primary truncate">
                  {l.service_name || 'Dịch vụ'}{l.quantity > 1 ? ` ×${l.quantity}` : ''}
                </span>
                <span className="font-body text-sm text-text-secondary shrink-0">{formatVND(l.price * l.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-bg-secondary pt-3 space-y-1">
            <div className="flex justify-between font-body text-sm text-text-secondary">
              <span>{t('subtotal')}</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-body text-sm text-green-600">
                <span>{t('discount')}</span>
                <span>-{formatVND(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-display text-lg text-text-primary pt-1">
              <span>{t('total')}</span>
              <span>{formatVND(total)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="grid grid-cols-3 gap-2">
            {(['cash', 'transfer', 'card'] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={cn(
                  'py-2.5 rounded-xl font-body text-xs font-medium border transition-colors',
                  method === m
                    ? 'bg-accent border-accent text-bg-dark'
                    : 'border-bg-secondary text-text-secondary hover:bg-bg-secondary',
                )}
              >
                {m === 'cash' ? t('pay_cash') : m === 'transfer' ? t('pay_transfer') : t('pay_card')}
              </button>
            ))}
          </div>

          {error && (
            <p className="font-body text-xs text-red-600 text-center">{error}</p>
          )}

          <button
            onClick={() => void submit()}
            disabled={submitting || lines.length === 0}
            className="w-full py-3 rounded-xl bg-accent text-bg-dark font-body text-sm font-semibold hover:bg-accent-dark disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Đang xử lý...' : t('confirm_payment')}
          </button>
        </div>
      </div>
    </div>
  );
}
