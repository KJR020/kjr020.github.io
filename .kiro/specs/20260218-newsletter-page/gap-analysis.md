# Gap Analysis: newsletter-page

## 1. Current State Investigation

### 既存アセット

| カテゴリ | ファイル | 再利用可能性 |
|---------|---------|------------|
| Content Collection設定 | `src/content.config.ts` | ✅ 同じパターンで `newsletters` を追加可能 |
| レイアウト | `src/layouts/BaseLayout.astro` | ✅ そのまま流用 |
| 一覧ページ | `src/pages/archive.astro` | ✅ パターンをそのまま踏襲 |
| 個別ページ | `src/pages/posts/[...slug].astro` | ✅ パターンを踏襲（Giscus不要、目次は任意） |
| カードコンポーネント | `src/components/PostCard.astro` | 🔶 流用可能だがリンク先が異なる |
| ヘッダー | `src/components/Header.astro` | ✅ `navItems` 配列に追加するだけ |
| トップページ | `src/pages/index.astro` | ✅ 新セクション追加 |
| CI/CD | `.github/workflows/deploy.yml` | ✅ そのまま連携（push on main → deploy） |
| CI | `.github/workflows/ci.yml` | ✅ 変更不要 |

### 既存コンベンション

- **データ取得**: `getCollection("collection", filter)` + ソート
- **静的パス生成**: `getStaticPaths()` + `render(post)`
- **Markdownレンダリング**: Tailwind Typography (`.prose` クラス)
- **カードUI**: `Card` / `CardHeader` / `CardTitle` / `CardContent` コンポーネント
- **ナビゲーション**: `navItems` 配列（`Header.astro`）+ `MobileMenu`（React）
- **日付表示**: `toLocaleDateString("ja-JP")` via `PostMeta.astro`

---

## 2. Requirement-to-Asset Map

| Req# | 要件 | 既存アセット | ギャップ |
|------|------|------------|--------|
| 1 | Content Collection定義 | `content.config.ts` | **Missing**: `newsletters` コレクション未定義。スキーマ追加が必要 |
| 2 | 一覧ページ | `archive.astro` パターン | **Missing**: `/newsletters/index.astro` 未作成。パターンは流用可能 |
| 3 | 個別ページ | `posts/[...slug].astro` パターン | **Missing**: `/newsletters/[...slug].astro` 未作成。Giscus・目次は不要 |
| 4 | ナビゲーション導線 | `Header.astro` の `navItems` | **Missing**: 「Tech Trends」リンク未追加。トップページのセクション未作成 |
| 5 | GHA自動生成 | `deploy.yml` / `ci.yml` | **Missing**: `newsletter.yml` 未作成。Claude Code Action の設定が必要 |
| 6 | セルフレビュー | なし | **Missing**: レビューロジック全体。**Research Needed**: Claude Code Actionでの2段階実行パターン |
| 7 | 自動コミット・デプロイ | `deploy.yml`（push on main → deploy） | **Missing**: ワークフロー内の自動コミット・プッシュステップ |
| 8 | エラーハンドリング | GitHub Actionsのデフォルト通知 | **Constraint**: GHAのデフォルト通知で十分。追加実装は最小限 |

### Frontmatterの不整合（重要）

`tech-trends-newsletter` スキルが生成するMarkdownのfrontmatterは以下:

```yaml
---
tags: [tech-newsletter, ...]
date: 2026-02-18
---
```

一方、Requirement 1 のスキーマでは `title` が必須フィールド。現在のスキル出力には **`title` フィールドがfrontmatterに含まれていない**。タイトルは本文の `# Tech Trends Newsletter - YYYY-MM-DD` として存在する。

**対応オプション**:
- A) スキルの出力テンプレートを修正して `title` をfrontmatterに追加
- B) Content Collectionの `title` をオプションにし、未指定時は日付から自動生成

---

## 3. Implementation Approach Options

### Option A: 新規コンポーネント作成（推奨）

既存のブログパターンを踏襲しつつ、ニュースレター専用のファイルを新規作成する。

**新規作成ファイル**:
- `content/newsletters/` ディレクトリ
- `src/pages/newsletters/index.astro` — 一覧ページ
- `src/pages/newsletters/[...slug].astro` — 個別ページ
- `src/components/NewsletterCard.astro` — ニュースレター用カード（PostCardを参考に）
- `.github/workflows/newsletter.yml` — 自動生成ワークフロー

**既存ファイルの変更**:
- `src/content.config.ts` — `newsletters` コレクション追加
- `src/components/Header.astro` — `navItems` に「Tech Trends」追加
- `src/pages/index.astro` — 最新ニュースレターセクション追加

**トレードオフ**:
- ✅ ブログ記事とニュースレターの責務が明確に分離
- ✅ 個別にスキーマ・表示をカスタマイズ可能
- ✅ 既存パターンの踏襲でコード量は最小限
- ❌ PostCard と NewsletterCard に若干の重複あり

### Option B: 既存コンポーネント拡張

PostCard を汎用化し、`posts` と `newsletters` の両方で使い回す。

**トレードオフ**:
- ✅ コンポーネントの重複を避けられる
- ❌ PostCard の Props が複雑化する（リンク先の分岐、コレクション名の抽象化）
- ❌ 将来ニュースレター独自のUI要素を追加しにくい

### Option C: ハイブリッド

PostMeta（日付・タグ表示）は共通利用し、CardコンポーネントはそれぞれPostCard / NewsletterCard として分離。

**トレードオフ**:
- ✅ 共通部分（PostMeta）は再利用、カード部分は独立
- ✅ バランスが取れたアプローチ
- ❌ 特に目立つ欠点はなし

---

## 4. Research Needed（設計フェーズへ持ち越し）

| # | 調査項目 | 影響する要件 |
|---|---------|------------|
| 1 | `anthropics/claude-code-action` のGHA設定方法とパラメータ | Req 5, 6 |
| 2 | Claude Code Actionで生成 → セルフレビューの2段階実行パターン（同一ジョブ内 or ジョブ分割） | Req 6 |
| 3 | GHA内でのgit commit & pushの権限設定（`contents: write`、`GITHUB_TOKEN` or PAT） | Req 7 |
| 4 | ニュースレタースキルの出力に `title` を追加する方法 or タイトル自動導出の方法 | Req 1 |

---

## 5. Implementation Complexity & Risk

**Effort: M（3〜7日）**
- フロントエンド（Collection定義、ページ2つ、カード、ナビ修正）は既存パターンの踏襲で S レベル
- GHAワークフロー（Claude Code Action + セルフレビュー + 自動コミット）が新規パターンで M レベル

**Risk: Medium**
- Claude Code GitHub Actionは比較的新しいツールで、ドキュメントやベストプラクティスの確認が必要
- セルフレビューの「重大な問題」の判定基準が曖昧 → 設計フェーズで具体化が必要
- API コスト（毎日の実行）は想定内だが、実運用で検証が必要

---

## 6. 推奨事項

1. **Option A（新規コンポーネント作成）を推奨**: ブログ記事とニュースレターの責務分離が明確で、将来の拡張にも対応しやすい。PostMeta は共通利用する（Option Cの要素を部分的に取り入れる）
2. **Frontmatter問題**: スキルの出力テンプレートに `title` を追加する方向で解決。Content Collection側で対応するより、ソース側を修正する方がシンプル
3. **GHAワークフロー**: Claude Code Actionの公式ドキュメントを設計フェーズで精査し、セルフレビューの実装パターンを確定させる
4. **段階的実装**: フロントエンド部分（Req 1-4）を先行実装し、GHA自動化（Req 5-8）は後続で取り組む
