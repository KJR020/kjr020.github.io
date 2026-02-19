# KJR020's Blog

## Project Overview（WHAT）

Astroで構築した個人ブログ。技術記事の発信とポートフォリオを兼ねる。

### 技術スタック
- **フレームワーク**: Astro + React
- **スタイリング**: Tailwind CSS
- **コード品質**: Biome（Linter/Formatter）
- **テスト**: Vitest + Playwright

詳細は [README.md](README.md) を参照。

## Design Philosophy（WHY）

### コード品質
- コード変更後は必ず `pnpm lint && pnpm test:run && pnpm build` で検証
- 型安全性を重視し、`any` の使用を避ける
- テストは実装と同時に書く

### シンプルさ
- 過度な抽象化を避け、必要最小限の実装を心がける
- 将来の拡張より現在の要件を優先
- ドキュメントは必要な箇所のみに記述

## Directory Structure

```
src/
├── components/    # UIコンポーネント（Astro/React）
├── content/       # ブログ記事（Markdown）
│   └── posts/     # 記事本体
├── layouts/       # ページレイアウト
├── lib/           # ユーティリティ関数
├── pages/         # ルーティング（ファイルベース）
└── styles/        # グローバルスタイル
```

## Commands

```shell
pnpm dev          # 開発サーバー起動
pnpm build        # ビルド
pnpm lint         # Lint実行
pnpm lint:fix     # Lint自動修正
pnpm format       # フォーマット
pnpm test:run     # テスト実行
pnpm typecheck    # 型チェック
```

## Spec-Driven Development

機能開発にはKiro-style Spec Driven Developmentを採用。

### クイックリファレンス
- **Steering**: `.kiro/steering/` - プロジェクト全体のルールとコンテキスト
- **Specs**: `.kiro/specs/` - 個別機能の仕様と進捗
- **Architecture**: `docs/architecture/` - 技術設計ドキュメント

### 基本ワークフロー
1. `/kiro:spec-init "description"` - 仕様の初期化
2. `/kiro:spec-requirements {feature}` - 要件定義
3. `/kiro:spec-design {feature}` - 設計
4. `/kiro:spec-tasks {feature}` - タスク分割
5. `/kiro:spec-impl {feature}` - 実装
   - `/kiro:spec-impl-tdd {feature}` - twadaスタイルTDDで実装（オプション）
6. `/kiro:spec-status {feature}` - 進捗確認

### 開発ルール
- 3フェーズ承認: Requirements → Design → Tasks → Implementation
- 各フェーズでレビュー必須（`-y` は意図的なスキップ時のみ）
- 日本語でレスポンス生成

## Architecture Documents
プロジェクト全体の技術方針を定義するドキュメント。常に最新の状態に保つ。

- [Test Architecture](docs/architecture/test_architecture.md) - テスト戦略と方針
