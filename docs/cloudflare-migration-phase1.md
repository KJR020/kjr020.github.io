# Cloudflare Pages 移行 Phase 1 実装ガイド

## 概要

GitHub PagesからCloudflare Pagesへのホスティング移行を実施する。

### 目的

- Cloudflareエコシステムへの統合基盤を構築（Phase 2でRAG基盤を追加予定）
- 既存のScrapbox APIプロキシ（CF Workers）との統合を容易にする
- 副業ポートフォリオとしてのエッジコンピューティング実装実績を積む

### 移行構成

```
現行: GitHub Pages → CF Workers (scrapbox-proxy) → Scrapbox API
移行後: CF Pages → CF Workers (scrapbox-proxy) → Scrapbox API
```

### 前提

- 月額コスト: $0（無料枠内、現行と同額）
- Phase 1 工数見積もり: 4.5h
- 既存機能の劣化なし（全ページURL互換、Scrapboxカード表示維持）

---

## 前提条件

### 必要なアカウント・ツール

| 項目 | 用途 |
|------|------|
| Cloudflareアカウント | Pages プロジェクト作成 |
| wrangler CLI (`pnpm add -g wrangler`) | ローカルテスト・デプロイ |
| GitHub Secrets設定権限 | APIトークン登録 |

### 事前に発行・取得するもの

- **`CLOUDFLARE_ACCOUNT_ID`**: Cloudflare Dashboard → Workers & Pages → 右側の Account ID
- **`CLOUDFLARE_API_TOKEN`**: Cloudflare Dashboard → My Profile → API Tokens → Create Token
  - 権限: `Cloudflare Pages:Edit`, `Account:Read`
  - スコープ: 対象アカウントのみ

---

## 実装手順

### Step 1: @astrojs/cloudflare インストール

```bash
pnpm add @astrojs/cloudflare
```

> [!note]
> Astro v5 + `@astrojs/cloudflare` の互換性を確認してからインストールすること。
> 最新のアダプターバージョンは https://github.com/withastro/adapters で確認。

### Step 2: astro.config.mjs の変更

現在の設定:

```js
export default defineConfig({
  site: "https://kjr020.github.io",
  build: {
    format: "directory",
  },
  integrations: [react(), sitemap(), pagefind()],
  // ...
});
```

変更後:

```js
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://kjr020.github.io", // カスタムドメイン設定後に変更する可能性あり
  output: "static", // 静的サイト生成を維持
  adapter: cloudflare(),
  build: {
    format: "directory",
  },
  integrations: [react(), sitemap(), pagefind()],
  // ...
});
```

変更点:
1. `import cloudflare from "@astrojs/cloudflare"` を追加
2. `adapter: cloudflare()` を追加
3. `output: "static"` を明示（デフォルトだが明示しておく）

変更後の検証:

```bash
pnpm build       # ビルドが成功することを確認
pnpm lint        # Lintエラーがないことを確認
pnpm test:run    # テストがパスすることを確認
```

### Step 3: GitHub Actions ワークフロー作成

`.github/workflows/deploy-cf-pages.yml` を新規作成する。

既存の `deploy.yml`（GitHub Pages用）は移行完了まで残し、移行確認後に削除する。
既存の `ci.yml` はそのまま維持する（PR時のCI用）。

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: cf-pages-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # CI: lint, format, typecheck, test, build
  ci:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Sync Astro types
        run: pnpm astro sync

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm format:check

      - name: Type check
        run: pnpm typecheck

      - name: Test
        run: pnpm test:run --passWithNoTests

      - name: Build
        run: pnpm build
        env:
          PUBLIC_GISCUS_REPO: ${{ vars.PUBLIC_GISCUS_REPO }}
          PUBLIC_GISCUS_REPO_ID: ${{ vars.PUBLIC_GISCUS_REPO_ID }}
          PUBLIC_GISCUS_CATEGORY: ${{ vars.PUBLIC_GISCUS_CATEGORY }}
          PUBLIC_GISCUS_CATEGORY_ID: ${{ vars.PUBLIC_GISCUS_CATEGORY_ID }}

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/

  # Deploy: CI成功後にCF Pagesへデプロイ
  deploy:
    needs: ci
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: build-output
          path: dist/

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist/ --project-name=kjr020-blog --branch=${{ github.head_ref || github.ref_name }}
```

**ポイント:**
- `ci` ジョブでlint/format/typecheck/test/buildを直列実行（既存CIの5並列ジョブに対し、デプロイワークフローは1ジョブに統合）
- `deploy` ジョブは `needs: ci` でCI成功後のみ実行
- PRブランチでは `--branch=${{ github.head_ref }}` でプレビューデプロイが生成される
- mainブランチでは本番デプロイ（production deployment）になる

### Step 4: Cloudflare Dashboard での Pages 設定

1. **CF Pages プロジェクト作成**
   - Cloudflare Dashboard → Workers & Pages → Create → Pages
   - 「Direct Upload」を選択（GitHub連携ではなくGitHub Actionsからデプロイするため）
   - プロジェクト名: `kjr020-blog`

2. **初回デプロイ（手動テスト）**
   ```bash
   pnpm build
   npx wrangler pages deploy dist/ --project-name=kjr020-blog
   ```
   - 初回はブラウザ認証が求められる
   - `https://kjr020-blog.pages.dev` でアクセスできることを確認

3. **GitHub Secrets 登録**
   - GitHub → リポジトリ → Settings → Secrets and variables → Actions
   - `CLOUDFLARE_ACCOUNT_ID`: CloudflareアカウントID
   - `CLOUDFLARE_API_TOKEN`: 作成したAPIトークン

4. **カスタムドメイン設定（オプション）**
   - CF Dashboard → Pages → kjr020-blog → Custom domains
   - `kjr020.github.io` をカスタムドメインとして設定する場合はDNS設定が必要
   - 当面は `kjr020-blog.pages.dev` で運用し、後でドメイン移行を検討

### Step 5: scrapbox-proxy CORS 設定更新

scrapbox-proxy Worker の `ALLOWED_ORIGINS` に CF Pages の URL を追加する。

```diff
  const ALLOWED_ORIGINS = [
    "https://kjr020.github.io",
+   "https://kjr020-blog.pages.dev",
  ];
```

> [!warning]
> 移行期間中は旧オリジン（`https://kjr020.github.io`）も残すこと。完全移行が確認できるまで削除しない。

更新後:

```bash
cd workers/scrapbox-proxy  # scrapbox-proxyプロジェクトのディレクトリ
npx wrangler deploy
```

### Step 6: 動作確認チェックリスト

#### ページURL疎通

| URL | 確認結果 |
|-----|---------|
| `/` （トップページ） | |
| `/posts/` （記事一覧） | |
| `/posts/astro/...` （個別記事） | |
| `/tags/` （タグ一覧） | |
| `/tags/astro` （タグ別記事） | |
| `/search/` | |
| `/404` | |

#### 機能動作

| 機能 | 確認結果 |
|------|---------|
| Scrapboxカードリスト表示 | |
| テーマ切り替え（ライト/ダーク） | |
| モバイルメニュー開閉 | |
| TOCスクロール連動 | |
| Giscusコメント欄 | |

#### CI/CD

| 項目 | 確認結果 |
|------|---------|
| mainブランチpushで自動デプロイ | |
| PRブランチでプレビューデプロイ | |
| CI失敗時にデプロイスキップ | |

#### パフォーマンス（Lighthouse）

| 指標 | 移行前 | 移行後 |
|------|--------|--------|
| Performance | | |
| Accessibility | | |
| Best Practices | | |
| SEO | | |

---

## 移行完了後の後片付け

1. `.github/workflows/deploy.yml`（GitHub Pages用）を削除
2. GitHub Settings → Pages → Source を無効化
3. `astro.config.mjs` の `site` をCF PagesのカスタムドメインURLに更新（必要に応じて）
4. scrapbox-proxy の `ALLOWED_ORIGINS` から旧オリジンを削除（全機能確認後）

---

## 参考リンク

- [Astro on Cloudflare Pages](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [@astrojs/cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Cloudflare Pages - Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [cloudflare/wrangler-action](https://github.com/cloudflare/wrangler-action)
- [Cloudflare Pages GitHub Actions deploy](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)

---

## 関連 GitHub Issues

| Issue | タイトル |
|-------|---------|
| #37 | [CF移行 Phase1] @astrojs/cloudflare アダプター導入・astro.config.mjs 更新 |
| #38 | [CF移行 Phase1] GitHub Actions ワークフロー作成（CF Pages deploy） |
| #39 | [CF移行 Phase1] CF Pagesプロジェクト作成・APIトークン設定 |
| #40 | [CF移行 Phase1] scrapbox-proxyの許可オリジン更新（CF Pages URL対応） |
| #41 | [CF移行 Phase1] 移行後動作確認・既存URL疎通テスト |
