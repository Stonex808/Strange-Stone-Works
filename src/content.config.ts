import { defineCollection, z } from 'astro:content';

const tablets = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    category: z.string(),
    pubDate: z.string()
  })
});

export const collections = { tablets };
