# TDDパターン詳細

## Green Phase の3つの戦略

### 1. 仮実装（Fake It）

テストを通す最小限のコード。まず定数を返す。

```typescript
// テスト
test("1+1は2", () => {
  expect(add(1, 1)).toBe(2);
});

// 仮実装
function add(a: number, b: number): number {
  return 2; // ハードコード
}
```

**いつ使う**:
- 実装方法が不明確なとき
- 小さなステップで進みたいとき
- 自信がないとき

### 2. 三角測量（Triangulation）

複数のテストで実装を「強制」する。

```typescript
// テスト1: 仮実装で通る
test("1+1は2", () => {
  expect(add(1, 1)).toBe(2);
});

// テスト2: 一般化を強制
test("2+3は5", () => {
  expect(add(2, 3)).toBe(5);
});

// 一般化された実装
function add(a: number, b: number): number {
  return a + b;
}
```

**いつ使う**:
- 仮実装から一般化するタイミングがわからないとき
- 実装の方向性を確認したいとき

### 3. 明白な実装（Obvious Implementation）

実装が明らかな場合は直接書く。

```typescript
// テスト
test("配列の長さを返す", () => {
  expect(length([1, 2, 3])).toBe(3);
});

// 明白な実装
function length<T>(arr: T[]): number {
  return arr.length;
}
```

**いつ使う**:
- 実装に自信があるとき
- シンプルな操作のとき

**注意**: テストが失敗したら仮実装に戻る。

## TODOリストの作り方

### 良いTODOリストの特徴

1. **具体的**: 「エラーハンドリング」ではなく「空配列でエラーを投げる」
2. **検証可能**: テストとして書けるレベルの粒度
3. **独立**: 順序に依存しない（理想的には）

### 例: FizzBuzz

```markdown
## TODOリスト
- [ ] 1を渡すと"1"を返す
- [ ] 2を渡すと"2"を返す
- [ ] 3を渡すと"Fizz"を返す
- [ ] 5を渡すと"Buzz"を返す
- [ ] 6を渡すと"Fizz"を返す（3の倍数）
- [ ] 10を渡すと"Buzz"を返す（5の倍数）
- [ ] 15を渡すと"FizzBuzz"を返す
- [ ] 30を渡すと"FizzBuzz"を返す
```

### TODOの追加タイミング

- 実装中に気づいたケース → 即座に追加
- エッジケースを思いついた → 即座に追加
- リファクタリングのアイデア → 即座に追加

## リファクタリングパターン

### 安全なリファクタリングの手順

1. テストが通っていることを確認
2. 1つの変更を行う
3. テストを実行
4. 失敗したら元に戻す
5. 成功したら次の変更へ

### よくあるリファクタリング

| パターン | Before | After |
|---------|--------|-------|
| 変数抽出 | `return a * 1.1` | `const taxRate = 1.1; return a * taxRate` |
| 関数抽出 | 長い関数 | 意味のある単位で分割 |
| ガード節 | ネストしたif | 早期return |
| マジックナンバー除去 | `if (age >= 18)` | `if (age >= ADULT_AGE)` |

## アンチパターン

### やってはいけないこと

1. **Redフェーズで実装を書く**
   - テストを書いたら必ず実行して失敗を確認

2. **Greenフェーズでリファクタリング**
   - まず通す、きれいにするのは後

3. **大きなステップで進む**
   - 「1つのテスト、1つの実装変更」を守る

4. **テストを書く前に実装を書く**
   - 実装が先行すると、テストが実装に引きずられる

5. **失敗を確認せずに進む**
   - 「正しく失敗する」ことがテストの品質保証

## テストの書き方

### Arrange-Act-Assert (AAA)

```typescript
test("ユーザー名を更新できる", () => {
  // Arrange: 準備
  const user = createUser({ name: "Alice" });

  // Act: 実行
  user.updateName("Bob");

  // Assert: 検証
  expect(user.name).toBe("Bob");
});
```

### 1テスト1アサーション

理想的には1つのテストで1つのことを検証:

```typescript
// Good: 1つの振る舞いを検証
test("空文字列は無効", () => {
  expect(isValid("")).toBe(false);
});

test("スペースのみは無効", () => {
  expect(isValid("   ")).toBe(false);
});

// Avoid: 複数の振る舞いを1つのテストで
test("無効な入力", () => {
  expect(isValid("")).toBe(false);
  expect(isValid("   ")).toBe(false);
  expect(isValid(null)).toBe(false);
});
```