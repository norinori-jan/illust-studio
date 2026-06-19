/**
 * sw.js — Illust Studio Service Worker
 * 配置先: リポジトリルート /sw.js
 *
 * 戦略:
 *   - Shell（HTML/JS/CSS/Fonts）: Cache First（オフラインでも開ける）
 *   - APIリクエスト: Network Only（キャッシュしない）
 *   - 画像アセット: Cache First with fallback
 */

const CACHE_NAME = 'illust-studio-v1';

// オフラインでも動かすファイル一覧
const SHELL = [
  '/',
  '/index.html',
  '/draw/index.html',
  '/concept/index.html',
  '/gallery/index.html',
  '/shared/bridge.js',
  '/manifest.json',
];

// ── INSTALL ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// ── ACTIVATE ─────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH ────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // APIリクエストはキャッシュしない（Network Only）
  if (
    url.hostname.includes('anthropic.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('workers.dev')
  ) {
    return; // ブラウザのデフォルト挙動に任せる
  }

  // Googleフォントはネットワーク優先、失敗時はキャッシュ
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // その他: Cache First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        // 正常レスポンスのみキャッシュ
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return res;
      });
    })
  );
});

