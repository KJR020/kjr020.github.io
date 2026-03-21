# Implementation Plan

## Tasks

- [x] 1. テーマ初期化コンポーネントの作成
- [x] 1.1 ThemeInit.astroコンポーネントを作成する
  - localStorageからテーマ設定を読み取る処理を実装
  - localStorageに値がない場合は`prefers-color-scheme`メディアクエリでシステム設定を取得
  - 取得したテーマに基づいて`<html>`要素に`.dark`クラスを適用または除去
  - localStorageアクセスエラー時のtry-catchによるフォールバック処理を追加
  - `is:inline`ディレクティブを使用してスクリプトがバンドルされないようにする
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 4.1, 4.2_

- [x] 1.2 BaseHead.astroにThemeInit.astroを統合する
  - ThemeInit.astroをインポートし、`<head>`セクションの最上部に配置
  - CSSより先にテーマ初期化スクリプトが実行されることを確認
  - _Requirements: 1.3, 4.3_

- [x] 2. ThemeToggleコンポーネントの同期対応
- [x] 2.1 ThemeToggle.tsxの初期化ロジックを調整する
  - マウント時に`document.documentElement.classList.contains("dark")`でDOM状態を読み取る
  - DOM状態をReactの初期状態として使用し、ハイドレーション時の不整合を防止
  - 既存のテーマ切り替え機能（クリック時の切り替え、localStorage保存）は維持
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. 動作確認と検証
- [x] 3.1 FOUC解消の確認テストを実施する
  - ダークモードを選択してページをリロードし、フラッシュが発生しないことを確認
  - ライトモードを選択してページをリロードし、正常に表示されることを確認
  - localStorageをクリアした状態でシステム設定に従ってテーマが適用されることを確認
  - テーマ切り替えボタンが正常に動作し、設定がリロード後も維持されることを確認
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.3_
