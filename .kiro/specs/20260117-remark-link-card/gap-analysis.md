# Gap Analysis: remark-link-card

## 1. 現状調査

### 1.1 関連ファイル・モジュール

| ファイル | 役割 | 変更影響 |
|---------|------|---------|
| [astro.config.mjs](astro.config.mjs) | Astro設定（Markdownプラグイン） | **直接変更** |
| [src/styles/globals.css](src/styles/globals.css) | グローバルスタイル | **追記対象** |
| [src/pages/posts/[...slug].astro](src/pages/posts/[...slug].astro) | 記事表示ページ | 影響あり（prose内での表示） |
| [.gitignore](.gitignore) | キャッシュ除外設定 | **追記対象** |
| [package.json](package.json) | 依存関係 | **追記対象** |

### 1.2 既存アーキテクチャパターン

#### Markdownプラグイン構成
- **remarkPlugins**: 現在未使用（空）
- **rehypePlugins**: `rehypeMermaid`のみ使用
- プラグインオプションは配列形式 `[[plugin, options]]` で設定

#### スタイリングパターン
- **CSS変数**: shadcn/ui準拠（`--card`, `--border`, `--radius`等）
- **ダークモード**: `.dark`クラスによるCSS変数切替
- **Tailwind CSS v4**: `@theme inline`でCSS変数をTailwindに統合
- **proseスタイル**: `[...slug].astro`内の`<style is:global>`で定義

#### 既存コンテンツ
- 43件のMarkdown記事が存在
- `<https://...>` 形式のリンクが既に使用されている（例: CORSに関するメモ）
- 変換対象のリンクが既存記事に存在する

### 1.3 統合ポイント

| 統合対象 | 現状 | 必要な対応 |
|---------|------|-----------|
| Astro Markdownパイプライン | rehypeのみ使用 | remarkPluginsに追加 |
| CSS変数システム | shadcn/ui準拠 | 既存変数を活用してスタイル作成 |
| ダークモード | `.dark`クラス切替 | ダークモード用スタイル追加 |
| キャッシュディレクトリ | 未存在 | `/public/remark-link-card/`作成 |

---

## 2. 要件実現可能性分析

### 2.1 要件別の技術的ニーズ

| 要件 | 技術的ニーズ | ギャップ |
|------|-------------|---------|
| Req 1: プラグイン導入 | npm install, astro.config.mjs変更 | **なし** |
| Req 2: リンクカード変換 | remark-link-cardの標準機能 | **なし** |
| Req 3: ライトモードスタイル | CSSクラス `.rlc-*` のスタイル定義 | **Missing**: CSSが未提供 |
| Req 4: ダークモードスタイル | `.dark .rlc-*` のスタイル定義 | **Missing**: CSSが未提供 |
| Req 5: キャッシュ管理 | cache: true オプション設定 | **なし** |

### 2.2 ギャップ詳細

#### Missing: カードスタイルCSS
- **理由**: remark-link-cardはHTML構造のみ提供し、CSSは付属しない
- **影響**: スタイルを自作する必要がある
- **対応**: globals.cssに`.rlc-*`クラスのスタイルを追加

#### 生成されるHTML構造（調査済み）
```html
<a class="rlc-container" href="[URL]">
  <div class="rlc-info">
    <div class="rlc-title">[タイトル]</div>
    <div class="rlc-description">[説明]</div>
    <div class="rlc-url-container">
      <img class="rlc-favicon" src="[favicon]">
      <span class="rlc-url">[URL]</span>
    </div>
  </div>
  <div class="rlc-image-container">
    <img class="rlc-image" src="[OG画像]">
  </div>
</a>
```

### 2.3 複雑度シグナル
- **統合の単純さ**: remarkPluginsへの追加のみ
- **外部依存**: remark-link-card（メンテナンス状況: 4年前の最終更新）
- **CSSの複雑さ**: 既存パターンに従うため低〜中

---

## 3. 実装アプローチオプション

### Option A: 既存ファイルへの拡張（推奨）

**概要**: 既存の`astro.config.mjs`と`globals.css`を拡張

**変更ファイル**:
1. `package.json` - 依存関係追加
2. `astro.config.mjs` - remarkPlugins追加
3. `src/styles/globals.css` - リンクカードスタイル追加
4. `.gitignore` - キャッシュディレクトリ除外

**トレードオフ**:
- ✅ 最小限のファイル変更
- ✅ 既存パターンとの整合性維持
- ✅ globals.cssで他のMarkdownスタイルと統一管理
- ❌ globals.cssのファイルサイズ増加

### Option B: 専用スタイルファイル作成

**概要**: リンクカード用の専用CSSファイルを作成

**変更ファイル**:
1. `package.json` - 依存関係追加
2. `astro.config.mjs` - remarkPlugins追加
3. `src/styles/link-card.css` - **新規作成**
4. `src/layouts/BaseLayout.astro` - CSS import追加
5. `.gitignore` - キャッシュディレクトリ除外

**トレードオフ**:
- ✅ 関心の分離
- ✅ メンテナンス時の見通しが良い
- ❌ 新規ファイル追加
- ❌ インポート設定が必要

### Option C: ハイブリッドアプローチ

**概要**: `[...slug].astro`の`<style is:global>`にスタイルを追加

**変更ファイル**:
1. `package.json` - 依存関係追加
2. `astro.config.mjs` - remarkPlugins追加
3. `src/pages/posts/[...slug].astro` - styleブロック拡張
4. `.gitignore` - キャッシュディレクトリ除外

**トレードオフ**:
- ✅ 記事ページ専用のスタイルとして管理
- ✅ 他のproseスタイルと同じ場所で管理
- ❌ ファイルサイズ増加（既に255行）
- ❌ 他のページでリンクカード使用時に再定義必要

---

## 4. 実装複雑度とリスク

### 工数見積もり: **S（1〜3日）**

**理由**:
- 既存パターンに従う拡張のみ
- 外部プラグインが主要機能を提供
- CSSは既存変数を流用可能

### リスク評価: **Low（低）**

| リスク | レベル | 緩和策 |
|--------|-------|--------|
| プラグイン互換性 | 低 | Astro/remarkとの互換性は確認済み |
| スタイル競合 | 低 | `.rlc-*`は専用プレフィックス |
| パフォーマンス | 低 | キャッシュ機能で外部リクエスト削減 |
| メンテナンス | 中 | プラグイン最終更新4年前（安定版と解釈） |

---

## 5. 推奨事項

### 推奨アプローチ: Option A（既存ファイル拡張）

**根拠**:
1. 変更ファイル数が最小限
2. 既存のMarkdownスタイル管理パターン（globals.css + `[...slug].astro`）と整合
3. CSS変数を活用することでダークモード対応が容易

### デザインフェーズで決定すべき事項

1. **カードレイアウト**: 横並び vs 縦並び（モバイル時）
2. **画像サイズ**: OG画像の表示サイズ・アスペクト比
3. **ホバーエフェクト**: 影の強調 / スケール変化 / 背景色変化
4. **フォールバック**: OG画像・説明文が取得できない場合の表示

### リサーチ不要項目

- プラグインの設定オプション: **調査済み**（cache, shortenUrl）
- 生成HTML構造: **調査済み**（`.rlc-*`クラス）
- 既存コンテンツとの互換性: **確認済み**（`<https://...>`形式使用中）
