'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayRevenue { date: string; amount: number; }
interface TopService { service_name: string; count: number; revenue: number; }
interface StaffPerf { staff_id: string; staff_name: string; order_count: number; revenue: number; commission_pct: number; commission: number; }
interface CustomerStats { new: number; returning: number; retention_rate: number; }
interface ReportData {
  revenue_by_day: DayRevenue[];
  top_services: TopService[];
  staff_performance: StaffPerf[];
  customer_stats: CustomerStats;
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

// Simple SVG bar chart
function BarChart({ data }: { data: DayRevenue[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.amount), 1);
  const chartH = 120;
  const barW = Math.max(4, Math.floor(600 / data.length) - 2);

  return (
    <div className="overflow-x-auto">
      <svg width={Math.max(600, data.length * (barW + 2))} height={chartH + 24} className="block">
        {data.map((d, i) => {
          const h = Math.max(2, (d.amount / max) * chartH);
          const x = i * (barW + 2);
          const y = chartH - h;
          const isToday = d.date === new Date().toISOString().slice(0, 10);
          return (
            <g key={d.date}>
              <rect x={x} y={y} width={barW} height={h}
                className={isToday ? 'fill-accent' : 'fill-accent/40'}
                rx={2} />
              {(i % 5 === 0 || i === data.length - 1) && (
                <text x={x + barW / 2} y={chartH + 16} textAnchor="middle"
                  className="fill-text-muted font-body" fontSize={8}>
                  {d.date.slice(8)}
                </text>
              )}
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
    <div className="space-y-6 max-w-5xl">
      {/* Header + month picker */}
      <div className="flex items-center gap-4">
        <h2 className="font-display text-xl text-text-primary">{t('reports_title')}</h2>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={prevMonth} className="p-1.5 hover:bg-bg-secondary rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <span className="font-body text-sm text-text-primary min-w-[110px] text-center">
            {t('payroll_month', { month, year })}
          </span>
          <button onClick={nextMonth} className="p-1.5 hover:bg-bg-secondary rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-bg-secondary p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base text-text-primary">{t('revenue_by_day')}</h3>
          <p className="font-display text-base text-accent-dark">{formatVND(totalRevenue)}</p>
        </div>
        {loading ? (
          <div className="h-36 bg-bg-secondary rounded-xl animate-pulse" />
        ) : (
          <BarChart data={data?.revenue_by_day ?? []} />
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top services */}
        <div className="bg-white rounded-2xl border border-bg-secondary p-5">
          <h3 className="font-display text-base text-text-primary mb-4">{t('top_services')}</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-bg-secondary rounded-xl animate-pulse" />)}
            </div>
          ) : (data?.top_services ?? []).length === 0 ? (
            <p className="font-body text-sm text-text-muted text-center py-6">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-2">
              {(data?.top_services ?? []).map((s, i) => (
                <div key={s.service_name} className="flex items-center gap-3">
                  <span className="font-body text-xs text-text-muted w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm text-text-primary">{s.service_name}</p>
                      <p className="font-body text-sm text-text-secondary">{formatVND(s.revenue)}</p>
                    </div>
                    <div className="h-1.5 bg-bg-secondary rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${Math.round((s.revenue / ((data?.top_services[0]?.revenue ?? 1))) * 100)}%` }}
                      />
                    </div>
                    <p className="font-body text-[10px] text-text-muted mt-0.5">{s.count} lần</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff performance */}
        <div className="bg-white rounded-2xl border border-bg-secondary p-5">
          <h3 className="font-display text-base text-text-primary mb-4">{t('staff_performance')}</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-bg-secondary rounded-xl animate-pulse" />)}
            </div>
          ) : (data?.staff_performance ?? []).length === 0 ? (
            <p className="font-body text-sm text-text-muted text-center py-6">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {(data?.staff_performance ?? []).map((s) => (
                <div key={s.staff_id} className="flex items-center gap-3 py-2 border-b border-bg-secondary last:border-0">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <span className="font-body text-xs text-accent-dark font-semibold">{s.staff_name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-sm text-text-primary">{s.staff_name}</p>
                    <p className="font-body text-xs text-text-muted">{s.order_count} đơn</p>
                  </div>
                  <div className="text-right">
                    <p className="font-body text-sm text-text-primary">{formatVND(s.revenue)}</p>
                    <p className="font-body text-xs text-green-600">+{formatVND(s.commission)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer stats */}
      <div className="bg-white rounded-2xl border border-bg-secondary p-5">
        <h3 className="font-display text-base text-text-primary mb-4">{t('customer_stats')}</h3>
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-bg-secondary rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-bg-secondary rounded-xl p-4 text-center">
              <p className="font-body text-xs text-text-muted">{t('new_customers')}</p>
              <p className="font-display text-2xl text-text-primary mt-2">{data?.customer_stats.new ?? 0}</p>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4 text-center">
              <p className="font-body text-xs text-text-muted">{t('returning_customers')}</p>
              <p className="font-display text-2xl text-text-primary mt-2">{data?.customer_stats.returning ?? 0}</p>
            </div>
            <div className="bg-accent/10 rounded-xl p-4 text-center">
              <p className="font-body text-xs text-accent-dark">{t('retention_rate')}</p>
              <p className="font-display text-2xl text-accent-dark mt-2">{data?.customer_stats.retention_rate ?? 0}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
