import { expect, test } from "playwright/test";

test.describe("トップページのブランド表現", () => {
  test("ヘッダーとヒーローで正式なブログ名を表示する", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");
    await expect(
      header.getByRole("link", { name: "KJR020's Blog", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "KJR020's Blog",
      }),
    ).toBeVisible();
    await expect(page.locator("main img[alt='KJR020']")).toHaveCount(0);
  });

  test("気取らない紹介文を2行で表示する", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("とあるWebエンジニアのブログ。")).toBeVisible();
    await expect(
      page.getByText("調べたこと、やってみたことを書いています。"),
    ).toBeVisible();
    await expect(page.locator("main")).not.toContainText("技術ブログ兼思考ログ");
  });
});
