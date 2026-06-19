# illust-studio セットアップガイド

## 1. GitHub Pages 有効化

1. GitHubリポジトリ `norinori-jan/illust-studio` を開く
1. Settings → Pages → Source: `Deploy from a branch`
1. Branch: `main` / `/ (root)` → Save
1. 数分後に `https://norinori-jan.github.io/illust-studio/` で公開される

-----

## 2. PWA ホーム画面追加（iPhone）

### `<head>` に追加するタグ（index.html / draw / concept / gallery 全ファイル共通）

```html
<!-- PWA -->
<link rel="manifest" href="/manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Illust Studio">
<link rel="apple-touch-icon" href="/assets/icon-192.png">
```

### Service Worker 登録スクリプト（各HTMLの `</body>` 直前に追加）

```html
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
</script>
```

### ホーム画面への追加手順（iPhone Safari）

1. Safari で `https://norinori-jan.github.io/illust-studio/` を開く
1. 画面下の共有ボタン（□↑）をタップ
1. 「ホーム画面に追加」をタップ
1. 名前を確認して「追加」

-----

## 3. アイコン作成

`assets/` フォルダに以下を用意する:

|ファイル          |サイズ      |用途           |
|--------------|---------|-------------|
|`icon-192.png`|192×192px|Android / PWA|
|`icon-512.png`|512×512px|スプラッシュ       |

**簡易作成方法（iPhone）:**

1. 好きな画像アプリで ✏️ と 🎨 を組み合わせたアイコンを作る
1. 正方形にトリミング
1. ファイル名を `icon-192.png` / `icon-512.png` にして `assets/` に配置

-----

## 4. Cloudflare Workers セットアップ

APIキーをクライアント側に持たせたくない場合に設定する。
設定しなくてもアプリは動作する（各アプリの設定画面でAPIキーを直接入力するモード）。

### 4-1. Cloudflareアカウント作成

- <https://dash.cloudflare.com> → 無料プランで OK

### 4-2. Workers 作成

1. Cloudflare Dashboard → Workers & Pages → Create application
1. 「Create Worker」→ 適当な名前（例: `illust-studio-api`）
1. 「Edit code」で `worker.js` の内容を貼り付けて Deploy

デプロイ後のURL例:

```
https://illust-studio-api.{your-name}.workers.dev
```

### 4-3. 環境変数（Secrets）を設定

Worker詳細ページ → Settings → Variables → Add variable

|変数名             |値                               |
|----------------|--------------------------------|
|`CLAUDE_KEY`    |`sk-ant-...`（Anthropic APIキー）   |
|`GEMINI_KEY`    |`AIza...`（Google APIキー）         |
|`ALLOWED_ORIGIN`|`https://norinori-jan.github.io`|

**Secretsとして設定すること**（暗号化保存、ログに出ない）

### 4-4. アプリ側のWorker URL設定

各アプリの設定画面（⚙️）にWorker URLを入力する欄を追加予定（TASK5残り）。

現状の暫定対応: draw / concept の `callClaude()` / `callGemini()` 内のURLを変更:

**変更前（直接API）:**

```javascript
fetch('https://api.anthropic.com/v1/messages', { ... })
fetch(`https://generativelanguage.googleapis.com/...`, { ... })
```

**変更後（Worker経由）:**

```javascript
fetch('https://illust-studio-api.{your-name}.workers.dev/claude', { ... })
fetch('https://illust-studio-api.{your-name}.workers.dev/gemini', { ... })
```

-----

## 5. ファイル配置チェックリスト

```
illust-studio/
├── index.html          ✅
├── sw.js               ✅ ← 今回追加
├── manifest.json       ✅ ← 今回追加
├── draw/
│   └── index.html      ✅
├── concept/
│   └── index.html      ✅
├── gallery/
│   └── index.html      ✅
├── shared/
│   └── bridge.js       ✅
└── assets/
    ├── icon-192.png    ⚠️ 手動で作成・配置
    └── icon-512.png    ⚠️ 手動で作成・配置
```

-----

## 6. 動作確認順序

1. GitHub Pagesで公開されているか確認
1. iPhoneのSafariで開けるか確認
1. ホーム画面に追加してスタンドアロン起動するか確認
1. オフライン（機内モード）でも開けるか確認
1. draw で描いて gallery に保存されるか確認
1. concept → drawへ送る → 下書きレイヤーに反映されるか確認