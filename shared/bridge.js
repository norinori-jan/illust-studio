/**
 * shared/bridge.js
 * illust-studio アプリ間画像受け渡し
 * concept ⇄ draw ⇄ gallery
 *
 * 使い方:
 *   <script src="../shared/bridge.js"></script>
 *
 * 送る側:
 *   IS_Bridge.send({ source, destination, imageDataURL, meta });
 *
 * 受け取る側（ページロード時に呼ぶ）:
 *   IS_Bridge.checkIncoming(payload => { ... });
 */

const IS_Bridge = (() => {
  const KEY = 'is_transfer';
  const GALLERY_KEY = 'is_gallery';

  // ── 送信 ──────────────────────────────────
  function send(payload) {
    // imageDataURL はサイズが大きいので保存前に圧縮チェック
    const data = JSON.stringify(payload);
    if (data.length > 4_000_000) {
      console.warn('[IS_Bridge] payload too large, skipping imageDataURL');
      const light = Object.assign({}, payload, { imageDataURL: null });
      localStorage.setItem(KEY, JSON.stringify(light));
    } else {
      localStorage.setItem(KEY, data);
    }
  }

  // ── 受信チェック ──────────────────────────
  // URL hash に #import があるか、または localStorage に pending があれば cb を呼ぶ
  function checkIncoming(cb) {
    // 1. URL hash 経由
    if (window.location.hash.startsWith('#import')) {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        try {
          const payload = JSON.parse(raw);
          localStorage.removeItem(KEY);          // 受け取ったら消す
          window.location.hash = '';             // hash をクリア
          cb(payload);
          return true;
        } catch(e) {
          console.error('[IS_Bridge] parse error', e);
        }
      }
    }
    // 2. hash なしでも pending があれば受け取る（同一ページ遷移なし環境用）
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        const payload = JSON.parse(raw);
        // destination が自分か確認
        const myApp = detectApp();
        if (!payload.destination || payload.destination === myApp) {
          localStorage.removeItem(KEY);
          cb(payload);
          return true;
        }
      } catch(e) {}
    }
    return false;
  }

  // ── ギャラリーへ保存 ──────────────────────
  function saveToGallery(item) {
    // item: { id, source, imageDataURL, prompt, style, tone, date }
    let gallery = [];
    try {
      const raw = localStorage.getItem(GALLERY_KEY);
      if (raw) gallery = JSON.parse(raw);
    } catch(e) {}
    gallery.unshift(Object.assign({ id: Date.now(), date: new Date().toISOString() }, item));
    if (gallery.length > 60) gallery = gallery.slice(0, 60);
    try {
      localStorage.setItem(GALLERY_KEY, JSON.stringify(gallery));
      return true;
    } catch(e) {
      console.warn('[IS_Bridge] gallery save failed (storage full?)');
      return false;
    }
  }

  // ── ギャラリーを読む ──────────────────────
  function loadGallery() {
    try {
      const raw = localStorage.getItem(GALLERY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e) { return []; }
  }

  // ── 現在のアプリを推測 ────────────────────
  function detectApp() {
    const path = window.location.pathname;
    if (path.includes('/draw')) return 'draw';
    if (path.includes('/concept')) return 'concept';
    if (path.includes('/gallery')) return 'gallery';
    return 'unknown';
  }

  return { send, checkIncoming, saveToGallery, loadGallery, detectApp };
})();

