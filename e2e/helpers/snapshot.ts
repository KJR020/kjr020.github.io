import type { Page } from "playwright/test";
import { expect } from "playwright/test";

export interface PageConfig {
  route: string;
  name: string;
  hasIslands: boolean;
}

/**
 * Astro Islandのハイドレーション完了を待機する。
 * hasIslands: true のページのみ待機し、false のページではスキップする。
 * /search ページは追加で .pagefind-ui セレクタの出現を待機する。
 */
export async function waitForHydration(
  page: Page,
  config: PageConfig,
): Promise<void> {
  if (!config.hasIslands) {
    return;
  }

  // state: 'attached' を使用。astro-island は MobileMenu 等がデスクトップで
  // md:hidden のため visible にならないケースがある。DOM への存在確認で十分。
  await page.waitForSelector("astro-island[client='load']:not([ssr])", {
    state: "attached",
    timeout: 30_000,
  });

  if (config.route === "/search") {
    await page.waitForSelector(".pagefind-ui", {
      state: "attached",
      timeout: 30_000,
    });
  }
}

/**
 * テーマを設定する（light/dark）。
 * page.goto() の前に呼び出す。addInitScript で localStorage.theme を注入し、
 * ThemeInit.astro の初期化ロジックがページロード時に正しいテーマを適用する。
 */
export async function setTheme(
  page: Page,
  theme: "light" | "dark",
): Promise<void> {
  await page.addInitScript((t: string) => {
    localStorage.setItem("theme", t);
  }, theme);

  await page.emulateMedia({
    colorScheme: theme,
  });
}

/**
 * スナップショット取得のための安定化処理を実行する。
 * ネットワークアイドル待機後にアニメーション完了を待機する。
 */
export async function stabilizePage(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  // アニメーション完了を待機（snapshot.css で無効化済みだが、安全のため短時間待機）
  await page.waitForTimeout(500);
}

/**
 * ページのスナップショットを取得する共通処理。
 * テーマ設定 → ナビゲーション → ハイドレーション待機 → 安定化 → スクリーンショット比較
 */
export async function capturePageSnapshot(
  page: Page,
  options: {
    config: PageConfig;
    theme: "light" | "dark";
    snapshotName: string;
    fullPage?: boolean;
    mask?: ReturnType<Page["locator"]>[];
  },
): Promise<void> {
  await setTheme(page, options.theme);
  await page.goto(options.config.route);
  await waitForHydration(page, options.config);
  await stabilizePage(page);

  await expect(page).toHaveScreenshot(`${options.snapshotName}.png`, {
    fullPage: options.fullPage ?? false,
    mask: options.mask,
  });
}
