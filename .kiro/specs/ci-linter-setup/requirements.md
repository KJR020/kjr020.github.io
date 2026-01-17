# Requirements Document

## Introduction
このドキュメントは、Astro製の個人ブログプロジェクトに対してCI/CDパイプラインの拡充、Biomeによるリンター/フォーマッター導入、および最低限のテスト実装を行うための要件を定義する。既存のGitHub Pages デプロイワークフローを拡張し、コード品質を継続的に担保する仕組みを構築する。

## Requirements

### Requirement 1: Biome によるリンター/フォーマッターの導入
**Objective:** As a 開発者, I want プロジェクトに統一されたコードスタイルを強制できる仕組み, so that コードの可読性と一貫性が保たれ、レビュー負荷が軽減される

#### Acceptance Criteria
1. The CI workflow shall Biome を使用して TypeScript/JavaScript ファイルのリント検査を実行する
2. The CI workflow shall Biome を使用して TypeScript/JavaScript ファイルのフォーマット検査を実行する
3. When リント/フォーマット検査で違反が検出された場合, the CI workflow shall ワークフローを失敗させ、違反箇所を報告する
4. The Biome configuration shall プロジェクトの既存コードスタイル（Astro, React, TypeScript）に適合するルールを適用する
5. The Biome configuration shall `.astro` ファイルを実験的にサポートする（Biome v2.3.0+ の Astro サポートを活用し、`useConst`, `useImportType`, `noUnusedVariables`, `noUnusedImports` ルールを overrides で無効化）

### Requirement 2: TypeScript 型検査の CI 統合
**Objective:** As a 開発者, I want PR/pushごとに型エラーを自動検出したい, so that 型安全性を担保し、実行時エラーを未然に防げる

#### Acceptance Criteria
1. When コードがリポジトリにpushされた場合, the CI workflow shall TypeScript の型検査（`tsc --noEmit`）を実行する
2. If 型エラーが検出された場合, the CI workflow shall ワークフローを失敗させ、エラー内容を報告する
3. The CI workflow shall 既存の `tsconfig.json` 設定に基づいて型検査を実行する

### Requirement 3: Astro ビルド検証の CI 統合
**Objective:** As a 開発者, I want PR作成時にビルドが成功することを確認したい, so that 本番デプロイ前に問題を検出できる

#### Acceptance Criteria
1. When Pull Request が作成または更新された場合, the CI workflow shall `astro build` コマンドを実行してビルド検証を行う
2. If ビルドが失敗した場合, the CI workflow shall ワークフローを失敗させ、エラー内容を報告する
3. The CI workflow shall ビルド成果物を一時的にアーティファクトとして保存する（デプロイは行わない）

### Requirement 4: 基本的なユニットテストの導入
**Objective:** As a 開発者, I want ユーティリティ関数の動作を自動テストで検証したい, so that リファクタリング時の回帰バグを防げる

#### Acceptance Criteria
1. The project shall テストフレームワーク（Vitest）をインストールして設定する
2. The CI workflow shall テストスイートを実行する
3. If テストが失敗した場合, the CI workflow shall ワークフローを失敗させ、失敗内容を報告する
4. The project shall 最低限1つのユーティリティ関数（`src/lib/utils.ts` の `cn` 関数など）に対するテストを含む
5. While テストがまだ存在しない場合, the CI workflow shall テストステップをスキップする（エラーにはしない）

### Requirement 5: CI ワークフローの構成
**Objective:** As a 開発者, I want CI検査をPull Request時とpush時に自動実行したい, so that コード品質を継続的に監視できる

#### Acceptance Criteria
1. The CI workflow shall `main` ブランチへの push 時に実行される
2. The CI workflow shall Pull Request 作成/更新時に実行される
3. The CI workflow shall 以下の順序でジョブを実行する: リント/フォーマット検査 → 型検査 → テスト → ビルド検証
4. The CI workflow shall 各ステップの実行時間を最小化するためにキャッシュ（pnpm store）を活用する
5. The CI workflow shall 既存のデプロイワークフロー（`deploy.yml`）とは独立して動作する

### Requirement 6: ローカル開発環境との整合性
**Objective:** As a 開発者, I want ローカルでもCI と同じ検査を実行したい, so that pushする前に問題を検出できる

#### Acceptance Criteria
1. The project shall `package.json` に以下の npm scripts を追加する: `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `test`
2. When 開発者が `npm run lint` を実行した場合, the Biome CLI shall ローカル環境でリント検査を実行する
3. When 開発者が `npm run format` を実行した場合, the Biome CLI shall ローカル環境でフォーマットを適用する
4. When 開発者が `npm run typecheck` を実行した場合, the TypeScript compiler shall 型検査を実行する
5. When 開発者が `npm run test` を実行した場合, the test runner shall テストスイートを実行する
