# KJR020's Blog

Astroで構築した個人ブログ

## 技術スタック

- [Astro](https://astro.build/) - 静的サイトジェネレーター
- [React](https://react.dev/) - UIコンポーネント
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [Biome](https://biomejs.dev/) - Linter / Formatter
- [Vitest](https://vitest.dev/) - テストフレームワーク
- [Playwright](https://playwright.dev/) - E2Eテスト

## アーキテクチャ

詳細な設計方針は [docs/architecture/](docs/architecture/) に記載。

## セットアップ

### 必要な環境

- Node.js 22.x 以上
- pnpm

### インストール

```shell
pnpm install
```

## 使い方

### 開発サーバーの起動

```shell
pnpm dev
```

### ビルド

```shell
pnpm build
```

### プレビュー

```shell
pnpm preview
```

### Lint / Format

```shell
# Lintの実行
pnpm lint

# Lintの自動修正
pnpm lint:fix

# フォーマットの実行
pnpm format

# フォーマットのチェック
pnpm format:check
```

### テスト

```shell
# テストの実行（watchモード）
pnpm test

# テストの実行（1回のみ）
pnpm test:run
```

### 型チェック

```shell
pnpm typecheck
```

## デプロイ

GitHub Pagesにデプロイ

https://kjr020.github.io/
