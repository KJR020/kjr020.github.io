# Research & Design Decisions

## Summary
- **Feature**: `dark-mode-flash-fix`
- **Discovery Scope**: Extension（既存テーマ切り替え機能の拡張）
- **Key Findings**:
  - Astroの`is:inline`ディレクティブを使用することでスクリプトが外部ファイルにバンドルされず、即座に実行される
  - `<head>`内の早期段階でテーマクラスを適用することでFOUCを防止できる
  - 既存のThemeToggleコンポーネントとの同期にはlocalStorageのキー名を統一する必要がある

## Research Log

### Astro FOUC防止パターン
- **Context**: ダークモードリロード時のフラッシュを防ぐ最適なAstroパターンを調査
- **Sources Consulted**:
  - [astro-fouc-killer](https://github.com/AVGVSTVS96/astro-fouc-killer)
  - [Get Rid of Theme Flicker](https://scottwillsey.com/theme-flicker/)
  - [Dark theme without the flickers](https://vinh.dev/writing/dark-theme-without-flickers)
- **Findings**:
  - `is:inline`ディレクティブを使用するとAstroがスクリプトをバンドルせず、インラインで残す
  - スクリプトを`<head>`内に配置することでCSSより先に実行される
  - `document.documentElement.classList`を操作してテーマクラスを適用
  - localStorageとprefers-color-schemeの2段階フォールバックが標準パターン
- **Implications**: BaseHead.astroまたはBaseLayout.astroに初期化スクリプトを追加する設計

### 既存実装の分析
- **Context**: 現在のテーマ実装との統合ポイントを特定
- **Sources Consulted**:
  - `src/components/ThemeToggle.tsx`
  - `src/styles/globals.css`
  - `src/layouts/BaseLayout.astro`
- **Findings**:
  - ThemeToggleはReactコンポーネントでuseEffectでテーマを初期化（ハイドレーション後）
  - `.dark`クラスを`<html>`要素に適用
  - localStorageキーは`"theme"`、値は`"light"`または`"dark"`
  - CSS変数は`:root`と`.dark`セレクタで定義済み
- **Implications**: 初期化スクリプトは既存のlocalStorageキー・値・クラス名を使用する必要がある

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| インラインスクリプト（採用） | `is:inline`で`<head>`内にスクリプト配置 | 外部依存なし、最速の初期化、既存パターンと整合 | スクリプト重複の可能性 | Astro公式推奨パターン |
| astro-fouc-killerパッケージ | サードパーティインテグレーション | 設定が簡単 | 外部依存、カスタマイズ性低 | 要件4.2に反する |
| CSSのみ（prefers-color-scheme） | メディアクエリのみで対応 | JavaScript不要 | localStorage優先設定が反映されない | 要件2を満たさない |

## Design Decisions

### Decision: インラインスクリプトによる早期テーマ適用
- **Context**: ページ読み込み時にCSSより先にテーマを適用する必要がある
- **Alternatives Considered**:
  1. astro-fouc-killerパッケージ — 外部依存が増える
  2. ThemeToggleコンポーネントの修正のみ — ハイドレーション後の実行では遅い
- **Selected Approach**: `BaseHead.astro`に`is:inline`スクリプトを追加し、localStorageとprefers-color-schemeを確認してテーマクラスを適用
- **Rationale**:
  - 外部依存なし（要件4.2）
  - 最小限のコード（要件4.1）
  - 既存のThemeToggleとの互換性維持（要件3）
- **Trade-offs**: スクリプトがページごとにインライン化されるが、サイズは最小限（<500バイト）
- **Follow-up**: ThemeToggleの初期状態がスクリプトと同期していることを確認

### Decision: ThemeToggleコンポーネントの同期
- **Context**: 初期化スクリプトとReactコンポーネントの状態を一致させる必要がある
- **Alternatives Considered**:
  1. ThemeToggle内でDOM状態を読み取る — 追加の同期処理が必要
  2. 共通のlocalStorageキーを使用 — シンプルで既存実装と互換
- **Selected Approach**: ThemeToggleはマウント時にlocalStorageから状態を読み取り、DOMの`.dark`クラスと同期
- **Rationale**: 既存のコード変更を最小限に抑えられる
- **Trade-offs**: 二重読み取りが発生するが、パフォーマンス影響は無視できる
- **Follow-up**: ThemeToggleの初期化ロジックを確認し、必要に応じてDOMからの読み取りを追加

## Risks & Mitigations
- **Risk**: 初期化スクリプトとThemeToggleの状態不整合 — Mitigation: 両方が同じlocalStorageキー（`"theme"`）を使用し、同じクラス名（`.dark`）を操作
- **Risk**: View Transitions使用時のFOUC再発 — Mitigation: `astro:after-swap`イベントリスナーを追加
- **Risk**: スクリプトエラー時のフォールバック — Mitigation: システム設定（prefers-color-scheme）をデフォルトとして使用

## References
- [astro-fouc-killer](https://github.com/AVGVSTVS96/astro-fouc-killer) — Astro向けFOUC防止パッケージの実装パターン
- [Get Rid of Theme Flicker](https://scottwillsey.com/theme-flicker/) — インラインスクリプトによるテーマフリッカー防止
- [Dark theme without the flickers](https://vinh.dev/writing/dark-theme-without-flickers) — タイミング問題の解説
