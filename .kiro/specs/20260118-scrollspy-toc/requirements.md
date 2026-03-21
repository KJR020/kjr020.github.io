# Requirements Document

## Introduction

記事ページにScrollSpy機能を備えた目次（Table of Contents）を表示する機能を追加する。記事内の見出し（h2, h3）を自動的に抽出し、現在のスクロール位置に応じてアクティブな見出しをハイライト表示する。

## Project Description (Input)
記事ページに、ScrollSpyの目次を表示したい

## Design Decisions
- **モバイル表示**: 記事上部に折りたたみ可能なアコーディオン形式で表示
- **見出しレベル**: h2 + h3（階層構造を維持）
- **URLハッシュ**: クリック時のみ更新（スクロールでは更新しない）

## Requirements

### Requirement 1: 目次の自動生成

**Objective:** 読者として、記事の構造を一目で把握したい。そのために記事内の見出しから目次を自動生成する。

#### Acceptance Criteria
1. When 記事ページが読み込まれた時, the TableOfContents shall 記事内のh2およびh3要素を抽出して目次を生成する
2. The TableOfContents shall 見出しの階層構造を維持して表示する（h3はh2の下にインデント）
3. When 記事に見出しが存在しない時, the TableOfContents shall 目次を表示しない
4. The TableOfContents shall 各目次項目をクリック可能なリンクとして表示する

### Requirement 2: ScrollSpy機能

**Objective:** 読者として、現在読んでいる箇所を目次上で把握したい。そのためにスクロール位置に応じて目次のアクティブ項目をハイライトする。

#### Acceptance Criteria
1. While ユーザーがページをスクロールしている間, the TableOfContents shall 現在のビューポート内の見出しに対応する目次項目をハイライト表示する
2. When ユーザーがスクロールして異なる見出しセクションに入った時, the TableOfContents shall ハイライト表示を新しいアクティブな見出しに移動する
3. The TableOfContents shall スクロールイベントをデバウンス/スロットルしてパフォーマンスを最適化する
4. When 複数の見出しがビューポート内に存在する時, the TableOfContents shall 最も上部に近い見出しをアクティブとして表示する

### Requirement 3: 目次クリックによるナビゲーション

**Objective:** 読者として、目次から特定のセクションに素早く移動したい。そのために目次項目クリックでスムーズにスクロールする。

#### Acceptance Criteria
1. When ユーザーが目次項目をクリックした時, the TableOfContents shall 対応する見出しまでスムーズにスクロールする
2. When スクロールが完了した時, the TableOfContents shall クリックされた項目をアクティブ状態にする
3. When ユーザーが目次項目をクリックした時, the TableOfContents shall スクロール先のURLハッシュを更新する

### Requirement 4: レスポンシブ対応とレイアウト

**Objective:** 読者として、様々なデバイスで快適に目次を利用したい。そのためにレスポンシブなレイアウトを提供する。

#### Acceptance Criteria
1. While デスクトップ表示（lg以上）の場合, the TableOfContents shall 記事の右側にスティッキー（固定位置）で表示する
2. While モバイル/タブレット表示（lg未満）の場合, the TableOfContents shall 記事上部に折りたたみ可能なアコーディオン形式で表示する
3. The TableOfContents shall ダークモード/ライトモードの両方に対応したスタイルを適用する
4. While スクロール中でも, the TableOfContents shall デスクトップ表示時に常に画面内に表示され続ける
5. When モバイルでアコーディオンを開閉した時, the TableOfContents shall スムーズなアニメーションで展開/折りたたみする

### Requirement 5: アクセシビリティ

**Objective:** すべてのユーザーが目次を利用できるようにしたい。そのためにアクセシビリティ要件を満たす。

#### Acceptance Criteria
1. The TableOfContents shall 適切なARIA属性（nav, aria-label）を持つ
2. The TableOfContents shall キーボードナビゲーションに対応する
3. The TableOfContents shall アクティブ状態をスクリーンリーダーに通知する（aria-current）
4. The TableOfContents shall モバイルのアコーディオンにaria-expanded属性を持つ

### Requirement 6: アバターアイコン表示

**Objective:** 読者として、現在読んでいるセクションを視覚的にわかりやすく把握したい。そのためにアクティブな目次項目の横にアバターアイコンを表示する。

#### Acceptance Criteria
1. While 目次項目がアクティブ状態の時, the TableOfContents shall アクティブな項目の左側にアバターアイコンを表示する
2. The TableOfContents shall アバター画像をpublic/ディレクトリの静的画像から読み込む
3. When アクティブな項目が変更された時, the TableOfContents shall アバターアイコンを新しいアクティブ項目に移動する
4. The TableOfContents shall アバターアイコンの移動をスムーズなアニメーションで表示する
