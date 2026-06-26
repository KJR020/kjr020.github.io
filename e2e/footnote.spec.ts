import { expect, test } from "playwright/test";

test.describe("記事脚注スタイル", () => {
  test("GFM脚注が記事デザインに馴染むスタイルで表示される", async ({ page }) => {
    await page.goto("/posts/llm/harness-engineering/");

    const footnotes = page.locator(".prose [data-footnotes]");
    await expect(footnotes).toBeVisible();

    const label = footnotes.locator("#footnote-label");
    await expect(label).toHaveText("脚注");
    await expect(label).toBeVisible();

    const labelStyles = await label.evaluate((element) => {
      const styles = getComputedStyle(element);

      return {
        display: styles.display,
        position: styles.position,
      };
    });
    expect(labelStyles.display).toBe("flex");
    expect(labelStyles.position).not.toBe("absolute");

    const sectionStyles = await footnotes.evaluate((element) => {
      const styles = getComputedStyle(element);

      return {
        borderTopStyle: styles.borderTopStyle,
        borderTopWidth: styles.borderTopWidth,
      };
    });
    expect(sectionStyles.borderTopStyle).toBe("solid");
    expect(Number.parseFloat(sectionStyles.borderTopWidth)).toBeGreaterThan(0);

    const reference = page.locator(".prose [data-footnote-ref]").first();
    await expect(reference).toBeVisible();

    const referenceStyles = await reference.evaluate((element) => {
      const styles = getComputedStyle(element);

      return {
        backgroundColor: styles.backgroundColor,
        borderRadius: styles.borderRadius,
        display: styles.display,
        textDecorationLine: styles.textDecorationLine,
      };
    });
    expect(referenceStyles.display).toBe("inline-flex");
    expect(referenceStyles.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(Number.parseFloat(referenceStyles.borderRadius)).toBeGreaterThan(0);
    expect(referenceStyles.textDecorationLine).toBe("none");

    const backReference = footnotes.locator("[data-footnote-backref]").first();
    await expect(backReference).toBeVisible();

    const backReferenceStyles = await backReference.evaluate((element) => {
      const styles = getComputedStyle(element);

      return {
        borderTopStyle: styles.borderTopStyle,
        display: styles.display,
      };
    });
    expect(backReferenceStyles.display).toBe("inline-flex");
    expect(backReferenceStyles.borderTopStyle).toBe("solid");
  });
});
