/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Search,  Edit,  ExternalLink } from 'lucide-react';
import { Link } from '@/lib/navigation';

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    const res = await fetch('/api/v1/admin/staff');
    const json = await res.json();
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
          onClick={() => {/* new staff modal */}}
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
                    <div className="w-14 h-14 rounded-full bg-bg-secondary overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
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
                    <p className="font-body text-[10px] text-text-muted uppercase mb-1">Doanh thu T4</p>
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
    </div>
  );
}
