'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Calendar, BarChart3, User, Gift, Scissors } from 'lucide-react';
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StaffDetailPage() {
  const t = useTranslations('admin');
  const params = useParams();
  const id = params?.id as string;
  const locale = useLocale();
  const router = useRouter();

  const [data, setData] = useState<StaffDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'profile' | 'history' | 'commissions'>('profile');
  
  // Tab data
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/v1/admin/staff/${id}`);
    const json = await res.json();
    setData(json.data);
    setLoading(false);
  }, [id]);

  useEffect(() => { if (id) void fetchStaff(); }, [fetchStaff]);

  useEffect(() => {
    if (tab === 'history' && id) {
      // Fetch bookings for this staff
      void fetch(`/api/v1/admin/bookings?staff_id=${id}&limit=50`)
        .then(r => r.json())
        .then(j => setBookings(j.data ?? []));
    }
    if (tab === 'commissions' && id) {
      // Fetch commissions (orders)
      void fetch(`/api/v1/admin/orders?staff_id=${id}&limit=50`)
        .then(r => r.json())
        .then(j => {
            const rows = (j.data ?? []).map((o: any) => ({
                id: o.id,
                created_at: o.created_at,
                total: o.total,
                commission_amount: Math.round(o.total * (data?.staff_profiles?.commission_pct ?? 0) / 100),
                customer_name: o.customer?.full_name
            }));
            setCommissions(rows);
        });
    }
  }, [tab, id, data?.staff_profiles?.commission_pct]);

  if (loading) return <div className="p-10 text-center animate-pulse">Đang tải hồ sơ...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Nhân viên không tồn tại</div>;

  const profile = data.staff_profiles;

  return (
    <div className="max-w-3xl space-y-6">
      <button
        onClick={() => router.push(`/${locale}/admin/staff`)}
        className="flex items-center gap-1.5 text-text-muted font-body text-sm hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Danh sách nhân viên
      </button>

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
           <p className="font-display text-xl text-text-primary">{formatVND(12500000)}</p>
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
      <div className="flex gap-2 bg-bg-secondary/50 p-1.5 rounded-2xl">
        <button 
          onClick={() => setTab('profile')}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-body text-sm transition-all", tab === 'profile' ? "bg-white text-text-primary shadow-sm font-bold" : "text-text-muted hover:text-text-secondary")}
        >
          <User className="w-4 h-4" />
          Hồ sơ
        </button>
        <button 
          onClick={() => setTab('history')}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-body text-sm transition-all", tab === 'history' ? "bg-white text-text-primary shadow-sm font-bold" : "text-text-muted hover:text-text-secondary")}
        >
          <Calendar className="w-4 h-4" />
          Lịch làm việc
        </button>
        <button 
          onClick={() => setTab('commissions')}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-body text-sm transition-all", tab === 'commissions' ? "bg-white text-text-primary shadow-sm font-bold" : "text-text-muted hover:text-text-secondary")}
        >
          <BarChart3 className="w-4 h-4" />
          Hoa hồng
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {tab === 'profile' && (
          <div className="bg-white rounded-3xl border border-bg-secondary p-8 space-y-6">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                   <div>
                      <label className="font-body text-xs text-text-muted uppercase mb-1.5 block">Họ và tên</label>
                      <input defaultValue={data.full_name} className="w-full bg-bg-secondary/30 border border-bg-secondary rounded-xl px-4 py-2.5 font-body text-sm" />
                   </div>
                   <div>
                      <label className="font-body text-xs text-text-muted uppercase mb-1.5 block">Số điện thoại</label>
                      <input defaultValue={data.phone} className="w-full bg-bg-secondary/30 border border-bg-secondary rounded-xl px-4 py-2.5 font-body text-sm" />
                   </div>
                </div>
                <div className="space-y-4">
                   <div>
                      <label className="font-body text-xs text-text-muted uppercase mb-1.5 block">Chuyên môn (ngăn cách bởi dấu phẩy)</label>
                      <input defaultValue={profile?.specialties.join(', ')} className="w-full bg-bg-secondary/30 border border-bg-secondary rounded-xl px-4 py-2.5 font-body text-sm" />
                   </div>
                   <div>
                      <label className="font-body text-xs text-text-muted uppercase mb-1.5 block">Lương cơ bản</label>
                      <input type="number" defaultValue={profile?.base_salary} className="w-full bg-bg-secondary/30 border border-bg-secondary rounded-xl px-4 py-2.5 font-body text-sm" />
                   </div>
                </div>
             </div>
             
             <div>
                <label className="font-body text-xs text-text-muted uppercase mb-1.5 block">Tiểu sử tóm tắt</label>
                <textarea rows={4} defaultValue={profile?.bio || ''} className="w-full bg-bg-secondary/30 border border-bg-secondary rounded-xl px-4 py-2.5 font-body text-sm resize-none" />
             </div>

             <div className="flex justify-end pt-4 border-t border-bg-secondary">
                <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-bg-dark text-white font-body text-sm font-medium hover:bg-black transition-colors">
                   <Save className="w-4 h-4" />
                   Lưu thay đổi
                </button>
             </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="bg-white rounded-3xl border border-bg-secondary overflow-hidden">
             {bookings.length === 0 ? (
               <div className="p-20 text-center font-body text-text-muted">Chưa có lịch hẹn nào được gán</div>
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
                           {b.booking_services.map(s => s.service_name).join(', ')}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="px-2 py-0.5 rounded-full bg-bg-secondary text-[10px] text-text-muted uppercase">{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             )}
          </div>
        )}

        {tab === 'commissions' && (
          <div className="bg-white rounded-3xl border border-bg-secondary overflow-hidden">
             {commissions.length === 0 ? (
               <div className="p-20 text-center font-body text-text-muted">Chưa có dữ liệu hoa hồng</div>
             ) : (
               <table className="w-full">
                  <thead>
                    <tr className="bg-bg-secondary/50 border-b border-bg-secondary">
                       <th className="px-6 py-4 text-left font-body text-xs text-text-muted uppercase">Ngày tạo</th>
                       <th className="px-6 py-4 text-left font-body text-xs text-text-muted uppercase">Khách hàng</th>
                       <th className="px-6 py-4 text-right font-body text-xs text-text-muted uppercase">Doanh thu</th>
                       <th className="px-6 py-4 text-right font-body text-xs text-text-muted uppercase text-accent font-bold">Hoa hồng</th>
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
      </div>
    </div>
  );
}
