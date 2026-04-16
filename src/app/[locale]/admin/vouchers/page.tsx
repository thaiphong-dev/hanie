'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, X, Send, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface Voucher {
  id: string; code: string; name: string;
  discount_type: 'percent' | 'fixed'; discount_value: number;
  min_order_amount: number; required_member_tier: string | null;
  total_issued: number; max_issue: number | null;
  expires_at: string | null; status: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  expired: 'bg-red-100 text-red-600',
  disabled: 'bg-gray-100 text-gray-500',
};

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface VoucherForm {
  code: string; name: string; discount_type: 'percent' | 'fixed';
  discount_value: number; min_order_amount: number;
  required_member_tier: string;
  max_issue: string | number;
  expires_at: string;
  status: 'active' | 'draft' | 'disabled';
}

const EMPTY_FORM: VoucherForm = {
  code: '', name: '', discount_type: 'percent',
  discount_value: 10, min_order_amount: 0,
  required_member_tier: '',
  max_issue: '',
  expires_at: '',
  status: 'active',
};

export default function VouchersPage() {
  const t = useTranslations('admin');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [distributeId, setDistributeId] = useState<string | null>(null);
  const [distributeTo, setDistributeTo] = useState('regular_plus');
  const [distributing, setDistributing] = useState(false);
  const [distributeResult, setDistributeResult] = useState<number | null>(null);
  const [form, setForm] = useState<VoucherForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/v1/admin/vouchers');
    const json = await res.json() as { data: Voucher[] };
    setVouchers(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchVouchers(); }, [fetchVouchers]);

  async function save() {
    setSaving(true);
    const payload = {
      ...form,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount),
      max_issue: form.max_issue === '' ? null : Number(form.max_issue),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      required_member_tier: form.required_member_tier || null,
    };
    await fetch('/api/v1/admin/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSheetOpen(false);
    void fetchVouchers();
  }

  async function distribute() {
    if (!distributeId) return;
    setDistributing(true);
    const res = await fetch('/api/v1/admin/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'distribute', voucher_id: distributeId, distribute_to: distributeTo }),
    });
    const json = await res.json() as { data: { distributed: number } };
    setDistributeResult(json.data?.distributed ?? 0);
    setDistributing(false);
    void fetchVouchers();
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-text-primary">{t('vouchers_title')}</h2>
        <button
          onClick={() => { setForm(EMPTY_FORM); setSheetOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('create_voucher')}
        </button>
      </div>

      {/* Voucher list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-bg-secondary rounded-2xl animate-pulse" />)
        ) : vouchers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-bg-secondary flex items-center justify-center h-24 font-body text-sm text-text-muted">
            Chưa có voucher nào
          </div>
        ) : (
          vouchers.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-bg-secondary p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm font-bold text-text-primary font-mono">{v.code}</p>
                      <span className={cn('px-2 py-0.5 rounded-full font-body text-[10px]', STATUS_COLORS[v.status] ?? 'bg-gray-100 text-gray-600')}>
                        {v.status}
                      </span>
                    </div>
                    <p className="font-body text-xs text-text-secondary">{v.name}</p>
                    <p className="font-body text-xs text-text-muted mt-0.5">
                      Giảm {v.discount_type === 'percent' ? `${v.discount_value}%` : formatVND(v.discount_value)}
                      {v.min_order_amount > 0 && ` · Đơn từ ${formatVND(v.min_order_amount)}`}
                      {v.expires_at && ` · HH ${format(parseISO(v.expires_at), 'dd/MM/yyyy')}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="text-right mr-2">
                    <p className="font-body text-xs text-text-muted">Đã phát</p>
                    <p className="font-body text-sm text-text-primary">{v.total_issued}{v.max_issue ? `/${v.max_issue}` : ''}</p>
                  </div>
                  <button
                    onClick={() => { setDistributeId(v.id); setDistributeResult(null); }}
                    className="p-2 hover:bg-bg-secondary rounded-lg text-text-muted hover:text-accent transition-colors"
                    title={t('distribute_voucher')}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Sheet */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSheetOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-bg-secondary sticky top-0 bg-white">
              <h3 className="font-display text-base text-text-primary">{t('create_voucher')}</h3>
              <button onClick={() => setSheetOpen(false)} className="p-1 hover:bg-bg-secondary rounded-lg">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-body text-xs text-text-muted block mb-1">{t('voucher_code_label')} *</label>
                <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm font-mono focus:outline-none focus:border-accent uppercase"
                  placeholder="SUMMER20" />
              </div>
              <div>
                <label className="font-body text-xs text-text-muted block mb-1">{t('voucher_name_label')} *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs text-text-muted block mb-1">Loại giảm</label>
                  <select value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'percent' | 'fixed' }))}
                    className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm bg-white focus:outline-none focus:border-accent">
                    <option value="percent">{t('voucher_type_percent')}</option>
                    <option value="fixed">{t('voucher_type_fixed')}</option>
                  </select>
                </div>
                <div>
                  <label className="font-body text-xs text-text-muted block mb-1">{t('voucher_value_label')}</label>
                  <input type="number" min={0} value={form.discount_value}
                    onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))}
                    className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs text-text-muted block mb-1">{t('voucher_min_order_label')}</label>
                  <input type="number" min={0} value={form.min_order_amount}
                    onChange={(e) => setForm((f) => ({ ...f, min_order_amount: Number(e.target.value) }))}
                    className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="font-body text-xs text-text-muted block mb-1">{t('voucher_max_issue_label')}</label>
                  <input type="number" min={1} value={form.max_issue}
                    onChange={(e) => setForm((f) => ({ ...f, max_issue: e.target.value }))}
                    className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent"
                    placeholder="Không giới hạn" />
                </div>
              </div>

              <div>
                <label className="font-body text-xs text-text-muted block mb-1">{t('voucher_expires_label')}</label>
                <input type="date" value={form.expires_at}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                  className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent" />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-bg-secondary px-5 py-4">
              <button onClick={() => void save()} disabled={saving || !form.code || !form.name}
                className="w-full py-3 rounded-xl bg-accent text-bg-dark font-body text-sm font-semibold hover:bg-accent-dark disabled:opacity-50 transition-colors">
                {saving ? 'Đang lưu...' : 'Tạo voucher'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Distribute Modal */}
      {distributeId && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => { setDistributeId(null); setDistributeResult(null); }} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white rounded-2xl z-50 p-5 shadow-2xl space-y-4">
            <h3 className="font-display text-base text-text-primary">{t('distribute_voucher')}</h3>

            {distributeResult !== null ? (
              <div className="text-center space-y-3">
                <p className="font-body text-2xl text-text-primary font-bold">{distributeResult}</p>
                <p className="font-body text-sm text-text-muted">khách nhận được voucher</p>
                <button onClick={() => { setDistributeId(null); setDistributeResult(null); }}
                  className="w-full py-2.5 rounded-xl bg-accent text-bg-dark font-body text-sm">
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {[
                    { value: 'regular_plus', label: t('distribute_regular_plus') },
                    { value: 'birthday', label: t('distribute_birthday') },
                    { value: 'vip', label: 'Chỉ VIP' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 p-3 rounded-xl border border-bg-secondary cursor-pointer hover:bg-bg-secondary transition-colors">
                      <input type="radio" name="distribute_to" value={opt.value}
                        checked={distributeTo === opt.value}
                        onChange={() => setDistributeTo(opt.value)}
                        className="accent-accent" />
                      <span className="font-body text-sm text-text-primary">{opt.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setDistributeId(null)} className="flex-1 py-2.5 rounded-xl border border-bg-secondary font-body text-sm text-text-secondary">
                    Huỷ
                  </button>
                  <button onClick={() => void distribute()} disabled={distributing}
                    className="flex-1 py-2.5 rounded-xl bg-accent text-bg-dark font-body text-sm font-semibold hover:bg-accent-dark disabled:opacity-50 transition-colors">
                    {distributing ? 'Đang phát...' : t('distribute_confirm')}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
