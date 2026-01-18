# Research & Design Decisions

## Summary
- **Feature**: `scrapbox-card-list`
- **Discovery Scope**: Extension（既存 Astro + React プロジェクトへの新コンポーネント追加）
- **Key Findings**:
  - Scrapbox API は CORS ヘッダーを返さないため、ビルド時取得が必須
  - 既存の shadcn/ui Card コンポーネントを拡張して利用可能
  - Astro の React インテグレーションで `client:load` ディレクティブによる CSR が実現可能

## Research Log

### Scrapbox API レスポンス構造
- **Context**: カード表示に必要なデータフィールドの特定
- **Sources Consulted**: `https://scrapbox.io/api/pages/help-jp` (実際の API レスポンス)
- **Findings**:
  - `pages` 配列に各ページ情報が格納
  - 主要フィールド:
    - `id`: 一意識別子
    - `title`: ページタイトル
    - `image`: サムネイル URL（nullable）
    - `descriptions`: テキスト抜粋の配列
    - `updated`: Unix タイムスタンプ
    - `views`: 閲覧数
  - `descriptions` 配列には `[https://...]` 形式の画像参照や `[page-name]` 形式のリンク記法が含まれる
- **Implications**:
  - `image` フィールドが null の場合のフォールバック UI が必要
  - `descriptions` の最初の数要素を結合して抜粋テキストを生成

### 既存コードベースのパターン分析
- **Context**: 既存の React コンポーネントパターンに合わせた設計
- **Sources Consulted**: `src/components/ThemeToggle.tsx`, `src/components/ui/card.tsx`
- **Findings**:
  - shadcn/ui ベースの Card コンポーネントが存在（`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`）
  - React コンポーネントは `useState`, `useEffect` による状態管理パターンを使用
  - Tailwind CSS + `cn()` ユーティリティでスタイリング
  - `@/components/ui/*` パスエイリアスが設定済み
- **Implications**:
  - 既存 Card コンポーネントを拡張して ScrapboxCard を構築
  - `client:load` ディレクティブで React コンポーネントをハイドレーション

### Astro ビルド時スクリプト実行
- **Context**: ビルド時に外部 API を呼び出す方法
- **Sources Consulted**: Astro ドキュメント、astro.config.mjs
- **Findings**:
  - Astro は `astro.config.mjs` の `integrations` で拡張可能
  - `prebuild` npm スクリプトでビルド前に Node.js スクリプトを実行可能
  - `public/` ディレクトリに配置したファイルはそのまま静的配信される
- **Implications**:
  - `scripts/fetch-scrapbox.ts` でビルド前にデータ取得
  - `public/data/scrapbox-{project}.json` に出力
  - `package.json` の `build` スクリプトを `prebuild && astro build` に変更

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| ビルド時取得 + 静的 JSON | prebuild スクリプトで API 取得、JSON 出力 | シンプル、追加サービス不要、CORS 回避 | リアルタイム更新不可 | **採用** |
| Cloudflare Workers Proxy | Workers で API をプロキシ | リアルタイム更新可能 | 外部サービス依存、設定複雑 | Future Requirements として記録済み |
| Astro SSR | サーバーサイドで API 取得 | リアルタイム更新可能 | GitHub Pages では不可 | 却下 |

## Design Decisions

### Decision: ビルド時データ取得方式
- **Context**: Scrapbox API の CORS 制限を回避しつつ GitHub Pages で動作させる
- **Alternatives Considered**:
  1. クライアントサイド fetch（CORS エラー）
  2. Cloudflare Workers Proxy（複雑性増加）
  3. ビルド時取得 + 静的 JSON（シンプル）
- **Selected Approach**: ビルド時に Node.js スクリプトで API 取得し、JSON ファイルとして出力
- **Rationale**: 追加サービス不要、GitHub Pages の制約内で動作、シンプルな実装
- **Trade-offs**: リアルタイム更新不可（ビルド時のスナップショット）
- **Follow-up**: 将来的に定期ビルド（GitHub Actions schedule）で更新頻度を向上可能

### Decision: 既存 Card コンポーネントの拡張
- **Context**: UI コンポーネントの設計方針
- **Alternatives Considered**:
  1. 完全に新規の ScrapboxCard コンポーネント
  2. 既存 shadcn/ui Card を拡張
- **Selected Approach**: 既存 Card コンポーネント（`CardHeader`, `CardTitle` 等）を組み合わせて ScrapboxCard を構築
- **Rationale**: 既存のデザインシステムとの一貫性、再利用性
- **Trade-offs**: shadcn/ui の Card デザインに依存

### Decision: React + client:load による CSR
- **Context**: Astro ページ内での動的コンポーネント実装
- **Alternatives Considered**:
  1. Astro コンポーネント + Vanilla JS
  2. React + client:load
  3. Preact + client:load
- **Selected Approach**: React + `client:load` ディレクティブ
- **Rationale**: 既存プロジェクトで React を使用中、状態管理が容易
- **Trade-offs**: クライアントサイドの JS バンドルサイズ増加

## Risks & Mitigations
- **Scrapbox API 仕様変更** — JSON スキーマのバリデーションとフォールバック処理で対応
- **ビルド時 API 障害** — エラー時は既存 JSON を保持し、ビルド自体は継続
- **大量ページによるパフォーマンス低下** — `limit` prop で表示件数を制限、必要に応じてページネーション追加（Future）

## References
- [Scrapbox REST API 一覧 - Cosense研究会](https://scrapbox.io/scrapboxlab/Scrapbox_REST_APIの一覧)
- [Astro React Integration](https://docs.astro.build/en/guides/integrations-guide/react/)
- [shadcn/ui Card Component](https://ui.shadcn.com/docs/components/card)
