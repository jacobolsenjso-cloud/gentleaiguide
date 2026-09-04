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
    // Kategori i kategorilinjen (Basics, Staying safe, Everyday use, Tools, Questions)
    category: z.string().optional(),
    // Sti til illustration under public/, fx /images/articles/07-ai-scams.png
    image: z.string().optional(),
    // true = vises som stor forsidehistorie
    featured: z.boolean().optional(),
    // 'scene' = hele billedet i ramme, 'spot' = fri figur på blød klat (standard)
    figure: z.enum(['scene', 'spot']).optional(),
  }),
});

export const collections = { guides };
