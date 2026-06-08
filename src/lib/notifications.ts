import { createServerClient } from '@/lib/supabase/server';
import { sendWebPush } from '@/lib/web-push';
import type { NotificationType } from '@/types/database';

export interface SendNotificationParams {
  userIds: string | string[];           // 1 hoặc nhiều recipients
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string | number | boolean | null>;
  url?: string;                         // URL khi click notification
}

/**
 * Gửi in-app notification (lưu DB) + PWA push (nếu user có subscription).
 * Dùng service_role key → bypass RLS.
 * Không throw — lỗi được log nhưng không block response.
 */
export async function sendNotification(params: SendNotificationParams): Promise<void> {
  const { userIds, type, title, body, data = {}, url } = params;
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  if (ids.length === 0) return;

  const supabase = createServerClient();

  // ── 1. Insert in-app notifications ─────────────────────────────────────────
  const rowData = { ...data, ...(url ? { _url: url } : {}) };
  const rows = ids.map((uid) => ({ user_id: uid, type, title, body, data: rowData }));
  const { error: insertError } = await supabase.from('notifications').insert(rows);
  if (insertError) {
    console.error('[notifications] insert error', insertError.message);
  }

  // ── 2. Fetch push subscriptions cho tất cả recipients ──────────────────────
  const { data: subs, error: subError } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', ids);

  if (subError) {
    console.error('[notifications] fetch subscriptions error', subError.message);
    return;
  }
  if (!subs || subs.length === 0) return;

  // ── 3. Gửi push + dọn subscription hết hạn ─────────────────────────────────
  const expiredEndpoints: string[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      const result = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        { title, body, url, data },
      );
      if (!result.ok && result.expired) {
        expiredEndpoints.push(sub.endpoint);
      }
    }),
  );

  if (expiredEndpoints.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', expiredEndpoints);
  }
}

// ── Helpers để lấy tất cả admin IDs (dùng khi notify admin) ────────────────
export async function getAdminIds(): Promise<string[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .eq('is_active', true);
  return (data ?? []).map((u) => u.id);
}
