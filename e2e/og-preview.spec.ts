import { expect, test } from "playwright/test";

test("OGPプレビューで共通・記事別画像を同じ設定から確認できる", async ({ page }) => {
  const response = await page.goto("/og-preview", { waitUntil: "networkidle" });

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "OGPプレビュー" })).toBeVisible();
  await expect(page.getByRole("img", { name: "共通OGPのプレビュー" })).toBeVisible();
  await expect(page.getByRole("img", { name: "記事別OGPのプレビュー" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "記事タイトル" })).toHaveValue(
    "AI時代にUX設計を学ぶため、『The Elements of User Experience』を読んだ",
  );
  await expect(page.getByRole("button", { name: "現在の設定" })).toBeVisible();
  await expect(page.getByRole("button", { name: "ひとつ前の設定" })).toBeVisible();
  await expect(page.getByRole("button", { name: "設定値をコピー" })).toBeVisible();
  await expect(page.getByRole("slider", { name: "記事ブログ名上位置" })).toHaveValue("128");
});

test("記事タイトルと余白の変更を記事別プレビューへ反映する", async ({ page }) => {
  await page.goto("/og-preview", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "ひとつ前の設定" }).click();
  await expect(page.getByRole("slider", { name: "カード外周" })).toHaveValue("22");
  await expect(page.getByRole("slider", { name: "記事ブログ名上位置" })).toHaveValue("58");

  await page.getByRole("button", { name: "現在の設定" }).click();
  await expect(page.getByRole("slider", { name: "カード外周" })).toHaveValue("32");
  await page.getByRole("textbox", { name: "記事タイトル" }).fill("プレビュー用の記事タイトル");
  await page.getByLabel("カード外周").fill("36");

  const articlePreview = page.getByRole("img", { name: "記事別OGPのプレビュー" });
  await expect(articlePreview).toHaveAttribute("src", /title=%E3%83%97%E3%83%AC%E3%83%93%E3%83%A5%E3%83%BC/);
  await expect(articlePreview).toHaveAttribute("src", /cardMargin=36/);
});

test("OGP画像エンドポイントは1200×630のPNGを返す", async ({ request }) => {
  const [response, articleResponse] = await Promise.all([
    request.get("/og-preview/image.png?kind=site"),
    request.get("/og-preview/image.png?kind=article&title=PreviewArticle"),
  ]);

  expect(response.status()).toBe(200);
  expect(articleResponse.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
  expect(response.headers()["cache-control"]).toBe("no-store");
  const [siteImage, articleImage] = await Promise.all([response.body(), articleResponse.body()]);
  expect(siteImage.subarray(1, 4).toString()).toBe("PNG");
  expect(articleImage.equals(siteImage)).toBe(false);
});
