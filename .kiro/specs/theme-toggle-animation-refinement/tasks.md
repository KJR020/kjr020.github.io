# Implementation Plan

## Overview

| # | Task | Requirements | Parallel |
|---|------|--------------|----------|
| 1 | アニメーション比較ラボを実装判断に使える状態へ仕上げる | 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.4 | - |
| 2 | 本番採用するモーション契約をコード上の定数として固定する | 1.1, 1.2, 1.3, 1.5, 2.1, 2.2, 2.3, 5.2, 5.3 | - |
| 3 | `ThemeToggleAnimated` の通常モーションを実装する | 1.1, 1.2, 1.3, 1.5, 2.1, 2.2, 2.3, 2.5, 4.1, 4.2, 4.4, 4.5 | - |
| 4 | reduced motion、連打防止、タイマー解放を実装する | 2.4, 3.1, 3.2, 3.3, 3.4, 3.5 | - |
| 5 | 既存テーマ連動との互換性を確認する | 4.1, 4.2, 4.3, 4.4, 4.5 | - |
| 6 | 自動テストと品質ゲートで回帰を防ぐ | 1.1, 1.2, 1.3, 1.5, 2.4, 3.1, 3.2, 3.3, 4.1, 4.2, 4.5 | - |

## Implementation Anchors

### Primary Files

| Purpose | Path |
|---------|------|
| 本番トグル | `src/components/ThemeToggleAnimated.tsx` |
| 比較ラボ | `src/components/ThemeAnimationLab.tsx` |
| 比較ラボCSS | `src/components/ThemeAnimationLab.css` |
| 比較ページ | `src/pages/theme-animation-lab.astro` |
| 仕様メモ | `.kiro/specs/theme-toggle-animation-refinement/animation-options.md` |

### Local Commands

```shell
pnpm dev
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
```

比較ページの目視確認:

```shell
pnpm dev
# http://localhost:4321/theme-animation-lab
```

本番テーマ切替の手動確認:

```shell
pnpm dev
# http://localhost:4321/
```

## Tasks

- [x] 1. アニメーション比較ラボを実装判断に使える状態へ仕上げる
- [x] 1.1 比較ラボのlint/typeエラーを解消する
  - `aria-label` を素の `div` に付けず、`role` を付与するかラベル対象を見出しへ寄せる
  - React Hook依存関係を安定化するため、`clearTimers` と `play` を `useCallback` 化する
  - スコア用ドットの `key` に配列indexを使わない
  - Biome format差分を解消する
  - まず新規追加分を直し、既存 `SearchBox.tsx` のlint指摘は別件として扱う
  - _Requirements: 1.1, 1.2, 1.3, 5.1_

  修正スニペット:

  ```tsx
  import { useCallback, useEffect, useRef, useState } from "react";

  const scoreDotKeys = ["1", "2", "3", "4", "5"] as const;

  function ScoreDots({ value }: { value: number }) {
    return (
      <div className="theme-lab__score" role="img" aria-label={`${value} / 5`}>
        {scoreDotKeys.map((key, index) => (
          <span key={key} data-filled={index < value} />
        ))}
      </div>
    );
  }
  ```

  ```tsx
  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }
    timersRef.current = [];
  }, []);

  const play = useCallback(() => {
    clearTimers();
    // existing play body
  }, [clearTimers, isDark, variant.doneAtMs, variant.switchAtMs]);

  useEffect(() => clearTimers, [clearTimers]);
  ```

  確認コマンド:

  ```shell
  pnpm lint
  pnpm typecheck
  ```

- [x] 1.2 比較パターンの見た目と評価軸を揃える
  - 4案を同じモック画面、同じ再生ボタン、同じライト/ダーク状態で比較する
  - `Quiet / Clear / Repeat` の評価がページ上で読める状態を維持する
  - `Quiet Eclipse`、`Paper Lantern`、`Ink Ripple`、`Orbit Shift` の4案を比較できる状態にする
  - 実ページの `document.documentElement.classList` と `localStorage.theme` を変更しない
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.4_

  比較対象の実装設定:

  ```ts
  type VariantId = "quiet-eclipse" | "paper-lantern" | "ink-ripple" | "orbit-shift";

  interface VariantConfig {
    id: VariantId;
    name: string;
    concept: string;
    motion: string;
    fit: string;
    switchAtMs: number;
    doneAtMs: number;
    scores: {
      quiet: number;
      clear: number;
      repeat: number;
    };
  }
  ```

  手動確認:

  ```shell
  pnpm dev
  # http://localhost:4321/theme-animation-lab を開く
  # 各カードの「再生」と「全部再生」で挙動を比較する
  ```

- [x] 1.3 比較ラボを本番導線から分離する
  - `/theme-animation-lab` は未リンクの検証用ページとして維持する
  - 比較用CSSは `.theme-lab` 配下のクラスに限定する
  - 本番実装完了後に比較ページを残すか削除するか判断できるよう、比較用途を `animation-options.md` に残す
  - _Requirements: 5.1, 5.4_

  CSSスコープの基本形:

  ```css
  .theme-lab {
    width: min(1180px, calc(100vw - 2rem));
    margin: 0 auto;
  }

  .theme-lab__stage {
    position: relative;
    overflow: hidden;
  }
  ```

- [ ] 2. 本番採用するモーション契約をコード上の定数として固定する
- [ ] 2.1 比較結果から本番候補を1案に絞る
  - 候補は原則 `Quiet Eclipse` とし、比較結果で違和感があれば `Paper Lantern` を次点にする
  - 採用案について、波、アイコン、テーマ反映、フェード、ロック解除の順序を固定する
  - 外部ライブラリは今回導入しない判断を維持する
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 5.2, 5.3_

  採用判断メモの追記先:

  ```markdown
  # .kiro/specs/theme-toggle-animation-refinement/animation-options.md

  ## Decision

  - Selected: Quiet Eclipse
  - Reason: ボタン起点で因果が明確、既存の波演出とテストケースに合う
  - Rejected: Paper Lantern は紙面感が良いが、操作点との因果が弱い
  ```

- [ ] 2.2 モーション設定を単一の契約として定義する
  - duration、delay、easing、完了タイミングを一箇所で確認できるようにする
  - `setTimeout` に数値リテラルを直接書かない
  - CSS transitionにも同じ値を渡し、JSとCSSのタイミングを同期する
  - _Requirements: 2.1, 2.2, 2.3_

  本番コードの定数案:

  ```tsx
  const THEME_TOGGLE_MOTION = {
    waveMs: 560,
    switchAtMs: 260,
    fadeMs: 140,
    iconMs: 220,
    settleMs: 720,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  } as const;

  type ThemeName = "light" | "dark";
  type IconPhase = "idle" | "exit" | "enter";
  ```

- [ ] 3. `ThemeToggleAnimated` の通常モーションを実装する
- [ ] 3.1 ボタン起点の波アニメーションに整理する
  - トグルボタン中心から画面全体を覆う波を展開する
  - 現在の右上/左下起点をやめ、`buttonRef.current.getBoundingClientRect()` から起点を計算する
  - 波の色は切替先テーマの背景として自然に見える値を使う
  - オーバーレイは `pointer-events: none` のまま維持する
  - _Requirements: 1.1, 1.2, 1.5, 3.5, 4.4_

  波ジオメトリのコア:

  ```tsx
  interface WaveGeometry {
    left: number;
    top: number;
    size: number;
  }

  function getWaveGeometry(button: HTMLButtonElement): WaveGeometry {
    const rect = button.getBoundingClientRect();
    const left = rect.left + rect.width / 2;
    const top = rect.top + rect.height / 2;

    const corners = [
      [0, 0],
      [window.innerWidth, 0],
      [0, window.innerHeight],
      [window.innerWidth, window.innerHeight],
    ] as const;

    const radius = Math.max(...corners.map(([x, y]) => Math.hypot(x - left, y - top)));

    return {
      left,
      top,
      size: radius * 2,
    };
  }
  ```

  波styleのコア:

  ```tsx
  const geometry = getWaveGeometry(buttonRef.current);

  setWaveStyle({
    left: geometry.left,
    top: geometry.top,
    width: geometry.size,
    height: geometry.size,
    transform: "translate(-50%, -50%) scale(0)",
  });

  requestAnimationFrame(() => {
    setWaveStyle((prev) => ({
      ...prev,
      transform: "translate(-50%, -50%) scale(1)",
      transition: `transform ${THEME_TOGGLE_MOTION.waveMs}ms ${THEME_TOGGLE_MOTION.easing}`,
    }));
  });
  ```

- [ ] 3.2 テーマ反映とボタン内アイコン遷移を同期する
  - 波が広がる途中で `.dark` class と `localStorage.theme` を更新する
  - ボタン内アイコンを切替先テーマに合わせて短く遷移させる
  - `ThemeInit.astro` が適用した初期テーマをマウント後に読む挙動を維持する
  - _Requirements: 1.3, 2.3, 4.1, 4.2, 4.5_

  テーマ適用のコア:

  ```tsx
  function applyTheme(theme: ThemeName) {
    const isDarkTheme = theme === "dark";
    document.documentElement.classList.toggle("dark", isDarkTheme);
    localStorage.setItem("theme", theme);
  }

  function getInitialTheme(): ThemeName {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  }
  ```

  通常モーションのスケルトン:

  ```tsx
  const nextTheme: ThemeName = isDark ? "light" : "dark";

  setIsAnimating(true);
  setIconPhase("exit");
  setShowWave(true);

  schedule(() => {
    applyTheme(nextTheme);
    setIsDark(nextTheme === "dark");
    setIconPhase("enter");
  }, THEME_TOGGLE_MOTION.switchAtMs);

  schedule(() => {
    setShowWave(false);
  }, THEME_TOGGLE_MOTION.waveMs);

  schedule(() => {
    setIsAnimating(false);
    setIconPhase("idle");
    setWaveStyle({});
  }, THEME_TOGGLE_MOTION.settleMs);
  ```

- [ ] 3.3 不要になった演出状態と未使用参照を整理する
  - 本番採用しない大きな中央アイコン演出を削除する
  - `iconPhase` がボタン内アイコンだけに必要ない場合は削減する
  - 未使用のstate、ref、CSS classを残さない
  - 通常環境でクリックから800ms以内に操作可能状態へ戻す
  - _Requirements: 1.4, 1.5, 2.5_

  削除候補:

  ```tsx
  // 採用しない場合は削除対象
  {createPortal(
    <div className="fixed inset-0 z-70 flex items-center justify-center ...">
      {/* large SunIcon / MoonIcon */}
    </div>,
    document.body,
  )}
  ```

- [ ] 4. reduced motion、連打防止、タイマー解放を実装する
- [ ] 4.1 動き軽減設定を尊重する切替経路を実装する
  - `prefers-reduced-motion: reduce` 有効時は全画面波や大きな移動演出をスキップする
  - 動き軽減時もテーマ変更と保存は即時に完了する
  - `matchMedia` が使えない環境では通常モーションへ倒す
  - _Requirements: 3.1, 3.2_

  Hook案:

  ```tsx
  function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
      if (!window.matchMedia) return;

      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(query.matches);

      const handleChange = () => setPrefersReducedMotion(query.matches);
      query.addEventListener("change", handleChange);

      return () => query.removeEventListener("change", handleChange);
    }, []);

    return prefersReducedMotion;
  }
  ```

  分岐案:

  ```tsx
  if (prefersReducedMotion) {
    applyTheme(nextTheme);
    setIsDark(nextTheme === "dark");
    setIconPhase("idle");
    setIsAnimating(false);
    setShowWave(false);
    setWaveStyle({});
    return;
  }
  ```

- [ ] 4.2 タイマーと連打時の安全性を整える
  - アニメーション中の追加クリックで二重反転が起きないようにする
  - 未完了タイマーをアンマウント時や再実行時にクリーンアップする
  - 操作ロックが必要以上に長く残らないようにする
  - _Requirements: 2.4, 3.3_

  タイマー管理のコア:

  ```tsx
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }
    timersRef.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);
  ```

  連打防止:

  ```tsx
  const toggleTheme = useCallback(() => {
    if (isAnimating) return;
    clearTimers();
    // continue normal or reduced motion flow
  }, [clearTimers, isAnimating]);
  ```

- [ ] 4.3 アクセシビリティ表示を改善する
  - ボタンの `aria-label` を現在の操作意図に合わせる
  - 装飾用オーバーレイとSVGが支援技術の余計な読み上げ対象にならない状態を保つ
  - オーバーレイがフォーカス移動やクリックを妨げないことを確認する
  - _Requirements: 3.4, 3.5_

  ボタン属性案:

  ```tsx
  <button
    ref={buttonRef}
    type="button"
    onClick={toggleTheme}
    disabled={isAnimating}
    aria-label={isDark ? "ライトモードに切り替える" : "ダークモードに切り替える"}
    className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors disabled:cursor-not-allowed"
  >
    {/* icon */}
  </button>
  ```

  オーバーレイ属性案:

  ```tsx
  <div
    className="fixed inset-0 z-60 pointer-events-none overflow-hidden transition-opacity"
    aria-hidden="true"
  >
    {/* wave */}
  </div>
  ```

- [ ] 5. 既存テーマ連動との互換性を確認する
- [ ] 5.1 初期テーマと永続化の互換性を確認する
  - `ThemeInit.astro` が適用した初期テーマをReact側が正しく反映する
  - テーマ切替後の `localStorage.theme` が `"light"` または `"dark"` のまま保存される
  - ページリロード後に選択済みテーマが維持される
  - _Requirements: 4.1, 4.2, 4.5_

  ブラウザコンソール確認:

  ```js
  document.documentElement.classList.contains("dark");
  localStorage.getItem("theme");
  ```

  手動確認手順:

  ```shell
  pnpm dev
  # 1. http://localhost:4321/ を開く
  # 2. テーマボタンを押す
  # 3. DevToolsで html.dark と localStorage.theme を確認する
  # 4. リロードしてテーマが維持されることを確認する
  ```

- [ ] 5.2 コメント・コード表示・CSS変数の追従を確認する
  - `.dark` class変更により既存のコメントテーマ連動が継続する
  - コードブロックのShikiテーマが既存CSSのまま追従する
  - 既存CSS変数とTailwindユーティリティの利用方針から外れない
  - _Requirements: 4.3, 4.4_

  確認ページ例:

  ```shell
  pnpm dev
  # 記事詳細ページを開き、コードブロックとGiscus表示があるページで確認する
  ```

  CSS変数確認:

  ```js
  getComputedStyle(document.documentElement).getPropertyValue("--background");
  getComputedStyle(document.documentElement).getPropertyValue("--foreground");
  ```

- [ ] 6. 自動テストと品質ゲートで回帰を防ぐ
- [ ] 6.1 テーマ切替の単体またはコンポーネントテストを追加する
  - 通常モーションで予定タイミング後にテーマが反転することを検証する
  - 動き軽減時に即時切替され、波演出が開始されないことを検証する
  - 連打やアンマウント時に未完了タイマーが残らないことを検証する
  - _Requirements: 1.1, 1.2, 1.3, 2.4, 3.1, 3.2, 3.3, 4.2_

  テストの骨子:

  ```tsx
  import { fireEvent, render, screen } from "@testing-library/react";
  import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
  import { ThemeToggleAnimated, THEME_TOGGLE_MOTION } from "./ThemeToggleAnimated";

  describe("ThemeToggleAnimated", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      localStorage.clear();
      document.documentElement.classList.remove("dark");
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
      localStorage.clear();
      document.documentElement.classList.remove("dark");
    });

    test("switches from light to dark after the configured timing", () => {
      render(<ThemeToggleAnimated />);

      fireEvent.click(screen.getByRole("button", { name: "ダークモードに切り替える" }));
      vi.advanceTimersByTime(THEME_TOGGLE_MOTION.switchAtMs);

      expect(document.documentElement).toHaveClass("dark");
      expect(localStorage.getItem("theme")).toBe("dark");
    });
  });
  ```

  実行コマンド:

  ```shell
  pnpm test:run -- src/components/ThemeToggleAnimated.test.tsx
  ```

- [ ] 6.2 E2Eでユーザー操作の最終状態を確認する
  - ライトからダークへ切り替えた後に `html.dark` が付与されることを確認する
  - ダークからライトへ切り替えた後に `html.dark` が除去されることを確認する
  - リロード後も保存済みテーマが維持されることを確認する
  - _Requirements: 4.1, 4.2, 4.5_

  Playwright骨子:

  ```ts
  import { expect, test } from "@playwright/test";

  test("theme toggle persists dark mode", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "ダークモードに切り替える" }).click();

    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("theme")))
      .toBe("dark");

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
  ```

  実行コマンド:

  ```shell
  pnpm test:e2e -- --project=chromium
  ```

- [ ] 6.3 品質ゲートを実行する
  - `pnpm lint` で新規・既存のlintエラーを確認する
  - `pnpm test:run` でユニットテストを確認する
  - `pnpm build` でAstroビルドを確認する
  - lintが既存 `SearchBox.tsx` 由来で失敗する場合は、新規変更由来のエラーと切り分けて記録する
  - _Requirements: 1.5, 4.5_

  最終確認コマンド:

  ```shell
  pnpm lint
  pnpm typecheck
  pnpm test:run
  pnpm build
  ```

## Requirements Coverage

| Requirement | Tasks |
|-------------|-------|
| 1.1 | 1.1, 1.2, 2.1, 3.1, 6.1 |
| 1.2 | 1.1, 1.2, 2.1, 3.1, 6.1 |
| 1.3 | 1.1, 1.2, 2.1, 3.2, 6.1 |
| 1.4 | 1.2, 3.3 |
| 1.5 | 1.2, 2.1, 3.1, 3.3, 6.3 |
| 2.1 | 2.2 |
| 2.2 | 2.2 |
| 2.3 | 2.2, 3.2 |
| 2.4 | 4.2, 6.1 |
| 2.5 | 3.3 |
| 3.1 | 4.1, 6.1 |
| 3.2 | 4.1, 6.1 |
| 3.3 | 4.2, 6.1 |
| 3.4 | 4.3 |
| 3.5 | 3.1, 4.3 |
| 4.1 | 3.2, 5.1, 6.2 |
| 4.2 | 3.2, 5.1, 6.1, 6.2 |
| 4.3 | 5.2 |
| 4.4 | 3.1, 5.2 |
| 4.5 | 3.2, 5.1, 6.2, 6.3 |
| 5.1 | 1.1, 1.2, 1.3 |
| 5.2 | 2.1 |
| 5.3 | 2.1 |
| 5.4 | 1.2, 1.3 |
