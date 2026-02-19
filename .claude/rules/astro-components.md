# Astro/React コンポーネント設計ルール

このルールは、Astro/Reactコンポーネントの設計・実装に関するガイドラインを定義する。

## 適用条件

- `src/components/**/*.astro`, `src/components/**/*.tsx` ファイルの作成・編集時
- `src/layouts/**/*.astro` ファイルの作成・編集時
- `src/pages/**/*.astro` ファイルの作成・編集時

---

## 1. コンポーネントの使い分け

### Astro vs React の選択基準

| ケース | 推奨 | 理由 |
|--------|------|------|
| 静的なUI（ヘッダー、フッター、カード表示等） | Astro コンポーネント | クライアントJSゼロでパフォーマンス最適 |
| インタラクティブなUI（トグル、メニュー、フォーム等） | React コンポーネント | 状態管理・イベントハンドリングが必要 |
| 外部APIデータの動的取得・表示 | React + TanStack Query | クライアントサイドでのデータフェッチ |
| ページレイアウト | Astro レイアウト | `<slot />` でページコンテンツを配置 |

### Client Directiveの選択

```astro
// Good: 用途に応じた適切なdirective
<MobileMenu client:load />       // ナビゲーション: 即座に操作可能にする
<Comments client:only="react" /> // SSR不要: クライアントのみでレンダリング
<TableOfContents client:load />  // スクロール連動: 即座に動作させる

// Bad: 全てにclient:loadを使う
<HeavyComponent client:load />   // 画面外なら client:visible を検討
```

| Directive | 用途 |
|-----------|------|
| `client:load` | ページロード時に即座にインタラクティブにする（ナビ、テーマ切替等） |
| `client:idle` | 重要度が低い要素。ブラウザがアイドル状態になるまで待機 |
| `client:visible` | ビューポートに入ったときにJS読み込み（ページ下部の要素等） |
| `client:only="react"` | SSR完全スキップ。外部サービス統合（Giscus等）向け |

---

## 2. 命名規則

### ファイル名

- **PascalCase**: `PostCard.astro`, `MobileMenu.tsx`, `ThemeToggle.tsx`
- テストファイル: コンポーネントと同階層に `ComponentName.test.tsx`

### Props型定義

```typescript
// Astroコンポーネント: interface Props を使用
---
interface Props {
  title: string;
  date: Date;
  tags?: string[];
}

const { title, date, tags = [] } = Astro.props;
---

// Reactコンポーネント: ComponentNameProps を使用
interface MobileMenuProps {
  navItems: NavItem[];
}

export function MobileMenu({ navItems }: MobileMenuProps) {
  // ...
}
```

### Export方式

```typescript
// React: named export function（default exportは使わない）
export function ThemeToggle() { ... }

// UI基盤コンポーネント: named exportで複数エクスポート
export { Card, CardHeader, CardTitle, CardContent };

// Astro: 暗黙的なdefault export（Astro標準の挙動）
```

---

## 3. React コンポーネントパターン

### UI基盤コンポーネント（Shadcn-ui スタイル）

```tsx
// Good: CVA + cn() でvariant管理
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center ...", {
  variants: {
    variant: { default: "...", ghost: "...", outline: "..." },
    size: { default: "h-9 px-4", sm: "h-8 px-3", icon: "size-9" },
  },
  defaultVariants: { variant: "default", size: "default" },
});

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

### SSR/Hydration対策

```tsx
// Good: ハイドレーションミスマッチを防止
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light"); // 固定初期値

  useEffect(() => {
    setTheme(getInitialTheme()); // クライアントで実際の値を同期
  }, []);
}

// Bad: SSR時にwindow/documentを参照
export function ThemeToggle() {
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light" // SSRでエラー
  );
}
```

### アクセシビリティ

```tsx
// Good: aria属性を適切に設定
<Button
  aria-label={theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"}
  aria-expanded={isOpen}
/>

// Good: セマンティックHTMLを使用
<nav aria-label="メインナビゲーション">
  <a href="/" role="link">Home</a>
</nav>
```

---

## 4. Astro ページパターン

### 静的パス生成

```astro
---
// getStaticPaths で全ページを事前生成
export async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}
---
```

### データ取得とソート

```astro
---
// Good: draft除外 + 日付降順ソート
const posts = await getCollection("posts", ({ data }) => !data.draft);
const sortedPosts = posts.sort(
  (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
);
---
```

---

## 5. Importルール

```typescript
// Good: @/ エイリアスで絶対パス
import PostCard from "@/components/PostCard.astro";
import { cn } from "@/lib/utils";
import type { HeadingItem } from "@/components/toc";

// Good: 同一ディレクトリ内は相対パス
import type { TableOfContentsProps } from "./types";

// Good: 型インポートは import type を使用
import type { CollectionEntry } from "astro:content";

// Bad: 深い相対パス
import { cn } from "../../../lib/utils";
```

---

## 禁止事項

- `default export` をReactコンポーネントで使用しない（named exportを使う）
- `any` 型の使用（理由: TypeScript strict モードで型安全性を担保）
- `client:load` の安易な使用（理由: 不要なJSバンドルサイズ増加）
- レイアウト全体をReactコンポーネントでラップ（理由: Astro Islandsの利点が失われる）

---

## 参考

- [Astro Components](https://docs.astro.build/en/basics/astro-components/)
- [Template Directives](https://docs.astro.build/en/reference/directives-reference/)
- [Shadcn-ui](https://ui.shadcn.com/)
