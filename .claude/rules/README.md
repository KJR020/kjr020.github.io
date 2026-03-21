---
paths:
  - ".claude/rules/**"
---

# Rules ディレクトリ運用ガイド

## 条件付きロード（paths フロントマター）

すべてのルールファイルは YAML フロントマターで `paths` を指定する。Claude Code は対象ファイルを編集するときのみ該当ルールをロードし、コンテキスト肥大を防ぐ。

```yaml
---
paths:
  - "src/**/*.tsx"
  - "src/**/*.astro"
---
```

## ディレクトリ構成

```
.claude/rules/
├── README.md              # この運用ガイド
├── astro-react.md         # Astro + React パターン
├── astro-components.md    # コンポーネント設計
├── naming.md              # 命名規則
├── comments.md            # コメントルール
├── styling.md             # スタイリング
├── testing.md             # テスト
├── code-quality.md        # コード品質
├── content-structure.md   # コンテンツ構成
├── content-writing.md     # 執筆品質
└── adr-evolution.md       # ADR変更履歴
```

## ファイル命名

- 小文字ケバブケース: `content-writing.md`, `code-quality.md`
- 1トピック1ファイル: 条件付きロードの粒度を保つため

## 設計根拠ファイル（.adr.md）

ルールの「なぜ」を記録する場合は `.adr.md` 拡張子を使用する。Claude Code は `.md` で終わるファイルを自動ロードするため、`.adr.md` にすることでコンテキストに含まれない。

```
naming.md          # ルール本体（自動ロード対象）
naming.adr.md      # 設計根拠（明示的にReadしたときのみ読まれる）
```

### .adr.md テンプレート

```markdown
# <ルール名> 設計根拠

- **日付**: YYYY-MM-DD
- **対象ルール**: [rule-file.md](rule-file.md)

## コンテキスト
なぜこのルールが必要になったか。

## 決定
何を決めたか。検討した代替案を含む。

## 結果
このルール採用による影響（正・負・注意点）。
```

## 新規ルール作成チェックリスト

1. 既存ルールと重複しないか確認
2. `paths` フロントマターを必ず設定
3. `# FORBIDDEN` / `# REQUIRED` コメント付きコード例を含める
4. 禁止事項に理由を明記
5. トレードオフがある場合は `.adr.md` で根拠を記録
