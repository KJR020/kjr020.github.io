# Research & Design Decisions

## Summary
- **Feature**: hugo-to-astro-migration
- **Discovery Scope**: New Feature（HugoからAstroへの完全移行）
- **Key Findings**:
  - Astro 5.0のContent Layer APIは高速でTOML frontmatterをサポート
  - `withastro/action@v5`による公式GitHub Pagesデプロイが推奨
  - Pagefindによるクライアントサイド検索が静的サイトに最適

## Research Log

### Astro 5.0 Content Collections API
- **Context**: 約45記事のMarkdownコンテンツを型安全に管理する方法の調査
- **Sources Consulted**:
  - [Content Collections - Astro Docs](https://docs.astro.build/en/guides/content-collections/)
  - [Astro 5.0 Release Blog](https://astro.build/blog/astro-5/)
- **Findings**:
  - Content Layer APIでMarkdown/MDX/YAML/TOML/JSONをサポート
  - Zodによるスキーマ定義で型安全性を確保
  - ビルド速度がMarkdownで最大5倍、MDXで2倍高速化
  - メモリ使用量が25-50%削減
  - `getCollection()`と`getEntry()`でクエリ
  - `src/content.config.ts`でコレクション定義
- **Implications**: TOML frontmatterのまま移行可能だが、YAML形式への統一を推奨

### Hugo to Astro Migration
- **Context**: 既存HugoブログからAstroへの移行パターン調査
- **Sources Consulted**:
  - [Migrating from Hugo - Astro Docs](https://docs.astro.build/en/guides/migrate-to-astro/from-hugo/)
  - [Chen Hui Jing - Migrating from Hugo to Astro](https://chenhuijing.com/blog/migrating-from-hugo-to-astro/)
  - [Elio Struyf - Migration Story](https://www.eliostruyf.com/migration-story-hugo-astro/)
- **Findings**:
  - AstroはYAMLとTOML frontmatterの両方をサポート
  - Hugo shortcodeはMDXのJSXコンポーネントに置換が必要
  - 移行期間は約3日が目安（経験者談）
  - frontmatter変換はスクリプトまたはAI支援が効果的
  - Go TemplatingからJSX-likeなAstro構文への変更
- **Implications**: TOML→YAML変換スクリプトを準備。shortcodeは使用していないためシンプルな移行が可能

### GitHub Pages Deployment
- **Context**: GitHub Actionsによる自動デプロイ設定
- **Sources Consulted**:
  - [Deploy to GitHub Pages - Astro Docs](https://docs.astro.build/en/guides/deploy/github/)
  - [withastro/action - GitHub](https://github.com/withastro/action)
- **Findings**:
  - `withastro/action@v5`が公式推奨
  - `actions/checkout@v6`と組み合わせて使用
  - Node.js 22がデフォルト
  - lockfileからパッケージマネージャを自動検出
  - `site`と`base`の設定が必要（カスタムドメインでない場合）
  - GitHub Settings → Pages → Source: GitHub Actions
- **Implications**: 既存のHugo用ワークフローを完全に置き換える

### React Integration
- **Context**: Reactコンポーネントの使用方法
- **Sources Consulted**:
  - [@astrojs/react - Astro Docs](https://docs.astro.build/en/guides/integrations-guide/react/)
  - [React Compiler Integration](https://syntackle.com/blog/integrating-react-compiler-with-astro/)
- **Findings**:
  - `@astrojs/react` v4.4.2が最新
  - `npx astro add react`で簡単セットアップ
  - Islands Architectureで必要な部分のみhydration
  - `client:load`, `client:idle`, `client:visible`ディレクティブ
  - React 19とReact Compilerに対応可能
- **Implications**: インタラクティブなコンポーネント（テーマ切り替え、検索UI）にReactを使用

### Search Implementation
- **Context**: 静的サイトでの検索機能実装
- **Sources Consulted**:
  - [Pagefind Setup Guide - Syntackle](https://syntackle.com/blog/pagefind-search-in-astro-site/)
  - [astro-pagefind - GitHub](https://github.com/shishkin/astro-pagefind)
- **Findings**:
  - Pagefindはビルド時にインデックス生成、クライアントサイドで検索
  - 検索インデックスはサイトと共にホスト
  - 入力開始時に必要なデータのみ読み込み（遅延ロード）
  - `data-pagefind-body`でインデックス対象を指定
  - `data-pagefind-ignore`で除外要素を指定
  - `astro-pagefind`でdev server時も検索可能
- **Implications**: Pagefind + astro-pagefindでHugoの検索機能を再現

### Mermaid Diagram Support
- **Context**: 既存記事のmermaid記法サポート
- **Sources Consulted**:
  - [Astro 5.5 Release](https://astro.build/blog/astro-550/)
  - [Mermaid Diagrams in Astro](https://dteather.com/blogs/astro-rehype-mermaid-cli/)
  - [Mermaid in Astro - realfiction](https://realfiction.net/posts/mermaid-in-astro/)
- **Findings**:
  - Astro 5.5で`excludeLangs`オプション追加
  - `rehype-mermaid`または`@beoe/rehype-mermaid`が選択肢
  - `rehype-mermaid-cli`がより安定（puppeteer使用）
  - Playwrightでビルド時にSVG生成
  - ダークモード対応は`@beoe/rehype-mermaid`が優秀
- **Implications**: `@beoe/rehype-mermaid`を採用（ダークモード対応、キャッシュ機能）

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Islands Architecture (Astro default) | 静的HTML + 部分的なJS hydration | パフォーマンス最適、必要な部分のみインタラクティブ | 複雑なステート管理には不向き | ブログに最適 |
| Full React SPA | 全体をReactで構築 | 豊富なエコシステム | 不要なJS、SEO複雑化 | 過剰 |
| Hybrid (SSG + SSR) | ページごとにSSG/SSR選択 | 柔軟性 | 複雑性増加 | 静的ブログには不要 |

**選択**: Islands Architecture（Astro default）

## Design Decisions

### Decision: Content Collections構成
- **Context**: 約45記事の効率的な管理と型安全性の確保
- **Alternatives Considered**:
  1. 単一コレクション - すべての記事を`posts`に
  2. カテゴリ別コレクション - Django, Vue, Generalなど個別に
- **Selected Approach**: 単一コレクション（`posts`）+ タグによる分類
- **Rationale**: 記事数が少なく、カテゴリ間の境界が曖昧。タグで柔軟に分類可能
- **Trade-offs**: コレクション別の型定義はできないが、シンプルさを優先
- **Follow-up**: 記事数増加時は再検討

### Decision: Frontmatter形式
- **Context**: 既存のTOML frontmatterをどう扱うか
- **Alternatives Considered**:
  1. TOML維持 - Astroがサポート
  2. YAML変換 - 業界標準、ツールサポート豊富
- **Selected Approach**: 移行時にYAML形式へ変換
- **Rationale**: YAMLの方がAstroエコシステムで一般的、エディタサポートも良好
- **Trade-offs**: 一括変換スクリプトが必要
- **Follow-up**: 変換スクリプトを移行タスクに含める

### Decision: 検索実装
- **Context**: 静的サイトでの全文検索機能
- **Alternatives Considered**:
  1. Pagefind - ビルド時インデックス
  2. Algolia - SaaS、無料枠あり
  3. Fuse.js - クライアントサイドのみ
- **Selected Approach**: Pagefind + astro-pagefind
- **Rationale**: 無料、サーバー不要、高速、Astroとの統合が良好
- **Trade-offs**: ビルド時間増加（軽微）
- **Follow-up**: インデックス対象の`data-pagefind-body`設定を確認

### Decision: テーマ・デザイン
- **Context**: PaperModテーマからの移行
- **Alternatives Considered**:
  1. 既存Astroテーマ使用 - Astro Blog Theme等
  2. カスタムビルド - Tailwind CSS使用
  3. 最小限のCSS - カスタムCSS
- **Selected Approach**: Tailwind CSS + shadcn/ui でカスタムビルド
- **Rationale**: shadcn/uiで高品質なUIコンポーネントを活用しつつ、柔軟にカスタマイズ可能
- **Trade-offs**: shadcn/uiの学習コストがあるが、再利用可能なコンポーネントで効率化
- **Follow-up**: PaperModの色・フォント設定を参考に

### Decision: UIコンポーネントライブラリ
- **Context**: インタラクティブなUIコンポーネントの実装方法
- **Alternatives Considered**:
  1. 自作コンポーネント - フルスクラッチ
  2. shadcn/ui - Radix UI + Tailwind CSS
  3. Chakra UI - CSS-in-JS
  4. Material UI - Googleデザインシステム
- **Selected Approach**: shadcn/ui
- **Rationale**:
  - Tailwind CSSとの親和性が高い
  - コンポーネントをコピーして所有できる（ロックインなし）
  - Astro公式ドキュメントでサポート
  - アクセシビリティ対応（Radix UI）
  - ダークモード対応が容易
- **Trade-offs**:
  - Astro Islands Architectureでは複合コンポーネント（Dialog等）を`.tsx`ファイルにまとめる必要あり
  - React contextが島間で共有されない制約あり
- **Follow-up**: Button, Card, Input, Badgeから開始し、必要に応じて追加

## Risks & Mitigations
- **日本語ファイル名の処理** - Astroは対応しているが、URLエンコーディングに注意。テストで確認
- **Mermaidビルド時間** - 多数のダイアグラムがあるとビルド遅延。キャッシュ機能で緩和
- **既存URL構造の変更** - リダイレクト設定または同一構造を維持
- **GitHub Pagesのbase設定** - `kjr020.github.io`はユーザーページなので`base`不要

## References
- [Astro Documentation](https://docs.astro.build/) - 公式ドキュメント
- [Content Collections Guide](https://docs.astro.build/en/guides/content-collections/) - コレクション設定
- [Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) - デプロイ設定
- [@astrojs/react](https://docs.astro.build/en/guides/integrations-guide/react/) - React統合
- [shadcn/ui for Astro](https://ui.shadcn.com/docs/installation/astro) - UIコンポーネント
- [Pagefind](https://pagefind.app/) - 検索ライブラリ
- [astro-pagefind](https://github.com/shishkin/astro-pagefind) - Astro統合
