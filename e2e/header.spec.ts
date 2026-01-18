import { expect, test } from "playwright/test";

test.describe("モバイルビューポートでのメニュー動作", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("768px未満でハンバーガーメニューが表示される", async ({ page }) => {
    await page.goto("/");

    // Astro Islandのハイドレーション完了を待機
    await page.waitForSelector("astro-island[client='load']:not([ssr])");

    const hamburgerButton = page.getByRole("button", { name: /メニューを開く/ });
    await expect(hamburgerButton).toBeVisible();
  });

  test("メニュー開閉が正しく動作する", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("astro-island[client='load']:not([ssr])");

    const hamburgerButton = page.getByRole("button", { name: /メニューを開く/ });
    await expect(hamburgerButton).toHaveAttribute("aria-expanded", "false");

    await hamburgerButton.click();
    await expect(hamburgerButton).toHaveAttribute("aria-expanded", "true");
    await expect(hamburgerButton).toHaveAttribute("aria-label", "メニューを閉じる");

    // モバイルメニュー内のリンクを確認
    const mobileNav = page.locator("astro-island nav");
    const homeLink = mobileNav.getByRole("link", { name: "Home" });
    await expect(homeLink).toBeVisible();

    await hamburgerButton.click();
    await expect(hamburgerButton).toHaveAttribute("aria-expanded", "false");
  });

  test("リンククリック後にメニューが閉じる", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("astro-island[client='load']:not([ssr])");

    const hamburgerButton = page.getByRole("button", { name: /メニューを開く/ });
    await hamburgerButton.click();
    await expect(hamburgerButton).toHaveAttribute("aria-expanded", "true");

    // モバイルメニュー内のArchiveリンク
    const mobileNav = page.locator("astro-island nav");
    const archiveLink = mobileNav.getByRole("link", { name: "Archive" });
    await archiveLink.click();

    await page.waitForURL(/\/archive/);
    await page.waitForSelector("astro-island[client='load']:not([ssr])");
    const newHamburgerButton = page.getByRole("button", { name: /メニューを開く/ });
    await expect(newHamburgerButton).toHaveAttribute("aria-expanded", "false");
  });

  test("Escapeキーでメニューが閉じる", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("astro-island[client='load']:not([ssr])");

    const hamburgerButton = page.getByRole("button", { name: /メニューを開く/ });
    await hamburgerButton.click();
    await expect(hamburgerButton).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(hamburgerButton).toHaveAttribute("aria-expanded", "false");
  });

  test("メニュー外クリックでメニューが閉じる", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("astro-island[client='load']:not([ssr])");

    const hamburgerButton = page.getByRole("button", { name: /メニューを開く/ });
    await hamburgerButton.click();
    await expect(hamburgerButton).toHaveAttribute("aria-expanded", "true");

    await page.locator("main").first().click({ force: true });
    await expect(hamburgerButton).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("デスクトップビューポートでの表示", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("768px以上で水平ナビゲーションが表示される", async ({ page }) => {
    await page.goto("/");

    // ヘッダー内のデスクトップナビゲーションを確認
    const header = page.locator("header");
    const desktopNav = header.locator("nav");
    await expect(desktopNav).toBeVisible();

    const homeLink = desktopNav.getByRole("link", { name: "Home" });
    await expect(homeLink).toBeVisible();
    const archiveLink = desktopNav.getByRole("link", { name: "Archive" });
    await expect(archiveLink).toBeVisible();
  });

  test("ハンバーガーメニューが非表示", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("astro-island[client='load']:not([ssr])");

    // md:hidden クラスにより非表示になっているはず
    const mobileMenuContainer = page.locator("astro-island .md\\:hidden");
    await expect(mobileMenuContainer).toBeHidden();
  });

  test("既存のナビゲーション動作が正常", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");
    const archiveLink = header.locator("nav").getByRole("link", { name: "Archive" });
    await archiveLink.click();

    await expect(page).toHaveURL(/\/archive/);
  });
});
