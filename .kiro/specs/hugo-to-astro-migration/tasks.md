# Implementation Plan

## Task Overview
HugoブログからAstroへの移行を6フェーズで実施する。

---

## Phase 1: 環境構築

- [x] 1. Astroプロジェクト初期化
- [x] 1.1 Astroプロジェクトを作成し、TypeScript、Tailwind CSS、React統合を設定する
  - `create astro`でプロジェクト初期化（with-tailwindcss テンプレート使用）
  - React統合（@astrojs/react）を追加
  - TypeScript strictモードを有効化
  - tsconfig.jsonでパスエイリアス（@/*）を設定
  - astro.config.mjsでsite URLを設定（https://kjr020.github.io/）
  - _Requirements: 5.4, 6.1, 6.2, 6.3_

- [x] 1.2 shadcn/uiを初期化し、基本コンポーネントを追加する
  - shadcn CLIでプロジェクトを初期化
  - Button, Card, Input, Badgeコンポーネントを追加
  - components.jsonの設定を確認
  - _Requirements: 3.1_

- [x] 1.3 Content Collectionsを設定し、ブログ記事スキーマを定義する
  - src/content.config.tsを作成
  - postsコレクションをZodスキーマで定義（title, date, draft, tags, description）
  - glob loaderでMarkdownファイルを読み込む設定
  - `astro sync`で型定義を生成
  - _Requirements: 1.1, 1.3, 6.4_

---

## Phase 2: コンテンツ移行

- [x] 2. コンテンツ移行
- [x] 2.1 TOML→YAML frontmatter変換スクリプトを作成・実行する
  - Node.jsスクリプトでTOML frontmatterをYAML形式に変換
  - 日付フォーマット（ISO 8601）を維持
  - title, date, draft, tagsフィールドを変換
  - 変換エラー時のレポート出力
  - _Requirements: 1.2_

- [x] 2.2 Markdownファイルをsrc/content/posts/に移動し、スキーマ検証を行う
  - 既存のcontent/posts/からsrc/content/posts/にコピー
  - ディレクトリ構造（カテゴリ別フォルダ）を維持
  - `astro build`でスキーマ検証エラーがないことを確認
  - 日本語ファイル名が正しく処理されることを確認
  - _Requirements: 1.1, 1.3_

---

## Phase 3: レイアウト・UIコンポーネント

- [x] 3. 共通レイアウトとUIコンポーネントを実装する

- [x] 3.1 (P) BaseLayoutコンポーネントを作成する
  - HTML共通構造（html, head, body）を定義
  - レスポンシブviewport設定
  - Tailwind CSSのダークモードクラス適用準備
  - slotで子コンテンツを受け取る
  - _Requirements: 3.1_

- [x] 3.2 (P) BaseHeadコンポーネントを作成し、SEOメタタグを出力する
  - title, descriptionメタタグ
  - OGPメタタグ（og:title, og:description, og:image, og:url）
  - canonical URL設定
  - charsetとviewport設定
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 3.3 Headerコンポーネントを作成し、ナビゲーションを実装する
  - サイトタイトル表示
  - Archive、Search、Scrapbox（外部リンク）へのナビゲーション
  - shadcn/ui Buttonを使用
  - レスポンシブ対応（モバイル時の表示調整）
  - _Requirements: 2.5_

- [x] 3.4 (P) Footerコンポーネントを作成し、著者情報とソーシャルリンクを表示する
  - 著者名（KJR020）表示
  - GitHub、Xへのリンク
  - コピーライト表示
  - _Requirements: 3.3_

- [x] 3.5 (P) PostMetaコンポーネントを作成し、記事メタ情報を表示する
  - 投稿日を日本語フォーマットで表示
  - タグをshadcn/ui Badgeで表示
  - タグクリックでタグページへ遷移
  - _Requirements: 3.4_

---

## Phase 4: ページ実装

- [x] 4. 各ページを実装する

- [x] 4.1 トップページを実装し、最新記事一覧を表示する
  - getCollectionで公開済み記事を取得
  - 日付でソートし、最新10件を表示
  - shadcn/ui Cardで記事カードを表示
  - ブログ概要テキストを表示
  - _Requirements: 2.1_

- [x] 4.2 (P) アーカイブページを実装し、全記事一覧を表示する
  - getCollectionで全公開記事を取得
  - 日付でソートして一覧表示
  - 年月でグループ化（将来対応可）
  - _Requirements: 2.2_

- [x] 4.3 個別記事ページを実装し、Markdown記事をレンダリングする
  - [...slug].astroで動的ルーティング
  - getStaticPathsで全記事パスを生成
  - 記事本文をレンダリング
  - PostMetaで投稿日・タグを表示
  - _Requirements: 2.3, 3.4_

- [x] 4.4 (P) タグ別記事一覧ページを実装する
  - [tag].astroで動的ルーティング
  - getStaticPathsで全タグのパスを生成
  - 指定タグの記事をフィルタリングして表示
  - _Requirements: 2.6_

---

## Phase 5: 機能実装

- [x] 5. インタラクティブ機能を実装する

- [x] 5.1 ダークモード切り替え機能を実装する
  - ThemeToggle Reactコンポーネントを作成
  - localStorageでテーマ設定を永続化
  - システム設定（prefers-color-scheme）をデフォルトとして使用
  - html要素のdarkクラスを切り替え
  - client:loadディレクティブでhydrate
  - _Requirements: 3.2_

- [x] 5.2 (P) シンタックスハイライトを設定する
  - Astro組み込みのShikiを使用
  - astro.config.mjsでmarkdown.shikiConfigを設定
  - ダークモード対応のテーマを選択
  - _Requirements: 1.4, 3.5_

- [x] 5.3 Mermaidダイアグラムレンダリングを設定する
  - @beoe/rehype-mermaidをインストール
  - astro.config.mjsでrehypePluginsに追加
  - ダークモード対応を設定
  - ビルド時にSVGに変換されることを確認
  - _Requirements: 1.5_

- [x] 5.4 検索機能を実装する
  - astro-pagefindをインストール・設定
  - SearchComponent Reactコンポーネントを作成
  - shadcn/ui Inputで検索入力を実装
  - Pagefind APIで検索実行
  - 検索結果のリスト表示
  - client:idleディレクティブでhydrate
  - _Requirements: 2.4_

- [x] 5.5 検索ページを作成する
  - SearchComponentをReact Islandとして配置
  - data-pagefind-bodyで検索対象を指定
  - _Requirements: 2.4_

---

## Phase 6: SEO・デプロイ設定

- [x] 6. SEO設定とデプロイ環境を構築する

- [x] 6.1 (P) robots.txtとサイトマップを設定する
  - public/robots.txtを作成
  - @astrojs/sitemapをインストール・設定
  - astro.config.mjsでsitemap統合を追加
  - _Requirements: 4.3, 4.4_

- [x] 6.2 GitHub Actions workflowを作成する
  - .github/workflows/deploy.ymlを作成
  - withastro/action@v5を使用
  - mainブランチへのpushでトリガー
  - Pagefindインデックス生成をビルドに含める
  - GitHub Pagesへのデプロイ設定
  - エラー時のデプロイ中止を設定
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 6.3 カスタム404ページを作成する
  - src/pages/404.astroを作成
  - トップページへの導線を提供
  - _Requirements: 5.5_

---

## Phase 7: 検証・統合

- [x] 7. 全体検証と統合テストを行う

- [x] 7.1 ローカルビルドで全機能を検証する
  - `astro build`が成功することを確認
  - 全記事が正しく生成されることを確認
  - 検索インデックスが生成されることを確認
  - ダークモード切り替えが動作することを確認
  - _Requirements: 5.1, 6.1, 6.5_

- [x] 7.2 レスポンシブデザインを検証する
  - モバイル、タブレット、デスクトップでの表示確認
  - ナビゲーションの動作確認
  - 記事の可読性確認
  - _Requirements: 3.1_

- [x] 7.3 OGPメタタグの出力を検証する
  - 各ページのOGPタグが正しく出力されることを確認
  - SNSシェア時のプレビュー確認（オプション）
  - _Requirements: 4.1, 4.2, 4.5_

---

## Requirements Coverage

| Requirement | Tasks |
|-------------|-------|
| 1.1 | 1.3, 2.2 |
| 1.2 | 2.1 |
| 1.3 | 1.3, 2.2 |
| 1.4 | 5.2 |
| 1.5 | 5.3 |
| 2.1 | 4.1 |
| 2.2 | 4.2 |
| 2.3 | 4.3 |
| 2.4 | 5.4, 5.5 |
| 2.5 | 3.3 |
| 2.6 | 4.4 |
| 3.1 | 1.2, 3.1, 7.2 |
| 3.2 | 5.1 |
| 3.3 | 3.4 |
| 3.4 | 3.5, 4.3 |
| 3.5 | 5.2 |
| 4.1 | 3.2, 7.3 |
| 4.2 | 3.2, 7.3 |
| 4.3 | 6.1 |
| 4.4 | 6.1 |
| 4.5 | 3.2, 7.3 |
| 5.1 | 6.2, 7.1 |
| 5.2 | 6.2 |
| 5.3 | 6.2 |
| 5.4 | 1.1 |
| 5.5 | 6.2, 6.3 |
| 6.1 | 1.1, 7.1 |
| 6.2 | 1.1 |
| 6.3 | 1.1 |
| 6.4 | 1.3 |
| 6.5 | 7.1 |
