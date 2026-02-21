import { test } from "playwright/test";
import type { PageConfig } from "./helpers/snapshot";
import { capturePageSnapshot } from "./helpers/snapshot";

const staticPages: PageConfig[] = [
  { route: "/", name: "index", hasIslands: true },
  { route: "/archive", name: "archive", hasIslands: true },
  { route: "/search", name: "search", hasIslands: true },
  { route: "/404", name: "404", hasIslands: false },
];

const dynamicPages: PageConfig[] = [
  {
    route: "/posts/terraform/terraform入門した",
    name: "post-detail",
    hasIslands: true,
  },
  { route: "/tags/DbC", name: "tag-list", hasIslands: true },
  { route: "/newsletters", name: "newsletter-index", hasIslands: true },
  {
    route: "/newsletters/2026-02-18_tech-trends",
    name: "newsletter-detail",
    hasIslands: true,
  },
];

const themes = ["light", "dark"] as const;

test.describe("静的ページのスナップショット", () => {
  for (const pageConfig of staticPages) {
    for (const theme of themes) {
      test(`${pageConfig.name} - ${theme}`, async ({ page }) => {
        const mask =
          pageConfig.route === "/"
            ? [page.locator("section", { hasText: "Scrapbox" })]
            : undefined;

        await capturePageSnapshot(page, {
          config: pageConfig,
          theme,
          snapshotName: `${pageConfig.name}-${theme}`,
          mask,
        });
      });
    }
  }
});

test.describe("動的ページのスナップショット", () => {
  for (const pageConfig of dynamicPages) {
    for (const theme of themes) {
      test(`${pageConfig.name} - ${theme}`, async ({ page }) => {
        const mask =
          pageConfig.name === "post-detail"
            ? [page.locator(".giscus")]
            : undefined;

        await capturePageSnapshot(page, {
          config: pageConfig,
          theme,
          snapshotName: `${pageConfig.name}-${theme}`,
          mask,
        });
      });
    }
  }
});
