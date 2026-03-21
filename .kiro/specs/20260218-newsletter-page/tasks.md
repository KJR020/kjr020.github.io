# Implementation Plan

## Overview

ニュースレターページ機能の実装タスク。Data Layer → UI Layer → CI/CD Layer の順で実装する。
依存関係のないタスクには `(P)` マークを付与。

---

## Phase 1: Data Layer

- [x] 1. newsletters Content Collection 定義
- [x] 1.1 `content/newsletters/` ディレクトリを作成し、サンプルMarkdownを配置
  - `content/newsletters/2026-02-18_tech-trends.md` をサンプルとして作成（スキル出力フォーマット準拠）
  - frontmatter: `title`, `date`（`YYYY-MM-DDT00:00:00+09:00` 形式）, `tags` を含むこと
  - _Requirements: 1.1, 1.3_
- [x]1.2 `src/content.config.ts` に `newsletters` コレクションを追加
  - Zodスキーマ: `title`（string必須）、`date`（coerce.date必須）、`tags`（string[]任意default[]）、`description`（string任意）
  - `collections` エクスポートに `newsletters` を追加
  - 既存の `posts` コレクションに変更を加えないこと
  - _Requirements: 1.2, 1.4_
- [x]1.3 `tech-trends-newsletter` スキルテンプレートをリポジトリに配置 (P)
  - `~/.claude/skills/tech-trends-newsletter/SKILL.md` を `.claude/skills/tech-trends-newsletter/SKILL.md` にコピーしてリポジトリ管理に移行
  - frontmatterテンプレートに `title: "Tech Trends Newsletter - YYYY-MM-DD"` を追加
  - `date` フォーマットを `YYYY-MM-DDT00:00:00+09:00` に更新
  - GHAランナーでも参照可能にするため、ワークフローのプロンプトでこのパスを指定
  - _Requirements: 1.3_

## Phase 2: UI Layer

- [x]2. ニュースレター一覧・個別ページとナビゲーション
- [x]2.1 `src/components/NewsletterCard.astro` を作成
  - Props: `PostCard.astro` と同じオブジェクト丸渡しパターン
    ```typescript
    interface Props {
      newsletter: {
        id: string;
        data: { title: string; date: Date; tags?: string[] };
      };
    }
    ```
  - `Card`, `CardHeader`, `CardTitle`, `CardContent` コンポーネントを使用（`PostCard.astro` のパターン準拠）
  - `PostMeta` で日付・タグを表示
  - カード全体を `/newsletters/{newsletter.id}` へのリンクとする
  - _Requirements: 2.3, 2.4_
- [x]2.2 `src/pages/newsletters/index.astro` を作成 (P)
  - `getCollection("newsletters")` で全件取得、日付降順ソート
  - `BaseLayout` を使用
  - `NewsletterCard` でエントリを表示
  - **年別グルーピングは行わない**（単純降順リスト。archive.astro とは異なる設計）
  - **空状態**: ニュースレターが0件の場合は「まだニュースレターはありません」のメッセージを表示
  - _Requirements: 2.1, 2.2, 2.3, 2.5_
- [x]2.3 `src/pages/newsletters/[...slug].astro` を作成 (P)
  - `getStaticPaths()` で全ニュースレターのパスを生成（`params: { slug: entry.id }`）
  - `render()` でMarkdownをHTMLにレンダリング
  - `BaseLayout` を使用
  - `.prose` クラスでMarkdownスタイリング
  - **注意**: `.prose` のグローバルスタイルは `posts/[...slug].astro` の `<style is:global>` で定義されているため、newsletters ページにも同等のスタイル定義を含めるか、共通CSSに抽出する
  - 外部リンクをクリック可能に表示
  - スラグはファイル名ベース（例: `2026-02-18_tech-trends`）
  - _Requirements: 3.1, 3.2, 3.3, 3.4_
- [x]2.4 `src/components/Header.astro` にナビリンクを追加
  - `navItems` 配列の `Archive` の後に `{ href: "/newsletters", label: "Tech Trends" }` を追加
  - 結果: `Home, Archive, Tech Trends, Search, Scrapbox`
  - `MobileMenu` にも自動反映されることを確認
  - _Requirements: 4.1, 4.3_
- [x]2.5 `src/pages/index.astro` にニュースレター導線を追加
  - `Latest Posts` と `Scrapbox` セクションの間に「Tech Trends」セクションを追加
  - `getCollection("newsletters")` で最新1件を取得して表示
  - ニュースレターが0件の場合はセクションを非表示
  - _Requirements: 4.2_

## Phase 3: CI/CD Layer

- [x]3. GitHub Actions ワークフロー
- [x]3.1 `claude-code-base-action` の最新安定コミットSHAを確認
  - `https://github.com/anthropics/claude-code-base-action` のコミット履歴からSHAを取得
  - design.mdの `@<commit-sha>` プレースホルダを実際のSHAに置換
  - 選定SHAが `structured_output` 出力をサポートすることを確認
  - _Requirements: 5.1_
- [x]3.2 `.github/workflows/newsletter.yml` を作成
  - design.mdの `Batch / Job Contract` セクションのYAMLを実装
  - 2ジョブ構成: `generate-and-review`（contents: read）→ `commit`（contents: write）
  - concurrency グループ設定
  - `persist-credentials: false` を生成ジョブのcheckoutに設定
  - `allowed_tools` に WebFetch を含めない
  - `structured_output` は `env` 経由で受け取り（シェル変数インライン展開を回避）
  - `jq -e` でJSON妥当性を事前検証する fail-closed レビューバリデーション
  - `git diff --name-only` でファイルスコープ検証（当日分1ファイルのみ許可）
  - `git add "$FILE"` で当日分のみステージング
  - Artifact経由のファイル受け渡し（当日分1ファイルのみ）
  - `TZ=Asia/Tokyo` でJST日付管理、frontmatterは `YYYY-MM-DDT00:00:00+09:00` 形式
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3_

## Phase 4: 検証

- [x]4. ビルド・テスト・動作確認
- [x]4.1 ローカルビルド検証
  - `pnpm build` が成功すること
  - `/newsletters` と `/newsletters/[slug]` のHTMLが生成されること
  - 既存ページ（posts, archive, search等）に影響がないこと
  - _Requirements: 1.4, 2.5, 3.4_
- [x]4.2 E2Eテスト追加 (P)
  - `e2e/newsletter.spec.ts` を作成
  - 一覧ページ: ニュースレターが日付順で表示されること
  - 個別ページ: Markdownが正しくレンダリングされること
  - ヘッダー: 「Tech Trends」リンクが `/newsletters` に遷移すること
  - 空状態: ニュースレターが0件の場合のメッセージ表示（テストデータ依存のため、サンプルMD存在時は省略可）
  - _Requirements: 2.1, 2.2, 3.2, 4.1_
- [x]4.3 全検証パス
  - `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:run && pnpm test:e2e && pnpm build`
  - Biome format/lint チェック
  - TypeScript 型チェック
  - Vitest テスト（既存テストの回帰なし）
  - Playwright E2Eテスト
  - Astro ビルド
  - _Requirements: All_

## Task Dependencies

```
1.1 → 1.2 → 2.1 → 2.2 (P)
                  → 2.3 (P)
                  → 2.4
                  → 2.5
1.3 (P: Phase 1-2と並行可能)

3.1 → 3.2

(2.x + 3.2) → 4.1 → 4.2 (P)
                    → 4.3
```

- Phase 1 の 1.1 → 1.2 は最優先。1.3（スキルテンプレートリポジトリ配置）は並行可能
- Phase 2 は 1.2 完了後に着手。2.1 完了後、2.2 と 2.3 は並行可能
- Phase 3 は Phase 1-2 と独立して着手可能だが、newsletter.yml の動作確認は Phase 1 のディレクトリ構造が前提
- Phase 4 は Phase 2 と Phase 3（3.2）の両方が完了後に実施
- 4.2（E2E テスト）は 4.1（ビルド検証）と並行可能だが、サンプルMD（1.1）の存在が前提
