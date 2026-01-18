// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import pagefind from "astro-pagefind";
import { rehypeMermaid } from "@beoe/rehype-mermaid";
// @ts-ignore
import remarkLinkCard from "remark-link-card";
import remarkCallout from "@r4ai/remark-callout";

// https://astro.build/config
export default defineConfig({
  site: "https://kjr020.github.io",
  build: {
    format: "directory",
  },
  integrations: [react(), sitemap(), pagefind()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    },
    remarkPlugins: [
      remarkCallout,
      [remarkLinkCard, { cache: true, shortenUrl: true }],
    ],
    rehypePlugins: [[rehypeMermaid, { class: "mermaid" }]],
  },
});
