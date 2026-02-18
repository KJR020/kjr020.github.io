# Requirements Document

## Introduction

本仕様は、ブログのデザインアクセントとしてSVGイラスト（kuri.svg）を効果的に配置するための要件を定義する。デザイン理論（視覚的階層、反復、余白、近接）に基づき、TOPページと記事目次において一貫したブランディングと視覚的魅力を実現する。

### 現状分析
- **TOPページ**: 既にkuri.svgが背景透かし（opacity: 0.15）として実装済み → **改善が必要**
- **目次コンポーネント**: `avatarSrc`/`avatarAlt` propsが存在するが未使用

### デザイン理論の適用方針
1. **反復（Repetition）**: 同じビジュアル要素を複数箇所で使用しブランド一貫性を確立
2. **視覚的階層（Visual Hierarchy）**: コンテンツを邪魔せず補完する配置
3. **余白（White Space）**: SVGの周囲に適切な余白を確保し視認性を向上
4. **近接（Proximity）**: 関連コンテンツの近くに配置し文脈を明確化

## Requirements

### Requirement 1: TOPページのSVGアクセント表示（改善）

**Objective:** As a 訪問者, I want TOPページでブログのマスコットキャラクター（栗）をより効果的に視認できる, so that ブログの個性とブランドを強く印象づけられる

#### Acceptance Criteria
1. When ユーザーがTOPページにアクセスした時, the Blog shall kuri.svgを現在の背景透かしより目立つデザインアクセントとして表示する
2. The Blog shall SVGの視認性を向上させる（opacity調整、サイズ変更、配置改善のいずれか）
3. The Blog shall SVGをコンテンツエリアと視覚的に調和する位置に配置する（例：ヒーローエリア、サイドバー、フッター付近）
4. The Blog shall モバイルとデスクトップの両方で適切なサイズと配置で表示する
5. The Blog shall SVGにaria-hidden="true"を設定し、スクリーンリーダーの妨げにならないようにする
6. The Blog shall 現在の背景透かし実装を置き換えるか、より効果的な表示方法に改善する

### Requirement 2: 記事目次下のSVGアクセント表示

**Objective:** As a 読者, I want 記事の目次エリアでマスコットキャラクターを見られる, so that 読書体験にアクセントが加わり、ブログの統一感を感じられる

#### Acceptance Criteria
1. When 記事ページの目次が表示された時, the TableOfContents shall 目次リストの下部にkuri.svgを表示する
2. The TableOfContents shall SVGを適切なサイズ（目次幅の50-70%程度）で中央配置する
3. The TableOfContents shall SVGの上部に十分な余白（margin-top）を設け、目次との視覚的分離を確保する
4. The TableOfContents shall 基本的に見出し数に関係なくSVGを表示する
5. While 目次の見出しが多い時（10件以上など）, the TableOfContents shall SVGを非表示にすることを検討する（目次が長くなりすぎる場合の対応）
6. The TableOfContents shall デスクトップ表示（lg以上）でのみSVGを表示し、モバイルでは非表示とする

### Requirement 3: デザイン一貫性の確保

**Objective:** As a ブログ運営者, I want SVGの表示スタイルがサイト全体で統一されている, so that ブランドの一貫性と視覚的調和が保たれる

#### Acceptance Criteria
1. The Blog shall TOPページと目次で同一のSVGファイル（/images/kuri.svg）を使用する
2. The Blog shall SVGの表示色がダークモード/ライトモードの両方で適切に視認できる
3. If SVGファイルの読み込みに失敗した場合, then the Blog shall エラーを表示せず、SVG要素を非表示にする
4. The Blog shall SVGに対してpointer-events: noneを設定し、インタラクションを無効化する

### Requirement 4: パフォーマンスとアクセシビリティ

**Objective:** As a 訪問者, I want SVG表示がページパフォーマンスに影響を与えない, so that 快適にブログを閲覧できる

#### Acceptance Criteria
1. The Blog shall SVGをインライン化せず、外部ファイルとして参照する（background-imageまたはimg要素）
2. The Blog shall SVGに対してloading="lazy"を適用しない（装飾要素のため初期表示で問題なし）
3. The Blog shall 装飾用SVGにalt属性を設定しない、またはalt=""（空）を設定する
4. When Lighthouse監査を実行した時, the Blog shall アクセシビリティスコアに影響を与えない
