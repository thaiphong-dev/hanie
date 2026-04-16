'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  member_tier: 'new' | 'regular' | 'vip';
  total_spent: number;
  last_booking_at: string | null;
  created_at: string;
}

const TIER_CONFIG = {
  new: { label: 'New', color: 'bg-gray-100 text-gray-700' },
  regular: { label: 'Regular', color: 'bg-blue-100 text-blue-700' },
  vip: { label: 'VIP', color: 'bg-accent/20 text-accent-dark' },
} as const;

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function CustomersPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('search', search);
    if (tier) params.set('tier', tier);
    const res = await fetch(`/api/v1/admin/customers?${params}`);
    const json = await res.json() as { data: Customer[]; meta: { total: number } };
    setCustomers(json.data ?? []);
    setTotal(json.meta?.total ?? 0);
    setLoading(false);
  }, [page, search, tier]);

  useEffect(() => { void fetchCustomers(); }, [fetchCustomers]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const TIERS = [
    { value: '', label: 'Tất cả' },
    { value: 'new', label: 'New' },
    { value: 'regular', label: 'Regular' },
    { value: 'vip', label: 'VIP' },
  ];

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-text-primary">{t('total_customers')} ({total})</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('search_customer')}
            className="w-full pl-9 pr-4 py-2 border border-bg-secondary rounded-xl font-body text-sm text-text-primary focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-1">
          {TIERS.map((tr) => (
            <button
              key={tr.value}
              onClick={() => { setTier(tr.value); setPage(1); }}
              className={cn(
                'px-3 py-2 rounded-xl font-body text-sm border transition-colors',
                tier === tr.value
                  ? 'bg-accent border-accent text-bg-dark'
                  : 'border-bg-secondary text-text-secondary hover:bg-bg-secondary',
              )}
            >
              {tr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer list */}
      <div className="bg-white rounded-2xl border border-bg-secondary overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-bg-secondary animate-pulse">
                <div className="w-10 h-10 rounded-full bg-bg-secondary" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 bg-bg-secondary rounded" />
                  <div className="h-3 w-24 bg-bg-secondary rounded" />
                </div>
                <div className="h-3 w-20 bg-bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="flex items-center justify-center h-32 font-body text-sm text-text-muted">
            Không tìm thấy khách hàng nào
          </div>
        ) : (
          <div>
            {customers.map((c, idx) => {
              const tier = TIER_CONFIG[c.member_tier];
              return (
                <button
                  key={c.id}
                  onClick={() => router.push(`/${locale}/admin/customers/${c.id}`)}
                  className={cn(
                    'w-full flex items-center gap-4 px-5 py-3.5 hover:bg-bg-secondary transition-colors text-left',
                    idx < customers.length - 1 && 'border-b border-bg-secondary',
                  )}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <span className="font-display text-sm text-accent-dark font-semibold">
                      {c.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm font-medium text-text-primary truncate">{c.full_name}</p>
                      <span className={cn('px-2 py-0.5 rounded-full font-body text-[10px] shrink-0', tier.color)}>
                        {tier.label}
                      </span>
                    </div>
                    <p className="font-body text-xs text-text-muted">{c.phone}</p>
                  </div>

                  {/* Stats */}
                  <div className="text-right shrink-0">
                    <p className="font-body text-sm text-text-primary">{formatVND(c.total_spent)}</p>
                    <p className="font-body text-xs text-text-muted">
                      {c.last_booking_at ? format(new Date(c.last_booking_at), 'dd/MM/yy') : '—'}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 30 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-bg-secondary font-body text-sm text-text-secondary disabled:opacity-40"
          >
            Trước
          </button>
          <span className="font-body text-sm text-text-muted">Trang {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={customers.length < 30}
            className="px-4 py-2 rounded-lg border border-bg-secondary font-body text-sm text-text-secondary disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
