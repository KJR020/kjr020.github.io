import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional().default([]),
    description: z.string().optional(),
  }),
});

const newsletters = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/newsletters" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional().default([]),
    description: z.string().optional(),
  }),
});

export const collections = { posts, newsletters };
