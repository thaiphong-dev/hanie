import webpush from 'web-push';

const VAPID_PUBLIC_KEY  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT     = process.env.VAPID_SUBJECT ?? 'mailto:admin@hanie.vn';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  data?: Record<string, string | number | boolean | null>;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendWebPush(
  subscription: PushSubscriptionRecord,
  payload: PushPayload,
): Promise<{ ok: true } | { ok: false; expired: boolean }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[web-push] VAPID keys not configured — skipping push');
    return { ok: false, expired: false };
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon ?? '/icons/icon-192.png',
        badge: payload.badge ?? '/icons/badge-72.png',
        url: payload.url ?? '/',
        data: payload.data ?? {},
      }),
    );
    return { ok: true };
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    // 410 Gone = subscription expired/unsubscribed; 404 Not Found = same
    const expired = status === 410 || status === 404;
    if (!expired) {
      console.error('[web-push] sendNotification error', err);
    }
    return { ok: false, expired };
  }
}
