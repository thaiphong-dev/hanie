/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useRef } from 'react';
import { UserPlus, Search, Edit, ExternalLink, X, Save, AlertCircle } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StaffMember {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  specialties: string[];
  base_salary: number;
  commission_pct: number;
  month_revenue: number;
  month_commission: number;
  month_total: number;
  color: string;
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

// ── Create Staff Modal ────────────────────────────────────────────────────────

const COLORS = ['#C9A882', '#8B6C42', '#6B8E6B', '#7B9BB5', '#B57B9A', '#B58A6A', '#6A8AB5', '#A89B6A'];

function CreateStaffModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [commissionPct, setCommissionPct] = useState('10');
  const [color, setColor] = useState(COLORS[0]!);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstInputRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/v1/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          role: 'staff',
          specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
          base_salary: Number(baseSalary) || 0,
          commission_pct: Number(commissionPct) || 0,
          color,
        }),
      });
      const json = await res.json() as { data: { id: string } | null; error: { message: string } | null };
      if (!res.ok || json.error) {
        setError(json.error?.message ?? 'Có lỗi xảy ra');
        return;
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-dark/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-bg-secondary">
          <h3 className="font-display text-xl text-text-primary">Thêm nhân viên mới</h3>
          <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-xl transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={e => void handleSubmit(e)} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-body text-xs text-text-muted uppercase tracking-wide">Họ và tên *</label>
              <input
                ref={firstInputRef}
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nguyễn Thị Lan"
                className="w-full px-4 py-2.5 rounded-xl border border-bg-secondary bg-white font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-body text-xs text-text-muted uppercase tracking-wide">Số điện thoại *</label>
              <input
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0901234567"
                type="tel"
                className="w-full px-4 py-2.5 rounded-xl border border-bg-secondary bg-white font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-1.5">
            <label className="font-body text-xs text-text-muted uppercase tracking-wide">Chuyên môn</label>
            <input
              value={specialties}
              onChange={e => setSpecialties(e.target.value)}
              placeholder="nail, mi, long_may (ngăn cách bởi dấu phẩy)"
              className="w-full px-4 py-2.5 rounded-xl border border-bg-secondary bg-white font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>

          {/* Salary + Commission */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-body text-xs text-text-muted uppercase tracking-wide">Lương cơ bản (VND)</label>
              <input
                type="number"
                min={0}
                value={baseSalary}
                onChange={e => setBaseSalary(e.target.value)}
                placeholder="4000000"
                className="w-full px-4 py-2.5 rounded-xl border border-bg-secondary bg-white font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-body text-xs text-text-muted uppercase tracking-wide">Hoa hồng (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={commissionPct}
                onChange={e => setCommissionPct(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-bg-secondary bg-white font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <label className="font-body text-xs text-text-muted uppercase tracking-wide">Màu hiển thị trên lịch</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    color === c ? "border-bg-dark scale-110 shadow-md" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
              {/* Custom color input */}
              <label className="w-8 h-8 rounded-full border-2 border-dashed border-bg-secondary flex items-center justify-center cursor-pointer hover:border-accent transition-colors" title="Màu tùy chỉnh">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="sr-only"
                />
                <span className="font-body text-[10px] text-text-muted">+</span>
              </label>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-4 h-4 rounded-full border border-bg-secondary" style={{ backgroundColor: color }} />
              <span className="font-body text-xs text-text-muted">{color}</span>
            </div>
          </div>

          {/* Note about password */}
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-3">
            <p className="font-body text-xs text-text-secondary">
              Mật khẩu mặc định sẽ là <span className="font-semibold text-accent">Hanie@</span> + 6 số cuối SĐT. Nhân viên có thể đổi sau khi đăng nhập.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 font-body text-sm p-3 bg-red-50 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-bg-secondary font-body text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={submitting || !fullName.trim() || !phone.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-bg-dark font-body text-sm font-semibold hover:bg-accent-dark disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Đang tạo...' : 'Tạo nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Staff List Page ───────────────────────────────────────────────────────────

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    const res = await fetch('/api/v1/admin/staff');
    const json = await res.json() as { data: StaffMember[] | null };
    setStaff(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => { void fetchStaff(); }, []);

  const filteredStaff = staff.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text-primary">Quản lý Nhân viên</h1>
          <p className="font-body text-sm text-text-muted mt-1">Quản lý hồ sơ, lương và hiệu suất nhân viên</p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Thêm nhân viên
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-bg-secondary p-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc số điện thoại..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-bg-secondary font-body text-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-bg-secondary p-6 animate-pulse">
              <div className="flex gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-bg-secondary" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-bg-secondary rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-10 bg-bg-secondary rounded-xl" />
                <div className="h-10 bg-bg-secondary rounded-xl" />
              </div>
            </div>
          ))
        ) : filteredStaff.length === 0 ? (
          <div className="col-span-full py-20 text-center font-body text-text-muted">Không tìm thấy nhân viên nào</div>
        ) : (
          filteredStaff.map((member) => (
            <div key={member.id} className="bg-white rounded-3xl border border-bg-secondary p-6 hover:shadow-xl transition-all group relative overflow-hidden">
              {/* Staff Color Strip */}
              <div className="absolute top-0 left-0 w-1.5 bottom-0" style={{ backgroundColor: member.color }} />

              <div className="flex justify-between items-start mb-6 pl-2">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-bg-secondary overflow-hidden flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display text-xl text-text-muted font-bold">{member.full_name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-display text-base text-text-primary group-hover:text-accent transition-colors">{member.full_name}</h2>
                    <p className="font-body text-xs text-text-muted">{member.phone}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.specialties.slice(0, 2).map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-bg-secondary text-[10px] text-text-secondary">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/admin/staff/${member.id}`}
                  className="p-2 hover:bg-bg-secondary rounded-xl transition-colors text-text-muted opacity-0 group-hover:opacity-100"
                >
                  <Edit className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6 pl-2">
                <div className="bg-bg-secondary/50 rounded-2xl p-3">
                  <p className="font-body text-[10px] text-text-muted uppercase mb-1">Doanh thu T{new Date().getMonth() + 1}</p>
                  <p className="font-display text-sm text-text-primary">{formatVND(member.month_revenue)}</p>
                </div>
                <div className="bg-bg-secondary/50 rounded-2xl p-3">
                  <p className="font-body text-[10px] text-text-muted uppercase mb-1">Thu nhập dự tính</p>
                  <p className="font-display text-sm text-emerald-600 font-bold">{formatVND(member.month_total)}</p>
                </div>
              </div>

              <Link
                href={`/admin/staff/${member.id}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-bg-secondary font-body text-xs font-medium text-text-secondary hover:bg-bg-dark hover:text-white hover:border-bg-dark transition-all pl-2"
              >
                Xem chi tiết & Lịch làm việc
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Create Staff Modal */}
      {showCreate && (
        <CreateStaffModal
          onClose={() => setShowCreate(false)}
          onCreated={() => void fetchStaff()}
        />
      )}
    </div>
  );
}
