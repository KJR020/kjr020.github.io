# Implementation Plan

- [x] 1. スナップショットテストの基盤設定
- [x] 1.1 (P) playwright.config.ts にスナップショット用の設定を追加する
  - `expect.toHaveScreenshot` に `maxDiffPixelRatio: 0.005`、`animations: "disabled"`、`stylePath: "./e2e/snapshot.css"` を設定
  - `snapshotPathTemplate` に `{projectName}` を含め、Desktop/Mobile のベースラインをディレクトリレベルで分離する
  - 既存の chromium / Mobile Chrome プロジェクト設定および `pnpm preview` の webServer 設定との共存を維持する
  - _Requirements: 1.2, 1.3, 1.4, 2.4, 4.1_
  - _Contracts: playwright.config.ts 拡張_

- [x] 1.2 (P) スナップショット安定化CSSを作成する
  - トランジション・アニメーションを無効化する（`animations: "disabled"` のバックアップ）
  - カーソル点滅の停止、スクロールバーの非表示（OS間差分抑制）、画像の遅延読み込みを即時読み込みに変更する
  - _Requirements: 2.4_
  - _Contracts: e2e/snapshot.css_

- [x] 2. (P) スナップショットヘルパーユーティリティを実装する
  - `waitForHydration`: `hasIslands` フラグに基づく条件分岐。Island付きページは `astro-island[client='load']:not([ssr])` を待機し、`/search` ページは追加で `.pagefind-ui` セレクタの出現を待機する
  - `setTheme`: `page.addInitScript` で `localStorage.theme` を注入し、`page.emulateMedia({ colorScheme })` を設定する。`page.goto()` の前に呼び出す設計により、ThemeInit.astro の初期化時に正しいテーマが適用され FOUC を防止する
  - `stabilizePage`: `networkidle` 待機後にアニメーション完了を待機する
  - `capturePageSnapshot`: 上記関数を組み合わせたスナップショット取得の共通処理を実装する
  - _Requirements: 2.3, 3.3_
  - _Contracts: e2e/helpers/snapshot.ts Service Interface_

- [x] 3. スナップショットテストの実装
- [x] 3.1 静的ページ（4ページ）のスナップショットテストを実装する
  - `PageConfig` インターフェースとテスト対象ページ設定配列を定義する
  - `/`、`/archive`、`/search`、`/404` の各ページについてライト/ダーク両テーマでスナップショットを取得する
  - スナップショット名は `{pageName}-{theme}` 形式（例: `index-light`、`archive-dark`）を使用する
  - `/` ページの ScrapboxCardList セクションは `mask` オプションで安定化する
  - `/search` ページは `.pagefind-ui` の出現を待機してからキャプチャする
  - _Requirements: 1.1, 2.1, 2.4, 3.1, 3.2_

- [x] 3.2 動的ページ（4ページ）のスナップショットテストを実装する
  - `/posts/[slug]`、`/tags/[tag]`、`/newsletters/`、`/newsletters/[slug]` の代表的な1ページずつのスナップショットテストを作成する
  - 各ページについてライト/ダーク両テーマでスナップショットを取得する
  - `/posts/[slug]` の Giscus コメント iframe 領域は `mask` オプションで安定化する
  - ハイドレーション完了を待機してからスナップショットを取得する
  - _Requirements: 1.1, 2.2, 2.3, 2.4, 3.1, 3.2_

- [x] 4. 更新ワークフローとCI連携
- [x] 4.1 (P) スナップショット更新用のnpmスクリプトを追加する
  - `package.json` に `test:e2e:update-snapshots` スクリプトを追加する
  - `--update-snapshots` フラグ付きで Playwright テストを実行する構成にする
  - _Requirements: 4.2, 4.3_

- [x] 4.2 GitHub Actions CI にE2Eジョブを追加する
  - `ubuntu-latest` 環境でビルド後にスナップショットテストを含むE2Eテストを実行するジョブを追加する
  - `pnpm exec playwright install --with-deps chromium` でブラウザをインストールする（pnpm環境に統一）
  - テスト失敗時に `playwright-report/` と `test-results/` をアーティファクトとしてアップロードする
  - 既存の5ジョブ（lint, format, typecheck, test, build）と並列実行する構成にする
  - _Requirements: 5.1, 5.2, 5.3_

## Requirements Coverage

| Requirement | Summary | Tasks |
|-------------|---------|-------|
| 1.1 | テストファイル配置と共存 | 3.1, 3.2 |
| 1.2 | ベースライン画像のリポジトリ管理 | 1.1 |
| 1.3 | 2ビューポート対応 | 1.1 |
| 1.4 | 統合実行 | 1.1 |
| 2.1 | 静的ページスナップショット | 3.1 |
| 2.2 | 動的ページスナップショット | 3.2 |
| 2.3 | ハイドレーション待機 | 2, 3.2 |
| 2.4 | 偽陽性抑制 | 1.1, 1.2, 3.1, 3.2 |
| 3.1 | 両テーマ対応 | 3.1, 3.2 |
| 3.2 | テーマ識別ファイル名 | 3.1, 3.2 |
| 3.3 | classList操作によるテーマ適用 | 2 |
| 4.1 | 差分レポート | 1.1 |
| 4.2 | 更新npmスクリプト | 4.1 |
| 4.3 | Git管理 | 4.1 |
| 5.1 | CI実行 | 4.2 |
| 5.2 | 同一ベースライン使用 | 4.2 |
| 5.3 | CI差分レポート | 4.2 |
