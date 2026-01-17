# Implementation Plan

## Task 1: 環境セットアップとパッケージインストール
- [x] 1.1 (P) Giscus Reactパッケージをインストールする
  - `@giscus/react` パッケージをnpmでインストール
  - package.jsonに依存関係が追加されることを確認
  - _Requirements: 1.1_

- [x] 1.2 (P) 環境変数ファイルを作成する
  - `.env` ファイルにGiscus設定用の環境変数を定義
  - `PUBLIC_GISCUS_REPO`, `PUBLIC_GISCUS_REPO_ID`, `PUBLIC_GISCUS_CATEGORY`, `PUBLIC_GISCUS_CATEGORY_ID` を設定
  - `.env.example` にテンプレートを作成（実際の値はプレースホルダー）
  - _Requirements: 4.3_

## Task 2: GitHub Discussionsセットアップ（手動作業）
- [x] 2. GitHubリポジトリでDiscussionsを有効化しGiscusを設定する
  - リポジトリ設定でDiscussions機能を有効化
  - Giscus用のDiscussionカテゴリ（例: "Comments"）を作成
  - [giscus.app](https://giscus.app) で設定を生成し、`repoId` と `categoryId` を取得
  - 取得した値を `.env` ファイルに反映
  - _Requirements: 4.1, 4.2, 4.3_

## Task 3: Commentsコンポーネント実装
- [x] 3.1 基本的なGiscusラッパーコンポーネントを作成する
  - `@giscus/react` をラップするReactコンポーネントを作成
  - propsでリポジトリ情報、カテゴリ情報を受け取る
  - `mapping="pathname"` で記事パスとDiscussionを紐づけ
  - `lang="ja"` で日本語UIを設定
  - `loading="lazy"` で遅延読み込みを有効化
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [x] 3.2 ダークモード連動機能を実装する
  - 初期テーマを `document.documentElement.classList.contains("dark")` で判定
  - `MutationObserver` で `.dark` クラスの変更を監視
  - テーマ変更時にGiscusのテーマを `light` / `dark` で切り替え
  - コンポーネントアンマウント時にObserverをクリーンアップ
  - _Requirements: 3.1, 3.2, 3.3_

## Task 4: 記事ページへの統合
- [x] 4. 記事詳細ページにコメントセクションを追加する
  - 記事詳細ページテンプレートにCommentsコンポーネントを配置
  - 記事本文の下にコメント欄が表示されるようレイアウト調整
  - 環境変数から設定値を注入
  - `client:only="react"` でクライアントサイドのみレンダリング
  - _Requirements: 1.1, 1.3_

## Task 5: 意思決定ドキュメント作成
- [x] 5. 技術選定の意思決定ログをドキュメントとして出力する
  - `docs/architecture/comment_architecture.md` を作成
  - 前提・制約、選択肢比較、観点別結論、反証条件、採用決定を記載
  - requirements.mdの意思決定ログセクションを整形して移植
  - _Requirements: 5.1, 5.2_

## Task 6: 動作確認
- [x] 6.1 ローカル環境でコメント機能の動作を確認する
  - 開発サーバーを起動し記事ページにアクセス
  - Giscus iframeが正しく表示されることを確認
  - GitHubログインでコメント投稿ができることを確認
  - _Requirements: 1.1, 1.3, 2.1_

- [x] 6.2 ダークモード切り替えの動作を確認する
  - テーマトグルでライト/ダークを切り替え
  - Giscusのテーマが連動して切り替わることを確認
  - ページリロード後も正しいテーマが適用されることを確認
  - _Requirements: 3.1, 3.2, 3.3_

## Requirements Coverage

| Requirement | Task(s) |
|-------------|---------|
| 1.1 | 1.1, 3.1, 4, 6.1 |
| 1.2 | 3.1 |
| 1.3 | 3.1, 4, 6.1 |
| 2.1 | 3.1, 6.1 |
| 2.2 | 3.1 |
| 2.3 | 3.1 |
| 3.1 | 3.2, 6.2 |
| 3.2 | 3.2, 6.2 |
| 3.3 | 3.2, 6.2 |
| 4.1 | 2 |
| 4.2 | 2 |
| 4.3 | 1.2, 2 |
| 5.1 | 5 |
| 5.2 | 5 |
