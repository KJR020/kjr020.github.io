# Research & Design Decisions

## Summary
- **Feature**: `markdown-rendering-improvement`
- **Discovery Scope**: Simple Addition（CSSスタイルの追加）
- **Key Findings**:
  - 既存の`.prose`スタイルに`list-style-type`が未設定でリストマーカーが非表示
  - 表（table）に対するスタイルが完全に欠如
  - CSS変数システム（`--border`, `--muted`等）が整備済みで再利用可能

## Research Log

### リストマーカーが表示されない原因
- **Context**: 箇条書きのマーカーが表示されない問題の調査
- **Sources Consulted**:
  - [src/pages/posts/[...slug].astro](src/pages/posts/[...slug].astro) L171-181
  - Tailwind CSS v4ドキュメント
- **Findings**:
  - `.prose ul, .prose ol`に`margin`と`padding-left`のみ設定
  - `list-style-type`プロパティが未設定
  - Tailwind CSSのPreflight（base styles）がリストスタイルをリセットしている
- **Implications**: `list-style-type: disc`（ul）と`list-style-type: decimal`（ol）を明示的に設定する必要がある

### 表スタイルの現状
- **Context**: 表の視認性が低い問題の調査
- **Sources Consulted**:
  - [src/styles/globals.css](src/styles/globals.css)
  - [src/pages/posts/[...slug].astro](src/pages/posts/[...slug].astro)
- **Findings**:
  - `.prose table`に対するスタイルが一切存在しない
  - 既存のCSS変数（`--border`, `--muted`）が罫線や背景色に活用可能
- **Implications**: 表の罫線、ヘッダー背景色、パディング、横スクロールのスタイルを新規追加

### 技術スタック確認
- **Context**: 使用されているCSSフレームワークの確認
- **Sources Consulted**:
  - [package.json](package.json)
  - [astro.config.mjs](astro.config.mjs)
- **Findings**:
  - Tailwind CSS v4.1.18（`@tailwindcss/vite`プラグイン経由）
  - `@tailwindcss/typography`プラグインは未使用
  - 手動で`.prose`スタイルを定義している
- **Implications**: 既存パターンに従い、`[...slug].astro`の`<style is:global>`セクションにスタイルを追加

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| A: 既存ファイル拡張 | `[...slug].astro`の`<style>`に追加 | 変更箇所が1ファイル、既存パターン踏襲 | ファイルが長くなる（+40行程度） | **推奨** |
| B: globals.css追加 | グローバルCSSに追加 | 全ページで再利用可能 | 既存パターンと異なる | 不採用 |
| C: typographyプラグイン導入 | `@tailwindcss/typography`使用 | 包括的なスタイル | 新規依存、既存スタイルとの調整必要 | 不採用 |

## Design Decisions

### Decision: スタイル追加場所
- **Context**: リストと表のスタイルをどこに追加するか
- **Alternatives Considered**:
  1. `src/pages/posts/[...slug].astro`の`<style is:global>`セクション
  2. `src/styles/globals.css`
  3. 新規CSSファイル作成
- **Selected Approach**: Option 1（`[...slug].astro`）
- **Rationale**:
  - 既に`.prose`関連スタイル（h2, h3, p, blockquote等）が定義されている場所
  - 変更の影響範囲が明確（記事ページのみ）
  - 他の開発者が関連スタイルを探す際に見つけやすい
- **Trade-offs**: ファイルが約40行増加するが、関連スタイルの集約によるメリットの方が大きい
- **Follow-up**: なし

### Decision: CSS変数の活用
- **Context**: 色やボーダーの指定方法
- **Selected Approach**: 既存のCSS変数（`--border`, `--muted`, `--foreground`）を使用
- **Rationale**:
  - ダークモード対応が自動的に行われる
  - デザインシステムとの一貫性を維持
- **Trade-offs**: なし（明確なメリットのみ）

## Risks & Mitigations
- **低リスク**: スタイル追加のみのため、既存機能への影響は最小
- **Callout/CodeBlockとの競合**: セレクタの詳細度に注意し、影響範囲を`.prose`内に限定

## References
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs) — スタイルのリセット仕様
- [MDN - list-style-type](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type) — リストマーカーの種類
