// RSS-feed: nyeste artikler først. Læsere (og Google) kan abonnere.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { isPublished } from '../site';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const articles = (await getCollection('guides', isPublished)).sort(
    (a, b) => b.data.updated.getTime() - a.data.updated.getTime() || b.data.order - a.data.order
  );
  return rss({
    title: 'The Gentle AI Guide',
    description: 'Plain-English help with AI for people over 50. Every article reviewed by a person.',
    site: context.site!,
    items: articles.map((a) => ({
      title: a.data.title,
      description: a.data.description,
      pubDate: a.data.updated,
      link: `/guides/${a.id}/`,
      categories: a.data.category ? [a.data.category] : [],
    })),
    customData: '<language>en</language>',
  });
}
