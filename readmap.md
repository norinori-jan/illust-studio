# illust-studio — リポジトリ設計 & ロードマップ

`norinori-jan/illust-studio` | GitHub Pages | シングルファイルHTML群 | iPhone-first PWA

-----

## リポジトリ構成

```
illust-studio/
├── index.html              ← ランチャー（アプリ選択 + 最近の作品4件）
│
├── draw/
│   └── index.html          ← 🖊 手描きキャンバス
│                              タッチ/Pencil対応 + AI色付けアシスタント
│
├── concept/
│   └── index.html          ← 💡 コンセプトボード
│                              テキストで伝える→AIが構図・色・ポイントを提案
│
├── gallery/
│   └── index.html          ← 📚 共有ギャラリー
│                              両アプリの作品を一覧・日記出力
│
├── shared/
│   ├── bridge.js           ← 🔗 アプリ間画像受け渡し（核心）
│   ├── palette.js          ← 🎨 共通カラーパレット18色定義
│   ├── export.js           ← 📤 共通エクスポート（PNG/日記/インスタ/はがき）
│   └── styles.css          ← 🎨 共通デザイントークン（CSS変数）
│
└── assets/
    ├── manifest.json       ← PWA設定
    └── icon.png            ← アプリアイコン
```

-----

## 2アプリの使い分け

|         |🖊 draw（手描きキャンバス）|💡 concept（コンセプトボード）|
|---------|----------------|-------------------|
|**主役**   |あなたの手           |AIの提案              |
|**入力**   |タッチ/スタイラス       |テキスト（日本語OK）        |
|**AI役割** |色提案・フィードバック     |構図・配色・描くポイント生成     |
|**出力**   |手描き作品           |参考ビジュアル＋説明         |
|**使うシーン**|実際に描きたい時        |「こんな絵を描きたい」を整理したい時 |

### 相互画像移動のフロー

```
concept → draw
  AIが提案した参考画像を「下書きとして draw に送る」
  → draw側でトレース・清書

draw → concept
  手描きの途中スケッチを「コンセプトに送る」
  → AIに「この絵の方向性でもっと詳しく提案して」と依頼

両方 → gallery
  完成・保存した作品は gallery に集約
  → 日記出力・フォーマット変換
```

### bridge.js の仕組み

```javascript
// 送る側（concept → draw）
IS_Bridge.send({
  source: 'concept',           // どのアプリから
  destination: 'draw',         // どこへ
  imageDataURL: canvas.toDataURL(),
  meta: { prompt, style, tone, date }
});
// → localStorage["is_transfer"] に保存 + draw/index.html#import で起動

// 受け取る側（draw）
IS_Bridge.checkIncoming(() => {
  // キャンバスに下書きレイヤーとして展開
});
```

-----

## ロードマップ

### ✅ 本日完了（Day 0 — 2025/06/18）

- [x] draw/index.html 初版完成（= illust-studio.html としてダウンロード済み）
  - タッチ描画エンジン（ペン/ブラシ/鉛筆/消しゴム）
  - 筆圧対応、undo/redo、ズーム
  - カラーパレット + カスタムカラー
  - AI色付け4モード（Claude/Gemini両対応）
  - エクスポート（PNG/日記/インスタ/共有）
- [ ] concept/index.html — **未作成（TASK1で着手）**
- [x] リポジトリ設計・フォルダ構成確定
- [x] ロードマップ作成

-----

### 🔲 TASK 1 — concept作成 + ランチャー + 共通基盤（次のセッション優先）

**concept/index.html ✅ 完成**

- [x] テキスト入力でAIに絵のイメージを伝えるUI
- [x] スタイル選択（水彩/鉛筆/アクリル etc.）
- [x] Claude/Geminiが構図・配色・描くポイントをテキスト提案
- [x] 参考ビジュアル（Canvas簡易プレビュー）
- [x] 「drawに送る」ボタン（bridge.js経由）

**index.html（ランチャー）✅ 完成**

- [x] 2アプリへのカード選択UI
- [x] 最近の作品（ギャラリーから4件プレビュー）
- [x] APIキーを一箇所で設定（`localStorage: is_claude`, `is_gemini`）

**shared/bridge.js ✅ 完成**

- [x] `IS_Bridge.send(payload)` 実装
- [x] `IS_Bridge.checkIncoming(callback)` 実装
- [x] URL hash `#import=base64JSON` 解析

**shared/styles.css ✅ 完成**

- [x] CSS変数をファイルに切り出し（両アプリで `<link>` して使う）

-----

### ✅ TASK 2 — draw 強化（完了）

- [x] **下書きレイヤー受け取り** — concept からの画像を半透明layer[0]に展開。受信バナー表示
- [x] **レイヤー本格実装** — 各レイヤーが独立した `<canvas>` を持つ
  - draft / 色塗りレイヤー(複数) / 輪郭レイヤー の順で重ねる
  - `flattenToCanvas()` で全レイヤー合成して書き出し
- [x] **ブラシ強化** — 水彩にじみ（楕円散布）/ 鉛筆ざらつき（ノイズ点）を実装
- [x] **グリッド/ガイド表示** — 三分割法グリッドをオーバーレイcanvasで表示（オフ可能）
- [x] **gallery への保存ボタン** — `is_gallery` に書き込み。ランチャーの最近の作品に反映

-----

### ✅ TASK 3 — concept 強化（完了）

- [x] **drawへ送るボタン** — 既存実装確認済み。変更なし
- [x] **プロンプト履歴** — 既存実装確認済み。変更なし
- [x] **スタイル別プレビュー比較** — 鉛筆・水彩・デジタルを3分割グリッドで並列表示。タップで選択→メインスタイルに反映→drawに送れる

-----

### ✅ TASK 4 — gallery（完了）

- [x] **gallery/index.html** 新規作成
- [x] 両アプリの作品を `is_gallery` localStorageから読み込み一覧表示
- [x] フィルター（アプリ別・今日・今週）
- [x] **日記フォーマット出力** — 最大4点をA5横1ページに合成
- [x] **iCloud Drive JSON連携** — `is_gallery.json` エクスポート/インポート（重複除外マージ）

-----

### ✅ TASK 5 — PWA + Cloudflare Workers（完了）

- [x] `manifest.json` — PWA設定（ショートカット: draw / concept）
- [x] `sw.js` — Service Worker（Shell Cache First / API Network Only / Font Network First）
- [x] ホーム画面追加対応（apple-mobile-web-appタグ + SETUP.mdに手順記載）
- [x] `worker.js` — Cloudflare Workers APIプロキシ（`/claude` `/gemini` エンドポイント）
- [x] Workers の環境変数: `CLAUDE_KEY` / `GEMINI_KEY` / `ALLOWED_ORIGIN`
- [x] `SETUP.md` — GitHub Pages + PWA + Cloudflare Workers デプロイ手順書

-----

### 🔲 TASK 6 — 将来構想（ロングタイム）

- [ ] **vocal入力** — 「海辺の少女」と声で言うとプロンプトに変換
- [ ] **スキャン取り込み** — カメラで紙の下書きを読み込んで draw に展開
- [ ] **music-suite連携** — BGMを流しながら描く（`ml_*` キー共有）
- [ ] **fortune連携** — 今日の易卦をもとにテーマを自動提案（`registry_a.json` 参照）

-----

## ファイル状況（TASK1〜5完了時点）

|ファイル               |状態    |リポジトリ配置先                           |
|-------------------|------|-----------------------------------|
|draw/index.html    |✅     |draw.html → `draw/index.html`      |
|concept/index.html |✅     |concept.html → `concept/index.html`|
|gallery/index.html |✅     |gallery.html → `gallery/index.html`|
|shared/bridge.js   |✅     |bridge.js → `shared/bridge.js`     |
|index.html         |✅     |`index.html`                       |
|manifest.json      |✅     |`manifest.json`                    |
|sw.js              |✅     |`sw.js`                            |
|worker.js          |✅     |Cloudflare Dashboardに貼り付け          |
|SETUP.md           |✅     |`SETUP.md`                         |
|assets/icon-192.png|⚠️ 手動作成|`assets/icon-192.png`              |
|assets/icon-512.png|⚠️ 手動作成|`assets/icon-512.png`              |

-----

## 次セッション向け引き継ぎプロンプト

```
illust-studioリポジトリの作業を続けます。
TASK1〜5完了。残りはTASK6（将来構想）または各HTMLへのSW登録タグ追加。
ファイル: draw.html/concept.html/gallery.html/bridge.js/index.html/manifest.json/sw.js/SETUP.md
SWタグ未追加: 各HTMLの<head>にmanifestタグ、</body>前にSW登録スクリプトを追加必要。
Worker URL: https://illust-studio-api.{name}.workers.dev（Surfaceでのデプロイ作業待ち）
APIキー: localStorage["is_claude"], ["is_gemini"]
ROADMAP.mdを参照して続きを進めてください。
```