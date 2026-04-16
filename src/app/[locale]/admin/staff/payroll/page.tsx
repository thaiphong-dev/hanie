'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PayrollRow {
  id: string; full_name: string; base_salary: number; commission_pct: number;
  month_revenue: number; month_commission: number; month_total: number;
  finalized?: boolean;
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function PayrollPage() {
  const t = useTranslations('admin');
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/v1/admin/staff?year=${year}&month=${month}`);
    const json = await res.json() as { data: PayrollRow[] };
    setRows(json.data ?? []);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { void fetchStaff(); }, [fetchStaff]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  async function finalize(staffId: string) {
    setFinalizing(staffId);
    try {
      await fetch('/api/v1/admin/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staffId, year, month }),
      });
      void fetchStaff();
    } finally {
      setFinalizing(null);
      setConfirming(null);
    }
  }

  const totals = rows.reduce(
    (s, r) => ({
      base: s.base + r.base_salary,
      commission: s.commission + r.month_commission,
      total: s.total + r.month_total,
    }),
    { base: 0, commission: 0, total: 0 },
  );

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header + month picker */}
      <div className="flex items-center gap-4">
        <h2 className="font-display text-xl text-text-primary">{t('payroll_title')}</h2>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={prevMonth} className="p-1.5 hover:bg-bg-secondary rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <span className="font-body text-sm text-text-primary min-w-[100px] text-center">
            {t('payroll_month', { month, year })}
          </span>
          <button onClick={nextMonth} className="p-1.5 hover:bg-bg-secondary rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-bg-secondary overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-6 gap-0 bg-bg-secondary">
          {['Nhân viên', t('payroll_base'), t('payroll_bill'), `${t('payroll_commission_pct')}`, t('payroll_commission_amount'), t('payroll_total')].map((h, i) => (
            <div key={i} className={cn('px-4 py-3 font-body text-xs text-text-muted font-medium', i > 0 && 'text-right')}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-0 border-t border-bg-secondary animate-pulse">
              {Array.from({ length: 6 }).map((__, j) => (
                <div key={j} className="px-4 py-4">
                  <div className="h-3 bg-bg-secondary rounded" />
                </div>
              ))}
            </div>
          ))
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center h-20 font-body text-sm text-text-muted">Chưa có dữ liệu</div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="grid grid-cols-6 gap-0 border-t border-bg-secondary items-center">
              <div className="px-4 py-3">
                <p className="font-body text-sm text-text-primary">{row.full_name}</p>
                {row.finalized && (
                  <span className="flex items-center gap-1 font-body text-[10px] text-green-600">
                    <Lock className="w-2.5 h-2.5" /> {t('payroll_finalized')}
                  </span>
                )}
              </div>
              <div className="px-4 py-3 text-right font-body text-sm text-text-primary">{formatVND(row.base_salary)}</div>
              <div className="px-4 py-3 text-right font-body text-sm text-text-secondary">{formatVND(row.month_revenue)}</div>
              <div className="px-4 py-3 text-right font-body text-sm text-text-secondary">{row.commission_pct}%</div>
              <div className="px-4 py-3 text-right font-body text-sm text-text-secondary">{formatVND(row.month_commission)}</div>
              <div className="px-4 py-3 text-right flex items-center justify-end gap-2">
                <span className="font-body text-sm font-semibold text-text-primary">{formatVND(row.month_total)}</span>
                {!row.finalized && (
                  confirming === row.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => void finalize(row.id)}
                        disabled={finalizing === row.id}
                        className="px-2 py-1 rounded-lg bg-green-500 text-white font-body text-xs hover:bg-green-600 disabled:opacity-50"
                      >
                        Xác nhận
                      </button>
                      <button
                        onClick={() => setConfirming(null)}
                        className="px-2 py-1 rounded-lg border border-bg-secondary font-body text-xs text-text-secondary"
                      >
                        Huỷ
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirming(row.id)}
                      className="px-2 py-1 rounded-lg border border-accent text-accent-dark font-body text-xs hover:bg-accent/10 transition-colors"
                    >
                      {t('finalize_payroll')}
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}

        {/* Totals row */}
        {rows.length > 0 && !loading && (
          <div className="grid grid-cols-6 gap-0 border-t-2 border-bg-secondary bg-bg-secondary/50">
            <div className="px-4 py-3 font-body text-sm font-semibold text-text-primary">Tổng</div>
            <div className="px-4 py-3 text-right font-body text-sm font-semibold text-text-primary">{formatVND(totals.base)}</div>
            <div className="px-4 py-3" />
            <div className="px-4 py-3" />
            <div className="px-4 py-3 text-right font-body text-sm font-semibold text-text-primary">{formatVND(totals.commission)}</div>
            <div className="px-4 py-3 text-right font-body text-sm font-semibold text-accent-dark">{formatVND(totals.total)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
