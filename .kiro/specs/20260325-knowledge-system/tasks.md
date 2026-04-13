# Implementation Plan

## Overview

| # | Task | Requirements | Phase | Status |
|---|------|-------------|-------|----------|
| 1 | KnowledgePageData型定義 | 1 | 1 | 完了 |
| 2 | ハッシュタグパーサー実装 | 1 | 1 | 完了 |
| 3 | Knowledge Proxy実装 | 1, 4 | 1 | 完了 |
| 4 | useKnowledgeDataフック | 2, 3 | 1 | 完了 |
| 5 | DomainListコンポーネント | 2 | 1 | 完了 |
| 6 | knowledge.astroページ | 3 | 1 | 完了 |
| 7 | Phase 1テスト | 1, 2, 4 | 1 | 部分 (パーサーのみ) |
| 12 | タグ共起グラフ実装 | 8 | 1 | 完了 |
| 13 | ドメインタグ定義 (`domains.json` / `domains.ts`) | 2, 8 | 1 | 完了 |
| ~~8~~ | ~~ページ詳細APIエンドポイント~~ | ~~5~~ | ~~2~~ | **撤回** |
| ~~9~~ | ~~知識グラフ構築エンジン~~ | ~~6~~ | ~~2~~ | **撤回** |
| ~~10~~ | ~~知識グラフ可視化コンポーネント~~ | ~~7~~ | ~~2~~ | **撤回** |
| ~~11~~ | ~~Phase 2テスト~~ | ~~5, 6, 7~~ | ~~2~~ | **撤回** |

---

## Phase 1: 全ページ取得 + タグ抽出 + ドメイン別一覧

### データモデル

- [ ] 1. KnowledgePageData型定義
  - `src/types/knowledge.ts` を作成
  - `KnowledgePageData`: `id`, `title`, `hashtags: string[]`, `updatedAt`, `linked`
  - `KnowledgeProxyResponse`: `pages`, `count`, `projectName`
  - Phase 3拡張用に `embedding2d?: { x: number; y: number }` をコメントで予約
  - _Requirements: 1_

### サーバーサイド

- [ ] 2. ハッシュタグパーサー実装 (P)
  - `functions/_lib/hashtag-parser.ts` を作成
  - `extractHashtags(descriptions: string[]): string[]` 関数
  - 正規表現: `/#([\w\u3000-\u9FFF]+)/g`
  - descriptions原文は返さず、抽出結果のみ [K-3]
  - _Requirements: 1_

- [ ] 3. Knowledge Proxy実装
  - `functions/api/knowledge/[project].ts` を作成
  - `functions/_lib/knowledge-proxy.ts` を作成
  - Proxy内部でScrapbox APIを `limit=100, skip=0,100,...` で全ページ取得
  - 並列度3に制限 [K-8]
  - 各ページのdescriptionsからハッシュタグ抽出（Task 2の関数を使用）
  - descriptions原文はレスポンスに含めない [K-3]
  - `validateProject()` によるプロジェクト名バリデーション [K-2]
  - `Cache-Control: public, max-age=300` [K-10]
  - `Access-Control-Allow-Origin` を本番ドメインに制限 [K-9]
  - _Requirements: 1, 4_
  - _Security: K-1, K-2, K-3, K-8, K-9, K-10_

### フロントエンド

- [ ] 4. useKnowledgeDataフック
  - `src/hooks/useKnowledgeData.ts` を作成
  - TanStack Queryで `/api/knowledge/{project}` を単一リクエストで取得
  - `staleTime: 5 * 60 * 1000`
  - レスポンスからタグ別グルーピング（`domainMap`）を生成
  - タグ一覧をページ数降順でソート
  - _Requirements: 2, 3_

- [ ] 5. DomainListコンポーネント (P)
  - `src/components/knowledge/DomainList.tsx` を作成
  - タグごとのカード: タグ名 + ページ数
  - タグクリックでページリスト展開（アコーディオン）
  - 各ページ: タイトル、更新日、被リンク数
  - 「未分類」カテゴリ（hashtags空のページ）
  - レスポンシブ対応、ダークモード対応
  - _Requirements: 2_

- [ ] 6. knowledge.astroページ
  - `src/pages/knowledge.astro` を作成
  - BaseLayoutを使用、`/knowledge` パスのページ
  - KnowledgeMapコンテナ（ビュー切り替え）を `client:load` で配置
  - 統計情報: 総ページ数、タグ数、最終更新日
  - Headerに `/knowledge` リンクを追加
  - ビュー切り替えUI: 一覧(Ph1) / グラフ(Ph2) / マップ(Ph3)のタブ構造を準備（Ph1では一覧のみアクティブ）
  - _Requirements: 3_

### テスト

- [ ] 7. Phase 1テスト (P)
  - [ ] 7.1 ハッシュタグパーサーテスト (P)
    - `functions/_lib/hashtag-parser.test.ts`
    - 正常系: 単一/複数タグ抽出、日本語タグ、英語タグ
    - エッジケース: タグなし、空配列
    - _Requirements: 1_
  - [ ] 7.2 Knowledge Proxyテスト (P)
    - `functions/_lib/knowledge-proxy.test.ts`
    - レスポンスにdescriptions原文が含まれないことを検証
    - ハッシュタグ抽出の正確性
    - _Requirements: 4_
  - [ ] 7.3 DomainListコンポーネントテスト (P)
    - `src/components/knowledge/DomainList.test.tsx`
    - タグ別表示、ページリスト展開、未分類カテゴリ
    - _Requirements: 2_

---

## Phase 1 追加: タグ共起グラフ (当初 Phase 2 を置換)

- [x] 12. タグ共起グラフ実装
  - `src/components/knowledge/KnowledgeGraph.tsx` (Cytoscape.js) を作成
  - タグノード: ページ数をサイズに反映（知識量の濃淡）
  - エッジ: 同じページに共起するタグペアをカウントして張る
  - ドメインタグは白枠で強調
  - ノードクリックで `PageList` パネルにそのタグのページ一覧を表示
  - ページ詳細APIは呼ばない（既存Knowledge Proxyのみで完結）
  - _Requirements: 8_

- [x] 13. ドメインタグ定義
  - `frameworks/domains.json` に14ドメインを定義
  - `src/lib/domains.ts` で色とタグ判定ヘルパーを提供
  - _Requirements: 2, 8_

## ~~Phase 2: ページ詳細API + ページリンクグラフ~~ (撤回)

> **撤回日**: 2026-04-13
> **撤回理由**: ページ詳細の大量fetchがCloudflare Functionsタイムアウトに抵触しうる。1,788ノードの描画は視認性が低く、俯瞰目的（「この分野が厚い/薄い」の判断）に合わない。タグ共起グラフ (Task 12) で代替。

~~8. ページ詳細APIエンドポイント~~
~~9. 知識グラフ構築エンジン~~
~~10. 知識グラフ可視化コンポーネント~~
~~11. Phase 2テスト~~

---

## 依存関係

```
Task 1 → Task 2, 3
Task 2 → Task 3
Task 3 → Task 4 → Task 5, 6
Task 8 → Task 9 → Task 10
```

## 新規ファイル一覧

| ファイルパス | Phase | 種別 |
|-------------|-------|------|
| `src/types/knowledge.ts` | 1 | 型定義 |
| `functions/_lib/hashtag-parser.ts` | 1 | ロジック |
| `functions/_lib/knowledge-proxy.ts` | 1 | ロジック |
| `functions/api/knowledge/[project].ts` | 1 | APIエンドポイント |
| `src/hooks/useKnowledgeData.ts` | 1 | フック |
| `src/pages/knowledge.astro` | 1 | ページ |
| `src/components/knowledge/KnowledgeMap.tsx` | 1 | コンテナ |
| `src/components/knowledge/DomainList.tsx` | 1 | コンポーネント |
| `src/components/knowledge/KnowledgeGraph.tsx` | 1 | タグ共起グラフ |
| `src/components/knowledge/PageList.tsx` | 1 | 詳細パネル |
| `src/lib/domains.ts` | 1 | ドメイン定義 |
| `frameworks/domains.json` | 1 | ドメインタグ定義データ |
