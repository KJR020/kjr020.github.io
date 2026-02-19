# Requirements Document

## Introduction

ブログとは独立した「Tech Trends ニュースレター」ページを新設する。AIが毎日自動で収集・整理した最新のテック情報を、GitHub Actions + Claude Codeで自動生成し、セルフレビューを経てAstro Content Collection（newsletters）としてサイトに公開する。

本要件は [functional-spec.md](./functional-spec.md)（承認済み）に基づく。

## Requirements

### Requirement 1: ニュースレターContent Collection定義

**Objective:** As a ブログオーナー, I want ニュースレターをブログ記事とは独立したContent Collectionとして管理したい, so that ブログ記事と混在せず、スキーマや表示を個別に制御できる

#### Acceptance Criteria

1. The Newsletter System shall `content/newsletters/` ディレクトリをニュースレター専用のContent Collectionとして定義する
2. The Newsletter System shall `content.config.ts` に `newsletters` コレクションを定義し、以下のfrontmatterスキーマを持つ: `title`（必須・文字列）、`date`（必須・日付）、`tags`（任意・文字列配列）、`description`（任意・文字列）
3. The Newsletter System shall `tech-trends-newsletter` スキルが生成するMarkdownフォーマットをそのままContent Collectionのソースとして読み込めるスキーマとする
4. When ニュースレターのMarkdownファイルが `content/newsletters/` に配置されたとき, the Newsletter System shall Astroビルド時にコレクションとして正しく読み込む

### Requirement 2: ニュースレター一覧ページ

**Objective:** As a ブログ読者, I want ニュースレターの一覧ページで過去の号をすべて確認したい, so that 興味のある日のニュースレターに素早くアクセスできる

#### Acceptance Criteria

1. The Newsletter System shall `/newsletters` パスにニュースレター一覧ページを提供する
2. The Newsletter System shall 一覧ページにすべてのニュースレターを日付の新しい順で表示する
3. The Newsletter System shall 各エントリに日付とタイトルを表示する
4. When ニュースレターのエントリがクリックされたとき, the Newsletter System shall 該当する個別ニュースレターページに遷移する
5. The Newsletter System shall 既存の `BaseLayout` を使用してサイト全体のデザインと統一感を保つ

### Requirement 3: ニュースレター個別ページ

**Objective:** As a ブログ読者, I want 個別のニュースレターをセクション構造付きで読みたい, so that Highlights・セクション別ニュース・Key Takeawaysを効率的に閲覧できる

#### Acceptance Criteria

1. The Newsletter System shall `/newsletters/[slug]` パスに個別ニュースレターページを提供する
2. The Newsletter System shall ニュースレター本文のMarkdownをHTMLとしてレンダリングする
3. The Newsletter System shall 原文リンク（外部サイトへのURL）をクリック可能なリンクとして表示する
4. The Newsletter System shall 既存の `BaseLayout` を使用してサイト全体のデザインと統一感を保つ

### Requirement 4: ナビゲーションとトップページ導線

**Objective:** As a ブログ読者, I want サイトのどこからでもニュースレターページにアクセスしたい, so that ニュースレターの存在に気づき、簡単に閲覧を開始できる

#### Acceptance Criteria

1. The Newsletter System shall ヘッダーナビゲーションに「Tech Trends」リンクを追加し、`/newsletters` へ遷移させる
2. The Newsletter System shall トップページに最新のニュースレターへの導線を表示する
3. When 「Tech Trends」リンクがクリックされたとき, the Newsletter System shall ニュースレター一覧ページに遷移する

### Requirement 5: GitHub Actionsによる自動生成ワークフロー

**Objective:** As a ブログオーナー, I want ニュースレターが毎日決まった時間に自動生成されてほしい, so that 手作業なしで最新のテック情報がサイトに公開される

#### Acceptance Criteria

1. The Newsletter System shall `newsletter.yml` ワークフローをGitHub Actionsに定義し、cronスケジュール（毎日JST 7:00 = UTC 22:00前日）で自動起動する
2. When cronスケジュールが発動したとき, the Newsletter System shall Claude Code（`tech-trends-newsletter` スキル）を実行してニュースレターのMarkdownファイルを生成する
3. The Newsletter System shall 生成されたファイルを `content/newsletters/YYYY-MM-DD_tech-trends.md` の命名規則で保存する
4. The Newsletter System shall Anthropic APIキーをリポジトリのSecretsから参照する
5. The Newsletter System shall `workflow_dispatch` トリガーも併せて定義し、手動実行を可能にする

### Requirement 6: 公開前セルフレビュー

**Objective:** As a ブログオーナー, I want 生成されたニュースレターが公開前にAIによるセルフレビューを受けてほしい, so that 不正確な情報や不適切な内容が公開されるリスクを低減できる

#### Acceptance Criteria

1. When ニュースレターのMarkdownが生成された後, the Newsletter System shall 公開前にAI（Claude Code）によるセルフレビューを実行する
2. The Newsletter System shall セルフレビューで以下の観点を検証する: 事実関係の妥当性、リンクの形式的な整合性、不適切な表現の有無、frontmatterの必須フィールドの存在
3. If セルフレビューで重大な問題が検出されたとき, the Newsletter System shall 該当ファイルをコミットせず、ワークフローをエラー終了してGitHubの通知で問題の概要を報告する
4. If セルフレビューで問題が検出されなかったとき, the Newsletter System shall 自動コミット・プッシュを続行する

### Requirement 7: 自動コミットとデプロイ連携

**Objective:** As a ブログオーナー, I want セルフレビュー通過後のニュースレターが自動でサイトにデプロイされてほしい, so that 公開までの全工程が人手を介さず完了する

#### Acceptance Criteria

1. When セルフレビューを通過したニュースレターが存在するとき, the Newsletter System shall mainブランチに自動コミット・プッシュする
2. When mainブランチにプッシュされたとき, the Newsletter System shall 既存の `deploy.yml` ワークフローをトリガーしてGitHub Pagesにデプロイする
3. The Newsletter System shall コミットメッセージに日付と自動生成であることを明示する（例: `📰 Add tech-trends newsletter 2026-02-18`）

### Requirement 8: エラーハンドリング

**Objective:** As a ブログオーナー, I want ニュースレター生成が失敗してもサイトに影響がないようにしたい, so that 既存コンテンツの可用性が常に維持される

#### Acceptance Criteria

1. If Claude Code APIの実行が失敗したとき, the Newsletter System shall ワークフローをエラー終了し、GitHubのデフォルト通知メカニズムで失敗を報告する
2. If ニュースレター生成が失敗したとき, the Newsletter System shall 既存のコンテンツ（過去のニュースレターおよびブログ記事）に一切影響を与えない
3. The Newsletter System shall 翌日のcronスケジュールで自動的に再実行される（明示的なリトライメカニズムは不要）
