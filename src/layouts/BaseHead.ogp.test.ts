import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
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

function readHtmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      return readHtmlFiles(fullPath);
    }

    return entry.isFile() && entry.name === "index.html" ? [readFileSync(fullPath, "utf8")] : [];
  });
}

describe("BaseHead OGP meta tags", () => {
  let rssXml = "";

  beforeAll(() => {
    buildSite();

    const rssPath = join(distDir, "rss.xml");
    rssXml = existsSync(rssPath) ? readFileSync(rssPath, "utf8") : "";
  }, 60_000);

  it("renders article OGP meta tags on post pages", () => {
    const postHtml = readHtmlFiles(join(distDir, "posts")).find(
      (html) =>
        html.includes("<title>Cookieとは - KJR020&#39;s Blog</title>") &&
        html.includes('<meta property="article:tag" content="Cookie">'),
    );

    expect(postHtml).toBeDefined();
    expect(postHtml).toContain('<meta property="og:type" content="article">');
    expect(postHtml).toContain('<meta property="og:locale" content="ja_JP">');
    expect(postHtml).toContain('<meta property="article:published_time"');
    expect(postHtml).toContain('<meta property="article:tag" content="Cookie">');
    expect(postHtml).toContain('<meta property="article:tag" content="Web">');
    expect(postHtml).toContain('<meta property="article:tag" content="HTTP">');
    expect(postHtml).not.toContain('<meta property="article:modified_time"');
  });

  it("keeps website OGP type on non-post pages", () => {
    const indexHtml = readFileSync(join(distDir, "index.html"), "utf8");

    expect(indexHtml).toContain('<meta property="og:type" content="website">');
    expect(indexHtml).toContain('<meta property="og:locale" content="ja_JP">');
    expect(indexHtml).toContain(
      '<link rel="alternate" type="application/rss+xml" title="KJR020 Blog RSS Feed" href="https://kjr020.dev/rss.xml">',
    );
    expect(indexHtml).toContain('href="/rss.xml"');
    expect(indexHtml).toContain('aria-label="RSS"');
    expect(indexHtml).not.toContain('<meta property="article:published_time"');
    expect(indexHtml).not.toContain('<meta property="article:tag"');
  });

  it("generates an RSS feed for subscribers", () => {
    const rssDoc = new DOMParser().parseFromString(rssXml, "application/xml");

    expect(rssXml).toContain("<rss");
    expect(rssXml).toContain("<channel>");
    expect(rssDoc.querySelector("channel > title")?.textContent).toBe("KJR020's Blog");
    expect(rssDoc.querySelector("channel > link")?.textContent).toBe("https://kjr020.dev/");
  });

  it("includes public posts and excludes draft posts from the RSS feed", () => {
    const rssDoc = new DOMParser().parseFromString(rssXml, "application/xml");
    const itemTitles = Array.from(rssDoc.querySelectorAll("item > title")).map((title) =>
      title.textContent?.trim(),
    );

    expect(itemTitles).toContain(
      "OpenAIが実践するAgent-First時代の開発アプローチ — Harness Engineering",
    );
    expect(itemTitles).toContain("Cookieとは");
    expect(itemTitles).not.toContain("Python標準ライブラリgraphlibでDAG並列実行エンジンを作った");
    expect(itemTitles).not.toContain("FetchPolicyについて");
  });

  it("orders RSS feed items by publish date descending", () => {
    const rssDoc = new DOMParser().parseFromString(rssXml, "application/xml");
    const pubDates = Array.from(rssDoc.querySelectorAll("item > pubDate")).map((pubDate) =>
      Date.parse(pubDate.textContent ?? ""),
    );

    expect(pubDates.length).toBeGreaterThan(1);
    expect(pubDates.every(Number.isFinite)).toBe(true);
    expect(pubDates).toEqual([...pubDates].sort((a, b) => b - a));
  });
});
