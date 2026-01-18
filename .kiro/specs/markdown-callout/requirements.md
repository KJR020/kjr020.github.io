# Requirements Document

## Introduction
本仕様書は、Astroブログの記事ページにおいてコールアウト（note/tip/warning/danger等）をMarkdown記法で使用可能にするための要件を定義する。`@r4ai/remark-callout`プラグインを使用し、Obsidian/GitHub風の`> [!type]`記法をHTMLに変換し、CSSでスタイリングする。既存の.mdファイル形式を維持しつつ、視覚的に区別可能なコールアウト表示を実現する。

## Requirements

### Requirement 1: コールアウト記法の変換
**Objective:** As a ブログ執筆者, I want Markdown記事内で`> [!type]`形式のコールアウト記法を使用できる, so that 読者に重要な情報を視覚的に強調して伝えられる

#### Acceptance Criteria
1. When 記事内に`> [!note]`記法が記述されている, the Markdownパーサー shall コールアウト用のHTML要素に変換する
2. When 記事内に`> [!tip]`記法が記述されている, the Markdownパーサー shall コールアウト用のHTML要素に変換する
3. When 記事内に`> [!warning]`記法が記述されている, the Markdownパーサー shall コールアウト用のHTML要素に変換する
4. When 記事内に`> [!danger]`記法が記述されている, the Markdownパーサー shall コールアウト用のHTML要素に変換する
5. When コールアウトにカスタムタイトルが指定されている, the Markdownパーサー shall 指定されたタイトルをHTML要素に含める
6. When コールアウトにタイトルが指定されていない, the Markdownパーサー shall デフォルトのタイプ名（Note/Tip/Warning/Danger）をタイトルとして表示する

### Requirement 2: コールアウト内コンテンツの対応
**Objective:** As a ブログ執筆者, I want コールアウト内で複数段落やリスト、コードブロックを使用できる, so that 複雑な情報も構造化して伝えられる

#### Acceptance Criteria
1. When コールアウト内に複数段落（空行を含む）が記述されている, the Markdownパーサー shall 全ての段落を正しくHTML変換する
2. When コールアウト内にリスト（箇条書き・番号付き）が記述されている, the Markdownパーサー shall リストを正しくHTML変換する
3. When コールアウト内にコードブロックが記述されている, the Markdownパーサー shall コードブロックを正しくHTML変換する
4. When コールアウト内にインラインコードが記述されている, the Markdownパーサー shall インラインコードを正しくHTML変換する

### Requirement 3: スタイリング
**Objective:** As a ブログ読者, I want コールアウトが視覚的に区別できる, so that 情報の種類（note/tip/warning/danger）を瞬時に認識できる

#### Acceptance Criteria
1. The ブログシステム shall コールアウト要素に余白・背景色・左ボーダーを適用する
2. The ブログシステム shall コールアウトタイプごとに異なる配色（背景色・ボーダー色）を適用する
3. The ブログシステム shall コールアウトのタイトル行と本文を視覚的に区別する
4. Where ダークモードが有効, the ブログシステム shall ダークモード用の配色を適用する
5. While ダークモードが有効, the ブログシステム shall 十分なコントラスト比を維持する

### Requirement 4: アクセシビリティ
**Objective:** As a スクリーンリーダー利用者, I want コールアウトの種別がテキストとして伝わる, so that 視覚に頼らず情報の重要度を理解できる

#### Acceptance Criteria
1. The ブログシステム shall コールアウトのタイトル行にタイプを示すテキスト（Note/Tip/Warning/Danger）を表示する
2. The ブログシステム shall warning/dangerコールアウトに十分なコントラスト比（WCAG AA基準）を確保する
3. The ブログシステム shall コールアウト内のテキストが読みやすいフォントサイズを維持する

### Requirement 5: 既存コンテンツとの互換性
**Objective:** As a ブログ運営者, I want 既存記事のレンダリングに影響がない, so that 過去のコンテンツを修正する必要がない

#### Acceptance Criteria
1. When コールアウト記法を含まない既存記事をレンダリングする, the Markdownパーサー shall 既存の表示を維持する
2. When 通常のblockquote（`>`のみ）が記述されている, the Markdownパーサー shall 通常のblockquoteとしてレンダリングする
3. The ブログシステム shall 既存の.mdファイル形式（MDXへの変換不要）を維持する

### Requirement 6: ドキュメント
**Objective:** As a ブログ執筆者, I want コールアウトの使い方を参照できる, so that 正しい記法で記事を執筆できる

#### Acceptance Criteria
1. The プロジェクトドキュメント shall コールアウト記法の使用例（note/tip/warning/danger）を含む
2. The プロジェクトドキュメント shall タイトルあり/なしの記法例を含む
3. The プロジェクトドキュメント shall 複数段落・リスト・コードブロックを含む記法例を含む
