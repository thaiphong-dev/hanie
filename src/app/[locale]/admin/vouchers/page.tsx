/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, X, Send, Tag, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface Voucher {
  id: string; code: string; name: string;
  discount_type: 'percent' | 'fixed'; discount_value: number;
  min_order_amount: number; required_member_tier: string | null;
  total_issued: number; max_issue: number | null;
  expires_at: string | null; status: string;
}

// const STATUS_COLORS: Record<string, string> = {
//   active: 'bg-green-100 text-green-700',
//   draft: 'bg-gray-100 text-gray-600',
//   expired: 'bg-red-100 text-red-600',
//   disabled: 'bg-gray-100 text-gray-500',
// };

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

interface VoucherRule {
  id: string;
  voucher_id: string;
  rule_type: 'birthday_month' | 'points_gte' | 'member_tier' | 'total_spent_gte' | 'manual' | 'new_register' | 'order_amount_gte';
  threshold: number | null;
  tier_value: string | null;
  is_active: boolean;
}

interface RuleForm {
  rule_type: 'none' | 'birthday_month' | 'points_gte' | 'member_tier' | 'total_spent_gte' | 'new_register' | 'order_amount_gte';
  threshold: string;
  tier_value: string;
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
  const [distributeTo, setDistributeTo] = useState('all');
  const [distributing, setDistributing] = useState(false);
  const [distributeResult, setDistributeResult] = useState<number | null>(null);
  const [form, setForm] = useState<VoucherForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [ruleForm, setRuleForm] = useState<RuleForm>({ rule_type: 'none', threshold: '', tier_value: '' });
  const [voucherRules, setVoucherRules] = useState<Record<string, VoucherRule | null>>({});

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired' | 'disabled'>('all');

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    const [vRes, rRes] = await Promise.all([
      fetch('/api/v1/admin/vouchers'),
      fetch('/api/v1/admin/voucher-rules'),
    ]);
    const vJson = await vRes.json() as { data: Voucher[] };
    const rJson = await rRes.json() as { data: VoucherRule[] };
    setVouchers(vJson.data ?? []);
    const byVoucher: Record<string, VoucherRule> = {};
    for (const rule of rJson.data ?? []) {
      byVoucher[rule.voucher_id] = rule;
    }
    setVoucherRules(byVoucher);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchVouchers(); }, [fetchVouchers]);

  const filteredVouchers = vouchers.filter(v => {
    if (activeTab === 'all') return true;
    return v.status === activeTab;
  });

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    await fetch(`/api/v1/admin/vouchers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    void fetchVouchers();
  }

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

    const isEditing = !!(form as any).id;
    const url = isEditing ? `/api/v1/admin/vouchers/${(form as any).id}` : '/api/v1/admin/vouchers';
    const method = isEditing ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json() as { data: { id: string } | null };
    const voucherId = (form as any).id ?? json.data?.id;

    // Save voucher rule if applicable
    if (voucherId && ruleForm.rule_type !== 'none') {
      const needsThreshold = ['points_gte', 'total_spent_gte', 'order_amount_gte'].includes(ruleForm.rule_type);
      await fetch('/api/v1/admin/voucher-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voucher_id: voucherId,
          rule_type: ruleForm.rule_type,
          threshold: needsThreshold ? Number(ruleForm.threshold) : null,
          tier_value: ruleForm.rule_type === 'member_tier' ? ruleForm.tier_value : null,
        }),
      });
    } else if (voucherId && ruleForm.rule_type === 'none') {
      // Delete existing rule if switching to "none"
      const existing = voucherRules[voucherId];
      if (existing) {
        await fetch(`/api/v1/admin/voucher-rules/${existing.id}`, { method: 'DELETE' });
      }
    }

    setSaving(false);
    setSheetOpen(false);
    setRuleForm({ rule_type: 'none', threshold: '', tier_value: '' });
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

  const TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'active', label: 'Đang chạy' },
    { key: 'expired', label: 'Hết hạn' },
    { key: 'disabled', label: 'Đã tạm ngưng' },
  ] as const;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-text-primary">Mã giảm giá</h2>
          <p className="font-body text-sm text-text-muted mt-1">Quản lý và phát hành chương trình ưu đãi</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setRuleForm({ rule_type: 'none', threshold: '', tier_value: '' }); setSheetOpen(true); }}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('create_voucher')}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-bg-secondary/50 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-1.5 rounded-lg font-body text-xs transition-all",
              activeTab === tab.key ? "bg-white text-text-primary shadow-sm font-bold" : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Voucher list */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-bg-secondary rounded-2xl animate-pulse" />)
        ) : filteredVouchers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-bg-secondary flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center">
              <Tag className="w-8 h-8 text-text-muted" />
            </div>
            <p className="font-body text-sm text-text-muted">Không tìm thấy mã giảm giá nào</p>
          </div>
        ) : (
          filteredVouchers.map((v) => (
            <div key={v.id} className={cn(
              "bg-white rounded-3xl border border-bg-secondary p-5 hover:shadow-lg transition-all group",
              v.status !== 'active' && "opacity-75"
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    v.status === 'active' ? "bg-accent/10" : "bg-bg-secondary"
                  )}>
                    <Tag className={cn("w-6 h-6", v.status === 'active' ? "text-accent" : "text-text-muted")} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-display text-base font-bold text-text-primary tracking-tight">{v.code}</p>
                      <span className={cn(
                        'px-2 py-0.5 rounded-lg font-body text-[10px] font-bold uppercase tracking-wider border',
                        v.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        v.status === 'expired' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                      )}>
                        {v.status === 'active' ? 'Đang chạy' : v.status === 'expired' ? 'Hết hạn' : 'Tạm ngưng'}
                      </span>
                    </div>
                    <p className="font-body text-xs text-text-secondary font-medium">{v.name}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                       <p className="font-body text-[11px] text-text-primary font-bold bg-bg-secondary px-2 py-0.5 rounded">
                         Giảm {v.discount_type === 'percent' ? `${v.discount_value}%` : formatVND(v.discount_value)}
                       </p>
                       {v.min_order_amount > 0 && (
                         <p className="font-body text-[11px] text-text-muted italic">Đơn từ {formatVND(v.min_order_amount)}</p>
                       )}
                       {voucherRules[v.id] && (
                         <span className="font-body text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                           {voucherRules[v.id]?.rule_type === 'new_register' && '🎁 Thành viên mới'}
                           {voucherRules[v.id]?.rule_type === 'order_amount_gte' && `🧾 Đơn ≥${formatVND(voucherRules[v.id]?.threshold ?? 0)}`}
                           {voucherRules[v.id]?.rule_type === 'birthday_month' && '🎂 Sinh nhật'}
                           {voucherRules[v.id]?.rule_type === 'points_gte' && `⭐≥${voucherRules[v.id]?.threshold}đ`}
                           {voucherRules[v.id]?.rule_type === 'member_tier' && `👑 ${voucherRules[v.id]?.tier_value?.toUpperCase()}`}
                           {voucherRules[v.id]?.rule_type === 'total_spent_gte' && `💰≥${formatVND(voucherRules[v.id]?.threshold ?? 0)}`}
                         </span>
                       )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="text-right mr-4 px-4 border-r border-bg-secondary">
                    <p className="font-body text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Đã phát / Toàn bộ</p>
                    <p className="font-display text-sm text-text-primary font-bold">
                       {v.total_issued.toLocaleString()}{v.max_issue ? ` / ${v.max_issue.toLocaleString()}` : ' / \u221e'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => {
                        const existing = {
                          ...v,
                          expires_at: v.expires_at ? format(parseISO(v.expires_at), 'yyyy-MM-dd') : '',
                          max_issue: v.max_issue ?? '',
                        };
                        setForm(existing as any);
                        const rule = voucherRules[v.id];
                        setRuleForm(rule ? {
                          rule_type: rule.rule_type === 'manual' ? 'none' : rule.rule_type,
                          threshold: rule.threshold != null ? String(rule.threshold) : '',
                          tier_value: rule.tier_value ?? '',
                        } : { rule_type: 'none', threshold: '', tier_value: '' });
                        setSheetOpen(true);
                      }}
                      className="p-2.5 hover:bg-bg-secondary rounded-xl text-text-muted hover:text-text-primary transition-all"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => void toggleStatus(v.id, v.status)}
                      className={cn(
                        "p-2.5 rounded-xl transition-all",
                        v.status === 'active' ? "text-rose-500 hover:bg-rose-50" : "text-emerald-500 hover:bg-emerald-50"
                      )}
                      title={v.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
                    >
                      {v.status === 'active' ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => { setDistributeId(v.id); setDistributeResult(null); }}
                      className="p-2.5 hover:bg-black hover:text-white rounded-xl text-text-muted transition-all ml-1"
                      title="Phát hành ngay"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {v.expires_at && (
                <div className="mt-4 pt-4 border-t border-dashed border-bg-secondary flex items-center justify-between">
                   <p className="font-body text-[10px] text-text-muted">
                     Hết hạn vào: <span className="font-bold text-text-secondary">{format(parseISO(v.expires_at), 'dd/MM/yyyy')}</span>
                   </p>
                   <div className="flex items-center gap-1">
                      <div className="w-24 h-1 bg-bg-secondary rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-accent" 
                           style={{ width: v.max_issue ? `${Math.min(100, (v.total_issued / v.max_issue) * 100)}%` : '0%' }} 
                         />
                      </div>
                      <span className="font-body text-[9px] text-text-muted font-bold">
                        {v.max_issue ? `${Math.round((v.total_issued / v.max_issue) * 100)}%` : '0%'}
                      </span>
                   </div>
                </div>
              )}
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
              <h3 className="font-display text-base text-text-primary">
                {(form as any).id ? 'Chỉnh sửa Voucher' : t('create_voucher')}
              </h3>
              <button onClick={() => setSheetOpen(false)} className="p-1 hover:bg-bg-secondary rounded-lg">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-body text-xs text-text-muted block mb-1">{t('voucher_code_label')} *</label>
                <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="w-full border border-bg-secondary rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent uppercase"
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

              {/* Auto-distribution rule */}
              <div className="border-t border-bg-secondary pt-4 space-y-3">
                <p className="font-body text-xs font-semibold text-text-primary uppercase tracking-wider">{t('voucher_rule_title')}</p>
                <select
                  value={ruleForm.rule_type}
                  onChange={(e) => setRuleForm((r) => ({ ...r, rule_type: e.target.value as RuleForm['rule_type'] }))}
                  className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm bg-white focus:outline-none focus:border-accent"
                >
                  <option value="none">{t('voucher_rule_none')}</option>
                  <option value="new_register">🎁 Chào mừng thành viên mới (tự động khi đăng ký)</option>
                  <option value="order_amount_gte">🧾 Hóa đơn ≥ ngưỡng (tự động khi thanh toán)</option>
                  <option value="birthday_month">🎂 Sinh nhật trong tháng</option>
                  <option value="points_gte">⭐ Điểm tích lũy ≥ ngưỡng</option>
                  <option value="member_tier">👑 Đạt cấp bậc thành viên</option>
                  <option value="total_spent_gte">💰 Tổng chi tiêu ≥ ngưỡng</option>
                </select>

                {/* new_register: no extra config needed */}
                {ruleForm.rule_type === 'new_register' && (
                  <p className="font-body text-xs text-text-muted bg-bg-secondary rounded-xl px-3 py-2">
                    Voucher sẽ tự động gửi cho khách khi họ đăng ký tài khoản mới (trong thời hạn hiệu lực voucher).
                  </p>
                )}

                {/* order_amount_gte: threshold = min order amount */}
                {ruleForm.rule_type === 'order_amount_gte' && (
                  <div className="space-y-2">
                    <div>
                      <label className="font-body text-xs text-text-muted block mb-1">
                        Giá trị hóa đơn tối thiểu (VND)
                      </label>
                      <input
                        type="number" min={0} step={10000} value={ruleForm.threshold}
                        onChange={(e) => setRuleForm((r) => ({ ...r, threshold: e.target.value }))}
                        className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent"
                        placeholder="500000"
                      />
                    </div>
                    <p className="font-body text-xs text-text-muted bg-bg-secondary rounded-xl px-3 py-2">
                      Voucher tự động gửi cho khách khi hóa đơn POS ≥ ngưỡng trên (trong thời hạn hiệu lực voucher).
                    </p>
                  </div>
                )}

                {(ruleForm.rule_type === 'points_gte' || ruleForm.rule_type === 'total_spent_gte') && (
                  <div>
                    <label className="font-body text-xs text-text-muted block mb-1">
                      Ngưỡng {ruleForm.rule_type === 'points_gte' ? '(điểm)' : '(VND)'}
                    </label>
                    <input
                      type="number" min={0} value={ruleForm.threshold}
                      onChange={(e) => setRuleForm((r) => ({ ...r, threshold: e.target.value }))}
                      className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent"
                      placeholder="0"
                    />
                  </div>
                )}
                {ruleForm.rule_type === 'member_tier' && (
                  <div>
                    <label className="font-body text-xs text-text-muted block mb-1">Cấp bậc</label>
                    <select
                      value={ruleForm.tier_value}
                      onChange={(e) => setRuleForm((r) => ({ ...r, tier_value: e.target.value }))}
                      className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm bg-white focus:outline-none focus:border-accent"
                    >
                      <option value="">-- Chọn cấp --</option>
                      <option value="new">Khách mới (New)</option>
                      <option value="regular">Regular</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-bg-secondary px-5 py-4">
              <button onClick={() => void save()} disabled={saving || !form.code || !form.name}
                className="w-full py-3 rounded-xl bg-accent text-bg-dark font-body text-sm font-semibold hover:bg-accent-dark disabled:opacity-50 transition-colors">
                {saving ? 'Đang lưu...' : (form as any).id ? 'Cập nhật' : 'Tạo voucher'}
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
                    { value: 'all', label: 'Tất cả khách hàng' },
                    { value: 'new_only', label: 'Chỉ khách hàng mới (New)' },
                    { value: 'regular_only', label: 'Chỉ Regular' },
                    { value: 'regular_plus', label: t('distribute_regular_plus') },
                    { value: 'vip', label: 'Chỉ VIP' },
                    { value: 'birthday', label: t('distribute_birthday') },
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
