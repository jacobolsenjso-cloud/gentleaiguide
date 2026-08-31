// Indholds-samling: guides ligger som markdown i src/content/guides/
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Rækkefølgen på guide-oversigten (1 = først)
    order: z.number(),
    // Sæt til dato når Jacob har godkendt teksten
    updated: z.coerce.date(),
    // Kort label der vises på kortet, fx "Start here"
    label: z.string().optional(),
  }),
});

export const collections = { guides };
