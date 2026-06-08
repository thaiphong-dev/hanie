'use client';

import { useEffect, useRef } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array.buffer;
}

/**
 * Tự động subscribe/unsubscribe PWA push khi user đăng nhập/đăng xuất.
 * Gọi trong component đã biết user đang logged in.
 */
export function usePushSubscription(enabled: boolean) {
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!enabled || subscribedRef.current) return;
    if (!VAPID_PUBLIC_KEY) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    let cancelled = false;

    async function subscribe() {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();

        let subscription = existing;
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        }

        if (cancelled) return;

        const { endpoint, keys } = subscription.toJSON() as {
          endpoint: string;
          keys: { p256dh: string; auth: string };
        };

        await fetch('/api/v1/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
            userAgent: navigator.userAgent,
          }),
        });

        subscribedRef.current = true;
      } catch (err) {
        // Người dùng từ chối permission hoặc browser không hỗ trợ — silent fail
        if (err instanceof Error && err.name !== 'NotAllowedError') {
          console.warn('[usePushSubscription]', err.message);
        }
      }
    }

    subscribe();

    return () => {
      cancelled = true;
    };
  }, [enabled]);
}
