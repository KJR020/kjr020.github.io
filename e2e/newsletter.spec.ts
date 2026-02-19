import { expect, test } from "playwright/test";

test.describe("ニュースレター一覧ページ", () => {
  test("一覧ページが表示され、ニュースレターが日付順で表示される", async ({
    page,
  }) => {
    await page.goto("/newsletters");

    await expect(page.locator("h1")).toHaveText("Tech Trends Newsletter");

    const cards = page.locator("[data-slot='card']");
    await expect(cards).toHaveCount(1);

    await expect(
      cards.first().getByText("Tech Trends Newsletter - 2026-02-18"),
    ).toBeVisible();
  });

  test("カードに個別ページへのリンクがある", async ({ page }) => {
    await page.goto("/newsletters");

    const card = page.locator("[data-slot='card']").first();
    const link = card.locator("a[href*='/newsletters/']");
    await expect(link).toHaveAttribute(
      "href",
      "/newsletters/2026-02-18_tech-trends",
    );
  });
});

test.describe("ニュースレター個別ページ", () => {
  test("Markdownが正しくレンダリングされる", async ({ page }) => {
    await page.goto("/newsletters/2026-02-18_tech-trends");

    // ページヘッダーのh1（article > header内）
    const headerTitle = page.locator("article > header h1");
    await expect(headerTitle).toHaveText("Tech Trends Newsletter - 2026-02-18");

    const prose = page.locator(".prose");
    await expect(prose).toBeVisible();

    await expect(prose.locator("h2").first()).toBeVisible();
  });

  test("一覧ページへの戻るリンクがある", async ({ page }) => {
    await page.goto("/newsletters/2026-02-18_tech-trends");

    const backLink = page.locator("a", {
      hasText: "ニュースレター一覧に戻る",
    });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/newsletters");
  });
});

test.describe("ヘッダーナビゲーション", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("「Tech Trends」リンクが /newsletters に遷移する", async ({
    page,
  }) => {
    await page.goto("/");

    const header = page.locator("header");
    const techTrendsLink = header
      .locator("nav")
      .getByRole("link", { name: "Tech Trends" });
    await expect(techTrendsLink).toBeVisible();

    await techTrendsLink.click();
    await expect(page).toHaveURL(/\/newsletters/);
  });
});

test.describe("トップページ Tech Trends セクション", () => {
  test("最新ニュースレターが表示される", async ({ page }) => {
    await page.goto("/");

    const section = page.locator("section", { hasText: "Tech Trends" });
    await expect(section).toBeVisible();

    await expect(
      section.getByText("Tech Trends Newsletter - 2026-02-18"),
    ).toBeVisible();

    const seeAllLink = section.getByText("すべて見る");
    await expect(seeAllLink).toBeVisible();
  });
});
