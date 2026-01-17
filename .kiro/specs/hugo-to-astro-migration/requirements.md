# Requirements Document

## Introduction

本ドキュメントは、既存のHugoブログ（PaperModテーマ）からAstroへの移行に関する要件を定義する。
現在のブログは約45記事のMarkdownコンテンツを持ち、GitHub Pagesでホスティングされている。
移行後も同等の機能を維持しつつ、Reactコンポーネントの活用を可能にすることを目的とする。

### 現状の構成
- **フレームワーク**: Hugo + PaperModテーマ
- **ホスティング**: GitHub Pages
- **コンテンツ**: 約45記事（Markdown形式、TOML frontmatter）
- **機能**: アーカイブ、検索、タグ、ソーシャルリンク

## Requirements

### Requirement 1: コンテンツ移行

**Objective:** As a ブログ運営者, I want 既存のMarkdownコンテンツをAstroで読み込める形式に変換したい, so that 過去の記事を失うことなく新しいプラットフォームで公開できる

#### Acceptance Criteria
1. The Astro Site shall 既存のMarkdownファイル（約45記事）をContent Collectionsとして読み込む
2. When Markdownファイルがビルド時に処理される, the Astro Site shall TOML形式のfrontmatterをYAML形式に変換して解釈する
3. The Astro Site shall 日本語ファイル名のMarkdownファイルを正しく処理する
4. The Astro Site shall 既存のコードブロック（シンタックスハイライト）を維持する
5. If Markdownファイルにmermaid記法が含まれる場合, then the Astro Site shall mermaidダイアグラムをレンダリングする

### Requirement 2: ページ構成

**Objective:** As a ブログ読者, I want 現在と同等のナビゲーション構造でブログを閲覧したい, so that 使い慣れた方法でコンテンツにアクセスできる

#### Acceptance Criteria
1. The Astro Site shall トップページにブログ概要と最新記事一覧を表示する
2. The Astro Site shall 記事一覧ページ（Archive）を提供する
3. The Astro Site shall 個別記事ページを提供する
4. The Astro Site shall 検索機能を提供する
5. The Astro Site shall ヘッダーナビゲーションにArchive、Search、外部リンク（Scrapbox）を含める
6. When ユーザーがタグをクリックした, the Astro Site shall 該当タグの記事一覧を表示する

### Requirement 3: デザイン・UI

**Objective:** As a ブログ読者, I want シンプルで読みやすいデザインのブログを閲覧したい, so that コンテンツに集中できる

#### Acceptance Criteria
1. The Astro Site shall レスポンシブデザインを採用する
2. The Astro Site shall ダークモード/ライトモードの切り替え機能を提供する
3. The Astro Site shall 著者情報（KJR020）とソーシャルリンク（GitHub、X）を表示する
4. The Astro Site shall 記事の投稿日を表示する
5. The Astro Site shall コードブロックにシンタックスハイライトを適用する

### Requirement 4: SEO・メタデータ

**Objective:** As a ブログ運営者, I want 検索エンジンとソーシャルメディアで適切に表示されるブログにしたい, so that コンテンツの発見可能性が向上する

#### Acceptance Criteria
1. The Astro Site shall 各ページに適切なtitle、descriptionメタタグを出力する
2. The Astro Site shall OGP（Open Graph Protocol）メタタグを出力する
3. The Astro Site shall robots.txtを生成する
4. The Astro Site shall サイトマップ（sitemap.xml）を生成する
5. The Astro Site shall 正規URL（canonical URL）を設定する

### Requirement 5: ビルド・デプロイ

**Objective:** As a ブログ運営者, I want GitHub Pagesへの自動デプロイを維持したい, so that 記事の公開プロセスが継続して自動化される

#### Acceptance Criteria
1. The Astro Site shall 静的サイトとしてビルドされる
2. When mainブランチにpushされた, the GitHub Actions shall Astroサイトをビルドしてdist/を生成する
3. When ビルドが完了した, the GitHub Actions shall dist/の内容をGitHub Pagesにデプロイする
4. The Astro Site shall ベースURL（https://kjr020.github.io/）を正しく設定する
5. If ビルドエラーが発生した場合, then the GitHub Actions shall エラーログを出力してデプロイを中止する

### Requirement 6: 開発体験

**Objective:** As a 開発者, I want モダンな開発環境でブログを管理したい, so that 効率的にコンテンツとコードを編集できる

#### Acceptance Criteria
1. The Astro Project shall 開発サーバー（Hot Reload対応）を提供する
2. The Astro Project shall TypeScriptを使用可能にする
3. The Astro Project shall Reactコンポーネントを使用可能にする
4. The Astro Project shall Content Collectionsの型安全性を提供する
5. While 開発サーバー実行中, the Astro Project shall Markdownファイルの変更を即座に反映する
