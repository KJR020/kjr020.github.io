# コード品質ルール

このルールは、TypeScript・Biome・コード品質全般に関するガイドラインを定義する。

## 適用条件

- `src/**/*.ts`, `src/**/*.tsx`, `src/**/*.astro` ファイルの作成・編集時
- `biome.json`, `tsconfig.json` の変更時
- コード変更後の検証時

---

## 1. Lint/Format の自動化

### Hook による自動修正

`src/` 配下のファイルをWrite/Editすると、PostToolUse hookで `biome check --write` が自動実行される（`.claude/settings.json` で設定済み）。手動でのlint/format実行は不要。

### 検証コマンド（タスク完了時）

コード変更の最終確認として以下を実行する:

```shell
pnpm test:run && pnpm build
```

| コマンド | 目的 | タイミング |
|----------|------|-----------|
| `pnpm lint` | Biome による Lint チェック | Hook で自動実行 |
| `pnpm format:check` | フォーマットの確認 | Hook で自動実行 / CIで検証 |
| `pnpm typecheck` | TypeScript 型チェック | ビルド時に実行 |
| `pnpm test:run` | Vitest ユニットテスト | タスク完了時に手動実行 |
| `pnpm build` | Astro ビルド検証 | タスク完了時に手動実行 |

---

## 2. TypeScript

### Strict モード

プロジェクトは `astro/tsconfigs/strict` を継承している。以下を遵守する:

```typescript
// Good: 明示的な型定義
function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Good: Union型で状態を制限
type Theme = "light" | "dark";
type AnimationPhase = "idle" | "exit" | "enter";

// Bad: any の使用
function processData(data: any) { ... }

// Bad: 型アサーションの乱用
const value = something as string;
```

### 型インポート

```typescript
// Good: 型は import type を使用
import type { CollectionEntry } from "astro:content";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

// Bad: 値と型を区別しないインポート
import { CollectionEntry } from "astro:content"; // 型のみなのにimport typeを使わない
```

### パスエイリアス

```typescript
// Good: @/ エイリアスで src/ を参照
import { cn } from "@/lib/utils";
import PostCard from "@/components/PostCard.astro";

// Good: 同一ディレクトリ内は相対パス
import type { TOCListProps } from "./types";

// Bad: 深い相対パス
import { cn } from "../../../lib/utils";
```

---

## 3. Biome設定（現行）

### フォーマット

| 項目 | 設定 |
|------|------|
| インデント | スペース 2文字 |
| 行幅 | 100文字 |
| クォート | ダブルクォート (`"`) |
| セミコロン | 常に付与 |

### Astroファイルの特別ルール

Astroコンポーネントではテンプレート内の参照をBiomeが検出できないため、以下のルールを無効化している:

- `useConst`: off
- `useImportType`: off
- `noUnusedVariables`: off
- `noUnusedImports`: off

これらはAstroファイル（`src/**/*.astro`）にのみ適用。`.ts`/`.tsx` では推奨ルールが有効。

---

## 4. コーディング規約

### 関数定義

```typescript
// Good: function宣言（コンポーネント）
export function ThemeToggle() { ... }

// Good: アロー関数（コールバック、ユーティリティ）
const handleClick = (e: React.MouseEvent) => { ... };
const sortedPosts = posts.sort((a, b) => ...);

// Good: ユーティリティ関数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 環境変数

```typescript
// Good: import.meta.env で取得。PUBLIC_ prefix で公開変数を区別
const giscusRepo = import.meta.env.PUBLIC_GISCUS_REPO as `${string}/${string}`;
```

### エラーハンドリング

```typescript
// Good: 外部APIの境界でバリデーション
const posts = await getCollection("posts", ({ data }) => !data.draft);

// Good: DOM要素の存在チェック
const element = document.getElementById(id);
if (element) {
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}
```

---

## 5. CI/CD パイプライン

GitHub Actionsで以下の5ジョブが並列実行される:

1. **Lint**: `pnpm lint`
2. **Format**: `pnpm format:check`
3. **Typecheck**: `pnpm typecheck`
4. **Test**: `pnpm test:run --passWithNoTests`
5. **Build**: `pnpm build`

環境: Node.js 22, pnpm 10, `--frozen-lockfile` でバージョン固定。

---

## 禁止事項

- `any` 型の使用（理由: strict モードの型安全性を損なう）
- `@ts-ignore` の使用（理由: `@ts-expect-error` に理由コメントを付けて使う）
- `eslint-disable` コメント（理由: Biomeを使用しているため無意味）
- `console.log` の本番コードへの残存（理由: デバッグ用途はテスト時のみ）

---

## 参考

- [Biome Linter Rules](https://biomejs.dev/linter/)
- [Astro TypeScript](https://docs.astro.build/en/guides/typescript/)
- プロジェクト: `biome.json`, `tsconfig.json`
