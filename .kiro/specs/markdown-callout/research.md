# Research & Design Decisions

## Summary
- **Feature**: `markdown-callout`
- **Discovery Scope**: Extension（既存Astroプロジェクトへのremarkプラグイン追加）
- **Key Findings**:
  - @r4ai/remark-callout v0.6.2がObsidian/GitHub風コールアウト記法をサポート
  - 出力HTMLはdata属性ベース（`data-callout`, `data-callout-type`, `data-callout-title`, `data-callout-body`）
  - 既存のglobals.cssにCSS変数ベースのダークモード対応が実装済み

## Research Log

### @r4ai/remark-calloutプラグイン調査
- **Context**: Obsidian/GitHub風の`> [!type]`記法をAstroで使用するためのプラグイン選定
- **Sources Consulted**:
  - [GitHub - r4ai/remark-callout](https://github.com/r4ai/remark-callout)
  - [公式ドキュメント](https://r4ai.github.io/remark-callout/)
  - [API Reference](https://r4ai.github.io/remark-callout/docs/en/api-reference/type-aliases/options/)
- **Findings**:
  - 最新バージョン: 0.6.2
  - 週間ダウンロード数: 約5,000（安定した利用実績）
  - MITライセンス
  - Astro公式ドキュメントでも推奨されているプラグイン
- **Implications**: Astroのmarkdown.remarkPluginsに直接追加可能、MDX不要

### 出力HTML構造
- **Context**: CSSスタイリングのためにHTML出力構造を把握
- **Sources Consulted**: 公式ドキュメント、GitHubリポジトリ
- **Findings**:
  ```html
  <!-- 通常のコールアウト -->
  <div data-callout data-callout-type="note">
    <div data-callout-title>Note</div>
    <div data-callout-body>コンテンツ</div>
  </div>

  <!-- 折りたたみ可能なコールアウト -->
  <details data-callout data-callout-type="warning">
    <summary data-callout-title>Warning</summary>
    <div data-callout-body>コンテンツ</div>
  </details>
  ```
- **Implications**: data属性セレクタでスタイリング、タイプごとに`data-callout-type`で色分け可能

### 既存プロジェクト構成分析
- **Context**: 統合に必要な既存ファイルと設定の把握
- **Sources Consulted**: プロジェクト内ファイル
- **Findings**:
  - `astro.config.mjs`: remarkPlugins配列に追加（既存: remarkLinkCard）
  - `src/styles/globals.css`: CSS変数ベースのダークモード対応済み
  - パッケージマネージャー: pnpm
  - Tailwind CSS v4使用（@tailwindcss/vite経由）
  - 既存のCSS変数: `--background`, `--foreground`, `--border`, `--destructive`等
- **Implications**: 既存のCSS変数とダークモードパターンを活用可能

### コールアウトタイプと配色設計
- **Context**: 4種類のコールアウト（note/tip/warning/danger）の視覚的区別
- **Sources Consulted**: Obsidian公式、GitHub Markdown仕様、WCAG 2.1
- **Findings**:
  - note: 青系（情報提供）
  - tip: 緑系（推奨事項）
  - warning: 黄/オレンジ系（注意喚起）
  - danger: 赤系（重要警告）
- **Implications**: 既存のCSS変数`--destructive`を活用可能、その他は新規CSS変数を定義

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| globals.cssに直接追加 | 既存のグローバルCSSにコールアウトスタイルを追加 | シンプル、既存パターンに沿う | ファイルサイズ増加 | 推奨：既存のremark-link-cardスタイルと同様のパターン |
| 別ファイルに分離 | callout.cssを新規作成しimport | 関心の分離 | import追加が必要 | 将来的に検討可能 |

## Design Decisions

### Decision: globals.cssへのスタイル追加
- **Context**: コールアウト用CSSの配置場所
- **Alternatives Considered**:
  1. globals.cssに追加 — 既存パターンと一貫性
  2. 別ファイル（callout.css）に分離 — モジュール化
- **Selected Approach**: globals.cssに追加
- **Rationale**: 既存のremark-link-cardスタイルと同様のパターンを踏襲し、一貫性を維持
- **Trade-offs**: ファイルサイズは増加するが、管理の簡易性を優先
- **Follow-up**: スタイルが大きくなった場合は分離を検討

### Decision: CSS変数によるカラー定義
- **Context**: ライトモード/ダークモード両対応のカラー管理
- **Alternatives Considered**:
  1. 直接カラー値を指定
  2. CSS変数を新規定義
- **Selected Approach**: CSS変数を新規定義（`--callout-note-*`等）
- **Rationale**: 既存のダークモード切り替え機構（`.dark`クラス）と統合可能
- **Trade-offs**: CSS変数が増えるが、メンテナンス性向上
- **Follow-up**: なし

## Risks & Mitigations
- **通常blockquoteとの競合** — `> [!type]`記法のみ変換されるため、通常の`>`は影響なし（プラグイン仕様）
- **既存記事への影響** — コールアウト記法を含まない記事は変更なし
- **プラグインのメンテナンス状況** — 最終更新が約1年前だが、安定版として利用実績あり

## References
- [@r4ai/remark-callout GitHub](https://github.com/r4ai/remark-callout) — プラグイン公式リポジトリ
- [@r4ai/remark-callout Docs](https://r4ai.github.io/remark-callout/) — 公式ドキュメント
- [Obsidian Callouts](https://help.obsidian.md/Editing+and+formatting/Callouts) — 記法の元となるObsidian仕様
- [WCAG 2.1 Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) — アクセシビリティ基準
