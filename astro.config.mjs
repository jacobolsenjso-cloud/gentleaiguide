// Astro-opsætning for gentleaiguide.com
// Statisk build (som techfeedwatch) — hostes på Cloudflare Pages
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// Kladder (draft: true i frontmatter) skal ikke i sitemap. Læses direkte fra
// markdown-filerne, fordi astro.config kører før indholds-samlingen findes.
const draftSlugs = readdirSync('./src/content/guides')
  .filter((f) => f.endsWith('.md') && /^draft:\s*true/m.test(readFileSync(`./src/content/guides/${f}`, 'utf8')))
  .map((f) => f.replace(/\.md$/, ''));

export default defineConfig({
  site: 'https://gentleaiguide.com',
  integrations: [sitemap({ filter: (page) => !draftSlugs.some((s) => page.endsWith(`/guides/${s}/`)) })],
  build: {
    format: 'directory',
  },
});
