# Requirements Document

## Table of Contents

| Section | What You'll Learn |
|---------|-------------------|
| [Introduction](#introduction) | テーマ切替アニメーション改善の目的とIssue #23との関係を整理する |
| [Requirement 1: 視覚体験の維持と整理](#requirement-1-視覚体験の維持と整理) | 波演出を残しつつ過剰な画面演出を抑える |
| [Requirement 2: タイミング設定の保守性](#requirement-2-タイミング設定の保守性) | ハードコードされたタイマーを調整可能な契約へ移す |
| [Requirement 3: アクセシビリティと操作安全性](#requirement-3-アクセシビリティと操作安全性) | reduced motion、連打、支援技術への配慮を定義する |
| [Requirement 4: 既存テーマ機構との互換性](#requirement-4-既存テーマ機構との互換性) | ThemeInit、localStorage、Giscus、Shikiとの連携を保つ |
| [Requirement 5: 外部アニメーションライブラリ判断](#requirement-5-外部アニメーションライブラリ判断) | Framer Motion等を今回導入するかの判断基準を定義する |

## Introduction

本仕様は、既存の `ThemeToggleAnimated` のアニメーション設定を再設計する。Issue #23 で指摘されている「`setTimeout` によるフェーズ管理」「タイミング値のハードコード」「キャンセル・中断処理の複雑さ」を解消しつつ、既存テストケースで期待されている波アニメーションを維持する。

対象はテーマ切替ボタン単体の改善であり、サイト全体のモーションシステム導入は Issue #33 のスコープに分離する。

## Requirements

### Requirement 1: 視覚体験の維持と整理

**Objective:** As a ブログ読者, I want テーマ切替時に自然で短い視覚フィードバックを得たい, so that 表示モードの変更を迷わず認識できる

#### Acceptance Criteria
1. When ユーザーがテーマ切替ボタンをクリックする, the ThemeToggleAnimated component shall 波アニメーションを表示してテーマ変更を視覚的に示す
2. When 波アニメーションが開始される, the ThemeToggleAnimated component shall トグルボタンの中心を起点として円形波を展開する
3. When テーマが切り替わる, the ThemeToggleAnimated component shall ボタン内アイコンを切替先テーマに合わせて短く遷移させる
4. The ThemeToggleAnimated component shall 全画面中央の大アイコン演出を必須要件にせず、波とボタン内アイコンを主演出として扱う
5. The animation shall 通常環境でクリックから800ms以内に完了し、操作待ち時間を長引かせない

### Requirement 2: タイミング設定の保守性

**Objective:** As a 開発者, I want アニメーションの時間・イージング・フェーズを一箇所で調整したい, so that UI調整時の意図しないズレを防げる

#### Acceptance Criteria
1. The ThemeToggleAnimated component shall duration、delay、easing を単一の設定オブジェクトまたは近接した定数に集約する
2. The ThemeToggleAnimated component shall `setTimeout` の数値リテラルを直接散在させない
3. When アニメーション設定を変更する, the developer shall 波展開、テーマ反映、フェード、操作ロック解除の相対関係を同じ場所で確認できる
4. The implementation shall アンマウント時または再実行時に未完了タイマーをクリーンアップできる
5. The implementation shall `buttonRef` など未使用の状態・参照を残さない

### Requirement 3: アクセシビリティと操作安全性

**Objective:** As a 動きに敏感なユーザー, I want OSの視差効果軽減設定が尊重される, so that テーマ切替を不快なく利用できる

#### Acceptance Criteria
1. While `prefers-reduced-motion: reduce` が有効, the ThemeToggleAnimated component shall 全画面波や大きな移動演出をスキップする
2. While `prefers-reduced-motion: reduce` が有効, the ThemeToggleAnimated component shall テーマ変更とlocalStorage保存を即時実行する
3. While アニメーション中, the ThemeToggleAnimated component shall 追加クリックを無視またはボタンをdisabledにして二重実行を防ぐ
4. The ThemeToggleAnimated component shall `aria-label` で現在の操作意図を示す
5. The overlays shall `pointer-events: none` を維持し、ページ操作やフォーカス移動を妨げない

### Requirement 4: 既存テーマ機構との互換性

**Objective:** As a 開発者, I want 既存のテーマ初期化と周辺機能を壊さずに改善したい, so that FOUC対策やコメント・コード表示との連携を維持できる

#### Acceptance Criteria
1. The ThemeToggleAnimated component shall `ThemeInit.astro` が設定した `document.documentElement.classList` を初期状態の信頼源として使う
2. When テーマが切り替わる, the ThemeToggleAnimated component shall `document.documentElement.classList` と `localStorage.theme` を既存形式で更新する
3. When `.dark` class が変更される, the existing Giscus and Shiki integrations shall 現行のMutationObserver/CSS変数連動で追従できる
4. The visual styling shall 既存のCSS変数（`--background`, `--foreground` 等）とTailwindユーティリティを優先して使用する
5. The implementation shall SSRハイドレーションミスマッチ対策を維持する

### Requirement 5: 外部アニメーションライブラリ判断

**Objective:** As a 開発者, I want Framer Motion等を入れるか明確な基準で判断したい, so that テーマ切替単体のために不要な依存を増やさない

#### Acceptance Criteria
1. The design shall Framer Motion、react-spring、CSS/WAAPI、View Transition API の候補を比較する
2. If 外部ライブラリを導入する, then the design shall テーマ切替以外への再利用先とバンドル増分の許容理由を示す
3. If 外部ライブラリを導入しない, then the implementation shall 現行React/CSSだけで保守性課題を解消する
4. The design shall サイト全体のマイクロインタラクション導入判断を Issue #33 に分離する
