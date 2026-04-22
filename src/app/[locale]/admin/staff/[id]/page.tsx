/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/lib/navigation';
import { ArrowLeft, Save, Calendar, BarChart3, User, CheckCircle, AlertCircle, CalendarOff, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BookingRow {
  id: string;
  status: string;
  scheduled_at: string;
  customer_name: string | null;
  booking_services: { service_name: string | null; price: number }[];
}

interface CommissionRow {
  id: string;
  created_at: string;
  total: number;
  commission_amount: number;
  customer_name: string | null;
}

interface LeaveRow {
  id: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  review_note: string | null;
  created_at: string;
}

interface StaffDetail {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  staff_profiles: {
    specialties: string[];
    base_salary: number;
    commission_pct: number;
    color: string;
    bio: string | null;
  } | null;
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const BOOKING_STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  in_progress: 'Đang thực hiện',
  done: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

const LEAVE_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-600' },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StaffDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<StaffDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'profile' | 'history' | 'commissions' | 'leaves'>('profile');

  // Controlled form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [commissionPct, setCommissionPct] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Tab data
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [commissionsLoading, setCommissionsLoading] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRow[]>([]);
  const [leavesLoading, setLeavesLoading] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/v1/admin/staff/${id}`);
    const json = await res.json() as { data: StaffDetail | null };
    setData(json.data);
    if (json.data) {
      const p = json.data.staff_profiles;
      setFullName(json.data.full_name);
      setPhone(json.data.phone);
      setSpecialties(p?.specialties.join(', ') ?? '');
      setBaseSalary(String(p?.base_salary ?? ''));
      setCommissionPct(String(p?.commission_pct ?? ''));
      setBio(p?.bio ?? '');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { if (id) void fetchStaff(); }, [fetchStaff]);

  useEffect(() => {
    if (tab === 'history' && id) {
      setBookingsLoading(true);
      void fetch(`/api/v1/admin/bookings?staff_id=${id}&limit=100`)
        .then(r => r.json())
        .then((j: { data: BookingRow[] | null }) => {
          setBookings(j.data ?? []);
          setBookingsLoading(false);
        });
    }
    if (tab === 'commissions' && id) {
      setCommissionsLoading(true);
      void fetch(`/api/v1/admin/orders?staff_id=${id}&limit=100`)
        .then(r => r.json())
        .then((j: { data: { id: string; created_at: string; total: number; customer: { full_name: string } | null }[] | null }) => {
          const pct = data?.staff_profiles?.commission_pct ?? 0;
          const rows: CommissionRow[] = (j.data ?? []).map(o => ({
            id: o.id,
            created_at: o.created_at,
            total: o.total,
            commission_amount: Math.round(o.total * pct / 100),
            customer_name: o.customer?.full_name ?? null,
          }));
          setCommissions(rows);
          setCommissionsLoading(false);
        });
    }
    if (tab === 'leaves' && id) {
      setLeavesLoading(true);
      void fetch(`/api/v1/staff/leave-requests?staff_id=${id}`)
        .then(r => r.json())
        .then((j: { data: LeaveRow[] | null }) => {
          setLeaves(j.data ?? []);
          setLeavesLoading(false);
        });
    }
  }, [tab, id, data?.staff_profiles?.commission_pct]);

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/v1/admin/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
          base_salary: Number(baseSalary),
          commission_pct: Number(commissionPct),
          bio: bio.trim() || null,
        }),
      });
      const json = await res.json() as { data: { success: boolean } | null; error: { message: string } | null };
      if (!res.ok || json.error) {
        setSaveError(json.error?.message ?? 'Lỗi lưu dữ liệu');
      } else {
        setSaveSuccess(true);
        setData(prev => prev ? {
          ...prev,
          full_name: fullName.trim(),
          phone: phone.trim(),
          staff_profiles: prev.staff_profiles ? {
            ...prev.staff_profiles,
            specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
            base_salary: Number(baseSalary),
            commission_pct: Number(commissionPct),
            bio: bio.trim() || null,
          } : null,
        } : null);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Lỗi kết nối');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-center animate-pulse font-body text-text-muted">Đang tải hồ sơ...</div>;
  if (!data) return <div className="p-10 text-center text-red-500 font-body">Nhân viên không tồn tại</div>;

  const profile = data.staff_profiles;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back button — uses Link for reliable navigation */}
      <Link
        href="/admin/staff"
        className="inline-flex items-center gap-1.5 text-text-muted font-body text-sm hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Danh sách nhân viên
      </Link>

      {/* Header Profile */}
      <div className="bg-white rounded-3xl border border-bg-secondary p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16" />

        <div className="w-24 h-24 rounded-full bg-bg-secondary overflow-hidden border-4 border-white shadow-xl flex items-center justify-center shrink-0">
          {data.avatar_url ? (
            <img src={data.avatar_url} alt={data.full_name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-4xl text-text-muted font-bold">{data.full_name.charAt(0)}</span>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="font-display text-2xl text-text-primary mb-1">{data.full_name}</h1>
          <p className="font-body text-sm text-text-muted mb-3">{data.phone}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent-dark font-body text-[10px] font-bold uppercase">
              {data.role}
            </span>
            {profile?.specialties.map((s, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-bg-secondary text-text-secondary font-body text-[10px] uppercase">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
          <p className="font-body text-[10px] text-text-muted uppercase tracking-wider">Trạng thái</p>
          <span className={cn(
            "px-3 py-1 rounded-full font-body text-xs font-medium",
            data.is_active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
          )}>
            {data.is_active ? 'Đang làm việc' : 'Nghỉ việc'}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-bg-secondary p-5">
          <p className="font-body text-[10px] text-text-muted uppercase mb-1">Doanh thu tháng này</p>
          <p className="font-display text-xl text-text-primary">{formatVND(0)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-bg-secondary p-5">
          <p className="font-body text-[10px] text-text-muted uppercase mb-1">Tỉ lệ hoa hồng</p>
          <p className="font-display text-xl text-accent">{profile?.commission_pct ?? 0}%</p>
        </div>
        <div className="bg-white rounded-2xl border border-bg-secondary p-5">
          <p className="font-body text-[10px] text-text-muted uppercase mb-1">Lương cơ bản</p>
          <p className="font-display text-xl text-text-primary">{formatVND(profile?.base_salary ?? 0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-bg-secondary/50 p-1.5 rounded-2xl overflow-x-auto">
        {[
          { key: 'profile', icon: User, label: 'Hồ sơ' },
          { key: 'history', icon: Calendar, label: 'Lịch hẹn' },
          { key: 'commissions', icon: BarChart3, label: 'Hoa hồng' },
          { key: 'leaves', icon: CalendarOff, label: 'Nghỉ phép' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-body text-sm transition-all whitespace-nowrap px-3",
              tab === key ? "bg-white text-text-primary shadow-sm font-bold" : "text-text-muted hover:text-text-secondary"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">

        {/* ── Profile Tab ─────────────────────────────────────────────────────── */}
        {tab === 'profile' && (
          <div className="bg-white rounded-3xl border border-bg-secondary p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="font-body text-xs text-text-muted uppercase mb-1.5 block">Họ và tên</label>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-bg-secondary/30 border border-bg-secondary rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-text-muted uppercase mb-1.5 block">Số điện thoại</label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-bg-secondary/30 border border-bg-secondary rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-text-muted uppercase mb-1.5 block">Lương cơ bản (VND)</label>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={e => setBaseSalary(e.target.value)}
                    className="w-full bg-bg-secondary/30 border border-bg-secondary rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="font-body text-xs text-text-muted uppercase mb-1.5 block">Chuyên môn (ngăn cách bởi dấu phẩy)</label>
                  <input
                    value={specialties}
                    onChange={e => setSpecialties(e.target.value)}
                    className="w-full bg-bg-secondary/30 border border-bg-secondary rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-text-muted uppercase mb-1.5 block">Hoa hồng (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={commissionPct}
                    onChange={e => setCommissionPct(e.target.value)}
                    className="w-full bg-bg-secondary/30 border border-bg-secondary rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-body text-xs text-text-muted uppercase mb-1.5 block">Tiểu sử tóm tắt</label>
              <textarea
                rows={4}
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full bg-bg-secondary/30 border border-bg-secondary rounded-xl px-4 py-2.5 font-body text-sm resize-none focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {saveError && (
              <div className="flex items-center gap-2 text-red-600 font-body text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="flex items-center gap-2 text-green-600 font-body text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Đã lưu thay đổi thành công!
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-bg-secondary">
              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-bg-dark text-white font-body text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        )}

        {/* ── Booking History Tab ─────────────────────────────────────────────── */}
        {tab === 'history' && (
          <div className="bg-white rounded-3xl border border-bg-secondary overflow-hidden">
            {bookingsLoading ? (
              <div className="p-20 text-center font-body text-text-muted animate-pulse">Đang tải...</div>
            ) : bookings.length === 0 ? (
              <div className="p-20 text-center font-body text-text-muted">Chưa có lịch hẹn nào</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-bg-secondary/50 border-b border-bg-secondary">
                    <th className="px-6 py-4 text-left font-body text-xs text-text-muted uppercase">Thời gian</th>
                    <th className="px-6 py-4 text-left font-body text-xs text-text-muted uppercase">Khách hàng</th>
                    <th className="px-6 py-4 text-left font-body text-xs text-text-muted uppercase">Dịch vụ</th>
                    <th className="px-6 py-4 text-center font-body text-xs text-text-muted uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-secondary">
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td className="px-6 py-4">
                        <p className="font-body text-sm text-text-primary">{format(parseISO(b.scheduled_at), 'dd/MM/yyyy')}</p>
                        <p className="font-body text-xs text-text-muted">{format(parseISO(b.scheduled_at), 'HH:mm')}</p>
                      </td>
                      <td className="px-6 py-4 font-body text-sm text-text-primary">{b.customer_name || 'Khách lẻ'}</td>
                      <td className="px-6 py-4 font-body text-xs text-text-secondary">
                        {b.booking_services?.map(s => s.service_name).filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-bg-secondary text-[10px] text-text-muted font-medium">
                          {BOOKING_STATUS_LABEL[b.status] ?? b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Commissions Tab ─────────────────────────────────────────────────── */}
        {tab === 'commissions' && (
          <div className="bg-white rounded-3xl border border-bg-secondary overflow-hidden">
            {commissionsLoading ? (
              <div className="p-20 text-center font-body text-text-muted animate-pulse">Đang tải...</div>
            ) : commissions.length === 0 ? (
              <div className="p-20 text-center font-body text-text-muted">Chưa có dữ liệu hoa hồng</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-bg-secondary/50 border-b border-bg-secondary">
                    <th className="px-6 py-4 text-left font-body text-xs text-text-muted uppercase">Ngày tạo</th>
                    <th className="px-6 py-4 text-left font-body text-xs text-text-muted uppercase">Khách hàng</th>
                    <th className="px-6 py-4 text-right font-body text-xs text-text-muted uppercase">Doanh thu</th>
                    <th className="px-6 py-4 text-right font-body text-xs uppercase text-accent font-bold">Hoa hồng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-secondary">
                  {commissions.map(c => (
                    <tr key={c.id}>
                      <td className="px-6 py-4 font-body text-sm text-text-primary">
                        {format(parseISO(c.created_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 font-body text-sm text-text-primary">{c.customer_name || 'Khách lẻ'}</td>
                      <td className="px-6 py-4 text-right font-body text-sm text-text-secondary">{formatVND(c.total)}</td>
                      <td className="px-6 py-4 text-right font-body text-sm text-accent font-bold">{formatVND(c.commission_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Leaves Tab ──────────────────────────────────────────────────────── */}
        {tab === 'leaves' && (
          <div className="space-y-3">
            {leavesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-bg-secondary rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : leaves.length === 0 ? (
              <div className="bg-white rounded-3xl border border-bg-secondary p-20 text-center font-body text-text-muted">
                Chưa có đơn nghỉ phép nào
              </div>
            ) : (
              leaves.map(lr => {
                const s = LEAVE_STATUS[lr.status];
                return (
                  <div key={lr.id} className="bg-white border border-border rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={14} className="text-text-muted" />
                          <span className="font-body text-sm font-medium text-text-primary">
                            {new Date(lr.date).toLocaleDateString('vi-VN', {
                              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="font-body text-sm text-text-muted mb-1">{lr.reason}</p>
                        {lr.review_note && (
                          <p className="font-body text-xs text-text-muted italic">Ghi chú: {lr.review_note}</p>
                        )}
                        <p className="font-body text-xs text-text-muted/60 mt-1">
                          Gửi lúc: {format(parseISO(lr.created_at), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                      <span className={cn('flex items-center gap-1 font-body text-xs px-2.5 py-1 rounded-full whitespace-nowrap', s?.color)}>
                        {s?.label ?? lr.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
