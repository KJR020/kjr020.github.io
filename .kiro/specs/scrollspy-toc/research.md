# Research & Design Decisions

## Summary
- **Feature**: scrollspy-toc
- **Discovery Scope**: Extension（既存の記事ページへの機能追加）
- **Key Findings**:
  - Intersection Observer APIを使用したScrollSpy実装が最もパフォーマンス効率が良い
  - shadcn/uiのCollapsibleコンポーネントでモバイル用アコーディオンを実装
  - 見出しIDの自動生成はrehype-slugプラグインで対応可能（Astro標準）

## Research Log

### ScrollSpy実装アプローチ
- **Context**: スクロール位置に応じてアクティブな見出しをハイライトする方法
- **Sources Consulted**: MDN Intersection Observer API, React hooks patterns
- **Findings**:
  - `scroll`イベントリスナーは高頻度で発火しパフォーマンス問題を引き起こす
  - Intersection Observer APIはブラウザネイティブで効率的
  - `rootMargin`で検出位置を調整可能（ヘッダー高さ考慮）
- **Implications**: Intersection Observer + useStateでReactコンポーネントとして実装

### 見出しID生成
- **Context**: 目次リンクのアンカー先となる見出しIDの確保
- **Sources Consulted**: Astro documentation, rehype-slug
- **Findings**:
  - Astroはrehype-slugをデフォルトで使用し、見出しに自動的にIDを付与
  - 日本語見出しもslugifyされる（例: "はじめに" → "はじめに"）
  - 既存の記事で確認済み
- **Implications**: 追加設定不要、既存のID属性を使用可能

### モバイル用アコーディオン
- **Context**: lg未満の画面幅で折りたたみ可能な目次を表示
- **Sources Consulted**: shadcn/ui Collapsible, Radix UI
- **Findings**:
  - shadcn/uiのCollapsibleコンポーネントが最適
  - `@radix-ui/react-collapsible`に依存
  - アニメーションはTailwindのdata属性で制御
- **Implications**: Collapsibleコンポーネントの追加が必要

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Reactコンポーネント | 単一のReactコンポーネント | 状態管理が容易、既存パターンと一致 | ハイドレーションが必要 | 採用 |
| Astroコンポーネント + Vanilla JS | .astroファイルとインラインスクリプト | SSGフレンドリー | 状態管理が複雑 | 不採用 |
| Web Components | カスタム要素 | フレームワーク非依存 | 開発コストが高い | 不採用 |

## Design Decisions

### Decision: Intersection Observer APIの使用
- **Context**: スクロール位置に応じたアクティブ見出し検出
- **Alternatives Considered**:
  1. scrollイベント + getBoundingClientRect
  2. Intersection Observer API
- **Selected Approach**: Intersection Observer API
- **Rationale**: ブラウザネイティブでパフォーマンス最適化済み、デバウンス不要
- **Trade-offs**: IE非対応（対象外なので問題なし）
- **Follow-up**: rootMarginの調整でヘッダー高さを考慮

### Decision: Reactコンポーネントとして実装
- **Context**: Astroプロジェクト内でのコンポーネント設計
- **Alternatives Considered**:
  1. Astroコンポーネント + インラインスクリプト
  2. Reactコンポーネント
- **Selected Approach**: Reactコンポーネント + client:load
- **Rationale**: 既存パターン（Comments, ThemeToggle, ScrapboxCardList）と一致、状態管理が容易
- **Trade-offs**: JavaScript必須だが、目次はプログレッシブエンハンスメントの対象外
- **Follow-up**: なし

### Decision: shadcn/ui Collapsibleの使用
- **Context**: モバイル用折りたたみUI
- **Alternatives Considered**:
  1. 独自実装
  2. shadcn/ui Collapsible
  3. details/summary要素
- **Selected Approach**: shadcn/ui Collapsible
- **Rationale**: プロジェクトで既にshadcn/uiを使用、アクセシビリティ対応済み
- **Trade-offs**: 依存パッケージの追加（@radix-ui/react-collapsible）
- **Follow-up**: pnpm add @radix-ui/react-collapsible が必要

## Risks & Mitigations
- **見出しにIDがない記事** → rehype-slugで自動生成されるため問題なし
- **長い目次がスクロール領域を超える** → max-heightとoverflow-y: autoで対応
- **パフォーマンス（多数の見出し）** → Intersection Observerで最適化済み

## References
- [Intersection Observer API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [shadcn/ui Collapsible](https://ui.shadcn.com/docs/components/collapsible)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
