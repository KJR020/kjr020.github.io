# Requirements Document

## Project Description (Input)
Cloudflare移管の実施 — GitHub Pages + CF Workers構成から CF Pages + CF Workers + RAG基盤へ移行する。移行は確定済み。本仕様は移行の要件・構成・工数・RAGスコープを定義する。

---

## Table of Contents

| Section | What You'll Learn |
|---------|-------------------|
| [Introduction](#introduction) | 移管の背景・目的・確定事項 |
| [Requirement 1: ホスティング移行](#requirement-1-ホスティング移行) | GitHub PagesからCF Pagesへの移行要件 |
| [Requirement 2: Scrapboxプロキシ継続](#requirement-2-scrapboxプロキシ継続) | 既存WorkerのCF Pages環境への対応 |
| [Requirement 3: RAG基盤構築（MVP）](#requirement-3-rag基盤構築mvp) | ScrapboxデータベースのRAGシステム要件 |
| [Requirement 4: CI/CD パイプライン](#requirement-4-cicd-パイプライン) | GitHub Actions → CF Pages デプロイ構成 |
| [Requirement 5: インデックス更新パイプライン](#requirement-5-インデックス更新パイプライン) | Scrapboxデータの定期同期要件 |

---

## Introduction

個人ブログ（kjr020.github.io）を以下の理由でCloudflareへ全面移管する：

- **技術一貫性**: Scrapbox APIプロキシ（CF Workers構築中）との統合を容易にする
- **RAG基盤**: Cloudflare Vectorize + Workers AIを用いたエッジRAGを実装し、副業ポートフォリオとして活用する
- **ポートフォリオ価値**: エッジコンピューティング + RAGの実装実績を副業案件（RAG・エージェント系）のアピールに使う

**移行の意思決定: Go（確定）**

コスト試算・工数・技術適合性の検討結果（`research.md`参照）に基づき、移行を実施する。

### 移行後構成の概要

```
現行: GitHub Pages → CF Workers (scrapbox-proxy) → Scrapbox API
移行後: CF Pages → CF Workers (proxy / rag-api / indexer) → Scrapbox API
                                               ↕
                              CF Vectorize / Workers AI / D1 / R2
```

---

## Requirements

### Requirement 1: ホスティング移行

**Objective:** As a ブログ運営者, I want AstroサイトがCF Pagesでホストされること, so that Cloudflare統合基盤の上でブログを運用できる

#### Acceptance Criteria
1. The CF Pages shall Astro静的サイトを `@astrojs/cloudflare` アダプター経由でビルド・配信する
2. The CF Pages shall `kjr020.github.io` と同等のURLでブログにアクセスできる（カスタムドメインまたはGitHub Pages継続のCNAME）
3. When GitHub mainブランチにpushされた場合, the CI/CD shall CF Pagesへの自動デプロイを実行する
4. The CF Pages shall 既存のすべてのページURL（記事・タグ・ニュースレター等）が移行後も同一パスでアクセスできる
5. The CF Pages shall `pnpm build` が成功し、Lighthouseスコアが移行前と同等以上を維持する

---

### Requirement 2: Scrapboxプロキシ継続

**Objective:** As a ブログ訪問者, I want Scrapboxコンテンツが移行後も表示されること, so that 既存機能が損なわれない

#### Acceptance Criteria
1. The scrapbox-proxy Worker shall CF Pages移行後も引き続き動作する
2. The scrapbox-proxy Worker shall 許可オリジンを `https://kjr020.github.io`（旧）から CF Pagesの新URLに更新する
3. The CF Pages shall Scrapboxカードリストが移行前と同様に表示される

---

### Requirement 3: RAG基盤構築（MVP）

**Objective:** As a エンジニア, I want ScrapboxデータをベースとしたRAGがブログ上で動作すること, so that 副業ポートフォリオとして実装実績を示せる

#### Acceptance Criteria
1. The indexer Worker shall Scrapboxの全ページを取得し、`@cf/baai/bge-m3` でベクター化してVectorizeに格納する
2. The rag-api Worker shall ユーザーのテキスト入力を受け取り、類似Scrapboxページを上位3件取得して回答を生成する
3. The rag-api Worker shall `@cf/meta/llama-3.1-8b-instruct` を用いて日本語で回答を生成する
4. The ブログUI shall RAG検索入力フォームと回答表示エリアを持つReactコンポーネントを提供する
5. The RAGシステム shall 月額コストが無料枠内（$0〜$5/月）に収まるよう設計する
6. Where Scrapboxページ数が5,000件未満の場合, the Vectorize shall 無料枠（5M stored dimensions）内で運用できる

---

### Requirement 4: CI/CD パイプライン

**Objective:** As a 開発者, I want mainブランチへのpushで自動デプロイされること, so that 現行のGitHub Actionsワークフローと同等の開発体験を維持できる

#### Acceptance Criteria
1. The GitHub Actions shall `pnpm lint && pnpm test:run && pnpm build` を実行してからCF Pagesへデプロイする
2. The GitHub Actions shall PRブランチに対してプレビューデプロイを生成する
3. If CIジョブが失敗した場合, the GitHub Actions shall デプロイをスキップする
4. The CI/CD shall Cloudflare APIトークンをGitHub Secretsで管理する

---

### Requirement 5: インデックス更新パイプライン

**Objective:** As a RAGシステム管理者, I want Scrapboxの更新がRAGに反映されること, so that 最新のコンテンツで回答が生成される

#### Acceptance Criteria
1. The indexer Worker shall Cron Triggers（週1回以上）でScrapboxから差分を取得してVectorizeを更新する
2. The indexer Worker shall 全件再インデックスと差分更新の両方をサポートする
3. If Scrapbox APIがエラーを返した場合, the indexer Worker shall エラーログを出力してリトライせず次回Cronを待つ

---

## 完了条件

以下がすべて完成した時点で移行完了とみなす：

1. CF Pagesでブログが公開されURLアクセスできる
2. 既存Scrapboxカード表示が動作する
3. RAG検索UIがブログ上で動作し、Scrapboxコンテンツに基づく回答が返る
4. GitHub Actions CI/CDが自動デプロイを実行する
5. Vectorize インデックスが最新Scrapboxデータで更新される
