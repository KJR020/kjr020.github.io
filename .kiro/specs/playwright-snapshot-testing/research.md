# Research & Design Decisions

## Summary
- **Feature**: `playwright-snapshot-testing`
- **Discovery Scope**: Extension（既存Playwright設定へのスナップショットテスト追加）
- **Key Findings**:
  - Playwright v1.57.0 は `toHaveScreenshot()` を内蔵しており、新規依存は不要
  - macOS（ローカル）と Linux（CI）ではフォントレンダリングが異なるため、ベースライン画像はCI環境（ubuntu-latest）で生成する方針が推奨される
  - `snapshotPathTemplate` でスナップショットの保存パスをカスタマイズ可能

## Research Log

### Playwright toHaveScreenshot API の仕様
- **Context**: スナップショットテストの基盤技術選定
- **Sources Consulted**:
  - [Visual comparisons | Playwright](https://playwright.dev/docs/test-snapshots)
  - [Playwright Visual Regression Testing Guide | Bug0](https://bug0.com/knowledge-base/playwright-visual-regression-testing)
  - [BrowserStack: Snapshot Testing with Playwright](https://www.browserstack.com/guide/playwright-snapshot-testing)
- **Findings**:
  - `toHaveScreenshot()` は Playwright v1.22+ で組み込み。外部ライブラリ不要
  - オプション: `maxDiffPixelRatio`, `maxDiffPixels`, `threshold`, `animations`, `mask`, `fullPage`, `stylePath`
  - `animations: 'disabled'` でCSSアニメーションを無効化し偽陽性を抑制
  - `fullPage: true` でページ全体のスクリーンショットを取得
  - `stylePath` でスクリーンショット取得前に任意CSSを注入可能（動的コンテンツ非表示等）
  - `--update-snapshots` フラグでベースライン一括更新
  - スナップショットのデフォルト保存先: `{testDir}/{testFileName}-snapshots/`
  - `snapshotPathTemplate` でパスをカスタマイズ可能
- **Implications**: 新規依存の追加は不要。`playwright.config.ts` の `expect.toHaveScreenshot` で全体設定を定義

### クロスプラットフォーム一貫性の課題
- **Context**: ローカル（macOS）とCI（Linux）でスナップショットが一致しない問題
- **Sources Consulted**:
  - [Continuous Integration | Playwright](https://playwright.dev/docs/ci)
  - [Visual Regression Testing with Playwright and GitHub Actions | Amazee Labs](https://www.amazeelabs.com/blog/visual-regression-testing-with-playwright-and-github-actions/)
  - [Streamlining Playwright Visual Regression Testing with GitHub Actions | Medium](https://medium.com/@haleywardo/streamlining-playwright-visual-regression-testing-with-github-actions-e077fd33c27c)
- **Findings**:
  - macOSとLinuxではフォントレンダリングが異なり、ピクセル単位で差分が出る
  - 解決策は3つ: (1) CI環境をベースラインの正とする (2) Dockerで統一 (3) OS別スナップショット
  - CI環境（ubuntu-latest）をベースラインの唯一の生成元とするアプローチが最もシンプル
  - ローカルでは `--update-snapshots` でLinux用ベースラインを更新不可 → CIで更新するワークフロー設計が必要
- **Implications**: ベースライン生成は CI 上で行い、ローカルではスナップショット比較を実行しない（または許容差を大きくする）設計が必要

### 既存プロジェクト構成の分析
- **Context**: 既存のPlaywright設定・CI構成との統合ポイント
- **Findings**:
  - `playwright.config.ts`: chromium + Mobile Chrome の2プロジェクト、`e2e/` ディレクトリ、`pnpm preview` でサーバー起動
  - `e2e/header.spec.ts`: 既存の振る舞いテスト（ハンバーガーメニュー動作等）
  - `.github/workflows/ci.yml`: 5ジョブ並列（lint, format, typecheck, test, build）。E2Eジョブは未設定
  - テーマ切り替え: `document.documentElement.classList.toggle("dark")` パターン（`ThemeToggle.tsx`, `ThemeInit.astro`）
  - 対象ページ: 静的4ページ + 動的4ページ（記事44件、タグ複数、ニュースレター複数）
- **Implications**: CIにE2Eジョブの追加が必要。テーマは `document.documentElement.classList` で制御

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 既存config拡張 | playwright.config.ts にスナップショット設定を追加 | シンプル、設定一元管理 | 振る舞いテストとスナップショットテストの実行分離が難しい | 採用 |
| 別config分離 | playwright.snapshot.config.ts を新規作成 | 完全分離、独立実行 | 設定の重複、webServer設定の二重管理 | 不採用（過度な分離） |

## Design Decisions

### Decision: ベースライン画像の生成環境
- **Context**: macOSとLinuxでフォントレンダリングが異なる
- **Alternatives Considered**:
  1. ローカル（macOS）でベースライン生成 → CI（Linux）で差分が出る
  2. CI（ubuntu-latest）でベースライン生成 → ローカルでは比較しない
  3. Docker（linux/amd64）でローカル・CI両方統一 → 環境構築の負荷
- **Selected Approach**: CI（ubuntu-latest）でベースライン生成
- **Rationale**: 最もシンプルで、CI環境はGitHub Actions提供のクリーンなVMで再現性が高い。Docker不要で開発者の負担が少ない
- **Trade-offs**: ローカルではスナップショット比較ができない（振る舞いテストのみ実行）
- **Follow-up**: ベースライン更新用のGitHub Actionsワークフロー設計

### Decision: テストファイルの配置方針
- **Context**: 既存の `e2e/header.spec.ts` との共存方法
- **Selected Approach**: `e2e/` ディレクトリ内に `snapshot.spec.ts` として配置
- **Rationale**: テストディレクトリは `e2e/` に統一されており、Playwrightの `testDir` 設定と一致する。ファイル名で振る舞い/スナップショットを区別

### Decision: テーマ切り替え方式
- **Context**: ライト/ダークモードのスナップショット取得方法
- **Selected Approach**: `page.emulateMedia({ colorScheme })` + `page.evaluate` で `document.documentElement.classList` を操作
- **Rationale**: プロジェクトのテーマ管理が `classList.toggle("dark")` で実装されているため、同じ仕組みを利用する

## Risks & Mitigations
- **偽陽性の多発** — `animations: 'disabled'`、`maxDiffPixelRatio` の閾値設定、動的コンテンツのマスクで抑制
- **スナップショット更新の手間** — npmスクリプト化で `pnpm test:e2e:update` 一発更新
- **CI実行時間の増加** — chromium のみでスナップショットを取得（Mobile Chrome は振る舞いテストのみ）
- **ベースライン画像のリポジトリサイズ増加** — フルページではなくビューポートサイズのスナップショットで抑制（必要に応じてフルページ）

## Cross Review (Claude + Codex CLI)

### 実施日: 2026-02-21
### レビュアー: Claude Opus 4.6 + OpenAI Codex CLI

| # | 重要度 | 指摘内容 | 検出 | 対応 |
|---|--------|---------|------|------|
| 1 | Critical | `snapshotPathTemplate` で Desktop/Mobile ベースライン衝突 | 両方 | `{projectName}` をテンプレートに追加 |
| 2 | High | 動的要素（Scrapbox, Pagefind, Giscus）の安定化不足 | Codex | ページ別安定化戦略テーブルを追加 |
| 3 | High | ローカル/CI 運用ルール未明文化 | Codex | 運用ルールテーブルと説明を追加 |
| 4 | Medium | テーマ適用が ThemeInit.astro の初期化と競合 | Codex | `addInitScript` 方式に変更 |
| 5 | Medium | `maxDiffPixelRatio: 0.01` が緩すぎ | Codex | `0.005` に厳格化 |
| 6 | Medium | ハイドレーション待機のページ差異未考慮 | Codex | `hasIslands` 分岐 + ページ別待機を追記 |
| 7 | Low | CI で `npx` ではなく `pnpm exec` を使用すべき | Codex | `pnpm exec` に統一 |

## References
- [Visual comparisons | Playwright](https://playwright.dev/docs/test-snapshots) — toHaveScreenshot API仕様
- [Continuous Integration | Playwright](https://playwright.dev/docs/ci) — CI設定ガイド
- [Best Practices | Playwright](https://playwright.dev/docs/best-practices) — テスト全般のベストプラクティス
- [Playwright Visual Regression Testing Guide | Bug0](https://bug0.com/knowledge-base/playwright-visual-regression-testing) — ビジュアルリグレッションテストの実践ガイド
