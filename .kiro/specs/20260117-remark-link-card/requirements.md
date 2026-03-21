# Requirements Document

## Introduction
本ドキュメントは、Astroブログにremark-link-cardプラグインを導入し、Markdown内のリンクをリッチなカード形式で表示する機能の要件を定義します。既存のダークモード対応およびTailwind CSS v4のデザインシステムと統合します。

## Requirements

### Requirement 1: プラグイン導入と基本設定
**Objective:** As a ブログ管理者, I want remark-link-cardプラグインをAstroに導入したい, so that Markdownのリンクをリッチなカード形式で表示できる

#### Acceptance Criteria
1. The remark-link-card shall Astro設定ファイルのremarkPluginsとして正しく登録される
2. When ビルドコマンドを実行した時, the Astro shall エラーなくビルドを完了する
3. The remark-link-card shall キャッシュ機能を有効にして、ビルド時のパフォーマンスを最適化する
4. The remark-link-card shall URLを短縮表示（ドメイン名のみ）するオプションを有効にする

### Requirement 2: リンクカード変換
**Objective:** As a ブログ読者, I want リンクがカード形式で表示されてほしい, so that リンク先の情報を視覚的に把握できる

#### Acceptance Criteria
1. When Markdownに生のURL（例: `https://example.com`）が記述された時, the remark-link-card shall URLをリッチなカード形式に変換する
2. When Markdownに山括弧囲みのURL（例: `<https://example.com>`）が記述された時, the remark-link-card shall URLをリッチなカード形式に変換する
3. When Markdownにインライン形式のリンク（例: `[テキスト](URL)`）が記述された時, the remark-link-card shall 通常のリンクとして維持し、カード変換しない
4. The リンクカード shall リンク先のタイトル、説明文、OGイメージ（存在する場合）を表示する

### Requirement 3: カードスタイリング（ライトモード）
**Objective:** As a ブログ読者, I want リンクカードが既存のデザインと調和してほしい, so that 統一感のある閲覧体験を得られる

#### Acceptance Criteria
1. The リンクカード shall 既存のCSS変数（`--card`, `--card-foreground`, `--border`）を使用してスタイリングされる
2. The リンクカード shall 適切なパディング、マージン、角丸（`--radius`）を持つ
3. When ユーザーがカードにホバーした時, the リンクカード shall 視覚的なフィードバック（影の強調やスケール変化など）を表示する
4. The リンクカード shall レスポンシブデザインに対応し、モバイルでも適切に表示される

### Requirement 4: カードスタイリング（ダークモード）
**Objective:** As a ブログ読者, I want ダークモードでもリンクカードが適切に表示されてほしい, so that どちらのテーマでも快適に閲覧できる

#### Acceptance Criteria
1. While ダークモードが有効な時, the リンクカード shall `.dark`クラスのCSS変数を使用してスタイリングされる
2. While ダークモードが有効な時, the リンクカード shall コントラストが適切で読みやすい状態を維持する
3. When テーマを切り替えた時, the リンクカード shall 即座に新しいテーマのスタイルに反映される

### Requirement 5: キャッシュ管理
**Objective:** As a ブログ管理者, I want リンク情報のキャッシュを適切に管理したい, so that ビルド時間を短縮しつつ、情報を最新に保てる

#### Acceptance Criteria
1. The remark-link-card shall `/public/remark-link-card/` ディレクトリにキャッシュを保存する
2. The キャッシュディレクトリ shall `.gitignore`に追加され、バージョン管理から除外される
3. If キャッシュが存在する場合, the remark-link-card shall キャッシュから情報を読み込み、外部リクエストを削減する
