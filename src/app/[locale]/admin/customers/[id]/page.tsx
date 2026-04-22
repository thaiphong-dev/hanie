'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface Note { id: string; content: string; created_at: string; author: { full_name: string } | null; }
interface BookingRow {
  id: string; status: string; scheduled_at: string;
  booking_services: { service_name: string | null; price: number }[];
}
interface CustomerDetail {
  id: string; full_name: string; phone: string; member_tier: string;
  total_spent: number; loyalty_points: number; birthday: string | null; created_at: string;
  booking_count: number; bookings: BookingRow[]; notes_list: Note[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  done: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-700',
};

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations('admin');
  const tStatus = useTranslations('booking_status');
  const locale = useLocale();
  const router = useRouter();

  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'profile' | 'history' | 'notes'>('profile');
  const [noteInput, setNoteInput] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/v1/admin/customers/${params.id}`);
    const json = await res.json() as { data: CustomerDetail | null };
    setData(json.data);
    setLoading(false);
  }, [params.id]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  async function submitNote() {
    if (!noteInput.trim()) return;
    setSubmittingNote(true);
    await fetch(`/api/v1/admin/customers/${params.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: noteInput.trim() }),
    });
    setNoteInput('');
    setSubmittingNote(false);
    void fetchData();
  }

  const TABS = [
    { key: 'profile', label: t('customer_profile') },
    { key: 'history', label: t('booking_history') },
    { key: 'notes', label: t('customer_notes') },
  ] as const;

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="h-8 w-40 bg-bg-secondary rounded animate-pulse" />
        <div className="h-32 bg-bg-secondary rounded-2xl animate-pulse" />
        <div className="h-64 bg-bg-secondary rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return <div className="font-body text-text-muted">Không tìm thấy khách hàng</div>;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Back */}
      <button
        onClick={() => router.push(`/${locale}/admin/customers`)}
        className="flex items-center gap-1.5 text-text-muted font-body text-sm hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Danh sách khách hàng
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-bg-secondary p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="font-display text-xl text-accent-dark font-bold">{data.full_name.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <h2 className="font-display text-lg text-text-primary">{data.full_name}</h2>
          <p className="font-body text-sm text-text-muted">{data.phone}</p>
        </div>
        <div className="text-right">
          <p className="font-body text-xs text-text-muted">{t('tier_label')}</p>
          <p className="font-display text-sm text-accent-dark font-semibold uppercase">{data.member_tier}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-bg-secondary p-3 text-center">
          <p className="font-body text-xs text-text-muted">{t('total_spent_label')}</p>
          <p className="font-display text-base text-text-primary mt-1">{formatVND(data.total_spent)}</p>
        </div>
        <div className="bg-white rounded-xl border border-bg-secondary p-3 text-center">
          <p className="font-body text-xs text-text-muted">{t('booking_count_label')}</p>
          <p className="font-display text-base text-text-primary mt-1">{data.booking_count}</p>
        </div>
        <div className="bg-white rounded-xl border border-bg-secondary p-3 text-center">
          <p className="font-body text-xs text-text-muted">Điểm tích lũy</p>
          <p className="font-display text-base text-accent mt-1">⭐ {data.loyalty_points ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-bg-secondary p-3 text-center">
          <p className="font-body text-xs text-text-muted">Từ ngày</p>
          <p className="font-display text-base text-text-primary mt-1">{format(parseISO(data.created_at), 'MM/yyyy')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-secondary p-1 rounded-xl">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={cn(
              'flex-1 py-2 rounded-lg font-body text-sm transition-colors',
              tab === tb.key ? 'bg-white text-text-primary shadow-sm font-medium' : 'text-text-muted hover:text-text-secondary',
            )}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl border border-bg-secondary p-5 space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-bg-secondary">
            <span className="font-body text-sm text-text-muted">Họ và tên</span>
            <span className="font-body text-sm text-text-primary">{data.full_name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-bg-secondary">
            <span className="font-body text-sm text-text-muted">Số điện thoại</span>
            <span className="font-body text-sm text-text-primary">{data.phone}</span>
          </div>
          {data.birthday && (
            <div className="flex justify-between items-center py-2 border-b border-bg-secondary">
              <span className="font-body text-sm text-text-muted">Sinh nhật</span>
              <span className="font-body text-sm text-text-primary">{format(parseISO(data.birthday), 'dd/MM/yyyy')}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2">
            <span className="font-body text-sm text-text-muted">Hạng thành viên</span>
            <span className="font-body text-sm text-accent-dark font-semibold uppercase">{data.member_tier}</span>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-white rounded-2xl border border-bg-secondary overflow-hidden">
          {data.bookings.length === 0 ? (
            <div className="flex items-center justify-center h-24 font-body text-sm text-text-muted">Chưa có lịch hẹn</div>
          ) : (
            <div>
              {data.bookings.map((b, i) => (
                <div key={b.id} className={cn('flex items-center gap-3 px-4 py-3', i < data.bookings.length - 1 && 'border-b border-bg-secondary')}>
                  <div className="flex-1">
                    <p className="font-body text-sm text-text-primary">{format(parseISO(b.scheduled_at), 'dd/MM/yyyy HH:mm')}</p>
                    <p className="font-body text-xs text-text-muted">
                      {b.booking_services.map((s) => s.service_name ?? 'Dịch vụ').join(', ')}
                    </p>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-full font-body text-[10px]', STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-700')}>
                    {tStatus(b.status as Parameters<typeof tStatus>[0])}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-3">
          {/* Add note */}
          <div className="bg-white rounded-2xl border border-bg-secondary p-4 flex gap-2">
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder={t('note_placeholder')}
              rows={2}
              className="flex-1 border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm text-text-primary resize-none focus:outline-none focus:border-accent"
            />
            <button
              onClick={() => void submitNote()}
              disabled={submittingNote || !noteInput.trim()}
              className="px-3 py-2 rounded-xl bg-accent text-bg-dark hover:bg-accent-dark disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Note list */}
          <div className="space-y-2">
            {data.notes_list.length === 0 ? (
              <div className="bg-white rounded-2xl border border-bg-secondary flex items-center justify-center h-20 font-body text-sm text-text-muted">
                Chưa có ghi chú
              </div>
            ) : (
              data.notes_list.map((note) => (
                <div key={note.id} className="bg-white rounded-2xl border border-bg-secondary p-4">
                  <p className="font-body text-sm text-text-primary">{note.content}</p>
                  <p className="font-body text-xs text-text-muted mt-2">
                    {note.author?.full_name ?? '—'} · {format(parseISO(note.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
