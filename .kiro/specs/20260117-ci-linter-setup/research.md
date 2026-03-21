# Research & Design Decisions

---
**Purpose**: CI/CD パイプライン構築における技術選定の調査結果と設計判断を記録する。

**Usage**:
- リンター/フォーマッター、テストフレームワーク、CI構成の技術選定根拠を文書化
- 代替案との比較検討結果を記録
---

## Summary
- **Feature**: `ci-linter-setup`
- **Discovery Scope**: Extension（既存のデプロイワークフローを拡張）
- **Key Findings**:
  - Biome v2.3.0+ は Astro ファイルの実験的サポートを提供（HTML/CSS/JS部分のみ）
  - Vitest は Astro の公式推奨テストフレームワークであり、`getViteConfig()` によるシームレスな統合が可能
  - pnpm キャッシュは `actions/setup-node@v4` の組み込み機能で対応可能

## Research Log

### Biome の Astro 対応状況
- **Context**: 要件で Biome を linter/formatter として採用することが検討されている
- **Sources Consulted**:
  - [Language support | Biome](https://biomejs.dev/internals/language-support/)
  - [Biome v2 release notes](https://biomejs.dev/blog/biome-v2/)
  - [Setting up Biome | Astro Tips](https://astro-tips.dev/tips/biome/)
- **Findings**:
  - Biome v2.3.0 以降、Astro/Vue/Svelte ファイルの out-of-box サポートを提供
  - サポートは **実験的** であり、HTML/CSS/JavaScript 部分のみ対象
  - Astro 固有の構文（frontmatter後の空行処理など）は改善されている
  - 推奨設定: `useConst`, `useImportType`, `noUnusedVariables`, `noUnusedImports` を `.astro` ファイルで無効化
- **Implications**:
  - `.astro` ファイルも Biome の対象に含めることが可能（ただし実験的）
  - 一部ルールを overrides で無効化する設定が必要

### Biome vs ESLint + Prettier 比較
- **Context**: 従来の ESLint + Prettier 構成との比較検討
- **Sources Consulted**:
  - [Biome vs ESLint: The Ultimate 2025 Showdown](https://medium.com/@harryespant/biome-vs-eslint-the-ultimate-2025-showdown-for-javascript-developers-speed-features-and-3e5130be4a3c)
  - [Better Stack: Biome vs ESLint](https://betterstack.com/community/guides/scaling-nodejs/biome-eslint/)
  - [Why I Chose Biome Over ESLint+Prettier](https://dev.to/saswatapal/why-i-chose-biome-over-eslintprettier-20x-faster-linting-one-tool-to-rule-them-all-10kf)
- **Findings**:
  - Biome は ESLint + Prettier の **10〜25倍高速**
  - 単一の設定ファイル（`biome.json`）で lint + format を管理可能
  - 200+ のルールを搭載、Prettier との 97% 互換性
  - 制限: 一部の ESLint プラグイン（セキュリティ系など）は未サポート
- **Implications**:
  - 個人ブログプロジェクトでは Biome の制限は問題にならない
  - CI 実行時間短縮に貢献

### テストフレームワーク選定（Vitest vs Jest）
- **Context**: ユニットテストフレームワークの選定
- **Sources Consulted**:
  - [Testing - Astro Docs](https://docs.astro.build/en/guides/testing/)
  - [Vitest vs Jest: Which Test Runner Should You Use in 2025?](https://medium.com/@ruverd/jest-vs-vitest-which-test-runner-should-you-use-in-2025-5c85e4f2bda9)
  - [Vitest vs Jest 30: Why 2026 is the Year of Browser-Native Testing](https://dev.to/dataformathub/vitest-vs-jest-30-why-2026-is-the-year-of-browser-native-testing-2fgb)
- **Findings**:
  - Astro 公式ドキュメントは **Vitest を推奨**
  - `getViteConfig()` ヘルパーによるゼロコンフィグ統合
  - Vitest は Jest より **4倍以上高速**（ESM ネイティブ対応）
  - Jest は React Native 必須、大規模レガシープロジェクト向け
- **Implications**:
  - Vite ベースの Astro プロジェクトには Vitest が最適
  - AstroContainer API による Astro コンポーネントテストも可能

### GitHub Actions CI 構成パターン
- **Context**: pnpm を使用した CI ワークフローの最適化
- **Sources Consulted**:
  - [Continuous Integration | pnpm](https://pnpm.io/continuous-integration)
  - [PNPM GitHub Actions Cache](https://theodorusclarence.com/shorts/github/pnpm-github-actions-cache)
  - [actions/setup-node advanced usage](https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md)
- **Findings**:
  - `pnpm/action-setup@v4` + `actions/setup-node@v4` の組み合わせが推奨
  - `setup-node` の `cache: "pnpm"` オプションでキャッシュ自動設定
  - `pnpm-lock.yaml` のコミットと `--frozen-lockfile` の使用が必須
  - node_modules のキャッシュはシンボリックリンク破損の可能性あり（非推奨）
- **Implications**:
  - 既存の `deploy.yml` と同様のセットアップパターンを踏襲可能
  - store キャッシュのみで十分な高速化が見込める

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 単一 CI ワークフロー | lint/typecheck/test/build を1つのワークフローに集約 | シンプル、依存関係管理が容易 | 全ステップ実行で時間増加 | 採用：小規模プロジェクトに適合 |
| 並列ジョブ構成 | lint/typecheck/test を並列実行、build は後続 | 実行時間短縮 | ジョブ間キャッシュ共有の複雑さ | 将来的なスケールで検討 |
| 既存ワークフロー統合 | deploy.yml に CI ステップを追加 | ファイル数削減 | 責務混在、デプロイ遅延 | 不採用：責務分離を優先 |

## Design Decisions

### Decision: Biome を linter/formatter として採用
- **Context**: コードスタイル統一のためのツール選定
- **Alternatives Considered**:
  1. ESLint + Prettier — 成熟したエコシステム、プラグイン豊富
  2. Biome — 高速、単一設定ファイル、Astro 実験的サポート
  3. Oxlint — 最速だがフォーマッター機能なし
- **Selected Approach**: Biome v2.x を採用
- **Rationale**:
  - ESLint + Prettier の 10〜25 倍高速で CI 時間短縮
  - 単一設定ファイルによるシンプルな管理
  - Astro 実験的サポートにより `.astro` ファイルも対象可能
  - 個人プロジェクトでは ESLint プラグインの制限は問題にならない
- **Trade-offs**:
  - 実験的サポートのため、Astro 固有構文で予期しない挙動の可能性
  - 一部ルールを overrides で無効化する必要あり
- **Follow-up**: Astro ファイルへの適用時に問題があれば対象から除外

### Decision: Vitest をテストフレームワークとして採用
- **Context**: ユニットテストフレームワークの選定
- **Alternatives Considered**:
  1. Jest — 成熟、大規模プロジェクト実績、RN 対応
  2. Vitest — Vite ネイティブ、高速、Astro 公式推奨
  3. Bun Test — 最速だがエコシステム未成熟
- **Selected Approach**: Vitest を採用
- **Rationale**:
  - Astro 公式ドキュメントで推奨されている
  - `getViteConfig()` によるゼロコンフィグ統合
  - Vite ベースの Astro と親和性が高い
  - Jest 互換 API により学習コスト低
- **Trade-offs**:
  - Jest の豊富なプラグインエコシステムは利用不可
  - Astro コンポーネントテストは AstroContainer API 経由（追加設定必要）
- **Follow-up**: 初期は utility 関数のテストに限定、コンポーネントテストは段階的に導入

### Decision: 独立した CI ワークフロー（ci.yml）を新規作成
- **Context**: 既存の deploy.yml との関係整理
- **Alternatives Considered**:
  1. deploy.yml に CI ステップを追加 — ファイル統合
  2. 新規 ci.yml を作成 — 責務分離
- **Selected Approach**: 新規 ci.yml を作成
- **Rationale**:
  - deploy.yml はデプロイ専用、ci.yml は品質検査専用で責務明確
  - PR 時は ci.yml のみ、main push 時は両方実行という使い分け
  - 既存の deploy.yml への影響を最小化
- **Trade-offs**:
  - 2つのワークフローファイルを管理する必要
  - セットアップステップの重複
- **Follow-up**: 将来的に reusable workflow で共通化を検討

## Risks & Mitigations
- **Biome の Astro サポートが不安定** — overrides で問題ルールを無効化、最悪の場合 `.astro` を対象外に
- **テストが存在しない状態での CI 失敗** — テストステップを条件付き実行に
- **pnpm キャッシュの不整合** — `--frozen-lockfile` の使用を必須化

## References
- [Biome Language Support](https://biomejs.dev/internals/language-support/) — Astro サポート状況
- [Astro Testing Docs](https://docs.astro.build/en/guides/testing/) — 公式テストガイド
- [pnpm CI Guide](https://pnpm.io/continuous-integration) — GitHub Actions 設定例
- [Vitest Configuration](https://vitest.dev/config/) — Vitest 設定リファレンス
