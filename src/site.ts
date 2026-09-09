// Én kontakt at slå på, når indholdet er godkendt.
// INDEXABLE = false  -> sitet er live og læsbart, men søgemaskiner holdes ude
// INDEXABLE = true   -> sitet må indekseres af Google m.fl.
export const INDEXABLE = true;

// Kategorierne i kategorilinjen, i den rækkefølge de vises.
// 'name' skal matche 'category' i artiklernes frontmatter præcist.
export const CATEGORIES = [
  { slug: 'basics',       name: 'Basics',       blurb: 'What AI is, and how to get started' },
  { slug: 'staying-safe', name: 'Staying safe', blurb: 'Scams, privacy, and when AI is wrong' },
  { slug: 'everyday-use', name: 'Everyday use', blurb: 'Practical jobs, with examples you can copy' },
  { slug: 'tools',        name: 'Tools',        blurb: 'ChatGPT, Gemini, Copilot and the rest, one at a time' },
  { slug: 'questions',    name: 'Questions',    blurb: 'Honest answers to what readers actually ask' },
];

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}
export function categoryByName(name?: string) {
  return CATEGORIES.find((c) => c.name === name);
}

// Udgivne artikler = alt der ikke er kladde. Brug denne i ALLE lister,
// så en kladde aldrig dukker op et sted, den ikke skal.
export function isPublished(entry: { data: { draft?: boolean } }) {
  return !entry.data.draft;
}

// Læsetid: ca. 200 ord i minuttet, mindst 1 minut
export function readingMinutes(body?: string) {
  const words = (body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
