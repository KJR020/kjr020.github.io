import { expect, test } from "playwright/test";

const articlePath = "/posts/astro/astro-pagefind-search";

test("画面幅に応じた本文組版を使い、FigureをWide laneへ広げる", async ({ page }, testInfo) => {
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

  const isCompact = testInfo.project.name === "Mobile Chrome";
  const expectedFontSize = isCompact ? 16 : 17;
  const expectedLineHeight = isCompact ? 1.9 : 2;

  expect(typography.fontSize).toBe(expectedFontSize);
  expect(typography.lineHeight / typography.fontSize).toBeCloseTo(expectedLineHeight, 1);
  expect(typography.width).toBeLessThanOrEqual(expectedFontSize * 40 + 1);
  await expect(figure.locator("figcaption")).toContainText(
    "検索結果から直接記事に遷移できる",
  );
  await expect(figure.locator("figcaption")).not.toContainText(/FIGURE \d+/);

  if (testInfo.project.name === "chromium") {
    const [paragraphBox, figureBox] = await Promise.all([
      paragraph.boundingBox(),
      figure.boundingBox(),
    ]);
    expect(figureBox?.width).toBeGreaterThan(paragraphBox?.width ?? 0);
  }
});

test("768pxからMediumの本文組版へ切り替える", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto(articlePath);

  const content = page.locator(".article-reading-content");
  const paragraph = content.locator(":scope > p").first();
  const [contentBox, paragraphBox] = await Promise.all([
    content.boundingBox(),
    paragraph.boundingBox(),
  ]);
  const fontSize = await paragraph.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize),
  );

  expect(fontSize).toBe(17);
  expect(paragraphBox?.width).toBeLessThan(contentBox?.width ?? 0);
});

test("モバイルでは記事ヘッダー直後に折りたたみ目次を表示する", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(articlePath);

  const article = page.getByRole("article");
  const mobileToc = article.locator(".post-mobile-toc");
  const trigger = mobileToc.getByRole("button", { name: "目次を開く" });

  await expect(mobileToc).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(mobileToc.getByRole("navigation", { name: "目次" })).toBeVisible();
  await expect(mobileToc.getByRole("button", { name: "目次を閉じる" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(article.locator("header + .post-mobile-toc")).toBeVisible();
});

test("デスクトップでは目次を隠して再表示できる", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(articlePath);

  const article = page.getByRole("article");
  const desktopToc = page.locator("aside");
  const navigation = desktopToc.getByRole("navigation", { name: "目次" });
  const initialArticleWidth = (await article.boundingBox())?.width ?? 0;

  await expect(navigation).toBeVisible();
  await desktopToc.getByRole("button", { name: "目次を隠す" }).click();
  await expect(navigation).toBeHidden();
  await expect
    .poll(async () => (await article.boundingBox())?.width ?? 0)
    .toBeGreaterThan(initialArticleWidth);

  await desktopToc.getByRole("button", { name: "目次を表示" }).click();
  await expect(navigation).toBeVisible();
  await expect.poll(async () => (await article.boundingBox())?.width ?? 0).toBe(initialArticleWidth);
});

test("見出しへの直接リンクを開いても目次の更新でページ上部へ戻らない", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/posts/ux/ai-era-user-experience-design#表層レイヤー");

  const heading = page.getByRole("heading", { name: "表層レイヤー" });
  await page.waitForTimeout(1_000);

  await expect(heading).toBeInViewport();
});

test("記事画像を拡大表示し、閉じると画像リンクへフォーカスを戻す", async ({ page }) => {
  await page.goto(articlePath);

  const viewportWidths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(viewportWidths.scroll).toBe(viewportWidths.client);

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
