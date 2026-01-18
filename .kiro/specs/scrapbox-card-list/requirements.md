# Requirements Document

## Introduction
本機能は、Astro ブログ上で Scrapbox プロジェクトの最新ページ一覧をリッチカード UI で表示するコンポーネントを提供する。GitHub Pages の静的ホスティング制約により、ビルド時に Scrapbox API からデータを取得し、静的 JSON として配信する設計とする。

## Project Description (Input)
### ゴール
GitHub Pages 上の Astro ブログで、Scrapbox API 経由で最新ページ一覧を取得し、
CodePen ライクなリッチカード UI で動的に表示する仕組みを実装したい。

### 技術的制約（調査結果）
- Scrapbox API は CORS ヘッダー（`Access-Control-Allow-Origin`）を返さない
- ブラウザから直接 fetch することは不可能
- GitHub Pages は静的ホスティングのみでサーバーサイド処理不可

### 採用アプローチ
**ビルド時取得 + 静的 JSON 配信**
- GitHub Actions または Astro ビルド時に Scrapbox API を取得
- 結果を静的 JSON ファイルとして生成
- クライアントは同一オリジンの JSON を fetch（CORS 問題なし）

### アウトプット
- `ScrapboxCardList.tsx`（React コンポーネント、JSON fetch + state 管理）
- `ScrapboxCard.tsx`（カード UI コンポーネント）
- ビルドスクリプト（Scrapbox API → JSON 生成）
- Tailwind CSS 実装

## Requirements

### Requirement 1: ビルド時データ取得
**Objective:** As a 開発者, I want ビルド時に Scrapbox API からデータを取得できること, so that CORS 制限を回避して最新データを配信できる

#### Acceptance Criteria
1. When Astro ビルドが実行された場合, the build script shall `https://scrapbox.io/api/pages/{project}` エンドポイントからページ一覧を取得する
2. The build script shall 取得したデータを `public/data/scrapbox-{project}.json` に保存する
3. The build script shall 以下の情報を JSON に含める: タイトル、説明（descriptions）、サムネイル画像 URL、更新日時、ページ URL
4. If API リクエストが失敗した場合, the build script shall エラーログを出力し、既存の JSON ファイルを保持する（ビルドは継続）
5. The build script shall 環境変数 `SCRAPBOX_PROJECT` でプロジェクト名を設定可能にする

### Requirement 2: コンポーネント配置と Props 設計
**Objective:** As a 開発者, I want Astro ページ上に ScrapboxCardList コンポーネントを配置できること, so that 任意の Scrapbox プロジェクトのページ一覧を表示できる

#### Acceptance Criteria
1. The ScrapboxCardList component shall プロジェクト名を指定する `project` prop を受け取る
2. The ScrapboxCardList component shall 表示件数を制限する `limit` prop をオプションで受け取る（デフォルト: 10件）
3. When Astro ページに `<ScrapboxCardList project="example" client:load />` を配置した場合, the component shall クライアントサイドでハイドレーションされ動的に動作する
4. If `project` prop が未指定の場合, the component shall エラーメッセージを表示する

### Requirement 3: クライアント側データ取得
**Objective:** As a システム, I want 静的 JSON からページ一覧を取得できること, so that 高速にコンテンツを表示できる

#### Acceptance Criteria
1. When コンポーネントがマウントされた場合, the ScrapboxCardList component shall `/data/scrapbox-{project}.json` から fetch リクエストを送信する
2. While データ取得が処理中の場合, the component shall ローディング状態を表示する
3. If JSON ファイルが存在しない場合, the component shall 「データが見つかりません」エラーメッセージを表示する
4. The component shall 取得したデータをキャッシュし、同一セッション内での重複リクエストを防ぐ

### Requirement 4: リッチカード UI 表示
**Objective:** As a ブログ訪問者, I want CodePen ライクなリッチカードでページを閲覧できること, so that 視覚的に魅力的なコンテンツ一覧を確認できる

#### Acceptance Criteria
1. The ScrapboxCard component shall 以下の要素を含むカードレイアウトを表示する: サムネイル画像（上部）、タイトル（大きめフォント）、説明文（省略表示）、Scrapbox ページへのリンク
2. When サムネイル画像が存在しない場合, the component shall プレースホルダー画像またはアイコンを表示する
3. The card UI shall 説明文が長い場合は最大3行で省略し、末尾に「...」を表示する
4. When ユーザーがカードをホバーした場合, the card shall 影の強調やスケール変化などの視覚的フィードバックを提供する
5. When ユーザーがカードをクリックした場合, the card shall 該当 Scrapbox ページを新しいタブで開く

### Requirement 5: レスポンシブ対応
**Objective:** As a ブログ訪問者, I want どのデバイスでも適切にカードが表示されること, so that モバイルでも快適に閲覧できる

#### Acceptance Criteria
1. The card grid layout shall デスクトップ（1024px以上）で3カラム、タブレット（768px-1023px）で2カラム、モバイル（767px以下）で1カラムで表示する
2. The card component shall 画面幅に応じてサムネイル画像のアスペクト比を維持しながらリサイズする
3. The card component shall タッチデバイスでタップ操作に対応する

### Requirement 6: エラーハンドリングとエッジケース
**Objective:** As a 開発者, I want 堅牢なエラーハンドリングがあること, so that 予期しない状況でもユーザー体験を損なわない

#### Acceptance Criteria
1. If JSON データが0件の場合, the component shall 「ページが見つかりません」メッセージを表示する
2. If ネットワークエラーが発生した場合, the component shall リトライボタン付きのエラー表示を行う
3. The component shall JSON データのバリデーションを行い、不正なデータ形式の場合は安全に処理する

---

## Future Requirements（将来要件）

> 以下は本フェーズのスコープ外。実装完了後に GitHub Issue として起票する。

### Future 1: Cloudflare Workers によるリアルタイム Proxy
**背景:** 現在はビルド時取得のため、更新頻度が限られる。リアルタイム更新が必要になった場合の拡張。

**要件概要:**
- Cloudflare Workers で Scrapbox API の Proxy を構築
- `proxyUrl` prop でリアルタイム取得に切り替え可能
- 静的 JSON とのフォールバック対応

**Issue タイトル:** `feat: Cloudflare Workers による Scrapbox API Proxy 対応`

### Future 2: 定期自動更新（GitHub Actions Scheduled）
**背景:** 手動デプロイなしで定期的にデータを更新したい。

**要件概要:**
- GitHub Actions の `schedule` トリガーで定期ビルド（例: 1日1回）
- データ更新時のみコミット・デプロイ

**Issue タイトル:** `feat: GitHub Actions による Scrapbox データ定期更新`

### Future 3: 複数プロジェクト対応
**背景:** 複数の Scrapbox プロジェクトを1ページで表示したい。

**要件概要:**
- 複数の `project` を配列で指定可能
- プロジェクトごとにセクション分けまたはタブ切り替え

**Issue タイトル:** `feat: 複数 Scrapbox プロジェクトの統合表示`

### Future 4: 検索・フィルタリング機能
**背景:** 大量のページから目的のコンテンツを探しやすくしたい。

**要件概要:**
- タイトル・説明文でのインクリメンタル検索
- タグやカテゴリでのフィルタリング

**Issue タイトル:** `feat: Scrapbox カードの検索・フィルタリング機能`
