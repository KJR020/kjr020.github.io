---
name: tdd
description: twadaスタイルのテスト駆動開発（TDD）で機能を実装する。新機能実装時、「TDDで」「テストファーストで」「Red-Green-Refactorで」と言われたときに使用。TODOリスト駆動、仮実装、三角測量、小さなステップを重視。
---

# TDD（テスト駆動開発）- twadaスタイル

## 基本サイクル: Red-Green-Refactor

```
┌─────────────────────────────────────────┐
│  1. Red    → 失敗するテストを書く        │
│  2. Green  → テストを通す最小限のコード  │
│  3. Refactor → 重複を除去、設計を改善    │
└─────────────────────────────────────────┘
```

**鉄則**: 各フェーズで1つのことだけ行う。Redでは実装しない。Greenでは設計改善しない。

## ワークフロー

### Phase 0: TODOリストを作成

実装前に、必要なテストケースをTODOリストとして洗い出す。

```markdown
## TODOリスト
- [ ] 空文字列を渡すと0を返す
- [ ] "1"を渡すと1を返す
- [ ] "1,2"を渡すと3を返す
- [ ] 改行区切りにも対応する
```

**ポイント**:
- 最も単純なケースから始める
- 境界値、エッジケースも含める
- 実装中に気づいたケースは随時追加

### Phase 1: Red（失敗するテストを書く）

1. TODOリストから1つ選ぶ（最も単純なものから）
2. テストを書く
3. テストを実行し、**失敗することを確認**

```typescript
// 例: Vitest
test("空文字列を渡すと0を返す", () => {
  expect(add("")).toBe(0);
});
```

実行して失敗を確認:
```bash
pnpm test:run --reporter=verbose
```

**注意**: コンパイルエラーも「Red」。まず動く状態にしてからテストを失敗させる。

### Phase 2: Green（テストを通す）

**最小限のコードで**テストを通す。

#### 戦略1: 仮実装（Fake It）

まず定数を返す:
```typescript
function add(numbers: string): number {
  return 0; // 仮実装
}
```

#### 戦略2: 明白な実装（Obvious Implementation）

実装が明白な場合は直接書く:
```typescript
function add(numbers: string): number {
  if (numbers === "") return 0;
  return parseInt(numbers, 10);
}
```

**判断基準**: 自信があれば明白な実装、不安があれば仮実装から。

### Phase 3: Refactor

テストが通った状態を維持しながら改善:
- 重複を除去
- 変数名・関数名を改善
- 構造を整理

**必ず**リファクタリング後にテストを実行して緑を確認。

### Phase 4: 次のテストへ

TODOリストの次の項目へ。以下を繰り返す:
1. Red → Green → Refactor
2. TODOリストを更新（完了をチェック、新規を追加）

## 三角測量（Triangulation）

仮実装から一般化する手法。複数のテストケースで実装を「強制」する。

```typescript
// テスト1
test("1を渡すと1を返す", () => {
  expect(add("1")).toBe(1);
});

// 仮実装で通る
function add(numbers: string): number {
  return 1; // これでは不十分
}

// テスト2を追加して三角測量
test("2を渡すと2を返す", () => {
  expect(add("2")).toBe(2);
});

// 一般化を強制される
function add(numbers: string): number {
  return parseInt(numbers, 10);
}
```

## コマンドリファレンス

| フレームワーク | テスト実行 | ウォッチモード |
|--------------|-----------|--------------|
| Vitest | `pnpm vitest run` | `pnpm vitest` |
| Jest | `pnpm jest` | `pnpm jest --watch` |
| pytest | `pytest` | `pytest-watch` |

## チェックリスト

各サイクルで確認:
- [ ] Redフェーズでテストが失敗することを確認したか
- [ ] Greenフェーズで最小限の実装にしたか
- [ ] Refactorフェーズでテストが通ることを確認したか
- [ ] TODOリストを更新したか

## 詳細リファレンス

- [patterns.md](references/patterns.md): 仮実装、三角測量、明白な実装の詳細パターン