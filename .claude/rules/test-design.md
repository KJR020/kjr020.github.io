---
paths:
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
  - "functions/**/*.test.ts"
  - "e2e/**/*.spec.ts"
---

# テスト設計ルール

このルールは、**「何を」「どこまで」テストするか**を体系的に判断するためのガイドライン。
Vitest/Playwright の**書き方**は `testing.md` を参照し、本ルールは**設計**に特化する。

## 適用条件

- 新しいテストファイルを作成する時
- 既存テストに大幅にケースを追加する時
- テストレビュー時に「網羅性が十分か」を判断する時
- セキュリティ境界や外部 I/O を扱うコードのテストを書く時

---

## 1. テスト戦略の全体像

### どの戦略を採るか

| 戦略 | 思想 | このプロジェクトでの採用度 |
|------|------|---------------------------|
| Testing Pyramid | Unit 多め、E2E 少なめ | 部分採用 |
| **Testing Trophy** (Kent C. Dodds) | **統合テスト厚め、型で底固め** | **主に採用** |
| Risk-based | 壊れた時のダメージ×確率で優先度 | 常に併用 |

**基本姿勢**: TypeScript strict で型の壁を作り (Trophy の底辺)、境界 (API/Proxy) の統合テストを厚く、UI ユニットは最小限。

### 書かないもの (Test what you own)

- 他人のライブラリ内部 (Cytoscape / React Query / Vitest 自体)
- ブラウザ内蔵 API の再検証 (DOM / fetch / Promise)
- `.astro` コンポーネントの静的 frontmatter
- 既に型で保証されている契約

---

## 2. 入力クラスの分類 (Equivalence Class Partitioning)

### 基本の流れ

```text
1. 入力を特定する
   ↓
2. 関数の「判断分岐」を列挙する (下記 3 視点から)
   ↓
3. 「同じ扱いを受ける値のグループ」に集約する
   ↓
4. 各グループに代表値を 1 つ配置
   ↓
5. グループ境界に近い値 (BVA) を追加
```

### 分類の元になる 3 つの視点

クラスを **1 つの視点からだけ出すと漏れる**。必ず 3 視点を重ねる。

#### 視点 1: コードパス (実装由来)

関数のコードを読み、どの入力でどの分岐を通るかを辿る。

```typescript
function getAllowedOrigin(request: Request): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;                              // 分岐 1
  if (ALLOWED_ORIGINS.includes(origin)) return origin;   // 分岐 2
  if (origin.startsWith("http://localhost:")) return origin; // 分岐 3
  return null;                                           // 分岐 4
}
```

→ 最低 4 クラスを機械的に導出できる。

#### 視点 2: 仕様・契約 (要件由来)

「この関数が**何を保証すべきか**」から出す。実装ではなく契約を読む。

例: `getAllowedOrigin`
- 正常: 本番ドメインと Preview 両方許可
- 正常: localhost は開発用途で許可
- 異常: **類似ドメインも拒否する** (fail-closed)

「類似ドメインを拒否」は実装分岐に明示的に存在しないが、契約として必要なので
「ホワイトリストに類似するが不一致」クラスを追加する。

#### 視点 3: 脅威モデル / 実世界の入力 (ドメイン由来)

「何が悪用されうるか」「現実に何が来うるか」から出す。

CORS の例:
- サブドメイン偽装 (`*.allowed.com.evil.com`)
- スキーム downgrade (`http://`)
- `null` Origin (iframe sandbox, file://, redirect)
- 大文字小文字の揺れ (RFC 的には異なる)
- localhost 偽装 (`localhost.evil.com`)
- IPv4/IPv6 別表記 (`127.0.0.1`, `[::1]`)

→ 視点 1 では出ないケースが露出する。

### 視点ごとの役割

| クラス | 視点 1 (コード) | 視点 2 (契約) | 視点 3 (脅威) |
|--------|-----|-----|-----|
| 正常系 | ✅ 主 | ✅ 主 | - |
| 境界値 | ✅ 主 | ✅ 主 | - |
| 類似不一致 | - | ✅ 主 | ✅ 主 |
| 偽装・特殊値 | - | - | ✅ 主 |
| 実行時型違反 | - | - | ✅ 主 |

**コードだけ見てテストを書くと、視点 2/3 のクラスが漏れる → セキュリティホールになりうる**。

---

## 3. 境界値分析 (BVA)

数値・長さ・範囲がある時は、境界の両側をテストする。

### 基本パターン: `n-1, n, n+1`

例: `PROJECT_NAME_MAX_LENGTH = 64` のテスト

```typescript
it.each([
  ["下限-1 (空)", ""],
  ["下限 (1文字)", "a"],
  ["中央", "KJR020"],
  ["上限 (64文字)", "a".repeat(64)],
  ["上限+1 (65文字)", "a".repeat(65)],
])("%s (%s)", (_label, input) => { ... });
```

### BVA の対象になるもの

- 文字列長: `0, 1, max, max+1`
- 数値範囲: `min-1, min, max, max+1`
- 配列サイズ: `[], [1], [max items], [max+1 items]`
- 時刻: `過去 / 今 / 未来 / エポック / Infinity`
- ステータスコード: `200, 299, 300, 399, 400, 599`

---

## 4. クラスの粒度ガイドライン

### 粗すぎるサイン (分割したほうがいい)

- 「異常系」1 クラスに 10 個以上入ってる → 中で挙動が違うなら分ける
- クラス名が「異常系」「エラー系」など抽象的 → 具体的にリネーム

### 細かすぎるサイン (統合したほうがいい)

- 1 クラスに 1 件しかテストが入らない → 隣のクラスと同じ扱いなら統合
- クラス名が**実装詳細を説明**している (`startsWith の分岐 X`) → 契約視点で名付け直す

### ちょうどいいサイン

- 各クラスが「人間に意味のある名前」で説明できる
- 「このクラスが壊れたら何が壊れたか」が名前から分かる
- `it.each` 配列に新ケースを 1 行追加できる構造になっている

---

## 5. Vitest の書き方 (設計反映)

### describe のネストでクラスを可視化

```typescript
describe("getAllowedOrigin", () => {
  describe("[A] Origin 欠落", () => { ... });
  describe("[B] ホワイトリスト完全一致 (正常系)", () => { ... });
  describe("[C] localhost 特例 (正常系)", () => { ... });
  describe("[D] 類似ドメイン不一致 (境界・異常系)", () => { ... });
  describe("[E] localhost 類似不一致 (境界・異常系)", () => { ... });
  describe("[F] 特殊値 (異常系)", () => { ... });
});
```

- 外側 describe = 関数名
- 内側 describe = クラス名 (`[A]` などの ID を付けると対応が追いやすい)
- `it` = そのクラス内の個別ケース

### 類似ケースは `it.each` でパラメタライズ

```typescript
describe("[D] ホワイトリストに類似するが不一致", () => {
  it.each([
    ["末尾スラッシュ違い", "https://kjr020.dev/"],
    ["大文字違い", "https://KJR020.dev"],
    ["スキーム違い (http)", "http://kjr020.dev"],
    ["サブドメイン偽装", "https://kjr020.dev.evil.com"],
    ["廃止ドメイン", "https://kjr020.github.io"],
  ])("%s は拒否する (%s)", (_label, origin) => {
    expect(getAllowedOrigin(reqWith(origin))).toBeNull();
  });
});
```

- 同じ構造のテストは羅列せず `it.each` で表形式に
- 先頭の label 引数は**テスト失敗時のメッセージ**になるため必ず書く
- ケース追加は配列に 1 行追加で済む

### AAA (Arrange / Act / Assert) を意識

```typescript
it("本番ドメインを許可", () => {
  // Arrange: テストデータの準備
  const request = reqWith("https://kjr020.dev");

  // Act: 被テスト関数の実行
  const result = getAllowedOrigin(request);

  // Assert: 結果の検証
  expect(result).toBe("https://kjr020.dev");
});
```

小さな関数では 1 行で書いても良いが、複雑になるほど AAA で分けると可読性が上がる。

### テスト名の書き方

- 日本語で書く (このプロジェクト規約)
- **入力条件 + 期待される結果**を含める
- 実装詳細ではなく**契約**を書く

```typescript
// Good: 契約を述べている
it("Origin ヘッダが無ければ null を返す", () => { ... });
it("廃止された github.io ドメインは拒否する", () => { ... });

// Bad: 実装詳細に依存
it("headers.get が null を返したとき return null する", () => { ... });
it("ALLOWED_ORIGINS.includes が false で startsWith が false なら...", () => { ... });
```

---

## 6. 網羅性判定チェックリスト

テストを書き終えた後、以下を機械的にチェックする:

```text
□ 視点 1 (コード): 全ての if/switch/三項分岐にクラスが対応しているか
□ 視点 2 (契約):   契約の全保証項目にクラスが対応しているか
□ 視点 3 (脅威):   脅威モデルの各パターンにクラスが対応しているか
□ BVA:            長さ・範囲・数値に境界値 (n, n±1) があるか
□ クラス網羅:     各 describe の子 it が 1 件以上あるか
□ 正常/異常:       正常系と異常系の両方に最低 1 クラスあるか
□ 副作用:         外部 I/O (fetch / DB / file) のエラーケースを検証しているか
□ Secret 漏洩:    レスポンス body / エラーメッセージに secret が含まれないか
```

---

## 7. アンチパターン

### 実装を追従するだけのテスト

```typescript
// Bad: 実装と 1:1 対応で中身を検証していない
it("fetchPages を呼ぶ", () => {
  const spy = vi.spyOn(module, "fetchPages");
  subject();
  expect(spy).toHaveBeenCalled();
});
```

呼び出されたかだけで**何が起きたか**を見ない。リファクタで壊れる。

### 一つの it に複数検証

```typescript
// Bad: 3 つのアサーションが 1 つの it に
it("正しく動く", () => {
  expect(a).toBe(1);
  expect(b).toBe(2);
  expect(c).toBe(3);
});
```

1 つ目が失敗すると 2 つ目以降が実行されない。境界・契約ごとに分ける。

### モックが本体より多い

```typescript
// Bad: モックの組み立てが 50 行、検証が 1 行
vi.mock("./a");
vi.mock("./b");
vi.mock("./c");
vi.mock("./d");
// ...
expect(result).toBe(true);
```

**Test what you own** の原則に反している。多くのモックが必要なら、
「テストしたい本当のロジック」が別の場所にあるか、設計を分割する余地がある。

### Secret が雑にテストに混入

```typescript
// Bad: 本物の SID が流出する
const SCRAPBOX_SID = "s:actual-production-sid.signature";
```

テスト用の**明らかにダミーだと分かる値**を使う (`"s:test.sig"`, `"fake-sid"` 等)。

---

## 8. プロジェクト固有の考慮点

### Cloudflare Pages Functions

- `PagesFunction` の context は `{ params, env, request }`。テストでは最小限のモックで良い
- `env.SCRAPBOX_SID` 等の Secret は必ずダミー値で検証
- レスポンスヘッダ (CORS / Cache-Control) は契約として必ずテスト

### Scrapbox API Proxy

- descriptions 原文がレスポンスに含まれないこと ([K-3])
- Secret 値がレスポンス body / エラーに漏れないこと ([K-1])
- CORS が本番ドメインホワイトリストで機能すること ([K-9])

### React コンポーネント

- アクセシビリティを破壊しない (role / aria) — 視点 2
- hydration mismatch を起こさない — 視点 3 (SSR 環境特有)
- 大量データで再計算が爆発しない — 視点 3 (パフォーマンス)

---

## 9. テスト設計のレビューフロー

PR レビュー時に使うフロー:

```text
1. describe のネスト構造を見る
   → クラス分類が可視化されているか? "describe A" だけのフラットなら refactor 依頼

2. 各クラスのケース数を数える
   → 0 件のクラスがないか? 1 件だけのクラスは統合を検討

3. 視点 3 (脅威モデル) のクラスがあるか
   → 特に境界 API / セキュリティコードで欠けがちなポイント

4. it.each を使う余地がないか
   → 類似 it が 3 件以上並んでいれば統合候補

5. テスト名が契約を説明しているか
   → 実装詳細への言及があれば rename 依頼
```

---

## 参考文献

- Kent C. Dodds, "Testing Trophy" (<https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications>)
- Lee Copeland, "A Practitioner's Guide to Software Test Design" — 同値分割 / 境界値分析の古典
- OWASP Top 10 — 視点 3 (脅威モデル) の入力源
- プロジェクト: [testing.md](./testing.md) — Vitest/Playwright の書き方
