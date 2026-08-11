import { expect, test } from "playwright/test";

const articlePath = "/posts/astro/astro-pagefind-search";

test("デスクトップでは記事ヘッダーの下から本文と目次を開始する", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(articlePath);

  const header = page.locator("[data-article-header]");
  const readingLayout = page.locator("[data-article-reading-layout]");
  const toc = page.locator("[data-article-toc]").getByRole("navigation", { name: "目次" });

  await expect(header).toBeVisible();
  await expect(readingLayout).toBeVisible();
  await expect(toc).toBeVisible();

  const [headerBox, readingLayoutBox, tocBox] = await Promise.all([
    header.boundingBox(),
    readingLayout.boundingBox(),
    toc.boundingBox(),
  ]);

  expect(headerBox).not.toBeNull();
  expect(readingLayoutBox).not.toBeNull();
  expect(tocBox).not.toBeNull();
  if (!headerBox || !readingLayoutBox || !tocBox) return;

  const headerBottom = headerBox.y + headerBox.height;
  expect(readingLayoutBox.y).toBeGreaterThanOrEqual(headerBottom);
  expect(tocBox.y).toBeGreaterThanOrEqual(headerBottom);
});

test("モバイルでは記事ヘッダーと本文の間に折りたたみ目次を表示する", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(articlePath);

  const header = page.locator("[data-article-header]");
  const toc = page.locator("[data-article-toc]");
  const article = page.locator("[data-article-body]");
  const tocButton = toc.getByRole("button", { name: "目次" });

  await expect(header).toBeVisible();
  await expect(tocButton).toBeVisible();
  await expect(article).toBeVisible();

  const order = await page.locator(
    "[data-article-header], [data-article-toc], [data-article-body]",
  ).evaluateAll((elements) => elements.map((element) => element.getAttributeNames().find((name) => name.startsWith("data-article-"))));

  expect(order).toEqual(["data-article-header", "data-article-toc", "data-article-body"]);
});

test("1024px台では目次を本文前へ置き、本文の行長を確保する", async ({ page }) => {
  await page.setViewportSize({ width: 1026, height: 900 });
  await page.goto(articlePath);

  const toc = page.locator("[data-article-toc]");
  const desktopToc = toc.getByRole("navigation", { name: "目次" });
  const mobileToc = toc.getByRole("button", { name: "目次" });
  const paragraph = page.locator(".article-reading-content > p").first();

  await expect(mobileToc).toBeVisible();
  await expect(desktopToc).toBeHidden();

  const paragraphBox = await paragraph.boundingBox();
  expect(paragraphBox).not.toBeNull();
  if (!paragraphBox) return;

  expect(paragraphBox.width).toBeGreaterThanOrEqual(600);
  expect(paragraphBox.width).toBeLessThanOrEqual(17 * 40 + 1);
});

test("ページ末尾では目次の最後の見出しを現在位置として示す", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(articlePath);

  const lastTocLink = page
    .locator('[data-article-toc] nav[aria-label="目次"]')
    .getByRole("link", { name: "脚注", exact: true });

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

  await expect(lastTocLink).toHaveAttribute("aria-current", "location");
});

test("記事コンテンツを40icの単一幅へ揃える", async ({ page }) => {
  await page.goto(articlePath);

  const content = page.locator(".article-reading-content");
  const paragraph = content.locator(":scope > p").first();
  const heading = content.locator(":scope > h2").first();
  const table = content.locator(":scope > table").first();
  const figure = content.locator("figure.article-figure").last();
  const code = content.locator(":scope > .article-code-example").first();
  const typography = await paragraph.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      fontSize: Number.parseFloat(style.fontSize),
      lineHeight: Number.parseFloat(style.lineHeight),
      width: element.getBoundingClientRect().width,
      readingMeasure: getComputedStyle(element.parentElement as Element)
        .getPropertyValue("--article-reading-measure")
        .trim(),
    };
  });

  expect(typography.fontSize).toBe(17);
  expect(typography.lineHeight / typography.fontSize).toBeCloseTo(1.7, 1);
  expect(typography.readingMeasure).toBe("40ic");
  expect(typography.width).toBeLessThanOrEqual(17 * 40 + 1);
  await expect(figure.locator("figcaption")).toContainText(
    "検索結果から直接記事に遷移できる",
  );
  await expect(figure.locator(".article-figure-label")).toHaveCount(0);

  const boxes = await Promise.all([
    paragraph.boundingBox(),
    heading.boundingBox(),
    table.boundingBox(),
    figure.boundingBox(),
    code.boundingBox(),
  ]);
  const paragraphBox = boxes[0];
  expect(paragraphBox).not.toBeNull();
  if (!paragraphBox) return;

  for (const box of boxes.slice(1)) {
    expect(box).not.toBeNull();
    if (!box) continue;
    expect(box.x).toBeCloseTo(paragraphBox.x, 0);
    expect(box.width).toBeCloseTo(paragraphBox.width, 0);
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
