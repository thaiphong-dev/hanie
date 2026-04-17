'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayRevenue { date: string; amount: number; }
interface TopService { service_name: string; count: number; revenue: number; }
interface StaffPerf { staff_id: string; staff_name: string; order_count: number; revenue: number; commission_pct: number; commission: number; }
interface CustomerStats { new: number; returning: number; retention_rate: number; }
interface LoyalCustomer { id: string; name: string; phone: string; total: number; visits: number; }
interface ReportData {
  revenue_by_day: DayRevenue[];
  top_services: TopService[];
  staff_performance: StaffPerf[];
  customer_stats: CustomerStats;
  completion_rate: number;
  loyal_customers: LoyalCustomer[];
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

// Simple SVG bar chart
function BarChart({ data }: { data: DayRevenue[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.amount), 1);
  const chartH = 150;
  const barW = Math.max(8, Math.floor(800 / data.length) - 4);

  return (
    <div className="overflow-x-auto pb-4">
      <svg width={Math.max(800, data.length * (barW + 4))} height={chartH + 30} className="block mx-auto">
        {data.map((d, i) => {
          const h = Math.max(4, (d.amount / max) * chartH);
          const x = i * (barW + 4);
          const y = chartH - h;
          const isToday = d.date === new Date().toISOString().slice(0, 10);
          return (
            <g key={d.date} className="group/bar">
              <rect x={x} y={y} width={barW} height={h}
                className={isToday ? 'fill-accent' : 'fill-accent/30 group-hover/bar:fill-accent/60 transition-colors'}
                rx={4} />
              {(i % 5 === 0 || i === data.length - 1) && (
                <text x={x + barW / 2} y={chartH + 20} textAnchor="middle"
                  className="fill-text-muted font-body" fontSize={10}>
                  {d.date.slice(8)}
                </text>
              )}
              <title>{`${d.date}: ${formatVND(d.amount)}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function ReportsPage() {
  const t = useTranslations('admin');
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/v1/admin/reports?year=${year}&month=${month}`);
    const json = await res.json() as { data: ReportData | null };
    setData(json.data);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { void fetchReports(); }, [fetchReports]);

  function prevMonth() { if (month === 1) { setMonth(12); setYear((y) => y - 1); } else setMonth((m) => m - 1); }
  function nextMonth() { if (month === 12) { setMonth(1); setYear((y) => y + 1); } else setMonth((m) => m + 1); }

  const totalRevenue = data?.revenue_by_day.reduce((s, d) => s + d.amount, 0) ?? 0;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header + month picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="font-display text-2xl text-text-primary">Báo cáo doanh thu</h2>
           <p className="font-body text-sm text-text-muted">Phân tích hiệu quả kinh doanh tháng {month}/{year}</p>
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-bg-secondary shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-bg-secondary rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <span className="font-display text-sm text-text-primary min-w-[140px] text-center font-bold">
            Tháng {month}, {year}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-bg-secondary rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-white p-5 rounded-3xl border border-bg-secondary shadow-sm">
            <p className="font-body text-[10px] text-text-muted uppercase tracking-wider mb-1">Tổng doanh thu</p>
            <p className="font-display text-xl text-text-primary font-bold">{formatVND(totalRevenue)}</p>
         </div>
         <div className="bg-white p-5 rounded-3xl border border-bg-secondary shadow-sm">
            <p className="font-body text-[10px] text-text-muted uppercase tracking-wider mb-1">Tỉ lệ hoàn thành</p>
            <p className="font-display text-xl text-emerald-600 font-bold">{data?.completion_rate ?? 0}%</p>
         </div>
         <div className="bg-white p-5 rounded-3xl border border-bg-secondary shadow-sm">
            <p className="font-body text-[10px] text-text-muted uppercase tracking-wider mb-1">Khách hàng mới</p>
            <p className="font-display text-xl text-text-primary font-bold">+{data?.customer_stats.new ?? 0}</p>
         </div>
         <div className="bg-white p-5 rounded-3xl border border-bg-secondary shadow-sm">
            <p className="font-body text-[10px] text-text-muted uppercase tracking-wider mb-1">Tỉ lệ quay lại</p>
            <p className="font-display text-xl text-accent-dark font-bold">{data?.customer_stats.retention_rate ?? 0}%</p>
         </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-[32px] border border-bg-secondary p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-display text-lg text-text-primary font-bold">Biểu đồ doanh thu hàng ngày</h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full" />
            <span className="font-body text-xs text-text-muted">Doanh thu VNĐ</span>
          </div>
        </div>
        {loading ? (
          <div className="h-[180px] bg-bg-secondary/50 rounded-2xl animate-pulse" />
        ) : (
          <BarChart data={data?.revenue_by_day ?? []} />
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top services */}
        <div className="bg-white rounded-[32px] border border-bg-secondary p-6 shadow-sm flex flex-col">
          <h3 className="font-display text-base text-text-primary font-bold mb-6">Dịch vụ phổ biến</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-bg-secondary/50 rounded-2xl animate-pulse" />)}
            </div>
          ) : (data?.top_services ?? []).length === 0 ? (
            <p className="font-body text-sm text-text-muted text-center py-10">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-5 flex-1">
              {(data?.top_services ?? []).map((s, i) => (
                <div key={s.service_name} className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-body text-xs text-text-primary font-bold truncate pr-4">{s.service_name}</p>
                    <p className="font-mono text-[10px] text-text-muted">{formatVND(s.revenue)}</p>
                  </div>
                  <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-1000"
                      style={{ width: `${Math.round((s.revenue / ((data?.top_services[0]?.revenue ?? 1))) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff performance */}
        <div className="bg-white rounded-[32px] border border-bg-secondary p-6 shadow-sm flex flex-col">
          <h3 className="font-display text-base text-text-primary font-bold mb-6">Hiệu suất nhân viên</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-bg-secondary/50 rounded-2xl animate-pulse" />)}
            </div>
          ) : (data?.staff_performance ?? []).length === 0 ? (
            <p className="font-body text-sm text-text-muted text-center py-10">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-4 flex-1">
              {(data?.staff_performance ?? []).map((s) => (
                <div key={s.staff_id} className="flex items-center gap-3 p-3 hover:bg-bg-secondary/50 rounded-2xl transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="font-display text-sm text-accent-dark font-bold">{s.staff_name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs text-text-primary font-bold truncate">{s.staff_name}</p>
                    <p className="font-body text-[10px] text-text-muted">{s.order_count} booking</p>
                  </div>
                  <div className="text-right">
                    <p className="font-body text-xs text-text-primary font-bold">{formatVND(s.revenue)}</p>
                    <p className="font-body text-[10px] text-emerald-600 font-bold">+{formatVND(s.commission)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loyal Customers */}
        <div className="bg-white rounded-[32px] border border-bg-secondary p-6 shadow-sm flex flex-col">
          <h3 className="font-display text-base text-text-primary font-bold mb-6">Khách hàng tiêu biểu</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-bg-secondary/50 rounded-2xl animate-pulse" />)}
            </div>
          ) : (data?.loyal_customers ?? []).length === 0 ? (
            <p className="font-body text-sm text-text-muted text-center py-10">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-4 flex-1">
              {(data?.loyal_customers ?? []).map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 hover:bg-bg-secondary/50 rounded-2xl transition-colors border border-transparent hover:border-bg-secondary">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <span className="font-display text-sm text-emerald-600 font-bold">{c.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs text-text-primary font-bold truncate">{c.name}</p>
                    <p className="font-body text-[10px] text-text-muted truncate">{c.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-body text-xs text-text-primary font-bold">{formatVND(c.total)}</p>
                    <p className="font-body text-[10px] text-accent-dark font-bold">{c.visits} lần đến</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
