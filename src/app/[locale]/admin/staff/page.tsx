'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PendingLeave { id: string; date: string; reason: string; }
interface StaffMember {
  id: string; full_name: string; phone: string; avatar_url: string | null;
  specialties: string[]; base_salary: number; commission_pct: number; color: string;
  month_revenue: number; month_commission: number; month_total: number;
  pending_leaves: PendingLeave[];
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

// ── StaffCard ─────────────────────────────────────────────────────────────────

function StaffCard({ staff, onLeaveAction, locale }: {
  staff: StaffMember;
  onLeaveAction: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  locale: string;
}) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  async function handleAction(leaveId: string, status: 'approved' | 'rejected') {
    if (status === 'approved') setApproving(leaveId);
    else setRejecting(leaveId);
    await onLeaveAction(leaveId, status);
    setApproving(null); setRejecting(null);
  }

  return (
    <div className="bg-white rounded-2xl border border-bg-secondary p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: staff.color + '33' }}
        >
          <span className="font-display text-lg font-bold" style={{ color: staff.color }}>
            {staff.full_name.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-display text-base text-text-primary">{staff.full_name}</p>
          <p className="font-body text-xs text-text-muted">{staff.phone}</p>
          {staff.specialties.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {staff.specialties.map((sp) => (
                <span key={sp} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent-dark font-body text-[10px]">{sp}</span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => router.push(`/${locale}/admin/staff/payroll`)}
          className="px-3 py-1.5 rounded-lg border border-bg-secondary font-body text-xs text-text-secondary hover:bg-bg-secondary transition-colors"
        >
          {t('payroll_title')}
        </button>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-bg-secondary rounded-xl p-2">
          <p className="font-body text-[10px] text-text-muted">{t('payroll_base')}</p>
          <p className="font-body text-sm text-text-primary">{formatVND(staff.base_salary)}</p>
        </div>
        <div className="bg-bg-secondary rounded-xl p-2">
          <p className="font-body text-[10px] text-text-muted">{t('staff_commission')} ({staff.commission_pct}%)</p>
          <p className="font-body text-sm text-text-primary">{formatVND(staff.month_commission)}</p>
        </div>
        <div className="bg-accent/10 rounded-xl p-2">
          <p className="font-body text-[10px] text-accent-dark">{t('payroll_total')}</p>
          <p className="font-body text-sm text-accent-dark font-semibold">{formatVND(staff.month_total)}</p>
        </div>
      </div>

      {/* Pending leaves */}
      {staff.pending_leaves.length > 0 && (
        <div className="border border-amber-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <p className="font-body text-xs text-amber-700 font-medium">{t('pending_approval')}</p>
          </div>
          {staff.pending_leaves.map((lr) => (
            <div key={lr.id} className="space-y-1.5">
              <p className="font-body text-xs text-text-primary">
                {t('leave_date', { date: format(new Date(lr.date), 'dd/MM/yyyy') })}
              </p>
              <p className="font-body text-xs text-text-muted">{lr.reason}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => void handleAction(lr.id, 'approved')}
                  disabled={approving === lr.id}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-500 text-white font-body text-xs hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {t('approve')}
                </button>
                <button
                  onClick={() => void handleAction(lr.id, 'rejected')}
                  disabled={rejecting === lr.id}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-500 text-white font-body text-xs hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  <X className="w-3 h-3" />
                  {t('reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/v1/admin/staff?year=${year}&month=${month}`);
    const json = await res.json() as { data: StaffMember[] };
    setStaff(json.data ?? []);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { void fetchStaff(); }, [fetchStaff]);

  async function handleLeaveAction(leaveId: string, status: 'approved' | 'rejected') {
    await fetch(`/api/v1/admin/leave-requests/${leaveId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    void fetchStaff();
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-text-primary">{t('staff_list')}</h2>
        <p className="font-body text-sm text-text-muted">
          {t('payroll_month', { month, year })}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-bg-secondary rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-2xl border border-bg-secondary flex items-center justify-center h-32 font-body text-sm text-text-muted">
          Chưa có nhân viên
        </div>
      ) : (
        <div className="space-y-4">
          {staff.map((s) => (
            <StaffCard key={s.id} staff={s} onLeaveAction={handleLeaveAction} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
