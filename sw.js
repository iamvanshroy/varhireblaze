/* VarHireBlaze service worker: makes the site installable and lets games keep working on a weak connection.
   Pages: network first, cached copy if offline. Static files: cached copy first, refreshed in the background.
   API calls, ads and analytics are never cached. */
const V = "vb-v2";
const CORE = ["/", "/games.html", "/lab.html", "/offline.html", "/games-core.js", "/neon-games.js", "/games-hub.js", "/vb-share.js", "/lab/core.js", "/lab/lab.css", "/icons/icon-192.png", "/img/vansh-face.webp"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;
  if (r.mode === "navigate" || (r.headers.get("accept") || "").includes("text/html")) {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match("/offline.html"))));
    return;
  }
  e.respondWith(caches.match(r).then(m => {
    const net = fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => m);
    return m || net;
  }));
});
