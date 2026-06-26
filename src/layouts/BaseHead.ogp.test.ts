import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";
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

function readStructuredData(html: string) {
  const matches = [...html.matchAll(/<script type="application\/ld\+json">(.+?)<\/script>/gs)];

  return matches.map((match) => JSON.parse(match[1]));
}

describe("BaseHead OGP meta tags", () => {
  beforeAll(() => {
    buildSite();
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

  it("renders WebSite, Person, and BlogPosting JSON-LD on post pages", () => {
    const postHtml = readHtmlFiles(join(distDir, "posts")).find(
      (html) =>
        html.includes("<title>Cookieとは - KJR020&#39;s Blog</title>") &&
        html.includes('<meta property="article:tag" content="Cookie">'),
    );

    expect(postHtml).toBeDefined();

    const structuredData = readStructuredData(postHtml ?? "");
    const graph = structuredData[0]["@graph"];

    expect(structuredData).toHaveLength(1);
    expect(graph.map((entry: { "@type": string }) => entry["@type"])).toEqual([
      "WebSite",
      "Person",
      "BlogPosting",
    ]);
    expect(graph[2]).toMatchObject({
      "@type": "BlogPosting",
      "@id": "https://kjr020.dev/posts/general/cookie%E3%81%A8%E3%81%AF/#blogposting",
      headline: "Cookieとは",
      description: "KJR020の技術ブログ",
      datePublished: "2024-08-25T08:03:17.000Z",
      dateModified: "2024-08-25T08:03:17.000Z",
      author: { "@id": "https://kjr020.dev/#person" },
      keywords: ["Cookie", "Web", "HTTP"],
    });
  });

  it("keeps website OGP type on non-post pages", () => {
    const indexHtml = readFileSync(join(distDir, "index.html"), "utf8");

    expect(indexHtml).toContain('<meta property="og:type" content="website">');
    expect(indexHtml).toContain('<meta property="og:locale" content="ja_JP">');
    expect(indexHtml).toContain(
      '<meta property="og:image" content="https://kjr020.dev/og-image.png">',
    );
    expect(indexHtml).toContain('<meta property="og:image:width" content="1200">');
    expect(indexHtml).toContain('<meta property="og:image:height" content="630">');
    expect(indexHtml).toContain('<meta property="og:image:type" content="image/png">');
    expect(indexHtml).toContain(
      '<meta name="twitter:image" content="https://kjr020.dev/og-image.png">',
    );
    expect(indexHtml).not.toContain('<meta property="article:published_time"');
    expect(indexHtml).not.toContain('<meta property="article:tag"');

    const structuredData = readStructuredData(indexHtml);
    const graph = structuredData[0]["@graph"];

    expect(graph.map((entry: { "@type": string }) => entry["@type"])).toEqual([
      "WebSite",
      "Person",
    ]);
    expect(graph.some((entry: { "@type": string }) => entry["@type"] === "BlogPosting")).toBe(
      false,
    );
  });

  it("does not generate draft post pages", () => {
    expect(existsSync(join(distDir, "posts", "graphql", "fetchpolicyについて", "index.html"))).toBe(
      false,
    );
  });

  it("ships the default OGP image at the recommended dimensions", async () => {
    const ogImagePath = join(distDir, "og-image.png");

    expect(existsSync(ogImagePath)).toBe(true);

    const metadata = await sharp(ogImagePath).metadata();

    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(630);
  });
});
