// Service worker da Cris: funciona offline e recebe os avisos (Web Push).
const CACHE = 'cris-vmvbbyxxw';
const ARQS = ['./', 'index.html', 'app.js', 'app.css', 'cris.glb', 'room.glb', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'fonts/n400.woff2', 'fonts/n600.woff2', 'fonts/n700.woff2', 'fonts/n800.woff2'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request).then((res) => {
    const cp = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return res;
  }).catch(() => caches.match('index.html'))));
});
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data.json(); } catch (x) { d = { title: 'Cris 💗', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Cris 💗', {
    body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || undefined, data: { type: d.type || '' },
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = './?r=' + encodeURIComponent((e.notification.data && e.notification.data.type) || '');
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    for (const c of cs) { if ('focus' in c) { c.navigate(url).catch(() => { }); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
