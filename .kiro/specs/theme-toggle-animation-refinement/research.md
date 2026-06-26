# Research & Design Decisions

## Table of Contents

| Section | What You'll Learn |
|---------|-------------------|
| [Summary](#summary) | 調査結果と採用方針の要点を確認する |
| [Research Log](#research-log) | 現行実装、Issue、候補技術の観察を整理する |
| [Architecture Pattern Evaluation](#architecture-pattern-evaluation) | 実装方式の候補とトレードオフを比較する |
| [Design Decisions](#design-decisions) | 今回の設計で採用する判断を記録する |
| [Risks & Mitigations](#risks--mitigations) | 実装時に注意すべきリスクと対策をまとめる |
| [References](#references) | 関連Issueと既存仕様への参照をまとめる |

## Summary

- **Feature**: `theme-toggle-animation-refinement`
- **Discovery Scope**: Extension
- **Key Findings**:
  - 既存の `ThemeToggleAnimated` はテーマ切替体験としては成立しているが、タイミング値がコンポーネント内に散在している。
  - Issue #23 の問題意識は「ライブラリ導入」そのものではなく、宣言的で調整しやすいモーション管理にある。
  - テーマ切替単体では外部依存を増やさず、定数化・タイマークリーンアップ・reduced motion対応で十分に改善できる。

## Research Log

### Existing ThemeToggleAnimated

- **Context**: 現在の実装と既存 spec の差分を確認した。
- **Sources Consulted**:
  - `src/components/ThemeToggleAnimated.tsx`
  - `.kiro/specs/theme-toggle-animation/design.md`
  - `kjr020-blog_20260418_testcases.csv`
- **Findings**:
  - 現行実装の主要タイミングは、テーマ反映 `300ms`、波フェード開始 `600ms`、完了 `900ms`、アイコン遷移 `300ms`。
  - `buttonRef` は定義されているが、波の起点計算には使われていない。
  - 現行実装はライト→ダークを右上、ダーク→ライトを左下起点にしている。一方、既存 spec はボタン中心起点を想定している。
  - `prefers-reduced-motion` に対する分岐はコンポーネント内にない。
  - テストケースは「波アニメーションが再生される」ことを期待しているが、大アイコン演出までは明示していない。
- **Implications**:
  - 改善対象は見た目の全面置換ではなく、現行演出の整理と操作待ち時間短縮が中心になる。
  - 既存 spec と実装のズレは、ボタン中心起点へ戻すことで整理できる。

### Issue #23

- **Context**: ユーザーが参照したIssueの内容を確認した。
- **Sources Consulted**:
  - GitHub Issue #23: `🔧 アニメーションライブラリの導入検討（framer-motion / react-spring）`
- **Findings**:
  - Issue本文では `setTimeout` によるフェーズ管理が調整しづらいことを課題としている。
  - 候補は Framer Motion、react-spring、CSS `@starting-style`。
  - 評価軸はバンドルサイズ、学習コスト、他アニメーションへの応用可能性、Astro + Reactとの相性。
- **Implications**:
  - ライブラリ導入は手段であり、今回の最小解は既存React/CSSでタイミング契約を明確にすること。
  - サイト全体へ広げる場合は Issue #33 の設計判断に委譲する。

### Browser Native Motion APIs

- **Context**: CSS/ブラウザAPIでテーマ切替を表現できるか確認した。
- **Sources Consulted**:
  - MDN: `Document.startViewTransition()`
  - MDN: `prefers-reduced-motion`
- **Findings**:
  - View Transition API は同一ドキュメント内の表示差分を自然に遷移できるが、未対応・スキップされる状況を考慮したフォールバックが必要。
  - `prefers-reduced-motion` はOS/ブラウザの動き軽減設定をCSS/JSから尊重するための標準的な入口になる。
- **Implications**:
  - View Transition API は将来の progressive enhancement 候補に留める。
  - reduced motion は今回の必須要件として扱う。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| A. 現行維持 + 微調整 | `setTimeout` とinline styleを残して値だけ調整 | 変更が最小 | Issue #23 の保守性課題が残る | 非推奨 |
| B. Framer Motion導入 | `motion.div` / `AnimatePresence` で宣言的に管理 | サイト全体に展開しやすい | テーマ切替単体には依存追加が重い | Issue #33 向き |
| C. react-spring導入 | 物理ベースで自然な波・アイコン遷移を作る | 表情のある動きに向く | 単純な時系列制御には過剰 | 今回は不採用 |
| D. CSS/React定数化 | React state + CSS transition + 集約定数で管理 | 依存追加なし、調整しやすい | 完全な宣言的制御ではない | 今回採用 |
| E. View Transition API | `document.startViewTransition` でテーマ差分を遷移 | ブラウザネイティブで自然 | フォールバックと互換性設計が必要 | 将来候補 |

## Design Decisions

### Decision: 外部ライブラリは今回導入しない

- **Context**: Issue #23 はFramer Motion/react-springの導入検討だが、今回の対象はテーマ切替単体。
- **Alternatives Considered**:
  1. Framer Motionを即導入する
  2. react-springを即導入する
  3. 既存React/CSSのまま設計を整理する
- **Selected Approach**: 既存React/CSSのまま、設定定数・フェーズ管理・reduced motion対応を整理する。
- **Rationale**: テーマ切替単体のためにバンドルを増やすより、Issue #33 のサイト全体モーション設計でまとめて判断する方が責務が明確。
- **Trade-offs**: ライブラリの宣言的APIは得られないが、今回の複雑度では定数化とクリーンアップで十分対応できる。
- **Follow-up**: Issue #33 の実装時に、共通モーション基盤へ移行する余地を残す。

### Decision: 主演出はボタン起点の波に絞る

- **Context**: 現行実装は波と全画面中央アイコンを併用しているが、ブログ閲覧中の操作としてはやや主張が強い。
- **Alternatives Considered**:
  1. 現行の大アイコン演出を維持する
  2. 大アイコンを廃止し、波とボタン内アイコンに絞る
  3. 大アイコンを低透明度の補助演出にする
- **Selected Approach**: 波とボタン内アイコンを主演出にし、大アイコンは必須要件から外す。
- **Rationale**: テストケースは波の存在を期待しており、大アイコンまでは要求していない。ブログの読書体験では短く静かなフィードバックの方が邪魔になりにくい。
- **Trade-offs**: 現行演出の派手さは下がるが、操作の軽さと読み物サイトとしての一貫性は上がる。
- **Follow-up**: 実装前レビューで大アイコンを完全削除するか、短時間の補助演出として残すか確認する。

### Decision: タイミング値をモーション契約として定義する

- **Context**: 現行実装は `300`, `600`, `900` のような値が処理内に直接書かれている。
- **Alternatives Considered**:
  1. CSS変数だけで管理する
  2. TypeScript定数だけで管理する
  3. TypeScript定数からstyleに注入し、JSタイマーとCSS transitionを同期する
- **Selected Approach**: TypeScriptの `THEME_TOGGLE_MOTION` 定数を基準にし、必要なCSS transitionへ同じ値を渡す。
- **Rationale**: テーマ反映タイミングと操作ロック解除はJS側の制御が必要なため、TypeScript定数を信頼源にするのが扱いやすい。
- **Trade-offs**: CSSだけで完結しないが、JSフェーズとのズレを減らせる。
- **Follow-up**: 実装時はタイマーIDを配列で保持し、unmount時にclearする。

## Risks & Mitigations

- 波起点を変更すると既存の見た目が変わる — 設計レビューで「ボタン起点」を明示承認する。
- reduced motion時の挙動がテストされない — PlaywrightまたはVitestで `matchMedia` の分岐を検証する。
- タイマー整理だけでは完全な宣言的実装にならない — Issue #33 で共通モーション基盤を検討する。
- テーマ切替時にGiscusやShikiとの同期が崩れる — `.dark` classと`localStorage.theme`の更新方式は変更しない。

## References

- [Issue #23: アニメーションライブラリの導入検討](https://github.com/KJR020/kjr020.github.io/issues/23)
- [Issue #33: Framer Motion導入提案](https://github.com/KJR020/kjr020.github.io/issues/33)
- `.kiro/specs/theme-toggle-animation/` — 初回実装時の仕様
- `src/components/ThemeToggleAnimated.tsx` — 現行実装
- `kjr020-blog_20260418_testcases.csv` — テーマ切替の手動テストケース
