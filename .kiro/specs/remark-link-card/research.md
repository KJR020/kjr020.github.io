# Research & Design Decisions: remark-link-card

---
**Purpose**: remark-link-card導入に関する調査結果と設計判断の記録

**Usage**:
- Light Discoveryプロセスの調査結果
- プラグイン選定の根拠
- スタイリング設計の詳細
---

## Summary
- **Feature**: `remark-link-card`
- **Discovery Scope**: Extension（既存Astroブログへのプラグイン追加）
- **Key Findings**:
  1. remark-link-card v1.3.1は4年前の最終更新だが、Astro 5との互換性は確認済み
  2. 改良版の`remark-link-card-plus`が存在するが、オリジナルで十分な機能を提供
  3. CSSは未提供のため、既存CSS変数システム（shadcn/ui準拠）を活用して自作

## Research Log

### プラグイン互換性調査
- **Context**: Astro 5.16.9との互換性確認
- **Sources Consulted**:
  - [remark-link-card - npm](https://www.npmjs.com/package/remark-link-card)
  - [GitHub - gladevise/remark-link-card](https://github.com/gladevise/remark-link-card)
  - [Astro Markdown Docs](https://docs.astro.build/en/guides/markdown-content/)
  - [Astroにおけるremark-link-cardを使ったリンクカード](https://sur33.com/posts/remark-link-card-with-astro/)
- **Findings**:
  - remark-link-card v1.3.1（最新）はAstro 5で動作確認済み
  - TypeScriptプロジェクトでは型定義ファイルが存在しないため警告が出る可能性
  - remarkPlugins配列形式 `[[plugin, options]]` で設定
- **Implications**: 標準的なremarkプラグイン統合パターンで導入可能

### 代替プラグイン調査
- **Context**: より新しい代替案の存在確認
- **Sources Consulted**:
  - [remark-link-card-plus - npm](https://www.npmjs.com/package/remark-link-card-plus)
  - [Released remark-link-card-plus](https://blog.okaryo.studio/en/20250108-release-remark-link-card-plus/)
- **Findings**:
  - `remark-link-card-plus`はオリジナルを改良したフォーク
  - リスト内リンクの誤変換問題を修正
  - 追加機能を提供
- **Implications**: 本プロジェクトではシンプルなユースケースのため、オリジナルで十分。問題発生時は移行検討。

### 生成HTML構造調査
- **Context**: CSSスタイリングのためのDOM構造把握
- **Sources Consulted**:
  - [GitHub README](https://github.com/gladevise/remark-link-card)
  - 参考実装サイト
- **Findings**:
  ```html
  <a class="rlc-container" href="[URL]">
    <div class="rlc-info">
      <div class="rlc-title">[タイトル]</div>
      <div class="rlc-description">[説明]</div>
      <div class="rlc-url-container">
        <img class="rlc-favicon" src="[favicon]" alt="" width="16" height="16">
        <span class="rlc-url">[URL]</span>
      </div>
    </div>
    <div class="rlc-image-container">
      <img class="rlc-image" src="[OG画像]" alt="" />
    </div>
  </a>
  ```
- **Implications**: 8つのCSSクラスに対してスタイル定義が必要

### 既存スタイリングパターン調査
- **Context**: プロジェクトのCSS設計パターン把握
- **Sources Consulted**:
  - `src/styles/globals.css`
  - `src/pages/posts/[...slug].astro`
- **Findings**:
  - shadcn/ui準拠のCSS変数システム（`--card`, `--border`, `--radius`等）
  - ダークモードは`.dark`クラスによる変数切替
  - Tailwind CSS v4の`@theme inline`でCSS変数統合
  - proseスタイルは`[...slug].astro`の`<style is:global>`で定義
- **Implications**: 既存CSS変数を活用することでデザイン一貫性を維持

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Option A: globals.css拡張 | 既存globals.cssにリンクカードスタイル追加 | 最小変更、パターン整合、ダークモード対応容易 | ファイルサイズ増加 | **推奨** |
| Option B: 専用CSS作成 | `src/styles/link-card.css`新規作成 | 関心分離、メンテ性 | インポート設定必要、ファイル増 | 複雑なスタイルの場合に検討 |
| Option C: slug.astro埋込 | 記事ページのstyleブロックに追加 | prose系スタイルと同居 | 255行→増加、他ページ再利用不可 | 非推奨 |

## Design Decisions

### Decision: プラグイン選定
- **Context**: remark-link-card vs remark-link-card-plus の選択
- **Alternatives Considered**:
  1. remark-link-card v1.3.1 — オリジナル、4年前更新
  2. remark-link-card-plus — 改良版、リスト内リンク問題修正
- **Selected Approach**: remark-link-card v1.3.1
- **Rationale**:
  - 参考記事で動作確認済み
  - シンプルなユースケース（リスト内リンクカード不要）
  - 依存関係を最小限に
- **Trade-offs**:
  - ✅ 実績あり、参考情報豊富
  - ❌ リスト内リンクが誤変換される可能性（現状の記事では問題なし）
- **Follow-up**: 問題発生時はremark-link-card-plusへの移行を検討

### Decision: スタイル配置場所
- **Context**: リンクカードCSSの配置先決定
- **Alternatives Considered**:
  1. globals.css — グローバルスタイルファイル
  2. 専用CSSファイル新規作成
  3. [slug].astroのstyleブロック
- **Selected Approach**: globals.css
- **Rationale**:
  - 既存のShikiスタイル（`.astro-code`）と同じパターン
  - CSS変数がスコープ内で利用可能
  - インポート設定不要
- **Trade-offs**:
  - ✅ 変更ファイル数最小
  - ❌ globals.cssが長くなる（約60行追加）

### Decision: カードレイアウト
- **Context**: リンクカードのビジュアルデザイン決定
- **Alternatives Considered**:
  1. 横並び（画像右側）— デスクトップ向け
  2. 縦並び（画像上部）— モバイル向け
  3. レスポンシブ切替 — 画面幅に応じて変更
- **Selected Approach**: レスポンシブ切替（デフォルト横並び、モバイルで縦並び）
- **Rationale**:
  - デスクトップでは情報密度を維持
  - モバイルでは可読性を優先
- **Trade-offs**:
  - ✅ 両デバイスで最適化
  - ❌ CSS複雑度がやや増加

## Risks & Mitigations

| Risk | Level | Mitigation |
|------|-------|------------|
| プラグイン更新停止（4年間） | 中 | 安定版として解釈。問題時はremark-link-card-plusへ移行 |
| TypeScript型定義なし | 低 | `// @ts-ignore`または型定義ファイル作成 |
| OG画像取得失敗 | 低 | CSSでフォールバックスタイル（画像なしレイアウト）を定義 |
| キャッシュディレクトリ肥大化 | 低 | .gitignoreで除外、定期的なクリーンアップ |

## References
- [remark-link-card - npm](https://www.npmjs.com/package/remark-link-card) — プラグイン公式
- [GitHub - gladevise/remark-link-card](https://github.com/gladevise/remark-link-card) — ソースコード・ドキュメント
- [Astroにおけるremark-link-cardを使ったリンクカード](https://sur33.com/posts/remark-link-card-with-astro/) — 参考実装記事
- [Astro Markdown Docs](https://docs.astro.build/en/guides/markdown-content/) — Astro公式Markdownガイド
- [remark-link-card-plus](https://www.npmjs.com/package/remark-link-card-plus) — 代替プラグイン
