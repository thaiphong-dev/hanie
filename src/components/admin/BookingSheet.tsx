'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import { X, Check, PlayCircle, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Booking, StaffUser } from '@/app/[locale]/admin/bookings/page';

function getStatusLabel(status: string, tStatus: (k: string) => string) {
  try { return tStatus(status); } catch { return status; }
}

function getStatusBtnColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-blue-500 hover:bg-blue-600';
    case 'confirmed': return 'bg-purple-500 hover:bg-purple-600';
    case 'in_progress': return 'bg-green-500 hover:bg-green-600';
    default: return 'bg-gray-400';
  }
}

function nextStatus(status: string): string | null {
  switch (status) {
    case 'pending': return 'confirmed';
    case 'confirmed': return 'in_progress';
    case 'in_progress': return 'done';
    default: return null;
  }
}

function nextStatusLabel(status: string, t: (k: string) => string) {
  switch (status) {
    case 'pending': return t('booking_action_confirm');
    case 'confirmed': return t('booking_action_start');
    case 'in_progress': return t('booking_action_done');
    default: return '';
  }
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface BookingSheetProps {
  booking: Booking;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  staffList: StaffUser[];
  onAssignStaff: (bookingId: string, staffId: string) => void;
}

export function BookingSheet({ booking, onClose, onStatusChange, staffList, onAssignStaff }: BookingSheetProps) {
  const t = useTranslations('admin');
  const tStatus = useTranslations('booking_status');
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelNote, setCancelNote] = useState('');

  const ns = nextStatus(booking.status);
  const total = booking.booking_services.reduce((s, bs) => s + bs.price, 0);

  function doAction(status: string) {
    onStatusChange(booking.id, status);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 m-0!" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-secondary">
          <h2 className="font-display text-base text-text-primary">{t('booking_detail')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <span className={cn(
              'px-3 py-1 rounded-full font-body text-xs font-medium',
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
              booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
              booking.status === 'done' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800',
            )}>
              {getStatusLabel(booking.status, (k) => tStatus(k as Parameters<typeof tStatus>[0]))}
            </span>
            <p className="font-body text-xs text-text-muted">ID: {booking.id.slice(0, 8)}</p>
          </div>

          {/* Customer */}
          <div className="bg-bg-secondary rounded-xl p-4 space-y-1">
            <p className="font-body text-xs text-text-muted">Khách hàng</p>
            <p className="font-body text-sm font-semibold text-text-primary">{booking.customer_name ?? 'Khách walk-in'}</p>
            <p className="font-body text-sm text-text-secondary">{booking.customer_phone ?? '—'}</p>
          </div>

          {/* Time + Staff */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-secondary rounded-xl p-4">
              <p className="font-body text-xs text-text-muted mb-1">Thời gian</p>
              <p className="font-body text-sm text-text-primary">
                {format(parseISO(booking.scheduled_at), 'HH:mm')} – {format(parseISO(booking.end_at), 'HH:mm')}
              </p>
              <p className="font-body text-xs text-text-muted">{format(parseISO(booking.scheduled_at), 'dd/MM/yyyy')}</p>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4">
              <p className="font-body text-xs text-text-muted mb-1">Kỹ thuật viên</p>
              {booking.staff ? (
                <p className="font-body text-sm text-text-primary font-medium">{booking.staff.full_name}</p>
              ) : (
                <div className="space-y-2">
                  <p className="font-body text-xs text-red-500 italic">Chưa gán</p>
                  <select
                    className="w-full bg-white border border-bg-secondary rounded-lg px-2 py-1.5 font-body text-xs"
                    onChange={(e) => {
                      if (e.target.value) void onAssignStaff(booking.id, e.target.value);
                    }}
                    defaultValue=""
                  >
                    <option value="">-- Gán nhân viên --</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          {booking.booking_services.length > 0 && (
            <div>
              <p className="font-body text-xs text-text-muted mb-2">Dịch vụ</p>
              <div className="space-y-1">
                {booking.booking_services.map((bs, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="font-body text-sm text-text-primary">{bs.service_name ?? 'Dịch vụ'}</span>
                    <span className="font-body text-sm text-text-secondary">{formatVND(bs.price)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-bg-secondary">
                  <span className="font-body text-sm font-semibold text-text-primary">Tổng</span>
                  <span className="font-body text-sm font-semibold text-accent">{formatVND(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="bg-bg-secondary rounded-xl p-3">
              <p className="font-body text-xs text-text-muted mb-1">Ghi chú khách</p>
              <p className="font-body text-sm text-text-primary">{booking.notes}</p>
            </div>
          )}

          {/* Cancel form */}
          {cancelMode && (
            <div className="space-y-2">
              <input
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                placeholder={t('cancel_reason_placeholder')}
                className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        {!['done', 'cancelled', 'no_show'].includes(booking.status) && (
          <div className="p-4 border-t border-bg-secondary space-y-2">
            {ns && (
              <button
                onClick={() => {
                  if (booking.status === 'in_progress') {
                    const params = new URLSearchParams({
                      booking_id: booking.id,
                      customer_name: booking.customer_name || 'Khách walk-in',
                      customer_phone: booking.customer_phone || '',
                      staff_id: booking.staff_id || '',
                    });
                    window.location.href = `/admin/pos?${params.toString()}`;
                  } else {
                    doAction(ns);
                  }
                }}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-body text-sm font-medium transition-colors disabled:opacity-50',
                  getStatusBtnColor(booking.status),
                )}
              >
                {booking.status === 'pending' && <Check className="w-4 h-4" />}
                {booking.status === 'confirmed' && <PlayCircle className="w-4 h-4" />}
                {booking.status === 'in_progress' && <Receipt className="w-4 h-4" />}
                {booking.status === 'in_progress' ? t('booking_action_pos') : nextStatusLabel(booking.status, (k) => t(k as Parameters<typeof t>[0]))}
              </button>
            )}

            {!['confirmed', 'in_progress'].includes(booking.status) && (
              cancelMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setCancelMode(false); setCancelNote(''); }}
                    className="flex-1 py-2.5 rounded-xl border border-bg-secondary font-body text-sm text-text-secondary"
                  >
                    Huỷ bỏ
                  </button>
                  <button
                    onClick={() => doAction('cancelled')}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-body text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    Huỷ lịch
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCancelMode(true)}
                  className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-body text-sm hover:bg-red-50 transition-colors"
                >
                  {t('booking_action_cancel')}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}
