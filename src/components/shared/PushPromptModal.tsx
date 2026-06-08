'use client';

import { useEffect, useState } from 'react';
import { Bell, X, CheckCircle, AlertCircle } from 'lucide-react';

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

/** Wrap navigator.serviceWorker.ready với timeout để không kẹt mãi */
function swReady(timeoutMs = 5000): Promise<ServiceWorkerRegistration> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Service worker timeout')), timeoutMs),
    ),
  ]);
}

type State = 'idle' | 'loading' | 'success' | 'denied' | 'error';

export function PushPromptModal() {
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission === 'granted') {
      sessionStorage.removeItem('push_prompt_pending');
      return;
    }
    if (Notification.permission === 'denied') return;
    const pending = sessionStorage.getItem('push_prompt_pending');
    if (pending === 'true') setVisible(true);
  }, []);

  function dismiss() {
    sessionStorage.removeItem('push_prompt_pending');
    setVisible(false);
  }

  // Auto-close sau khi hiển thị success
  useEffect(() => {
    if (state === 'success') {
      const t = setTimeout(dismiss, 2000);
      return () => clearTimeout(t);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  async function enable() {
    setState('loading');
    setErrorMsg('');

    try {
      // Bước 1: Xin quyền từ browser (hiện native dialog của browser)
      const permission = await Notification.requestPermission();

      if (permission === 'denied') {
        setState('denied');
        return;
      }
      if (permission !== 'granted') {
        // User đóng dialog mà không chọn
        dismiss();
        return;
      }

      // Bước 2: Chờ Service Worker sẵn sàng (max 5s)
      let registration: ServiceWorkerRegistration;
      try {
        registration = await swReady(5000);
      } catch {
        // SW chưa ready — thử register lại rồi wait
        registration = await navigator.serviceWorker.register('/sw.js');
        await new Promise<void>((resolve) => {
          if (registration.active) { resolve(); return; }
          registration.addEventListener('updatefound', () => {
            registration.installing?.addEventListener('statechange', function handler() {
              if (this.state === 'activated') { resolve(); }
            });
          });
          setTimeout(resolve, 3000); // fallback timeout
        });
      }

      if (!VAPID_PUBLIC_KEY) {
        setState('error');
        setErrorMsg('Cấu hình VAPID key bị thiếu');
        return;
      }

      // Bước 3: Subscribe push
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));

      const { endpoint, keys } = subscription.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      // Bước 4: Lưu subscription lên server
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

      setState('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      console.warn('[PushPromptModal]', msg);
      setState('error');
      setErrorMsg(msg);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              ${state === 'success' ? 'bg-green-100' : state === 'denied' || state === 'error' ? 'bg-red-50' : 'bg-[#C9A882]/15'}`}
            >
              {state === 'success'
                ? <CheckCircle className="w-5 h-5 text-green-500" />
                : state === 'denied' || state === 'error'
                ? <AlertCircle className="w-5 h-5 text-red-400" />
                : <Bell className="w-5 h-5 text-[#C9A882]" />
              }
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-base">
                {state === 'success'
                  ? 'Đã bật thông báo!'
                  : state === 'denied'
                  ? 'Thông báo bị chặn'
                  : state === 'error'
                  ? 'Có lỗi xảy ra'
                  : 'Bật thông báo'}
              </h2>
              <p className="text-xs text-gray-500">Hanie Studio</p>
            </div>
          </div>
          {state !== 'loading' && state !== 'success' && (
            <button
              onClick={dismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        {state === 'idle' && (
          <p className="text-sm text-gray-600 leading-relaxed">
            Nhận thông báo ngay cả khi bạn đóng trình duyệt — nhắc nhở lịch hẹn, xác nhận đặt lịch và ưu đãi mới nhất từ Hanie Studio.
          </p>
        )}
        {state === 'loading' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Vui lòng bấm <strong>Cho phép</strong> trên hộp thoại của trình duyệt…</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-3 h-3 rounded-full bg-[#C9A882] animate-pulse" />
              Đang chờ xác nhận
            </div>
          </div>
        )}
        {state === 'success' && (
          <p className="text-sm text-green-600">
            Bạn sẽ nhận được thông báo ngay cả khi đóng ứng dụng. Cảm ơn bạn!
          </p>
        )}
        {state === 'denied' && (
          <p className="text-sm text-gray-600 leading-relaxed">
            Trình duyệt đã chặn thông báo. Để bật lại, vào <strong>Cài đặt trình duyệt → Quyền riêng tư → Thông báo</strong> và cho phép trang này.
          </p>
        )}
        {state === 'error' && (
          <p className="text-sm text-red-500">
            {errorMsg || 'Không thể đăng ký thông báo. Vui lòng thử lại sau.'}
          </p>
        )}

        {/* Actions */}
        {(state === 'idle' || state === 'error') && (
          <div className="flex gap-3">
            <button
              onClick={dismiss}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Để sau
            </button>
            <button
              onClick={() => void enable()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#C9A882] text-white text-sm font-medium hover:bg-[#b8916e] transition-colors"
            >
              {state === 'error' ? 'Thử lại' : 'Bật thông báo'}
            </button>
          </div>
        )}
        {state === 'denied' && (
          <button
            onClick={dismiss}
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        )}
      </div>
    </div>
  );
}
