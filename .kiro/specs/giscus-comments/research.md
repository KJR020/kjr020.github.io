# Research & Design Decisions

## Summary
- **Feature**: `giscus-comments`
- **Discovery Scope**: Extension（既存Astroブログへの機能追加）
- **Key Findings**:
  - Giscusは `@giscus/react` パッケージでReactコンポーネントとして利用可能
  - 既存の `ThemeToggle.tsx` がダークモード管理を担当、`document.documentElement.classList` で `.dark` クラスを切り替え
  - `MutationObserver` を使用してテーマ変更を検知し、Giscusの `setConfig` でテーマを動的に切り替え可能

## Research Log

### Giscus設定パラメータ
- **Context**: Giscus埋め込みに必要な設定オプションの調査
- **Sources Consulted**:
  - [giscus.app](https://giscus.app)
  - [How to integrate Giscus to your Astro Blog](https://www.maxpou.fr/blog/giscus-with-astro/)
  - [How to setup Giscus in your Astro website](https://daniel.es/blog/how-to-setup-giscus-in-astro/)
- **Findings**:
  - 必須パラメータ: `repo`, `repoId`, `category`, `categoryId`
  - マッピング方式: `pathname`（URLパス）、`url`、`title`、`og:title` から選択
  - テーマ: `preferred_color_scheme`, `light`, `dark`, `cobalt` など多数
  - 言語: 40言語以上対応（日本語は `ja`）
  - 遅延読み込み: `data-loading="lazy"` でサポート
- **Implications**: `pathname` マッピングがシンプルで管理しやすい。テーマは動的切り替え可能

### Astro統合方式
- **Context**: AstroでGiscusを埋め込む方法の調査
- **Sources Consulted**:
  - [Adding Giscus Discussions to Astro](https://dteather.com/blogs/adding-giscus-discussions-to-astro/)
  - [Using GitHub Discussions to host my Astro blog comments](https://www.thomasledoux.be/blog/hosting-blog-comments-reactions-github-discussions)
- **Findings**:
  - 方式A: `<script>` タグ直接埋め込み（シンプルだがページリロードが発生）
  - 方式B: `@giscus/react` Reactコンポーネント（リロードなしでスムーズ）
  - Astro指定: `client:only="react"` でクライアントサイドのみレンダリング
  - View Transitions対応: `astro:page-load` イベントでの再初期化が必要
- **Implications**: プロジェクトが既にReact（`@astrojs/react`）を使用しているため、`@giscus/react` が最適

### ダークモード連動
- **Context**: サイトテーマとGiscusテーマの同期方法
- **Sources Consulted**:
  - [How to integrate Github Discussion Comments to Astro Blog](https://blog.ailinklab.com/post/2025/2025-01-11/integrate-giscus-to-astro-blog/)
  - 既存コード: `src/components/ThemeToggle.tsx`
- **Findings**:
  - 既存実装: `localStorage.getItem("theme")` と `classList.toggle("dark")` でテーマ管理
  - Giscus連動: `MutationObserver` で `.dark` クラス変更を監視
  - API: `iframe.contentWindow.postMessage({ giscus: { setConfig: { theme } } })`
  - 代替案: Reactコンポーネントのpropsでtheme変更時に再レンダリング
- **Implications**: Reactコンポーネント使用時はstate経由でテーマを渡すのがシンプル

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Script Tag直接埋め込み | Astroページに`<script>`タグを追加 | シンプル、依存なし | ページリロード発生、テーマ連動が複雑 | 非推奨 |
| @giscus/react | Reactコンポーネントとして埋め込み | リロードなし、テーマ連動容易 | 追加依存パッケージ | **採用** |
| カスタムAstroコンポーネント | Astroコンポーネントで`<script>`をラップ | 依存なし | テーマ連動が複雑 | 検討対象外 |

## Design Decisions

### Decision: Reactコンポーネント方式の採用
- **Context**: Giscus埋め込み方式の選定
- **Alternatives Considered**:
  1. `<script>` タグ直接埋め込み — シンプルだがテーマ連動が困難
  2. `@giscus/react` パッケージ — テーマ連動が容易
- **Selected Approach**: `@giscus/react` パッケージを使用
- **Rationale**:
  - プロジェクトが既に `@astrojs/react` を導入済み
  - Reactコンポーネントでテーマstate管理が自然
  - GitHub認証時のページリロードが発生しない
- **Trade-offs**: 追加依存パッケージが必要（約50KB gzipped）
- **Follow-up**: パッケージバージョン互換性の確認

### Decision: pathnameマッピングの採用
- **Context**: ページとDiscussionの紐づけ方式
- **Alternatives Considered**:
  1. `pathname` — URLパスでマッピング
  2. `url` — 完全URLでマッピング
  3. `title` — ページタイトルでマッピング
- **Selected Approach**: `pathname` マッピング
- **Rationale**:
  - URLパスが変わらない限り同じDiscussionに紐づく
  - ドメイン変更時も継続性を保てる
  - タイトル変更の影響を受けない
- **Trade-offs**: パス変更時はDiscussionが新規作成される
- **Follow-up**: なし

## Risks & Mitigations
- **リスク1**: GitHub Discussionsが無効な場合にエラー → 事前セットアップ手順をドキュメント化
- **リスク2**: View Transitions時にGiscusが再レンダリングされない → `astro:page-load` イベントでの処理
- **リスク3**: テーマ切り替え時に一瞬フラッシュ → initialテーマをSSG時に正しく設定

## References
- [giscus.app](https://giscus.app) — 公式サイト、設定生成ツール
- [@giscus/react - npm](https://www.npmjs.com/package/@giscus/react) — Reactコンポーネントパッケージ
- [How to integrate Giscus to your Astro Blog](https://www.maxpou.fr/blog/giscus-with-astro/) — Astro統合ガイド
- [Using GitHub Discussions to host my Astro blog comments](https://www.thomasledoux.be/blog/hosting-blog-comments-reactions-github-discussions) — 実装例
