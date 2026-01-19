# Implementation Plan

## Tasks

- [x] 1. ThemeToggleAnimatedコンポーネントの基本構造を実装する
- [x] 1.1 コンポーネントの状態管理とマウント処理を実装する
  - isDark, mounted, isAnimating, showWave, waveStyle, iconPhase の状態を定義
  - buttonRefを使用してボタン要素への参照を保持
  - useEffectでマウント完了を検知し、ThemeInit.astroで設定済みのテーマをDOMから読み取る
  - マウント前はプレースホルダーボタンを返してSSRハイドレーションミスマッチを防止
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 1.2 テーマ切り替えのコアロジックを実装する
  - toggleTheme関数でテーマの反転処理を実装（light↔dark）
  - document.documentElement.classListでdarkクラスを切り替え
  - localStorageにテーマを保存
  - isAnimating中はボタンクリックを無効化
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. トグルボタンとボタン内アイコンアニメーションを実装する
  - ボタン要素にref、onClick、disabled、aria-labelを設定
  - 太陽アイコン（小）と月アイコン（小）をボタン内に配置
  - テーマ状態に応じてtranslate-yでアイコンを縦方向にスライド
  - アニメーション中はdisabled:cursor-not-allowedスタイルを適用
  - _Requirements: 3.1, 3.2, 3.3, 8.1, 8.2_

- [x] 3. 波エフェクト演出を実装する
- [x] 3.1 波のサイズと位置の計算ロジックを実装する
  - buttonRefから現在のボタン位置を取得
  - ボタン中心から画面の対角線までの最大距離を計算
  - waveStyleに初期状態（scale(0)、ボタン中心位置）を設定
  - _Requirements: 4.1_

- [x] 3.2 波の展開アニメーションとオーバーレイを実装する
  - React Portalで波オーバーレイをbody直下にレンダリング（z-40）
  - requestAnimationFrameでscale(0)→scale(1)へのトランジションを開始
  - 600msのcubic-bezierイージングで滑らかに展開
  - テーマに応じた背景色を設定（rgb(10,10,10) / rgb(250,250,250)）
  - pointer-events: noneでユーザー操作を妨げない
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 4. フルスクリーンアイコンオーバーレイを実装する
- [x] 4.1 大きなアイコンのカットイン/カットアウトアニメーションを実装する
  - React Portalでアイコンオーバーレイをbody直下にレンダリング（z-50）
  - 太陽アイコン（大）と月アイコン（大）を画面中央に配置
  - iconPhaseに応じてtranslate-xでアイコンを横方向にスライド
  - exit時：現在のアイコンが右方向へスライドアウト
  - enter時：新しいアイコンが左方向からスライドイン
  - _Requirements: 2.1, 2.2, 5.1, 5.2_

- [x] 4.2 (P) オーバーレイのフェードアウト処理を実装する
  - アニメーション完了後にオーバーレイをフェードアウト
  - pointer-events: noneでユーザー操作を妨げない
  - _Requirements: 5.3, 5.4_

- [x] 5. アニメーションタイムラインを統合する
  - 0ms: isAnimating=true, iconPhase="exit", showWave=true, 波展開開始
  - 300ms: テーマ切り替え実行、iconPhase="enter"
  - 600ms: showWave=false
  - 900ms: isAnimating=false, iconPhase="idle"
  - setTimeoutを使用してタイミングを制御
  - 全アニメーションが約1秒以内に完了することを確認
  - _Requirements: 2.3_

- [x] 6. Header.astroとの統合
  - Header.astroのimport文をThemeToggleAnimatedに変更
  - client:loadディレクティブでReactコンポーネントをハイドレーション
  - 既存のThemeInit.astroとの互換性を確認
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 7. E2Eテストで動作を検証する
  - テーマ切り替えボタンのクリックでテーマが反転することを確認
  - ページリロード後もテーマが永続化されていることを確認
  - オーバーレイがヘッダーより前面に表示されることを確認
  - _Requirements: 1.1, 1.3, 7.3_

## Requirements Coverage

| 要件ID | タスク |
|--------|--------|
| 1.1, 1.2, 1.3 | 1.2, 7 |
| 2.1, 2.2, 2.3 | 4.1, 5 |
| 3.1, 3.2, 3.3 | 2 |
| 4.1, 4.2, 4.3, 4.4, 4.5 | 3.1, 3.2 |
| 5.1, 5.2, 5.3, 5.4 | 4.1, 4.2 |
| 6.1, 6.2, 6.3 | 1.1 |
| 7.1, 7.2, 7.3, 7.4 | 6, 7 |
| 8.1, 8.2 | 2 |
