# Requirements Document

## Introduction

ブログサイトのUI外観をPlaywrightのスナップショットテストで保護する基盤を構築する。各ページのビジュアル状態をスナップショットとして記録し、意図しないUI変更（ビジュアルリグレッション）を検出可能にする。

### 対象ページ

プロジェクトの全ページルート（8ページ）:
- `/` (トップページ)
- `/archive` (アーカイブ)
- `/search` (検索)
- `/404` (エラーページ)
- `/posts/[slug]` (記事詳細)
- `/tags/[tag]` (タグ別一覧)
- `/newsletters/` (ニュースレター一覧)
- `/newsletters/[slug]` (ニュースレター詳細)

### 前提条件

- Playwright v1.57.0 が導入済み
- `e2e/` ディレクトリに既存のE2Eテスト（`header.spec.ts`）が存在
- Desktop Chrome / Mobile Chrome の2プロジェクトが設定済み
- `pnpm preview` でビルド済みサイトを配信する構成

---

## Requirements

### Requirement 1: スナップショットテストの基盤構成

**Objective:** 開発者として、スナップショットテストを既存のPlaywright設定と共存する形で導入したい。既存のE2Eテスト（振る舞いテスト）とスナップショットテスト（外観テスト）を明確に分離して管理できるようにするため。

#### Acceptance Criteria

1. The スナップショットテスト shall スナップショット専用のテストファイルを `e2e/` ディレクトリ内に配置し、既存のE2Eテスト（`header.spec.ts` 等）と共存する
2. The スナップショットテスト shall ベースラインスナップショット画像をリポジトリで管理可能なディレクトリに保存する
3. The スナップショットテスト shall Desktop Chrome（1280x720）と Mobile Chrome（Pixel 5: 393x851）の2つのビューポートでスナップショットを取得する
4. When `pnpm test:e2e` を実行した時, the Playwright shall 既存のE2Eテストとスナップショットテストの両方を実行する

### Requirement 2: ページ別スナップショット取得

**Objective:** 開発者として、各ページのフルページスナップショットを取得したい。ページごとのUI変更を検出できるようにするため。

#### Acceptance Criteria

1. The スナップショットテスト shall 静的ページ（`/`, `/archive`, `/search`, `/404`）のフルページスナップショットを取得する
2. The スナップショットテスト shall 動的ページ（`/posts/[slug]`, `/tags/[tag]`, `/newsletters/`, `/newsletters/[slug]`）について、代表的な1ページずつのスナップショットを取得する
3. When ページにAstro Islandが含まれる場合, the スナップショットテスト shall ハイドレーション完了を待機してからスナップショットを取得する
4. The スナップショットテスト shall フォントレンダリングやアニメーションによる偽陽性を抑制するため、適切な安定化処理を行う

### Requirement 3: テーマ別スナップショット

**Objective:** 開発者として、ライトモードとダークモードの両方でスナップショットを取得したい。テーマ切り替えによるUI崩れを検出できるようにするため。

#### Acceptance Criteria

1. The スナップショットテスト shall 各ページについてライトモードとダークモードの両テーマでスナップショットを取得する
2. The スナップショット画像 shall テーマを識別可能なファイル名で保存する（例: `index-light-desktop.png`, `index-dark-mobile.png`）
3. When テーマを切り替える時, the スナップショットテスト shall `document.documentElement` の `class` 属性を操作してテーマを適用する

### Requirement 4: スナップショット更新ワークフロー

**Objective:** 開発者として、意図的なUI変更時にスナップショットを容易に更新したい。ベースライン更新の手順が明確であることで、ワークフローが滞りなく進むようにするため。

#### Acceptance Criteria

1. When スナップショットの差分が検出された時, the Playwright shall 差分の詳細（期待画像・実際の画像・差分画像）をレポートに含める
2. The プロジェクト shall スナップショットを更新するためのnpmスクリプトを提供する
3. The スナップショットのベースライン画像 shall Gitリポジトリにコミットされ、バージョン管理される

### Requirement 5: CI連携

**Objective:** 開発者として、CIパイプラインでスナップショットテストを実行したい。Pull Requestのレビュー時にビジュアルリグレッションを自動検出できるようにするため。

#### Acceptance Criteria

1. The スナップショットテスト shall CI環境（GitHub Actions）で既存のE2Eテストと同じワークフローで実行可能である
2. While CI環境で実行する時, the スナップショットテスト shall ローカル環境と同一のベースライン画像を使用して比較する
3. If スナップショットの差分が検出された時, the CI shall テストを失敗として報告し、差分レポートをアーティファクトとして保存する
