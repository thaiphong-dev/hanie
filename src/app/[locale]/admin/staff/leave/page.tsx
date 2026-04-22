'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarDays, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { DatePicker } from '@/components/shared/DatePicker';

interface LeaveRequest {
  id: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  review_note: string | null;
  created_at: string;
}

const STATUS_CONFIG = {
  pending: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-600', icon: XCircle },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StaffLeavePage() {
  const t = useTranslations('leave_request');
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/staff/leave-requests');
      const json = await res.json() as { data: LeaveRequest[] | null };
      setRequests(json.data ?? []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchRequests(); }, [fetchRequests]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !reason.trim()) return;

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/v1/staff/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, reason: reason.trim() }),
      });
      const json = await res.json() as { data: LeaveRequest | null; error: { message: string } | null };

      if (!res.ok || json.error) {
        setSubmitError(json.error?.message ?? 'Có lỗi xảy ra');
      } else {
        setSubmitSuccess(true);
        setDate('');
        setReason('');
        if (json.data) {
          setRequests((prev) => [json.data!, ...prev]);
        }
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch {
      setSubmitError(t('error_connection'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <CalendarDays size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-text-primary">{t('submit_title')}</h1>
          <p className="font-body text-sm text-text-muted">{t('subtitle')}</p>
        </div>
      </div>

      {/* Submit form */}
      <div className="bg-bg-primary border border-border rounded-2xl p-5">
        <h2 className="font-display text-lg text-text-primary mb-4">{t('submit_title')}</h2>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block font-body text-sm text-text-muted mb-2">
              {t('date_label')} *
            </label>
            <DatePicker value={date} onChange={setDate} minDate={minDate} />
          </div>

          <div>
            <label htmlFor="leave-reason" className="block font-body text-sm text-text-muted mb-1">
              {t('reason_label')} *
            </label>
            <textarea
              id="leave-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              required
              placeholder={t('reason_placeholder')}
              className="w-full font-body text-sm bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          {submitError && (
            <div className="flex items-center gap-2 text-red-600 font-body text-sm">
              <AlertCircle size={14} />
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="flex items-center gap-2 text-green-600 font-body text-sm">
              <CheckCircle size={14} />
              {t('success_msg')}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !date || !reason.trim()}
            className="flex items-center gap-2 font-body text-sm font-medium bg-accent hover:bg-accent/80 text-white px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <Send size={14} />
            {submitting ? '...' : t('submit_btn')}
          </button>
        </form>
      </div>

      {/* List */}
      <div>
        <h2 className="font-display text-lg text-text-primary mb-4">{t('sent_requests')}</h2>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-bg-secondary rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && requests.length === 0 && (
          <p className="font-body text-sm text-text-muted text-center py-8">{t('empty_state')}</p>
        )}

        <div className="space-y-3">
          {requests.map((req) => {
            const cfg = STATUS_CONFIG[req.status];
            const Icon = cfg.icon;
            return (
              <div key={req.id} className="bg-bg-primary border border-border rounded-2xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays size={14} className="text-text-muted" />
                      <span className="font-body text-sm font-medium text-text-primary">
                        {new Date(req.date).toLocaleDateString('vi-VN', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="font-body text-sm text-text-muted mb-2">{req.reason}</p>
                    {req.review_note && (
                      <p className="font-body text-xs text-text-muted italic">
                        {t('review_note_label')}: {req.review_note}
                      </p>
                    )}
                  </div>
                  <span className={cn('flex items-center gap-1 font-body text-xs px-2.5 py-1 rounded-full whitespace-nowrap', cfg.color)}>
                    <Icon size={11} />
                    {t(`status_${req.status}` as Parameters<typeof t>[0])}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
