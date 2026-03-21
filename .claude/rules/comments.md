---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "src/**/*.astro"
---

# コメントルール

## 言語

コメントは日本語で記述する。

## 原則: 「なぜ」を書く

コードが「何をしているか」はコードから読める。コメントは「なぜそうしているか」を書く。

```typescript
// BAD: コードの説明
// 配列をフィルタリングする
const active = items.filter((item) => item.isActive);

// GOOD: 根拠の説明
// SSR時は固定値を使用し、ハイドレーションミスマッチを防止
const [mounted, setMounted] = useState(false);
```

## JSDoc

エクスポートされる型・インターフェース・関数に付与する。

```typescript
/** Scrapbox API レスポンス型 */
export interface ScrapboxPageData {
  title: string;
  descriptions: string[];
}

/** Intersection Observerを使用してアクティブな見出しを検出する */
export function useScrollSpy(headings: HeadingItem[]) { ... }
```

## 書かない場面

- 自明なコードへのコメント
- コードの直訳（`// iを1増やす`）
- TODO以外の一時的なコメント
