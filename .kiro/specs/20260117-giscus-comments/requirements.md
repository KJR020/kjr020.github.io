# Requirements Document

## Introduction
Astro製技術ブログにGiscus（GitHub Discussions連携）コメント機能を導入する。全記事にコメント欄を設置し、GitHub認証によるMarkdown対応コメントを実現する。また、技術選定の意思決定ログをドキュメントとして残す。

## Requirements

### Requirement 1: コメント欄表示
**Objective:** As a ブログ読者, I want 各記事の下部にコメント欄を見る, so that 記事についてコメントできる

#### Acceptance Criteria
1. When 記事詳細ページを表示した時, the コメントコンポーネント shall 記事本文の下にGiscusウィジェットを表示する
2. The コメントコンポーネント shall 記事ごとに固有のDiscussionスレッドと紐づける
3. When ページを読み込んだ時, the コメントコンポーネント shall 既存のコメントを取得して表示する

### Requirement 2: コメント投稿
**Objective:** As a GitHubアカウントを持つ読者, I want コメントを投稿する, so that 記事について意見やフィードバックを残せる

#### Acceptance Criteria
1. When GitHubログイン済みユーザーがコメントを入力して送信した時, the Giscusウィジェット shall GitHub Discussionsにコメントを投稿する
2. The Giscusウィジェット shall Markdown記法（コードブロック含む）でのコメント入力をサポートする
3. If 未ログイン状態でコメントを投稿しようとした時, then the Giscusウィジェット shall GitHub認証を促すUIを表示する

### Requirement 3: ダークモード連動
**Objective:** As a ブログ読者, I want コメント欄がサイトのテーマに合わせて表示される, so that 統一感のある閲覧体験を得られる

#### Acceptance Criteria
1. While サイトがライトモードの時, the コメントコンポーネント shall Giscusのライトテーマを適用する
2. While サイトがダークモードの時, the コメントコンポーネント shall Giscusのダークテーマを適用する
3. When サイトのテーマが切り替わった時, the コメントコンポーネント shall Giscusのテーマを動的に切り替える

### Requirement 4: GitHub Discussionsセットアップ
**Objective:** As a ブログ管理者, I want リポジトリにGiscus用のDiscussionsを設定する, so that コメントデータを管理できる

#### Acceptance Criteria
1. The GitHubリポジトリ shall Discussionsを有効化する
2. The GitHubリポジトリ shall Giscus専用のDiscussionカテゴリを作成する
3. The Giscus設定 shall リポジトリ・カテゴリ情報を正しく参照する

### Requirement 5: 意思決定ドキュメント作成
**Objective:** As a ブログ管理者, I want 技術選定の経緯をドキュメントとして残す, so that 将来の参照や見直しができる

#### Acceptance Criteria
1. The ドキュメント shall `docs/architecture/comment_architecture.md` に意思決定ログを出力する
2. The 意思決定ログ shall 前提・制約、選択肢比較、観点別結論、反証条件、採用決定を含む

## 意思決定ログ

### コメント機能：Giscus採用

#### 前提・制約
- GitHub Pages + Astro（SSG）でホスティング、サーバー常設なし
- 全記事にコメント欄を付ける
- できれば GitHub 認証
- 無料〜低コスト
- 技術ブログなので Markdown / コード貼り付けが重要

#### 選択肢
- **採用**: Giscus（GitHub Discussions）
- **比較対象**: Utterances、Disqus、Cusdis、Remark42、Commento/Comentario、Isso、Hyvor Talk

#### 観点別の結論

##### 1) 運用コスト
- Giscus: GitHub上（Discussions）に保存＝追加コストほぼ0、サーバー運用なし
- 自前ホスト系（Remark42/Comentario/Isso）は運用・監視・アップデートが発生
- SaaS（Disqus/Hyvor）は継続課金や広告/データ面のトレードオフ

##### 2) GitHub Pages / Astro適合
- Giscus: 埋め込みのみで完結（静的サイトで成立）
- 自前ホスト系は別途ホスト先が必要（GitHub Pages単体では完結しない）

##### 3) コメントしやすさ（技術ブログ適性）
- Giscus: GitHubログインで投稿、Markdown（コードブロック含む）前提で相性が良い
- CusdisはMarkdown弱め/なしになりがちで技術ブログ用途とミスマッチ

##### 4) プライバシー・データ所有
- Giscus: データは自分のGitHubリポジトリ（Discussions）に保存＝所有/移行の筋が良い
- Disqusはトラッキング/広告等の懸念が大きい

##### 5) スパム耐性 / モデレーション
- Giscus: GitHubアカウント必須でスパムが入りにくい。削除・ロック等もGitHub側で管理可能
- 匿名投稿系（Cusdis/Isso等）はスパム対策を別途考える必要が出やすい

##### 6) カスタマイズ（ダークモード等）
- Giscus: テーマ設定があり、ブログ側のダークモード連動もしやすい
- Disqusは自由度や一体感の面で妥協が必要になりがち

#### 反証条件（Giscusをやめる条件）
- 「GitHubアカウント必須」が読者層に合わず、コメント率が明確に下がる
- GitHub Discussions運用がリポジトリ管理上の負担になる
- 匿名コメントや他SNSログインが必須要件に変わる

#### 採用決定
GitHub Pages + 技術ブログ + 低コスト + GitHub認証という要件に最も整合するため **Giscusを採用**。
