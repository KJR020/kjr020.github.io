# スタイリングルール

このルールは、Tailwind CSSを中心としたスタイリングに関するガイドラインを定義する。

## 適用条件

- `src/**/*.astro`, `src/**/*.tsx` ファイルでクラス名を記述する時
- `src/styles/globals.css` の編集時
- 新しいUIコンポーネントを作成する時

---

## 1. カラーシステム

### CSS変数ベースのデザイントークン

プロジェクトではCSS変数でカラートークンを定義し、Tailwindクラスから参照する。

```css
/* src/styles/globals.css で定義済み */
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(240 10% 3.9%);
  --primary: hsl(240 5.9% 10%);
  --muted-foreground: hsl(240 3.8% 46.1%);
  --border: hsl(240 5.9% 90%);
  /* ... */
}

.dark {
  --background: hsl(240 10% 3.9%);
  --foreground: hsl(0 0% 98%);
  /* ... */
}
```

```tsx
// Good: セマンティックなトークン名を使用
<div className="bg-background text-foreground border-border" />
<p className="text-muted-foreground" />
<button className="bg-primary text-primary-foreground" />

// Bad: ハードコードされた色
<div className="bg-white text-gray-900" />
<div style={{ color: "#333" }} />
```

### ダークモード

```tsx
// Good: CSS変数が自動的に切り替わるため、dark: prefix は最小限に
<div className="bg-background" />  // light/dark 両対応

// 必要な場合のみ dark: prefix を使用
<button className="border bg-background dark:bg-input/30 dark:border-input" />
```

---

## 2. クラス名の記述パターン

### cn() ユーティリティで動的クラスを管理

```tsx
import { cn } from "@/lib/utils";

// Good: cn() で条件付きクラスを管理
<div className={cn(
  "flex items-center gap-2",
  isActive && "bg-accent text-accent-foreground",
  className,
)} />

// Good: 複数行で可読性を確保
<Card className={cn(
  "shrink-0 w-56 p-4",
  "rounded-lg border",
  "bg-card transition-colors hover:bg-accent/50",
  "flex flex-col h-40",
)} />

// Bad: 文字列結合
<div className={`flex items-center ${isActive ? "bg-accent" : ""}`} />
```

### CVA でバリアント管理（UIコンポーネント）

```tsx
// Good: UI基盤コンポーネントはCVAでvariantを定義
const badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 ...", {
  variants: {
    variant: {
      default: "border-transparent bg-primary text-primary-foreground",
      secondary: "border-transparent bg-secondary text-secondary-foreground",
      outline: "text-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});
```

---

## 3. レスポンシブデザイン

### ブレークポイント

```tsx
// モバイルファースト。md: (768px) を主要ブレークポイントとして使用
<nav className="hidden md:flex" />        // デスクトップのみ表示
<div className="md:hidden" />             // モバイルのみ表示
<div className="lg:grid lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-8" />  // サイドバーレイアウト
```

### コンテナクエリ

```tsx
// Container Query はコンポーネント内レスポンシブに使用
<div className="@container/card-header">
  <div className="@sm:grid-cols-2">...</div>
</div>
```

---

## 4. レイアウトパターン

### ページ共通レイアウト

```astro
<!-- BaseLayout: sticky footer パターン -->
<body class="flex min-h-screen flex-col bg-background text-foreground antialiased">
  <Header />
  <main class="flex-1">
    <slot />
  </main>
  <Footer />
</body>
```

### コンテナ

```astro
<!-- ページコンテンツのコンテナ -->
<div class="container mx-auto px-4 py-8">
  <!-- コンテンツ -->
</div>

<!-- 記事ページ: 最大幅制限 -->
<div class="container mx-auto px-4 py-8 max-w-6xl">
  <!-- 記事 + サイドバー -->
</div>
```

### グリッド

```tsx
// 記事カード一覧: gap-2 の縦並び
<div className="grid gap-2">
  {posts.map((post) => <PostCard post={post} />)}
</div>

// 2カラム（記事 + TOC）
<div className="lg:grid lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-8">
  <article>...</article>
  <aside>...</aside>
</div>
```

---

## 5. トランジションとアニメーション

```tsx
// Good: Tailwindのtransitionユーティリティを使用
<a className="transition-colors hover:bg-accent hover:text-accent-foreground" />
<button className="transition-all" />

// Good: data属性でアニメーション状態を制御（Radix UI）
<Collapsible.Content className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp" />

// アイコンの回転
<ChevronDown className={cn(
  "w-4 h-4 transition-transform duration-200",
  isOpen && "rotate-180",
)} />
```

---

## 6. 記事コンテンツのタイポグラフィ

記事ページの `.prose` クラスは `src/pages/posts/[...slug].astro` の `<style is:global>` で定義。

```astro
<!-- 記事コンテンツの表示 -->
<div class="prose prose-neutral dark:prose-invert max-w-none">
  <Content />
</div>
```

新しいMarkdown要素のスタイルを追加する場合は、`.prose` セレクタ内に追記する。

---

## 禁止事項

- ハードコードされた色値の使用（理由: ダークモード対応が壊れる）
- `@apply` の過度な使用（理由: Tailwind v4では非推奨。コンポーネント抽出で対応）
- `style` 属性でのインラインスタイル（理由: Tailwindクラスと混在すると管理困難。アニメーション計算値を除く）
- `!important` の多用（理由: `cn()` の `twMerge` でクラス競合を解決する）

---

## 参考

- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [CVA (class-variance-authority)](https://cva.style/docs)
- プロジェクト: `src/styles/globals.css`, `src/lib/utils.ts`
