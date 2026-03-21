# Implementation Plan

## Tasks

- [x] 1. Biome のセットアップと設定
- [x] 1.1 (P) Biome パッケージをインストールする
  - devDependencies に @biomejs/biome を追加
  - バージョンは v2.x 系の最新を使用
  - _Requirements: 1.4_

- [x] 1.2 Biome 設定ファイルを作成する
  - プロジェクトルートに biome.json を配置
  - TypeScript/JavaScript ファイルに対するリント・フォーマットルールを定義
  - Astro ファイル向けに overrides を設定し、useConst, useImportType, noUnusedVariables, noUnusedImports を無効化
  - Prettier 互換のフォーマット設定を適用
  - _Requirements: 1.4, 1.5_

- [x] 1.3 既存コードに Biome を適用してフォーマットを修正する
  - 現在のコードベースに対してフォーマッターを実行
  - リントエラーがあれば修正
  - 1.2 で作成した設定が正しく動作することを確認
  - _Requirements: 1.4, 1.5_

- [x] 2. Vitest のセットアップと設定
- [x] 2.1 (P) Vitest パッケージをインストールする
  - devDependencies に vitest を追加
  - _Requirements: 4.1_

- [x] 2.2 Vitest 設定ファイルを作成する
  - プロジェクトルートに vitest.config.ts を配置
  - Astro の getViteConfig() を使用して Vite 設定を統合
  - テスト環境として node を指定
  - globals: true で describe/it/expect をグローバルに使用可能に
  - _Requirements: 4.1_

- [x] 2.3 cn 関数のユニットテストを実装する
  - src/lib/utils.test.ts にテストファイルを作成
  - 単一クラス名、複数クラス名の結合をテスト
  - 条件付きクラス（truthy/falsy）の処理をテスト
  - Tailwind クラスの競合解決（twMerge 動作）をテスト
  - 空入力、オブジェクト形式、配列形式のエッジケースをテスト
  - _Requirements: 4.4_

- [x] 3. npm scripts の追加
- [x] 3.1 package.json に lint/format 関連スクリプトを追加する
  - lint: Biome によるリント検査を実行
  - lint:fix: リント違反を自動修正
  - format: フォーマットを適用
  - format:check: フォーマット検査のみ実行（CI 用）
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 3.2 package.json に typecheck/test スクリプトを追加する
  - typecheck: tsc --noEmit で型検査を実行
  - test: vitest でテストを実行
  - test:run: vitest run で単発実行（CI 用）
  - _Requirements: 6.1, 6.4, 6.5_

- [x] 4. GitHub Actions CI ワークフローの作成
- [x] 4.1 CI ワークフローファイルを作成する
  - .github/workflows/ci.yml を新規作成
  - main ブランチへの push と PR 作成/更新時にトリガー
  - deploy.yml と同様のセットアップパターン（pnpm/action-setup + setup-node）を使用
  - pnpm キャッシュを有効化
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 4.2 CI ワークフローにリント・フォーマット検査ステップを追加する
  - pnpm lint でリント検査を実行
  - pnpm format:check でフォーマット検査を実行
  - 違反があればワークフローを失敗させる
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4.3 CI ワークフローに型検査ステップを追加する
  - pnpm typecheck で型検査を実行
  - 型エラーがあればワークフローを失敗させる
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 4.4 CI ワークフローにテスト実行ステップを追加する
  - pnpm test:run --passWithNoTests でテストを実行
  - テストが存在しない場合もエラーにしない
  - テスト失敗時はワークフローを失敗させる
  - _Requirements: 4.2, 4.3, 4.5_

- [x] 4.5 CI ワークフローにビルド検証ステップを追加する
  - pnpm build で Astro ビルドを実行
  - ビルド失敗時はワークフローを失敗させる
  - 実行順序: lint → typecheck → test → build
  - _Requirements: 3.1, 3.2, 5.3_

- [x] 5. 統合検証
- [x] 5.1 ローカル環境で全スクリプトの動作を確認する
  - npm run lint / lint:fix の動作確認
  - npm run format / format:check の動作確認
  - npm run typecheck の動作確認
  - npm run test の動作確認
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 5.2 CI ワークフローの動作を確認する
  - feature ブランチを push して CI が起動することを確認
  - 各ステップが正しい順序で実行されることを確認
  - 既存の deploy.yml に影響がないことを確認
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

## Requirements Coverage

| Requirement | Tasks |
|-------------|-------|
| 1.1 | 4.2 |
| 1.2 | 4.2 |
| 1.3 | 4.2 |
| 1.4 | 1.1, 1.2, 1.3 |
| 1.5 | 1.2, 1.3 |
| 2.1 | 4.3 |
| 2.2 | 4.3 |
| 2.3 | 4.3 |
| 3.1 | 4.5 |
| 3.2 | 4.5 |
| 3.3 | (ビルドアーティファクト保存は Non-Goal として除外) |
| 4.1 | 2.1, 2.2 |
| 4.2 | 4.4 |
| 4.3 | 4.4 |
| 4.4 | 2.3 |
| 4.5 | 4.4 |
| 5.1 | 4.1 |
| 5.2 | 4.1 |
| 5.3 | 4.5 |
| 5.4 | 4.1 |
| 5.5 | 4.1, 5.2 |
| 6.1 | 3.1, 3.2 |
| 6.2 | 3.1, 5.1 |
| 6.3 | 3.1, 5.1 |
| 6.4 | 3.2, 5.1 |
| 6.5 | 3.2, 5.1 |

## Notes

- **3.3（ビルドアーティファクト保存）**: 設計の Non-Goals に記載の通り、デプロイは行わないため、アーティファクト保存は本スコープでは実装しない
- **並列実行可能タスク**: 1.1 と 2.1 は依存関係がないため並列実行可能（(P) マーク付き）
