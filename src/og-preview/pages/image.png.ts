import path from "node:path";
import type { APIRoute } from "astro";

import { createOgImagePng, OG_IMAGE_COPY, type OgImageContent } from "@/lib/ogImage";
import { OG_PREVIEW_DEFAULT_TITLE, parseOgPreviewLayout } from "../config";

const projectRoot = process.cwd();

export const prerender = false;

function createPreviewContent(searchParams: URLSearchParams): OgImageContent {
  if (searchParams.get("kind") !== "article") return { kind: "site" };

  const title = searchParams.get("title")?.trim().slice(0, 160);

  return {
    kind: "article",
    publishedAt: "2026-08-26T00:00:00+09:00",
    title: title || OG_PREVIEW_DEFAULT_TITLE,
    url: OG_IMAGE_COPY.url,
  };
}

export const GET: APIRoute = async ({ url }) => {
  const png = await createOgImagePng({
    content: createPreviewContent(url.searchParams),
    layout: parseOgPreviewLayout(url.searchParams),
    photoPath: path.join(projectRoot, "src", "assets", "og", "kuri-cutout.png"),
    sansBoldFontPath: path.join(projectRoot, "src", "assets", "og", "NotoSansJP-Bold.otf"),
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "image/png",
    },
  });
};
