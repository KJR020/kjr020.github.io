# Test Architecture

このドキュメントは、プロジェクトのテスト戦略と方針を定義する。

## 概要

### 目的
- コード品質の継続的な検証
- リファクタリング時の回帰バグ防止
- CI/CD パイプラインでの自動テスト実行

### テストフレームワーク
- **Vitest**: Unit / Component テスト用の Vite ネイティブテストランナー
- **Playwright**: E2E / Visual regression テスト用のブラウザテストランナー

### ファイル配置
Unit / Component テストファイルは、ソースファイルと同じディレクトリに配置する（コロケーション）。

```
src/
├── lib/
│   ├── utils.ts          # ソースファイル
│   └── utils.test.ts     # テストファイル
└── components/
    └── ui/
        ├── button.tsx
        └── button.test.tsx
```

E2E テストは `playwright.config.ts` の `testDir` に合わせて配置する。現状は `e2e/` を使用している。

```
e2e/
├── header.spec.ts
├── snapshot.spec.ts
├── snapshot.css
└── helpers/
    └── snapshot.ts
```

## テスト対象の評価基準

新しいテストを追加する際は、以下の観点で評価する。

| 観点 | 説明 |
|------|------|
| **テスト価値** | バグ発見・回帰防止にどれだけ貢献するか |
| **実装コスト** | テスト作成にかかる工数・複雑さ |
| **メンテナンスコスト** | コード変更時にテストも変更が必要になる頻度 |
| **依存関係** | 外部ライブラリ・DOM・ブラウザ API への依存度 |
| **ビジネス影響** | バグがあった場合のユーザー影響 |

### 優先度ガイドライン

| 優先度 | 条件 |
|--------|------|
| **高** | テスト価値が高く、実装コストが低い（純粋関数、ユーティリティ） |
| **中** | テスト価値は高いが、DOM モック等の追加設定が必要 |
| **低** | 外部ライブラリのラッパーや、単純な表示コンポーネント |

## テスト種別

### Unit Tests
- 純粋関数、ユーティリティ関数
- テスト環境: `jsdom`（現行設定）
- 依存関係: なし

### Component Tests
- React コンポーネントのロジック
- テスト環境: `jsdom`
- 依存関係: `@testing-library/react`

### E2E Tests
- Playwright を使用
- 配置: `e2e/**/*.spec.ts`
- `pnpm test:e2e` で実行
- スナップショット安定化CSSは `e2e/snapshot.css`

## 設定ファイル

### vitest.config.ts

```typescript
/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}", "functions/**/*.test.ts"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

### playwright.config.ts

```typescript
import { defineConfig } from "playwright/test";

export default defineConfig({
  testDir: "./e2e",
  expect: {
    toHaveScreenshot: {
      stylePath: "./e2e/snapshot.css",
    },
  },
});
```

### package.json scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

## CI 統合

```yaml
- name: Run tests
  run: pnpm test:run --passWithNoTests
```

- `--passWithNoTests`: テストファイルがない場合もエラーにしない
- `test:run`: ウォッチモードではなく単発実行

```yaml
- name: Run E2E tests
  run: pnpm test:e2e
```

## カバレッジ計測

Vitest のカバレッジ計測を使用する。測定対象は `vitest.config.ts` の `coverage.include` で明示する。

```typescript
// vitest.config.ts
export default getViteConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "functions/**/*.ts",
        "src/lib/**/*.ts",
        "src/components/**/use*.ts",
        "src/components/scrapbox/queryClient.ts",
      ],
    },
  },
});
```

## 参考資料

- [Astro Testing Docs](https://docs.astro.build/en/guides/testing/)
- [Vitest Configuration](https://vitest.dev/config/)
- [Testing Library](https://testing-library.com/)
