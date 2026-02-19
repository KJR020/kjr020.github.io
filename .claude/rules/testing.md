# テストルール

このルールは、Vitest（ユニット/コンポーネント）とPlaywright（E2E）のテスト実装に関するガイドラインを定義する。

## 適用条件

- `src/**/*.test.ts`, `src/**/*.test.tsx` ファイルの作成・編集時
- `e2e/**/*.spec.ts` ファイルの作成・編集時
- テスト対象のコンポーネント・関数を変更した時

---

## 1. テスト戦略

### 役割分担

| ツール | 対象 | ファイルパターン |
|--------|------|------------------|
| Vitest | ユーティリティ関数、React Hooks、Reactコンポーネント | `src/**/*.test.{ts,tsx}` |
| Playwright | ページフロー、ナビゲーション、レスポンシブ表示 | `e2e/**/*.spec.ts` |

### テスト配置

```
src/
├── lib/
│   ├── utils.ts          # 実装
│   └── utils.test.ts     # テスト（並置）
├── components/
│   ├── MobileMenu.tsx
│   ├── MobileMenu.test.tsx  # テスト（並置）
│   └── toc/
│       ├── useScrollSpy.ts
│       └── useScrollSpy.test.ts
e2e/
├── header.spec.ts        # E2Eテスト
└── ...
```

---

## 2. Vitest ユニットテスト

### 基本構造

```typescript
import { describe, expect, it } from "vitest";

describe("cn", () => {
  describe("単一クラス名の処理", () => {
    it("単一の文字列クラスを返す", () => {
      expect(cn("text-red-500")).toBe("text-red-500");
    });
  });

  describe("エッジケース", () => {
    it("オブジェクト形式のクラスを処理する", () => {
      expect(cn({ "text-red-500": true, "bg-blue-500": false })).toBe("text-red-500");
    });
  });
});
```

**規約:**
- `describe` でカテゴリ分け（機能グループ / エッジケース）
- `it` の説明は**日本語**で記述
- 1つのテストは1つの動作のみ検証

### Reactコンポーネントテスト

```tsx
/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MobileMenu } from "./MobileMenu";

const mockNavItems = [
  { href: "/", label: "Home" },
  { href: "/archive", label: "Archive" },
];

describe("MobileMenu", () => {
  it("初期状態でハンバーガーアイコンが表示される", () => {
    render(<MobileMenu navItems={mockNavItems} />);
    const button = screen.getByRole("button", { name: /メニューを開く/ });
    expect(button).toBeInTheDocument();
  });

  it("クリックでメニューが開きaria-expandedがtrueになる", () => {
    render(<MobileMenu navItems={mockNavItems} />);
    const button = screen.getByRole("button", { name: /メニューを開く/ });
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });
});
```

**規約:**
- `@vitest-environment jsdom` でDOM環境を指定
- `screen.getByRole` を優先（アクセシビリティセレクタ）
- モックデータはテストファイル内でconst定義

### セレクタの優先順位

```typescript
// 1. getByRole（最優先: アクセシビリティ重視）
screen.getByRole("button", { name: /メニューを開く/ });

// 2. getByText
screen.getByText("すべて見る");

// 3. getByTestId（上記で取得困難な場合のみ）
screen.getByTestId("theme-toggle");

// Bad: 実装詳細に依存
document.querySelector(".mobile-menu-button");
document.getElementById("menu-btn");
```

### Hooks テスト

```typescript
import { act, renderHook } from "@testing-library/react";
import { beforeEach, afterEach, vi } from "vitest";

describe("useScrollSpy", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    document.body.innerHTML = `<h2 id="heading-1">Heading 1</h2>`;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("見出しがビューポートに入るとactiveIdが更新される", () => {
    const { result } = renderHook(() => useScrollSpy(["heading-1"]));
    act(() => {
      observer.triggerEntries([{ isIntersecting: true, target: element }]);
    });
    expect(result.current.activeId).toBe("heading-1");
  });
});
```

**規約:**
- ブラウザAPIのモックは `vi.stubGlobal` を使用
- `beforeEach`/`afterEach` で必ずセットアップ/クリーンアップ
- 状態変更は `act()` でラップ

---

## 3. Playwright E2Eテスト

### 基本構造

```typescript
import { expect, test } from "playwright/test";

test.describe("モバイルビューポートでのメニュー動作", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("ハンバーガーメニューが表示される", async ({ page }) => {
    await page.goto("/");
    // Astro Islandのハイドレーション完了を待機
    await page.waitForSelector("astro-island[client='load']:not([ssr])");

    const button = page.getByRole("button", { name: /メニューを開く/ });
    await expect(button).toBeVisible();
  });
});

test.describe("デスクトップビューポートでの表示", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("水平ナビゲーションが表示される", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header nav");
    await expect(nav).toBeVisible();
  });
});
```

**規約:**
- `test.use()` でビューポートを明示的に指定
- `page.waitForSelector("astro-island...")` でAstro Islandのハイドレーション待機
- `getByRole` を優先（Vitestと同じセレクタ方針）
- テスト説明は**日本語**

### テスト対象ブラウザ

| プロジェクト | デバイス |
|-------------|----------|
| chromium | Desktop Chrome |
| Mobile Chrome | Pixel 5 |

### 待機パターン

```typescript
// Good: Astro Island ハイドレーション待機
await page.waitForSelector("astro-island[client='load']:not([ssr])");

// Good: ナビゲーション完了待機
await page.waitForURL(/\/archive/);

// Bad: 固定時間の待機
await page.waitForTimeout(3000);
```

---

## 4. テスト設定

### Vitest (`vitest.config.ts`)

```typescript
export default getViteConfig({
  test: {
    environment: "jsdom",
    globals: true,                          // describe/it/expect をグローバルで使用
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],    // cleanup, jest-dom 設定
  },
});
```

### セットアップファイル (`src/test/setup.ts`)

```typescript
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
});
```

---

## 禁止事項

- `test.only()` / `describe.only()` のコミット（理由: CIで `forbidOnly: true` 設定済み）
- `waitForTimeout()` による固定時間待機（理由: テストの不安定性を招く）
- CSSクラス名やIDをセレクタとして使用（理由: 実装変更で壊れやすい）
- テスト間の状態依存（理由: 並列実行で予期しない結果になる）

---

## 参考

- [Astro Testing](https://docs.astro.build/en/guides/testing/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- プロジェクト: `vitest.config.ts`, `playwright.config.ts`, `src/test/setup.ts`
