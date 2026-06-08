'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, Calendar, Tag, UserCheck, UserX, Clock, Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types/database';
import type { AppNotification } from '@/hooks/useNotifications';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  new_booking: <Calendar className="w-4 h-4 text-blue-500" />,
  booking_cancelled_by_customer: <X className="w-4 h-4 text-red-500" />,
  booking_confirmed: <UserCheck className="w-4 h-4 text-green-600" />,
  booking_cancelled_by_admin: <UserX className="w-4 h-4 text-red-500" />,
  booking_assigned: <UserCheck className="w-4 h-4 text-blue-500" />,
  booking_reminder: <Clock className="w-4 h-4 text-amber-500" />,
  leave_request_submitted: <Calendar className="w-4 h-4 text-purple-500" />,
  leave_request_approved: <UserCheck className="w-4 h-4 text-green-600" />,
  leave_request_rejected: <UserX className="w-4 h-4 text-red-500" />,
  voucher_received: <Tag className="w-4 h-4 text-accent" />,
  payment_received: <Receipt className="w-4 h-4 text-green-600" />,
};

interface NotificationBellProps {
  isLoggedIn: boolean;
}

export function NotificationBell({ isLoggedIn }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  async function handleNotificationClick(n: AppNotification) {
    await markRead(n.id);
    const url = n.data?._url as string | undefined;
    if (url) {
      setOpen(false);
      router.push(url);
    }
  }

  // Đăng ký push subscription khi user logged in
  usePushSubscription(isLoggedIn);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  if (!isLoggedIn) return null;

  return (
    <div ref={dropdownRef} className="relative" data-testid="notification-bell">
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5 text-text-muted" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-border z-[300] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-display font-semibold text-sm text-text">
              Thông báo
              {unreadCount > 0 && (
                <span className="ml-1.5 text-xs font-normal text-text-muted">
                  ({unreadCount} chưa đọc)
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-accent hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-[400px] overflow-y-auto divide-y divide-border/50">
            {loading && (
              <li className="px-4 py-8 text-center text-sm text-text-muted">Đang tải...</li>
            )}
            {!loading && notifications.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-text-muted">
                Chưa có thông báo nào
              </li>
            )}
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => void handleNotificationClick(n)}
                  className={cn(
                    'w-full text-left px-4 py-3 flex gap-3 hover:bg-surface transition-colors',
                    !n.read && 'bg-accent/5',
                  )}
                >
                  <span className="mt-0.5 shrink-0">{TYPE_ICON[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-medium text-text truncate', !n.read && 'font-semibold')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-text-muted/70 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
