---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "src/**/*.astro"
---

# 命名規則

## コンポーネント

PascalCase。ファイル名とエクスポート名を一致させる。

```
ThemeToggle.tsx → export function ThemeToggle()
PostCard.astro  → <PostCard />
```

## Hooks

`use` prefix + camelCase。

```
useScrapboxData.ts → export function useScrapboxData()
useScrollSpy.ts    → export function useScrollSpy()
```

## ユーティリティ / lib

camelCase。

```
utils.ts, queryClient.ts
```

## 型 / インターフェース

PascalCase。Props は `interface Props` で統一。

```typescript
interface Props { ... }
type ScrapboxPageData = { ... }
interface HeadingItem { ... }
```

## テストファイル

`*.test.ts` / `*.test.tsx`。ソースファイルと同じディレクトリに配置。

```
SearchBox.tsx
SearchBox.test.tsx
```

## インポート

`@/*` 絶対パスを使う。ディレクトリをまたぐ相対パスは禁止。

```typescript
// GOOD
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// BAD
import { cn } from "../../lib/utils";
```
