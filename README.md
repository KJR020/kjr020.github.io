# KJR020's Blog

KJR020の技術ブログ。Astro + Cloudflare Pages で構築し、Scrapbox の知識体系を可視化する Knowledge Graph 機能を備える。

[![CI](https://github.com/KJR020/kjr020.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/KJR020/kjr020.github.io/actions/workflows/ci.yml)

**https://kjr020.dev/**

## 特徴

### Knowledge Graph

Scrapbox に蓄積した 1,788 ページのハッシュタグ共起関係を [Cytoscape.js](https://js.cytoscape.org/) で可視化。ノードサイズがページ数を反映し、知識の濃淡が一目で分かる。

- タグ共起グラフ + タグ別ページ一覧の 2 ビュー
- Cloudflare Pages Functions 経由で Scrapbox API を安全に中継（descriptions 原文非公開、CORS 制限、Cache-Control）
- ハッシュタグは `[...]` 内の URL fragment を除外し `_` をスペースに正規化して抽出

### 全文検索

[Pagefind](https://pagefind.app/) によるクライアントサイド全文検索。`Cmd+K` でコマンドパレットから即座にアクセス可能。

### ブログ機能

- Markdown + Astro Content Collections による記事管理
- タグ分類 / シンタックスハイライト (Shiki) / Mermaid 図 / コールアウト / リンクカード
- [Giscus](https://giscus.app/) によるコメント (GitHub Discussions 連携)
- レスポンシブデザイン + ダークモード
- sitemap 自動生成

## アーキテクチャ

```mermaid
graph TB
    subgraph Browser
        ASTRO["Astro 静的ページ"]
        SEARCH["Pagefind 全文検索"]
        KG["Knowledge Graph<br/>(Cytoscape.js)"]
    end

    subgraph CF["Cloudflare Pages"]
        STATIC["静的ホスティング"]
        FN_PAGES["Pages Function<br/>GET /api/pages/:project"]
        FN_KNOWLEDGE["Pages Function<br/>GET /api/knowledge/:project"]
    end

    subgraph External
        SB["Scrapbox API"]
    end

    ASTRO --> STATIC
    KG --> FN_KNOWLEDGE
    FN_PAGES --> SB
    FN_KNOWLEDGE --> SB
```

## 技術スタック

| カテゴリ          | 技術                                                                  |
|---------------|-----------------------------------------------------------------------|
| フレームワーク       | [Astro](https://astro.build/) 5.x + [React](https://react.dev/) 19    |
| スタイリング        | [Tailwind CSS](https://tailwindcss.com/) 4                            |
| 可視化        | [Cytoscape.js](https://js.cytoscape.org/) (Knowledge Graph)           |
| 検索          | [Pagefind](https://pagefind.app/) (クライアントサイド全文検索)                 |
| インフラ          | [Cloudflare Pages](https://pages.cloudflare.com/) + Pages Functions   |
| Lint / Format | [Biome](https://biomejs.dev/)                                         |
| テスト           | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) |
| CI/CD         | GitHub Actions → Cloudflare Pages                                     |

## プロジェクト構成

```text
src/
├── components/          # UI コンポーネント (Astro / React)
│   └── knowledge/       #   Knowledge Graph 関連
├── content/posts/       # ブログ記事 (Markdown)
├── hooks/               # React Hooks
├── layouts/             # ページレイアウト
├── lib/                 # ユーティリティ
├── pages/               # ルーティング (ファイルベース)
├── styles/              # グローバルスタイル
└── types/               # 型定義

functions/
├── _lib/                # Proxy 共通ロジック (hashtag parser, http helper)
└── api/
    ├── pages/           # Scrapbox ページ一覧 Proxy
    └── knowledge/       # Knowledge Graph 用全ページ取得 Proxy

docs/
├── architecture/        # 設計ドキュメント
└── security/            # セキュリティ検証チェックリスト
```

<details>
<summary><strong>開発ガイド</strong></summary>

### 必要な環境

- Node.js 22.x
- pnpm 10.x

### セットアップ

```shell
pnpm install
```

### コマンド

| コマンド                 | 説明               |
|----------------------|--------------------|
| `pnpm dev`           | Astro 開発サーバー起動 |
| `pnpm build`         | 本番ビルド            |
| `pnpm preview`       | ビルド結果のプレビュー      |
| `pnpm lint`          | Biome Lint         |
| `pnpm lint:fix`      | Lint 自動修正      |
| `pnpm format`        | フォーマット             |
| `pnpm typecheck`     | TypeScript 型チェック  |
| `pnpm test:run`      | Vitest 実行        |
| `pnpm test:coverage` | カバレッジ計測          |
| `pnpm test:e2e`      | Playwright E2E テスト |

### Cloudflare Pages Functions のローカル実行

Scrapbox API Proxy (`/api/*`) を動かすには `wrangler` が必要:

```shell
# Astro dev + Functions を同時に起動
pnpm dev                             # port 4321
pnpm exec wrangler pages dev --proxy 4321 --port 8788
# → http://localhost:8788 でアクセス
```

`.dev.vars` に `SCRAPBOX_SID` を設定:

```shell
SCRAPBOX_SID=your-connect-sid-value
```

</details>

## デプロイ

Cloudflare Pages に自動デプロイ。`main` ブランチへの push で GitHub Actions → Cloudflare Pages にビルド・デプロイされる。

## ライセンス

記事コンテンツ (`src/content/`) の著作権は著者に帰属します。ソースコードは自由に参照してください。
