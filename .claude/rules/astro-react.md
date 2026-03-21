---
paths:
  - "src/**/*.astro"
  - "src/**/*.tsx"
---

# Astro + React パターン

## Astro コンポーネント (.astro)

レイアウト、静的UI、ページに使用する。データ取得はfrontmatterで行う。

```astro
---
// frontmatterでデータ取得・ロジック
const posts = await getCollection("posts");
---

<ul>
  {posts.map((post) => <li>{post.data.title}</li>)}
</ul>
```

## React コンポーネント (.tsx)

クライアントサイドのインタラクティビティが必要な場合のみ使用する。

```astro
<!-- client:load: ページロード時に即座にハイドレーション -->
<SearchBox client:load />

<!-- client:visible: ビューポートに入ったときにハイドレーション -->
<ScrapboxCardList client:visible data={scrapboxData} />
```

## エクスポート

Named exportを使う。default exportは禁止。

```typescript
// GOOD
export function ThemeToggle() { ... }

// BAD
export default function ThemeToggle() { ... }
```

## UIプリミティブ

`@/components/ui/` の shadcn/ui コンポーネントを使う。バリアントは `cva` で定義する。

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
```

## コンテンツコレクション

スキーマは `src/content.config.ts` で Zod を使って定義する。
