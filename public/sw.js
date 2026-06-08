// Hanie Studio — Service Worker
// Xử lý PWA push notifications khi tab đóng / app ở background

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Push event: hiện notification ─────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Hanie Studio', body: event.data.text(), url: '/' };
  }

  const { title, body, icon, badge, url, data } = payload;

  event.waitUntil(
    self.registration.showNotification(title ?? 'Hanie Studio', {
      body: body ?? '',
      icon: icon ?? '/icons/icon-192.png',
      badge: badge ?? '/icons/badge-72.png',
      data: { url: url ?? '/', ...data },
      requireInteraction: false,
      tag: data?.type ?? 'hanie-noti',     // group cùng loại
      renotify: true,
    }),
  );
});

// ── Notification click: mở / focus tab ─────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Nếu đã có tab mở → focus tab đó và navigate
        for (const client of clients) {
          if ('focus' in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        // Chưa có tab → mở tab mới
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
