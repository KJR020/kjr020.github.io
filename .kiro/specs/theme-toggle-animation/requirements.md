# Requirements Document

## Introduction
本仕様は、ブログのダークモード/ライトモード切り替え時に、月と太陽が入れ替わる演出アニメーションを追加する機能を定義する。v0で作成したNext.js用コンポーネントをベースに、Astro環境向けに移植・実装する。

## Requirements

### Requirement 1: テーマ切り替えトリガー
**Objective:** ユーザーとして、テーマ切り替えボタンをクリックしてダーク/ライトモードを切り替えたい。これにより、好みの表示モードでブログを閲覧できる。

#### Acceptance Criteria
1. When ユーザーがテーマ切り替えボタンをクリックする, the ThemeToggleコンポーネント shall 現在のテーマを反転させる（light→dark または dark→light）
2. While アニメーションが実行中, the ThemeToggleコンポーネント shall ボタンのクリックを無効化する
3. The ThemeToggleコンポーネント shall 選択されたテーマをlocalStorageに保存する

### Requirement 2: アイコン切り替えアニメーション（大）
**Objective:** ユーザーとして、テーマ切り替え時に画面中央で大きな月と太陽のアイコンが入れ替わるアニメーションを見たい。これにより、テーマ変更を視覚的に楽しめる。

#### Acceptance Criteria
1. When テーマがライトモードからダークモードに切り替わる, the ThemeToggleコンポーネント shall 画面中央で太陽アイコン（大）をカットアウト（右方向へスライドアウト）し、月アイコン（大）をカットイン（左方向からスライドイン）する
2. When テーマがダークモードからライトモードに切り替わる, the ThemeToggleコンポーネント shall 画面中央で月アイコン（大）をカットアウト（右方向へスライドアウト）し、太陽アイコン（大）をカットイン（左方向からスライドイン）する
3. The アニメーション shall 約1秒以内に完了する

### Requirement 3: アイコン切り替えアニメーション（小・ボタン内）
**Objective:** ユーザーとして、ボタン内のアイコンもテーマに合わせてアニメーションで切り替わるのを見たい。

#### Acceptance Criteria
1. When テーマがライトモードの場合, the ボタン内 shall 太陽アイコン（小）を表示する
2. When テーマがダークモードの場合, the ボタン内 shall 月アイコン（小）を表示する
3. When テーマが切り替わる, the ボタン内アイコン shall 縦方向にスライド（translate-y）してアニメーションする

### Requirement 4: 波エフェクト演出
**Objective:** ユーザーとして、テーマ切り替え時にボタンを中心に波のように広がるエフェクトを見たい。これにより、より印象的な切り替え体験ができる。

#### Acceptance Criteria
1. When テーマ切り替えが開始される, the ThemeToggleコンポーネント shall ボタン位置を中心に円形の波を画面全体に展開する
2. The 波 shall ダークモードへの切り替え時は暗い色（rgb(10,10,10)）、ライトモードへの切り替え時は明るい色（rgb(250,250,250)）で表示する
3. The 波 shall 約600msかけてscale(0)からscale(1)へ展開する
4. When アニメーションが完了する, the 波 shall フェードアウトして非表示になる
5. The 波オーバーレイ shall pointer-events: noneでユーザー操作を妨げない

### Requirement 5: フルスクリーンオーバーレイ演出
**Objective:** ユーザーとして、テーマ切り替え時に画面中央で大きなアイコンのアニメーションを見たい。これにより、より印象的な切り替え体験ができる。

#### Acceptance Criteria
1. When テーマ切り替えアニメーションが開始される, the ThemeToggleコンポーネント shall 画面全体にアイコン用オーバーレイを表示する
2. While オーバーレイが表示されている, the ThemeToggleコンポーネント shall 画面中央に大きな太陽/月アイコンのアニメーションを表示する
3. When アニメーションが完了する, the オーバーレイ shall フェードアウトして非表示になる
4. The オーバーレイ shall pointer-events: noneでユーザー操作を妨げない

### Requirement 6: 初期テーマ設定
**Objective:** ユーザーとして、ページ読み込み時に以前選択したテーマまたはOSの設定に基づいてテーマが適用されてほしい。これにより、一貫した表示体験ができる。

#### Acceptance Criteria
1. When ページが読み込まれる, the ThemeToggleコンポーネント shall localStorageに保存されたテーマを優先的に適用する
2. If localStorageにテーマが保存されていない, then the ThemeToggleコンポーネント shall OSのprefers-color-scheme設定に従ってテーマを適用する
3. The ThemeToggleコンポーネント shall SSRハイドレーションミスマッチを防ぐため、マウント後にテーマ状態を同期する

### Requirement 7: Astro環境への適合
**Objective:** 開発者として、Next.js用のコンポーネントをAstro環境で動作させたい。これにより、既存のブログ基盤との統合ができる。

#### Acceptance Criteria
1. The ThemeToggleコンポーネント shall Reactコンポーネントとして実装され、Astroの`client:load`ディレクティブで読み込まれる
2. The ThemeToggleコンポーネント shall 既存のThemeInit.astroと互換性を持ち、テーマ初期化ロジックと連携する
3. The オーバーレイ shall React Portalを使用してbody直下にレンダリングされ、Headerのスタッキングコンテキストの影響を受けない
4. The ThemeToggleコンポーネント shall 既存のTailwind CSSテーマカラー（--foreground等）を使用する

### Requirement 8: アクセシビリティ
**Objective:** ユーザーとして、スクリーンリーダーや支援技術を使用してもテーマ切り替え機能を利用したい。

#### Acceptance Criteria
1. The テーマ切り替えボタン shall 適切なaria-label属性を持つ（例：「テーマを切り替える」）
2. While アニメーション中, the ボタン shall disabled状態を示し、disabled:cursor-not-allowedスタイルを適用する
