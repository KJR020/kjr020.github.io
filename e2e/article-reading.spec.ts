import { expect, test } from "playwright/test";

const articlePath = "/posts/astro/astro-pagefind-search";

test("本文をReading laneへ絞り、FigureをWide laneへ広げる", async ({ page }, testInfo) => {
  await page.goto(articlePath);

  const content = page.locator(".article-reading-content");
  const paragraph = content.locator(":scope > p").first();
  const figure = content.locator("figure.article-figure").last();
  const typography = await paragraph.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      fontSize: Number.parseFloat(style.fontSize),
      lineHeight: Number.parseFloat(style.lineHeight),
      width: element.getBoundingClientRect().width,
    };
  });

  expect(typography.fontSize).toBe(17);
  expect(typography.lineHeight / typography.fontSize).toBeCloseTo(1.7, 1);
  expect(typography.width).toBeLessThanOrEqual(17 * 38 + 1);
  await expect(figure.locator("figcaption")).toContainText(
    "検索結果から直接記事に遷移できる",
  );

  if (testInfo.project.name === "chromium") {
    const [paragraphBox, figureBox] = await Promise.all([
      paragraph.boundingBox(),
      figure.boundingBox(),
    ]);
    expect(figureBox?.width).toBeGreaterThan(paragraphBox?.width ?? 0);
  }
});

test("記事画像を拡大表示し、閉じると画像リンクへフォーカスを戻す", async ({ page }) => {
  await page.goto(articlePath);

  const trigger = page.getByRole("link", { name: "画像を拡大: ⌘Kコマンドパレット" });
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "画像を拡大表示" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute(
    "src",
    "/images/posts/astro-pagefind-search/search-command-palette.png",
  );

  await dialog.getByRole("button", { name: "拡大表示を閉じる" }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("画像拡大パネルをビューポート中央に表示する", async ({ page }) => {
  await page.goto(articlePath);

  await page.getByRole("link", { name: "画像を拡大: ⌘Kコマンドパレット" }).click();

  const dialog = page.getByRole("dialog", { name: "画像を拡大表示" });
  await expect(dialog.locator("img")).toHaveJSProperty("naturalWidth", 1078);
  const [dialogBox, viewport] = await Promise.all([
    dialog.boundingBox(),
    page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;inline-size:100dvw;block-size:100dvh;visibility:hidden;pointer-events:none";
      document.body.append(probe);
      const box = probe.getBoundingClientRect();
      probe.remove();
      return {
        width: window.innerWidth,
        height: box.height - (window.visualViewport?.offsetTop ?? 0),
      };
    }),
  ]);

  expect(dialogBox).not.toBeNull();
  if (!dialogBox) return;

  expect(dialogBox.x + dialogBox.width / 2).toBeCloseTo(viewport.width / 2, 0);
  expect(dialogBox.y + dialogBox.height / 2).toBeCloseTo(viewport.height / 2, 0);
});

test("コード言語を表示し、コピー結果をテキストで通知する", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(articlePath);

  const code = page.locator('.article-code-example:has(pre[data-language="typescript"])').first();
  await expect(code.getByText("TypeScript", { exact: true })).toHaveAttribute(
    "aria-label",
    "コードの言語",
  );

  const copyButton = code.locator(".copy-button");
  await expect(copyButton).toHaveAttribute("aria-label", "コードをコピー");
  await copyButton.click();

  await expect(code.locator('[aria-live="polite"]')).toHaveText("コードをコピーしました");
  await expect(copyButton).toHaveAttribute("aria-label", "コピーしました");
});
