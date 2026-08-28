import { getCollection } from "astro:content";
import path from "node:path";
import type { APIRoute } from "astro";

import { createOgImagePng, OG_IMAGE_COPY } from "@/lib/ogImage";

const projectRoot = process.cwd();
const publishedPosts = getCollection("posts", ({ data }) => !data.draft);

export async function getStaticPaths() {
  const posts = await publishedPosts;

  return posts.map((post) => ({ params: { slug: post.id } }));
}

export const GET: APIRoute = async ({ params }) => {
  const posts = await publishedPosts;
  const post = posts.find(({ id }) => id === params.slug);

  if (!post) {
    return new Response(null, { status: 404 });
  }

  const png = await createOgImagePng({
    content: {
      kind: "article",
      publishedAt: post.data.date,
      title: post.data.title,
      url: OG_IMAGE_COPY.url,
    },
    photoPath: path.join(projectRoot, "src", "assets", "og", "kuri-cutout.png"),
    sansBoldFontPath: path.join(projectRoot, "src", "assets", "og", "NotoSansJP-Bold.otf"),
  });

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
