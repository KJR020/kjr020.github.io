import { expect, test } from "playwright/test";

test("実装とつながった実用的な見本帳を表示する", async ({ page }) => {
  const response = await page.goto("/design-system");

  expect(response?.ok()).toBe(true);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "KJR020ブログ デザインシステム見本帳",
    }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex,nofollow",
  );

  await expect(page.locator('body[data-layout="specimen-book"]')).toBeVisible();
  await expect(page.locator(".book-header")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "章目次" })).toBeVisible();
  await expect(page.getByRole("link", { name: "1. Foundations" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "技術記事の静かな案内役" }),
  ).toHaveCount(0);
  await expect(page.locator(".ds-hero")).toHaveCount(0);
  await expect(page.locator(".ds-sidebar")).toHaveCount(0);

  await expect(page.locator("#foundations")).toBeVisible();
  await expect(page.locator("#components")).toBeVisible();
  await expect(page.locator("#patterns")).toBeVisible();
  await expect(page.locator('[data-token="--background"]')).toBeVisible();
  await expect(
    page.locator('[data-slot="button"][data-variant="default"]').first(),
  ).toBeVisible();
  await expect(page.locator('[data-slot="badge"]').first()).toBeVisible();
  await expect(page.locator('[data-slot="input"]').first()).toBeVisible();
  await expect(page.locator('[data-slot="card"]').first()).toBeVisible();
});

test("モバイルでも章目次と標本を横溢れなく表示する", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/design-system");

  await expect(page.getByRole("navigation", { name: "章目次" })).toBeVisible();
  await expect(page.getByRole("link", { name: "1. Foundations" })).toBeVisible();

  const viewport = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);
});

test("Tag interactionの正規仕様を実装された標本とともに表示する", async ({ page }) => {
  await page.goto("/design-system#badge");

  const specification = page.locator('[data-specification="tag-interaction"]');

  await expect(page.getByRole("heading", { name: "Tag interaction" })).toBeVisible();
  await expect(specification.locator('a[href="/tags/Astro"]')).toBeVisible();
  await expect(specification).toContainText("220ms");
  await expect(specification).toContainText("14deg");
  await expect(specification).toContainText("6%");
  await expect(specification).toContainText("prefers-reduced-motion");
});
