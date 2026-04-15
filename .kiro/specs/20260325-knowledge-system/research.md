# Research & Design Decisions

## Summary
- **Feature**: `20260325-knowledge-system`
- **Discovery Scope**: 参照フレームワーク調査 + Scrapboxデータ分析
- **Key Findings**:
  - 5つのフレームワーク（SWEBOK, roadmap.sh, Zettelkasten, Bloom's Taxonomy, T字型スキル）を組み合わせる戦略を採用
  - ZettelkastenとScrapboxは最も相性が良い（1ページ1アイデア、双方向リンク）
  - SWEBOK v4は18 Knowledge Areasで、SE分野の最上位分類として適切
  - Scrapboxは1,788ページ、87%が孤立ページ（被リンク0）→ タグベース分類が優先
  - 既存ハッシュタグ使用率26%、`#書籍`/`#料理`等のパターンあり
  - API制約: descriptions先頭5行のみ、1回100件上限 → ページネーション必須

## Research Log

### 参照フレームワークの調査と選定

#### 1. roadmap.sh — Backend Developer Roadmap
- **構造**: 約15大カテゴリ、2段階階層（大カテゴリ → 具体的技術/ツール）
- **カテゴリ例**: インターネット, プログラミング言語, データベース, API, キャッシング, メッセージブローカー, アーキテクチャパターン, テスト, CI/CD, Webセキュリティ
- **強み**: 実践的な技術スタックの全体像把握に最適。学習ロードマップとしてそのまま使える
- **限界**: 理論面（設計原則、プロセス、品質管理等）のカバーが薄い
- **知識管理での位置づけ**: SWEBOK各KA内の実践的サブカテゴリとして使用

#### 2. SWEBOK v4 (Software Engineering Body of Knowledge)
- **構造**: 18 Knowledge Areas、3段階階層（KA → トピック → サブトピック）
- **v4新規KA**: Software Architecture, Software Engineering Operations, Software Security
- **KA一覧**: Requirements, Architecture, Design, Construction, Testing, Operations, Maintenance, Configuration Management, Management, Process, Models & Methods, Quality, Security, Professional Practice, Economics, Computing/Math/Engineering Foundations
- **強み**: IEEE公認の包括的フレームワーク。理論から実践まで体系的
- **限界**: 学術的・包括的すぎて日常メモの分類には粒度が粗い場合がある
- **知識管理での位置づけ**: SE分野の最上位分類体系（WHAT）

#### 3. Zettelkasten メソッド
- **ノート種別**: Fleeting Notes（一時メモ）、Literature Notes（読書記録）、Permanent Notes（再構成済みアイデア）、Structure Notes（ハブ/目次）
- **原則**: 1ノート1アイデア（Atomicity）、リンクによる接続、Semi-lattice構造、リンクの文脈付け
- **Scrapboxとの相性**: **最も高い**。Scrapboxの`[リンク]`記法はZettelkasten用に設計されたかのよう。Zettelkastenフォーラムで1,200ノート超の実践例あり
- **知識管理での位置づけ**: Scrapbox運用の方法論（METHOD）

#### 4. Bloom's Taxonomy（改訂版 2001）
- **認知プロセス次元（6レベル）**: Remember → Understand → Apply → Analyze → Evaluate → Create
- **知識次元（4タイプ）**: Factual, Conceptual, Procedural, Metacognitive
- **活用法**: 各ノートに深さタグ（`[深さ/知っている]` `[深さ/使える]` 等）を付与して習熟度を可視化
- **知識管理での位置づけ**: 知識の深さ尺度（DEPTH）、オプションのメタデータ

#### 5. T字型スキルモデル
- **4形態**: I型（1専門）→ T型（広い基礎+1専門）→ Pi型（広い基礎+2専門）→ Comb型（広い基礎+3専門以上）
- **活用法**: 定期的な棚卸しで自分のスキルの形を把握
- **知識管理での位置づけ**: 成長戦略（STRATEGY）、カバレッジの解釈に使用

### 組み合わせ戦略

5つのフレームワークは異なる側面を扱うため、以下のように組み合わせる:

1. **SWEBOKの18KA** をScrapboxのHub Note / 参照フレームワークの最上位として配置
2. 各KA内に **roadmap.sh** ベースの具体的技術トピックを配置
3. 日常の学びは **Zettelkasten方式** でAtomic Noteとして蓄積し、リンクで接続
4. 各ノートに **Bloomレベル** のタグを付与して習熟度を追跡（オプション）
5. 定期的に **T字型** の観点で自分のスキルマップを棚卸し
6. まとまったテーマは **Astroブログ** の記事として蒸留・公開

### Sources
- [roadmap.sh Backend Developer Roadmap](https://roadmap.sh/backend)
- [SWEBOK v4 - IEEE Computer Society](https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4)
- [Introduction to the Zettelkasten Method](https://zettelkasten.de/introduction/)
- [Using Scrapbox as a Zettel Notes Archive](https://forum.zettelkasten.de/discussion/895/)
- [Bloom's Taxonomy Explained - Valamis](https://www.valamis.com/hub/blooms-taxonomy)
- [The 4 Shapes of Software Developers](https://thetshaped.dev/p/the-4-shapes-of-software-developers)

---

## Scrapboxデータ分析

### 基本統計

| 項目 | 値 |
|------|-----|
| **総ページ数** | 1,788 |
| **ピン留めページ** | 2（KJR020, スキルセット） |
| **description付きページ** | 約85% |
| **平均行数** | 12.0行/ページ |
| **タイトルのみ（1行）** | 約11% |
| **孤立ページ率（被リンク0）** | 87% |

### ドメイン分布（推定）

| ドメイン | 推定件数 | 主要トピック例 |
|----------|----------|---------------|
| AI/LLM/エージェント | 150-200件 | Claude Code, ADK, RAG, Gemini |
| Web技術/フロントエンド | 150-180件 | React, Next.js, Astro, TypeScript |
| インフラ/クラウド/DevOps | 120-150件 | GCP, AWS, Terraform, Docker |
| プログラミング言語/型理論 | 80-100件 | TypeScript, Python, Rust, 型システム |
| ソフトウェア設計/アーキテクチャ | 80-100件 | DDD, Clean Architecture, 設計パターン |
| セキュリティ | 40-50件 | SSRF, OWASP, CVE, 認証認可 |
| 書籍/読書メモ | 60-80件 | 技術書レビュー, 読書法 |
| 仕事術/メタ認知/思考法 | 50-70件 | 提案のレベル, ファシリテーション |
| データベース | 40-50件 | SQL, PostgreSQL, Redis |
| 料理 | 30-40件 | レシピ, グリルチキン, スープカレー |
| 絵本/文化 | 10-15件 | アフリカの絵本, ボローニャ国際児童図書展 |

### 既存タグ/リンクパターン

- **ハッシュタグ使用率**: 26%（`#書籍`, `#法律`, `#料理`, `#セキュリティ`, `#ClaudeCode` 等）
- **内部リンク使用率**: 16%
- **被リンクが多いページ**: データ指向アプリケーションデザイン(7), Claude Code(4), Agent Development Kit(4)
- **タグ記法**: 日本語/英語混在、スペースはアンダースコア`_`で代替

### 要件への影響

1. **体系タグ記法**: 既存の `#` ハッシュタグパターン（26%で使用済み）との整合性を考慮。`#domain/ai/agent` のようなハッシュタグ階層記法が最も自然な移行パス
2. **API取得戦略**: 1,788ページの全件取得には18リクエスト必要（limit=100）。ページネーション+キャッシュ戦略が必須。TanStack QueryのstaleTime 5分推奨
3. **知識グラフの実効性**: 87%が孤立ページのため、Phase 1のタグベースカバレッジが先に価値を出す。Phase 2のリンクグラフは体系タグの普及後に効果が出る
4. **descriptions制約**: Scrapbox APIのdescriptionsは先頭5行のみ → 体系タグはページ先頭に配置する運用ルールが必要（Req 12に反映）
5. **スタブページ**: タイトルのみ（1行）のページが11%存在。体系タグの対象外にするか判断が必要
