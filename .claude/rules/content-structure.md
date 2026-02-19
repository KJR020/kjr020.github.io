# コンテンツ・ファイル構成ルール

このルールは、コンテンツ管理、ファイル命名、プロジェクト構成に関するガイドラインを定義する。

## 適用条件

- `src/content/` 配下のMarkdownファイルの作成・編集時
- `src/content.config.ts` の変更時
- 新しいディレクトリやファイルを作成する時

---

## 1. コンテンツコレクション

### Content Layer API（Astro v5）

```typescript
// src/content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional().default([]),
    description: z.string().optional(),
  }),
});
```

### 新しいコレクションの追加

```typescript
// Good: 既存パターンに合わせた定義
const newsletters = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/newsletters" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional().default([]),
  }),
});

export const collections = { posts, newsletters };
```

**注意:** スキーマ変更後は `npx astro sync` を実行して型を再生成する。

---

## 2. 記事のFrontmatter

### 必須フィールド

```yaml
---
title: "記事タイトル"
date: "2026-02-19T10:00:00+09:00"
draft: false
---
```

### オプションフィールド

```yaml
---
title: "記事タイトル"
date: "2026-02-19T10:00:00+09:00"
draft: false
tags: [astro, react, typescript]
description: "記事の概要説明"
---
```

### 日付形式

- **ISO 8601 + JST**: `YYYY-MM-DDTHH:MM:SS+09:00`
- スキーマで `z.coerce.date()` により自動変換される

---

## 3. ファイル命名規則

### ディレクトリ構成

```
src/
├── components/        # PascalCase: PostCard.astro, MobileMenu.tsx
│   ├── ui/            # 小文字: UIプリミティブ
│   ├── toc/           # 小文字: 機能ドメイン
│   ├── scrapbox/      # 小文字: 機能ドメイン（barrel exportあり）
│   └── icons/         # 小文字: SVGアイコン
├── content/
│   └── posts/         # カテゴリディレクトリ（下記参照）
├── layouts/           # PascalCase: BaseLayout.astro
├── lib/               # 小文字: utils.ts, queryClient.ts
├── pages/             # 小文字: ルーティング対応
│   ├── posts/
│   │   └── [...slug].astro
│   └── tags/
│       └── [tag].astro
├── styles/            # 小文字: globals.css
└── test/              # 小文字: setup.ts
```

### コンポーネントファイル

| 種別 | 命名規則 | 例 |
|------|----------|-----|
| Astroコンポーネント | PascalCase.astro | `PostCard.astro`, `Header.astro` |
| Reactコンポーネント | PascalCase.tsx | `MobileMenu.tsx`, `ThemeToggle.tsx` |
| ユーティリティ | camelCase.ts | `utils.ts`, `queryClient.ts` |
| テストファイル | PascalCase.test.tsx | `MobileMenu.test.tsx` |
| 型定義ファイル | camelCase.ts | `types.ts` |

### コンテンツディレクトリ

記事のカテゴリディレクトリは現状混在している（PascalCase / lowercase）。新規作成時は**小文字**を推奨:

```
src/content/posts/
├── astro/           # Good: 小文字
├── terraform/       # Good: 小文字
├── react/           # Good: 小文字（新規作成時）
└── cloudflare/      # Good: 小文字
```

---

## 4. Barrel Export

機能ドメインのディレクトリでは `index.ts` でバレルエクスポートを使用:

```typescript
// src/components/scrapbox/index.ts
export { ScrapboxCard } from "./ScrapboxCard";
export { ScrapboxCardList } from "./ScrapboxCardList";
export type { ScrapboxPage } from "./types";

// 使用側
import { ScrapboxCardList } from "@/components/scrapbox";
```

---

## 5. Markdownコンテンツ

### 利用可能な拡張機能

プロジェクトのMarkdownパイプライン（`astro.config.mjs` で設定済み）:

| 機能 | プラグイン | 記法 |
|------|----------|------|
| コールアウト | remark-callout | `> [!note]`, `> [!warning]` |
| リンクカード | remark-link-card | URL単体行で自動生成 |
| Mermaid図 | @beoe/rehype-mermaid | ` ```mermaid ` |
| シンタックスハイライト | Shiki (GitHub theme) | ` ```言語名 ` |

### シンタックスハイライト

デュアルテーマ対応（light: github-light, dark: github-dark）。Shikiが自動的にテーマを切り替える。

---

## 6. パッケージ管理

- **パッケージマネージャ**: pnpm（npm/yarnは使わない）
- **ロックファイル**: `pnpm-lock.yaml`（CIでは `--frozen-lockfile` で固定）
- **Node.js**: v22（`.github/workflows/ci.yml` で指定）

---

## 禁止事項

- npm/yarnコマンドの使用（理由: pnpmで統一。ロックファイルの不整合を防ぐ）
- frontmatterの `date` フィールドにタイムゾーンなしの日付を使用（理由: JSTを明示して日付ズレを防ぐ）
- `src/content/` 配下にMarkdown以外のファイルを配置（理由: glob loaderのパターンに合わない）
- 記事ファイル名に日本語を使用（理由: URL互換性の問題。既存の日本語ファイル名は残すが、新規作成時は英数字ハイフン区切りを使用）

---

## 参考

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/)
- プロジェクト: `src/content.config.ts`, `astro.config.mjs`
