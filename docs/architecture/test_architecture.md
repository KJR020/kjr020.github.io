# Test Architecture

このドキュメントは、プロジェクトのテスト戦略と方針を定義する。

## 概要

### 目的
- コード品質の継続的な検証
- リファクタリング時の回帰バグ防止
- CI/CD パイプラインでの自動テスト実行

### テストフレームワーク
- **Vitest**: Vite ネイティブのテストランナー（Astro 公式推奨）

### ファイル配置
テストファイルはソースファイルと同じディレクトリに配置する（コロケーション）。

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
- テスト環境: `node`
- 依存関係: なし

### Component Tests（将来）
- React コンポーネントのロジック
- テスト環境: `jsdom` または `happy-dom`
- 依存関係: `@testing-library/react`

### E2E Tests（スコープ外）
- Playwright を使用（別途導入済み）
- 本ドキュメントのスコープ外

## 設定ファイル

### vitest.config.ts

```typescript
/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
  },
});
```

### package.json scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:watch": "vitest watch"
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

## カバレッジ計測

現時点ではカバレッジ計測は行わない。必要に応じて以下を追加:

```typescript
// vitest.config.ts
export default getViteConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
    },
  },
});
```

## 参考資料

- [Astro Testing Docs](https://docs.astro.build/en/guides/testing/)
- [Vitest Configuration](https://vitest.dev/config/)
- [Testing Library](https://testing-library.com/)
