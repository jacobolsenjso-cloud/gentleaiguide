// Astro-opsætning for gentleaiguide.com
// Statisk build (som techfeedwatch) — hostes på Cloudflare Pages
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gentleaiguide.com',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});
