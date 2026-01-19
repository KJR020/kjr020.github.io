# Research Notes

## Discovery Phase Findings

### 既存コンポーネント分析

#### 1. ThemeToggle.tsx（本番環境で使用中）
- **場所**: `src/components/ThemeToggle.tsx`
- **機能**: シンプルなテーマ切り替え（アニメーションなし）
- **特徴**:
  - shadcn/ui `Button` コンポーネントを使用
  - `getInitialTheme()` でDOM状態から初期テーマを取得
  - SSRハイドレーションミスマッチ防止パターン実装済み
  - aria-labelでアクセシビリティ対応

#### 2. theme-toggle.tsx（v0作成、未統合）
- **場所**: `src/components/theme-toggle.tsx`
- **機能**: アニメーション付きテーマ切り替え
- **特徴**:
  - `animationPhase`: "idle" | "cut-out" | "cut-in" の3状態
  - アニメーションタイミング: 350ms (切り替え) → 700ms (フェードアウト) → 1000ms (完了)
  - フルスクリーンオーバーレイ表示
  - `text-foreground/80` でモノトーンスタイリング
  - **問題点**: `"use client"` ディレクティブはNext.js用（Astroでは不要）

#### 3. ThemeInit.astro
- **場所**: `src/components/ThemeInit.astro`
- **機能**: FOUC防止のためのインラインスクリプト
- **特徴**:
  - `is:inline` でバンドルされないスクリプト
  - localStorage → prefers-color-scheme の優先順位でテーマ決定
  - エラーハンドリング（プライベートブラウジング対応）

#### 4. Header.astro
- **場所**: `src/components/Header.astro`
- **機能**: サイトヘッダー
- **特徴**:
  - `z-50` のスタッキングコンテキスト
  - `ThemeToggle` を `client:load` で読み込み
  - **問題**: オーバーレイがヘッダー内に閉じ込められる

### 技術的調査

#### React Portal の必要性
- Header.astro は `z-50` のスタッキングコンテキストを持つ
- フルスクリーンオーバーレイを表示するには、Headerの外にレンダリングが必要
- `createPortal(element, document.body)` を使用して解決

#### createPortal 使用パターン
```typescript
import { createPortal } from "react-dom";

// マウント後にのみPortalを使用
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

// オーバーレイのレンダリング
{mounted && showOverlay && createPortal(
  <div className="fixed inset-0 z-[100]">...</div>,
  document.body
)}
```

#### Astro環境での考慮事項
- `"use client"` ディレクティブは不要（削除する）
- `client:load` でハイドレーション
- ThemeInit.astro との互換性を維持

### デザイン決定

#### アプローチ: パターンC（ハイブリッド）
- **新規作成**: `ThemeToggleAnimated.tsx`
- **ベース**: `theme-toggle.tsx` のアニメーションロジック
- **追加機能**:
  - React Portal でオーバーレイを body 直下にレンダリング
  - `ThemeToggle.tsx` のSSRハイドレーションパターンを採用
- **後処理**: 統合完了後、不要なコンポーネントを削除

#### カラースキーム
- `--foreground` / `--background` テーマ変数を使用
- オーバーレイ背景: `rgba(0,0,0,0.03)` / `rgba(255,255,255,0.03)`
- アイコン: `text-foreground/80`

### 関連ファイル一覧
| ファイル | 役割 | 変更予定 |
|---------|------|---------|
| `src/components/ThemeToggleAnimated.tsx` | 新規コンポーネント | 新規作成 |
| `src/components/Header.astro` | ヘッダー | import先変更 |
| `src/components/ThemeToggle.tsx` | 現行コンポーネント | 統合後削除 |
| `src/components/theme-toggle.tsx` | v0ソース | 統合後削除 |
| `src/components/ThemeInit.astro` | FOUC防止 | 変更なし |
