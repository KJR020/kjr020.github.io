# Design Document

## Overview

テーマ切り替え時に月と太陽が入れ替わるアニメーションを追加する。v0で作成したコンポーネントをベースに、Astro環境向けに新規コンポーネント`ThemeToggleAnimated.tsx`を作成する。

### アプローチ
**パターンC: ハイブリッド**
- 新規ファイル `ThemeToggleAnimated.tsx` を作成
- 統合完了後、不要なコンポーネント（`ThemeToggle.tsx`, `theme-toggle.tsx`）を削除

### 主要な演出
1. **波エフェクト**: ボタンを中心に円形の波が画面全体に広がる
2. **アイコンアニメーション（大）**: 画面中央で太陽/月アイコンがスライドイン/アウト
3. **アイコンアニメーション（小）**: ボタン内のアイコンが縦方向にスライド

## Architecture

### Component Hierarchy

```
Header.astro
└── ThemeToggleAnimated (client:load)
    ├── Toggle Button (in header, z-50)
    │   └── Small Icons (translate-y animation)
    └── Portal → document.body
        ├── Wave Overlay (z-40)
        │   └── Expanding Circle
        └── Icon Overlay (z-50)
            ├── Sun Icon (large)
            └── Moon Icon (large)
```

### State Management

```typescript
// コンポーネント内部状態
interface ThemeToggleState {
  isDark: boolean;                    // 現在のテーマ
  mounted: boolean;                   // クライアントマウント完了
  isAnimating: boolean;               // アニメーション実行中
  showWave: boolean;                  // 波オーバーレイ表示
  waveStyle: React.CSSProperties;     // 波の動的スタイル
  iconPhase: "idle" | "exit" | "enter"; // アイコンアニメーション段階
}

// refs
buttonRef: RefObject<HTMLButtonElement>  // ボタン位置取得用
```

### Animation Timeline

```
0ms     - toggleTheme() 呼び出し
        - isAnimating = true
        - iconPhase = "exit"
        - showWave = true
        - 波のスタイル計算（ボタン位置を中心に）
        - 現在のアイコン（大）がスライドアウト
        - 波が scale(0) → scale(1) へ展開開始

300ms   - テーマ切り替え実行（DOM class変更、localStorage保存）
        - iconPhase = "enter"
        - 新しいアイコン（大）がスライドイン

600ms   - showWave = false
        - 波がフェードアウト

900ms   - isAnimating = false
        - iconPhase = "idle"
        - アニメーション完了
```

## Component Details

### ThemeToggleAnimated.tsx

#### Props
```typescript
// Propsなし - 自己完結型コンポーネント
export function ThemeToggleAnimated(): JSX.Element
```

#### Internal Functions

```typescript
// DOM状態から現在のテーマを取得（ThemeInit.astroで設定済み）
function getInitialTheme(): boolean // isDark

// テーマ切り替えハンドラー
function toggleTheme(): void
```

#### Key Implementation Points

1. **React Portal による2層オーバーレイ**
   ```typescript
   import { createPortal } from "react-dom";

   // 波オーバーレイ（z-40）
   {mounted && createPortal(
     <div className="fixed inset-0 z-40 pointer-events-none">
       <div
         className="absolute rounded-full"
         style={waveStyle}
       />
     </div>,
     document.body
   )}

   // アイコンオーバーレイ（z-50）
   {mounted && createPortal(
     <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
       {/* 大きなアイコン */}
     </div>,
     document.body
   )}
   ```

2. **波エフェクトの計算**
   ```typescript
   const toggleTheme = useCallback(() => {
     const button = buttonRef.current;
     const rect = button.getBoundingClientRect();
     const x = rect.left + rect.width / 2;
     const y = rect.top + rect.height / 2;

     // 画面の対角線の長さを計算
     const maxDistance = Math.sqrt(
       Math.max(x, window.innerWidth - x) ** 2 +
       Math.max(y, window.innerHeight - y) ** 2
     );

     setWaveStyle({
       left: x,
       top: y,
       width: maxDistance * 2,
       height: maxDistance * 2,
       transform: "translate(-50%, -50%) scale(0)",
     });

     // requestAnimationFrameで波を展開
     requestAnimationFrame(() => {
       setWaveStyle(prev => ({
         ...prev,
         transform: "translate(-50%, -50%) scale(1)",
         transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1)",
       }));
     });
   }, []);
   ```

3. **SSRハイドレーション対策**
   ```typescript
   const [mounted, setMounted] = useState(false);
   useEffect(() => setMounted(true), []);

   // マウント前はプレースホルダーを返す
   if (!mounted) {
     return <button className="..."><div className="w-5 h-5" /></button>;
   }
   ```

4. **ボタン内アイコンのアニメーション（縦方向）**
   ```typescript
   // 太陽アイコン（小）
   className={`... ${
     isDark ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
   }`}

   // 月アイコン（小）
   className={`... ${
     isDark ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
   }`}
   ```

5. **大きなアイコンのアニメーション（横方向）**
   ```typescript
   // 太陽アイコン（大）- ライトモードへ切り替え時
   className={`... ${
     !isDark && iconPhase === "enter"
       ? "translate-x-0 opacity-100"
       : !isDark && iconPhase === "exit"
       ? "translate-x-full opacity-0"
       : "-translate-x-full opacity-0"
   }`}

   // 月アイコン（大）- ダークモードへ切り替え時
   className={`... ${
     isDark && iconPhase === "enter"
       ? "translate-x-0 opacity-100"
       : isDark && iconPhase === "exit"
       ? "translate-x-full opacity-0"
       : "translate-x-full opacity-0"
   }`}
   ```

## Styling

### Color Scheme
- **テーマカラー**: `text-foreground` CSS変数を使用
- **波の背景色**:
  - ダークモードへ: `rgb(10, 10, 10)`
  - ライトモードへ: `rgb(250, 250, 250)`
- **オーバーレイ背景**: 透明（`pointer-events-none`）

### Z-Index Hierarchy
```
z-40  - 波オーバーレイ
z-50  - アイコンオーバーレイ、トグルボタン
```

### CSS Transitions

```css
/* 波の展開 */
transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);

/* アイコンのスライド */
transition: all 300ms ease-out;

/* オーバーレイのフェード */
transition: opacity 200ms-300ms;
```

## File Changes

### New Files
| ファイル | 説明 |
|---------|------|
| `src/components/ThemeToggleAnimated.tsx` | アニメーション付きテーマトグル |

### Modified Files
| ファイル | 変更内容 |
|---------|----------|
| `src/components/Header.astro` | import先を `ThemeToggleAnimated` に変更 |

### Files to Delete (after integration & E2E test pass)
| ファイル | 理由 |
|---------|------|
| `src/components/ThemeToggle.tsx` | `ThemeToggleAnimated` に置き換え |
| `src/components/theme-toggle.tsx` | ソースとして使用完了 |

## Accessibility

- **aria-label**: 「テーマを切り替える」を設定
- **aria-hidden**: アイコンSVGには不要（ボタンにaria-labelがあるため）
- **disabled状態**: アニメーション中は `disabled` 属性と `disabled:cursor-not-allowed` スタイル
- **pointer-events**: オーバーレイは `pointer-events-none` でユーザー操作を妨げない

## Testing Considerations

### Unit Tests
- テーマ切り替え機能のテスト
- localStorage保存のテスト

### E2E Tests
- テーマ切り替えボタンのクリック動作
- テーマの永続化（ページリロード後）
- 波エフェクトがボタン位置から展開されることの確認

### Visual Regression
- アニメーションのスムーズさ確認
- 波がヘッダーより前面に表示されることの確認

## Dependencies

- **既存**: React, react-dom, Tailwind CSS
- **追加なし**: 外部ライブラリの追加は不要
