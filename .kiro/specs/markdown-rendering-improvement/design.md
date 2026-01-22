# Design Document: markdown-rendering-improvement

## Overview

**Purpose**: ブログ記事のマークダウンレンダリングを改善し、箇条書きのリストマーカー表示と表の視認性向上を実現する。

**Users**: ブログ読者が記事を閲覧する際に、リストと表の構造を視覚的に理解できるようになる。

**Impact**: 既存の`.prose`スタイルを拡張し、リストと表に適切なスタイルを追加する。

### Goals
- 順序なしリスト（ul）に黒丸マーカーを表示
- 順序付きリスト（ol）に連番を表示
- 表に罫線、ヘッダー背景色、パディングを適用
- ダークモード対応
- 横幅超過時の横スクロール対応

### Non-Goals
- `@tailwindcss/typography`プラグインの導入
- 既存スタイル（コードブロック、callout等）の変更
- 新規CSSファイルの作成

## Architecture

### Existing Architecture Analysis

現在のスタイル構成:
- **globals.css**: CSS変数定義、callout/link-cardスタイル
- **[...slug].astro**: 記事ページの`.prose`スタイル（h2, h3, p, blockquote等）

既存パターン:
- `.prose`内の要素に対してカスタムスタイルを適用
- CSS変数（`--border`, `--muted`, `--foreground`）を使用してダークモード対応
- Tailwind CSS v4のPreflight（リセットスタイル）を前提としたスタイル定義

### Architecture Pattern & Boundary Map

**Architecture Integration**:
- **Selected pattern**: 既存ファイル拡張（Option A）
- **Domain boundaries**: `.prose`クラス内に限定したスタイル適用
- **Existing patterns preserved**: CSS変数の使用、`<style is:global>`での定義
- **New components rationale**: 新規コンポーネントなし、スタイル追加のみ
- **Steering compliance**: シンプルさの原則に従い最小限の変更

### Technology Stack

| Layer | Choice / Version | Role in Feature | Notes |
|-------|------------------|-----------------|-------|
| Frontend | Astro 5.x | ページレンダリング | 既存 |
| Styling | Tailwind CSS v4.1.18 | CSSフレームワーク | `@tailwindcss/vite`経由 |
| Styling | CSS Variables | ダークモード対応 | `--border`, `--muted`等 |

## Requirements Traceability

| Requirement | Summary | Components | Interfaces | Flows |
|-------------|---------|------------|------------|-------|
| 1.1 | ulに黒丸マーカー表示 | ListStyles | CSS | - |
| 1.2 | olに連番表示 | ListStyles | CSS | - |
| 1.3 | ネストリストのマーカー | ListStyles | CSS | - |
| 1.4 | リストのダークモード対応 | ListStyles | CSS | - |
| 2.1 | 表の外枠罫線 | TableStyles | CSS | - |
| 2.2 | セル間区切り線 | TableStyles | CSS | - |
| 2.3 | ヘッダー背景色 | TableStyles | CSS | - |
| 2.4 | セルパディング | TableStyles | CSS | - |
| 2.5 | 表のダークモード対応 | TableStyles | CSS | - |
| 2.6 | 横スクロール対応 | TableWrapper | CSS | - |
| 3.1 | CSS変数使用 | ListStyles, TableStyles | CSS | - |
| 3.2 | proseクラス内での上書き | ListStyles, TableStyles | CSS | - |
| 3.3 | 既存コンポーネント非影響 | - | - | - |

## Components and Interfaces

| Component | Domain/Layer | Intent | Req Coverage | Key Dependencies | Contracts |
|-----------|--------------|--------|--------------|------------------|-----------|
| ListStyles | Styling | リストマーカー表示 | 1.1-1.4, 3.1-3.2 | CSS Variables (P0) | CSS |
| TableStyles | Styling | 表の視認性向上 | 2.1-2.5, 3.1-3.2 | CSS Variables (P0) | CSS |
| TableWrapper | Styling | 横スクロール対応 | 2.6 | - | CSS |

### Styling Layer

#### ListStyles

| Field | Detail |
|-------|--------|
| Intent | `.prose`内のリスト要素にマーカースタイルを適用 |
| Requirements | 1.1, 1.2, 1.3, 1.4, 3.1, 3.2 |

**Responsibilities & Constraints**
- `ul`要素に`list-style-type: disc`を適用
- `ol`要素に`list-style-type: decimal`を適用
- ネストされたリストに階層別マーカー（circle, square）を適用
- CSS変数を使用してダークモード対応

**Dependencies**
- Inbound: `.prose`クラス — スコープ限定 (P0)
- External: CSS Variables — 色定義 (P0)

**Contracts**: CSS [x]

##### CSS Contract
```css
/* リストマーカースタイル */
.prose ul {
  list-style-type: disc;
}

.prose ol {
  list-style-type: decimal;
}

.prose ul ul {
  list-style-type: circle;
}

.prose ul ul ul {
  list-style-type: square;
}
```

**Implementation Notes**
- Integration: 既存の`.prose ul, .prose ol`スタイルに追加
- Validation: 開発サーバーでリストマーカー表示を確認
- Risks: 既存スタイルとの競合なし（新規プロパティ追加のみ）

#### TableStyles

| Field | Detail |
|-------|--------|
| Intent | `.prose`内の表要素に視認性の高いスタイルを適用 |
| Requirements | 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2 |

**Responsibilities & Constraints**
- 表に罫線（`border`）を適用
- ヘッダー行に背景色を適用
- セルにパディングを適用
- CSS変数を使用してダークモード対応

**Dependencies**
- Inbound: `.prose`クラス — スコープ限定 (P0)
- External: CSS Variables — `--border`, `--muted` (P0)

**Contracts**: CSS [x]

##### CSS Contract
```css
/* 表スタイル */
.prose table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prose th,
.prose td {
  border: 1px solid var(--border);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.prose th {
  background-color: var(--muted);
  font-weight: 600;
}

.prose tr:nth-child(even) {
  background-color: var(--muted);
  opacity: 0.5;
}
```

**Implementation Notes**
- Integration: `.prose`スタイルセクションに新規追加
- Validation: 表を含むマークダウンで表示確認
- Risks: `var(--muted)`の透明度調整が必要な場合あり

#### TableWrapper

| Field | Detail |
|-------|--------|
| Intent | 横幅超過時の表に対して横スクロールを提供 |
| Requirements | 2.6 |

**Responsibilities & Constraints**
- 表のコンテナに`overflow-x: auto`を適用
- レスポンシブ対応

**Contracts**: CSS [x]

##### CSS Contract
```css
/* 表の横スクロール対応 */
.prose .table-wrapper {
  overflow-x: auto;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prose .table-wrapper table {
  margin-top: 0;
  margin-bottom: 0;
}
```

**Implementation Notes**
- Integration: マークダウンからレンダリングされる表は自動でラッパーなし。CSSのみで対応する場合は`display: block`と`overflow-x: auto`を`table`に直接適用
- Alternative: rehypeプラグインで表をラッパーで囲む（スコープ外）

##### Alternative: Direct Table Overflow
```css
/* ラッパーなしの横スクロール対応 */
.prose table {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}
```

## Testing Strategy

### Unit Tests
- N/A（CSSスタイルのため）

### E2E/UI Tests
1. リストマーカー表示確認
   - 順序なしリストに黒丸が表示される
   - 順序付きリストに連番が表示される
   - ネストリストに階層別マーカーが表示される
2. 表スタイル確認
   - 表に罫線が表示される
   - ヘッダー行に背景色が適用される
   - セルにパディングが適用される
3. ダークモード確認
   - ダークモードでリストマーカーが適切に表示される
   - ダークモードで表の罫線と背景色が適切に表示される
4. レスポンシブ確認
   - 横幅が狭い画面で表が横スクロール可能

### Visual Regression Tests
- リストと表のスタイルがスクリーンショットで確認できる
- ダークモード/ライトモード両方でキャプチャ

## Error Handling

### Error Strategy
CSSスタイルのため、エラーハンドリングは不要。ブラウザのCSSパーサーがフォールバック処理を行う。

### Monitoring
- ビルド時のCSSバリデーション（Biome）
- ブラウザ開発者ツールでのスタイル適用確認
