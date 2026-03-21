# Requirements Document

## Introduction
GitHub Issue #13 で報告されたモバイル表示時のヘッダーレイアウト崩れを修正する。現状、ナビゲーションリンクが横一列に配置されており、モバイル画面幅ではコンテンツがはみ出してコンテナを押し広げている。レスポンシブ対応を実装し、全画面サイズで適切に表示されるようにする。

## Requirements

### Requirement 1: モバイルレスポンシブ対応
**Objective:** ユーザーとして、モバイル端末でもヘッダーが正しく表示されることで、サイトを快適に閲覧したい

#### Acceptance Criteria
1. When ビューポート幅が768px未満になる, the Header shall ナビゲーションメニューを非表示にしてハンバーガーメニューアイコンを表示する
2. When ユーザーがハンバーガーメニューをタップする, the Header shall ナビゲーションメニューを展開表示する
3. When ナビゲーションメニューが展開中にユーザーがリンクをタップする, the Header shall メニューを自動的に閉じる
4. While ナビゲーションメニューが展開中, the Header shall メニュー外をタップした場合にメニューを閉じる
5. The Header shall 全てのビューポート幅でコンテナ幅を超えないこと

### Requirement 2: デスクトップ表示の維持
**Objective:** ユーザーとして、デスクトップでは従来通りの水平ナビゲーションを利用したい

#### Acceptance Criteria
1. When ビューポート幅が768px以上になる, the Header shall ナビゲーションリンクを横一列で表示する
2. When ビューポート幅が768px以上になる, the Header shall ハンバーガーメニューアイコンを非表示にする
3. The Header shall デスクトップ表示時に既存のスタイル（sticky、backdrop-blur等）を維持する

### Requirement 3: アクセシビリティ
**Objective:** 全てのユーザーがヘッダーナビゲーションを利用できるようにする

#### Acceptance Criteria
1. The ハンバーガーメニューボタン shall 適切なaria-label属性を持つ
2. When メニューが展開/折りたたみされる, the ボタン shall aria-expanded属性を更新する
3. The モバイルナビゲーション shall キーボード操作（Tab、Escape）に対応する

### Requirement 4: パフォーマンス
**Objective:** メニューの開閉がスムーズに動作する

#### Acceptance Criteria
1. The メニュー開閉アニメーション shall 300ms以内に完了する
