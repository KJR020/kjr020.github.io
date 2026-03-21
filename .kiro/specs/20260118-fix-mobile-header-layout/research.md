# Research & Design Decisions

## Summary
- **Feature**: `fix-mobile-header-layout`
- **Discovery Scope**: Extension（既存Header.astroの拡張）
- **Key Findings**:
  - Tailwind CSS v4を使用、`md:`ブレークポイント（768px）が標準
  - 既存ThemeToggle.tsxがReact + client:loadで動作しており、同パターンを踏襲可能
  - Button UIコンポーネントが`ghost`バリアントと`icon`サイズを提供

## Research Log

### 既存アーキテクチャの確認
- **Context**: Header.astroの現在の実装を理解
- **Sources Consulted**: src/components/Header.astro, src/components/ThemeToggle.tsx
- **Findings**:
  - ナビゲーションは4項目（Home, Archive, Search, Scrapbox）
  - ThemeToggleはReactコンポーネント、`client:load`ディレクティブ使用
  - stickyヘッダー + backdrop-blur効果
  - navItemsは静的配列で管理
- **Implications**: モバイルメニューもReactコンポーネントとして実装し、同じパターンを維持

### Tailwind CSS設定
- **Context**: レスポンシブブレークポイントの確認
- **Sources Consulted**: src/styles/globals.css, src/components/Footer.astro
- **Findings**:
  - Tailwind v4（`@import "tailwindcss"`）
  - Footer.astroで`md:flex-row`使用（768pxブレークポイント）
  - カスタムブレークポイントなし、デフォルト使用
- **Implications**: 768px（md）をモバイル/デスクトップの境界として使用

### UIコンポーネントライブラリ
- **Context**: 既存UIパーツの確認
- **Sources Consulted**: src/components/ui/button.tsx
- **Findings**:
  - class-variance-authority + @radix-ui/react-slotベース
  - `ghost`バリアント、`icon`サイズが利用可能
  - アクセシビリティ対応済み（aria属性、focus-visible）
- **Implications**: ハンバーガーボタンはButtonコンポーネントを再利用

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| CSS Only | `hidden md:flex`でメニュー表示切替 | シンプル、JS不要 | メニュー開閉アニメーション困難 | JS無効時のフォールバックに適合 |
| React Component | MobileMenuコンポーネント新規作成 | 状態管理が容易、アニメーション実装可能 | バンドルサイズ微増 | ThemeToggleと同じパターン |
| Astro Island | Reactコンポーネント + client:load | SSRとハイドレーション両対応 | ハイドレーション前は動作しない | 推奨アプローチ |

## Design Decisions

### Decision: モバイルメニューのコンポーネント構成
- **Context**: レスポンシブナビゲーションの実装方法
- **Alternatives Considered**:
  1. Header.astro内にインラインで実装
  2. MobileMenu.tsxとして分離
- **Selected Approach**: MobileMenu.tsxとして分離し、Header.astroからインポート
- **Rationale**: ThemeToggleと同じパターンを維持、関心の分離
- **Trade-offs**: ファイル数は増えるが、テスタビリティと再利用性が向上
- **Follow-up**: E2Eテストでモバイル表示を検証

### Decision: メニュー展開時のUI配置
- **Context**: モバイルメニューの表示位置
- **Alternatives Considered**:
  1. ヘッダー下にドロップダウン
  2. フルスクリーンオーバーレイ
  3. サイドドロワー
- **Selected Approach**: ヘッダー下にドロップダウン（縦方向にナビリンク配置）
- **Rationale**: 4項目のみで画面を占有しすぎない、実装がシンプル
- **Trade-offs**: 将来ナビ項目が増えた場合は再検討が必要

## Risks & Mitigations
- **ハイドレーション遅延**: JS読み込み前はメニューが動作しない → CSS`hidden md:block`でデスクトップ表示を維持
- **メニュー外クリック検出**: useEffect + document.addEventListener → コンポーネントアンマウント時にクリーンアップ
- **アニメーションパフォーマンス**: transform/opacityのみ使用（layoutトリガー回避）

## References
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design) — ブレークポイント設定
- [Astro Islands](https://docs.astro.build/en/concepts/islands/) — client:load動作
- [ARIA Practices - Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) — アクセシビリティパターン
