'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NotificationType } from '@/types/database';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string | number | boolean | null>;
  read: boolean;
  created_at: string;
}

interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/notifications?limit=30');
      if (!res.ok) return;
      const json = await res.json() as {
        data: { notifications: AppNotification[]; unread_count: number } | null;
      };
      if (json.data) {
        setNotifications(json.data.notifications);
        setUnreadCount(json.data.unread_count);
      }
    } catch {
      // network error — silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll mỗi 30 giây để cập nhật badge (Supabase Realtime thay thế nếu muốn real-time thật sự)
    const timer = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await fetch('/api/v1/notifications/read-all', { method: 'PATCH' });
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refresh: fetchNotifications,
  };
}
