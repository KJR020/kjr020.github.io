import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );
  const site = context.site?.toString() ?? "https://kjr020.dev";
  const feedUrl = new URL("/rss.xml", site).toString();
  const latestPublishedAt = sortedPosts.at(0)?.data.date.toUTCString();

  return rss({
    title: "KJR020's Blog",
    description: "KJR020の技術ブログ",
    site,
    trailingSlash: false,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.id}`,
      categories: post.data.tags,
    })),
    customData: [
      "<language>ja-jp</language>",
      latestPublishedAt ? `<lastBuildDate>${latestPublishedAt}</lastBuildDate>` : "",
      `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />`,
    ].join(""),
  });
}
