# Implementation Plan

## Overview

| # | Task | Requirements | Phase | Status |
|---|------|-------------|-------|--------|
| 1 | KnowledgePageData / TagSummary 型定義 | 1 | 1 | 完了 |
| 2 | ハッシュタグパーサー実装 | 1 | 1 | 完了 |
| 3 | Knowledge Proxy 実装 | 1, 4 | 1 | 完了 |
| 4 | useKnowledgeData フック | 2, 3 | 1 | 完了 |
| 5 | TagList コンポーネント | 2 | 1 | 完了 |
| 6 | knowledge.astro ページ + KnowledgeGraph コンテナ + Header 導線 | 3 | 1 | 完了 |
| 7 | TagGraph (タグ共起グラフ) 実装 | 8 | 1 | 完了 |
| 8 | format.ts (scrapboxUrl / formatRelativeDate) 切り出し + テスト | - | 1 | 完了 |
| 9 | Phase 1 テスト | 1, 2, 4, 8 | 1 | パーサー/format のみ |
| ~~10~~ | ~~ドメインタグ定義 (`domains.json` / `domains.ts`)~~ | ~~2, 8~~ | ~~1~~ | **撤回** |
| ~~11~~ | ~~ページ詳細API エンドポイント~~ | ~~5~~ | ~~2~~ | **撤回** |
| ~~12~~ | ~~知識グラフ構築エンジン~~ | ~~6~~ | ~~2~~ | **撤回** |
| ~~13~~ | ~~知識グラフ可視化 (ページリンク)~~ | ~~7~~ | ~~2~~ | **撤回** |

---

## Phase 1: 全ページ取得 + タグ抽出 + タグ別一覧 + タグ共起グラフ

### データモデル

- [x] 1. 型定義
  - `src/types/knowledge.ts` を作成
  - `KnowledgePageData`: `id`, `title`, `hashtags: string[]`, `updatedAt`, `linked`, `linesCount`, `views`
  - `KnowledgeProxyResponse`: `pages`, `count`, `projectName`
  - `TagSummary`: `name`, `count`, `totalLinked`, `totalLines`
  - Phase 3 拡張用に `embedding2d?: { x: number; y: number }` をコメントで予約
  - _Requirements: 1_

### サーバーサイド

- [x] 2. ハッシュタグパーサー実装
  - `functions/_lib/hashtag-parser.ts` + `hashtag-parser.test.ts`
  - `extractHashtags(descriptions: string[]): string[]`
  - `[...]` 内（URL fragment / ページリンク）は除外
  - `#` の直前は空白または行頭を要求（`word#notTag` / `example.com#foo` を除外）
  - `_` をスペースに正規化（`#Claude_Code` → "Claude Code"）
  - descriptions原文は返さない [K-3]
  - _Requirements: 1_

- [x] 3. Knowledge Proxy 実装
  - `functions/api/knowledge/[project].ts` + `functions/_lib/knowledge-proxy.ts`
  - Scrapbox API を `limit=100, skip=0,100,...` で全件取得、並列度3制限 [K-8]
  - descriptions 原文はレスポンスに含めない [K-3]
  - `validateProject()` でプロジェクト名バリデーション [K-2]
  - `Cache-Control`: 成功時 `public, max-age=300` [K-10]、エラー時 `no-store`
  - `Access-Control-Allow-Origin` を本番ドメインに制限 [K-9]
  - _Requirements: 1, 4_
  - _Security: K-1, K-2, K-3, K-8, K-9, K-10_

### フロントエンド

- [x] 4. useKnowledgeData フック
  - `src/hooks/useKnowledgeData.ts`
  - TanStack Query で `/api/knowledge/{project}` を取得、`staleTime: 5 * 60 * 1000`
  - レスポンスからタグ別サマリー (`TagSummary[]`) を生成、ページ数降順でソート（同数は `totalLinked` tiebreak）
  - _Requirements: 2, 3_

- [x] 5. TagList コンポーネント
  - `src/components/knowledge/TagList.tsx`
  - タグごとのアコーディオン: タグ名 + ページ数 + 被リンク合計
  - 親で `pages` → `Map<tagName, pagesSortedByUpdatedAt>` を `useMemo` で一度に構築
  - 「未分類」は内部キー `__untagged__` で実在 `#未分類` タグと分離
  - _Requirements: 2_

- [x] 6. knowledge.astro + KnowledgeGraph コンテナ + Header 導線
  - `src/pages/knowledge.astro` を作成（タイトル: "Knowledge Graph"）
  - `src/components/knowledge/KnowledgeGraph.tsx` をコンテナとして配置（`client:load`）
  - 統計情報: 総ページ数、タグ数、接続数
  - タブ: 「タグ共起」「一覧」
  - Header に `/knowledge` リンクを追加
  - _Requirements: 3_

- [x] 7. TagGraph (タグ共起グラフ) 実装
  - `src/components/knowledge/TagGraph.tsx` (Cytoscape.js)
  - タグをノード、同じページに共起するタグペアをエッジに
  - ノードサイズ = ページ数（知識量の濃淡）
  - ノード色 = `tagColor(name)`: タグ名ハッシュから決定論的に HSL 生成
  - ページ数2未満のタグは描画対象外（ノイズ除外）
  - ノードクリックで `PageList` パネルを表示
  - `aria-hidden="true"`（インタラクティブ領域だが同等情報は一覧タブで提供）
  - _Requirements: 8_

### ユーティリティ

- [x] 8. format.ts 切り出し
  - `src/components/knowledge/format.ts`
  - `scrapboxUrl(project, title)`: URL組み立て（encodeURIComponent）
  - `formatRelativeDate(isoString)`: 相対日付（`Math.max(0, ...)` で未来日付クランプ）
  - `TagList.tsx` / `PageList.tsx` の重複を解消
  - `format.test.ts` で7件テスト

### テスト

- [x] 9. Phase 1 テスト (部分完了)
  - [x] 9.1 ハッシュタグパーサー: `functions/_lib/hashtag-parser.test.ts` (12件)
  - [x] 9.2 format: `src/components/knowledge/format.test.ts` (10件)
  - [ ] 9.3 Knowledge Proxy: 未着手
  - [ ] 9.4 TagList コンポーネント: 未着手

---

## ~~Phase 2: ページ詳細API + ページリンクグラフ~~ (撤回)

> **撤回日**: 2026-04-13
> **撤回理由**: ページ詳細の大量fetch が Cloudflare Functions のタイムアウトに抵触しうる。1,788 ノード描画は視認性が低く、俯瞰目的（「この分野が厚い/薄い」の判断）に合わない。タグ共起グラフ (Task 7) で代替。

## ~~ドメインタグ定義~~ (撤回)

> **撤回日**: 2026-04-14
> **撤回理由**: 14個の固定ドメイン (`frameworks/domains.json` / `src/lib/domains.ts`) は、メンテコストが YAML 参照フレームワーク案を却下したときと同じ問題を再現していた。俯瞰目的にはページ数そのもので十分。タグ色は `tagColor(name)` ハッシュで決定論的に生成する方針に変更。

---

## 依存関係

```text
Task 1 → Task 2, 3
Task 2 → Task 3
Task 3 → Task 4 → Task 5, 6, 7
Task 8 (format) → Task 5, 6 (任意抽出)
```

## 新規ファイル一覧

| ファイルパス | Phase | 種別 |
|-------------|-------|------|
| `src/types/knowledge.ts` | 1 | 型定義 |
| `functions/_lib/hashtag-parser.ts` | 1 | ロジック |
| `functions/_lib/hashtag-parser.test.ts` | 1 | テスト |
| `functions/_lib/knowledge-proxy.ts` | 1 | ロジック |
| `functions/api/knowledge/[project].ts` | 1 | API エンドポイント |
| `src/hooks/useKnowledgeData.ts` | 1 | フック |
| `src/pages/knowledge.astro` | 1 | ページ |
| `src/components/knowledge/KnowledgeGraph.tsx` | 1 | コンテナ |
| `src/components/knowledge/TagGraph.tsx` | 1 | タグ共起グラフ |
| `src/components/knowledge/TagList.tsx` | 1 | タグ別一覧 |
| `src/components/knowledge/PageList.tsx` | 1 | 詳細パネル |
| `src/components/knowledge/format.ts` | 1 | ユーティリティ |
| `src/components/knowledge/format.test.ts` | 1 | テスト |
| `src/components/knowledge/index.ts` | 1 | re-export |
