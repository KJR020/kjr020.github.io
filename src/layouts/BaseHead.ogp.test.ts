import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

const distDir = join(process.cwd(), "dist");
const astroBin = join(process.cwd(), "node_modules", ".bin", "astro");

function buildSite() {
  execFileSync(astroBin, ["build"], {
    cwd: process.cwd(),
    stdio: "inherit",
  });
}

describe("BaseHead OGP meta tags", () => {
  beforeAll(() => {
    buildSite();
  }, 60_000);

  it("renders article OGP meta tags on post pages", () => {
    const postHtml = readFileSync(
      join(distDir, "posts", "vitest", "vitestについて", "index.html"),
      "utf8",
    );

    expect(postHtml).toContain('<meta property="og:type" content="article">');
    expect(postHtml).toContain('<meta property="og:locale" content="ja_JP">');
    expect(postHtml).toContain('<meta property="article:published_time"');
    expect(postHtml).toContain('<meta property="article:tag" content="Vitest">');
    expect(postHtml).not.toContain('<meta property="article:modified_time"');
  });

  it("keeps website OGP type on non-post pages", () => {
    const indexHtml = readFileSync(join(distDir, "index.html"), "utf8");

    expect(indexHtml).toContain('<meta property="og:type" content="website">');
    expect(indexHtml).toContain('<meta property="og:locale" content="ja_JP">');
    expect(indexHtml).not.toContain('<meta property="article:published_time"');
    expect(indexHtml).not.toContain('<meta property="article:tag"');
  });
});
