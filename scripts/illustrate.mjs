// Laver én illustration pr. artikel med Googles Gemini-API (gratis niveau).
//
//   npm run illustrate 7        -> public/images/articles/07-ai-scams.png
//   npm run illustrate 7 13 3   -> flere ad gangen
//   npm run illustrate 7 --force  overskriver, hvis filen findes
//
// Nøglen ligger i .env som GEMINI_API_KEY=... (filen er ignoreret af Git).
// Stil-prompt og motiver ligger i scripts/illustrations.json — samme stil
// hver gang, kun motivet skifter. Det er dét, der holder billederne ens.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/images/articles');
const cfg = JSON.parse(readFileSync(resolve(root, 'scripts/illustrations.json'), 'utf8'));

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
if (!apiKey) {
  console.error('Mangler GEMINI_API_KEY. Opret .env i projektmappen med linjen:\n  GEMINI_API_KEY=din-nøgle-her\n(Nøglen laves gratis på https://aistudio.google.com/apikey)');
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const numbers = args.filter((a) => /^\d+$/.test(a));
if (numbers.length === 0) {
  console.error('Angiv mindst ét artikelnummer, fx: npm run illustrate 7');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

async function generate(n) {
  const entry = cfg.articles[String(n)];
  if (!entry) { console.error(`Artikel ${n} findes ikke i illustrations.json`); return; }
  const file = resolve(outDir, `${String(n).padStart(2, '0')}-${entry.slug}.png`);
  if (existsSync(file) && !force) { console.log(`Springer over ${file} (findes allerede — brug --force for at lave ny)`); return; }

  const prompt = `${cfg.style}\n\nSubject: ${entry.motif}`;
  console.log(`Laver illustration ${n} (${entry.slug}) …`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '16:9' },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Fejl fra Gemini (${res.status}) for artikel ${n}:\n${text.slice(0, 600)}`);
    if (res.status === 404) console.error('Tip: modelnavnet kan være ændret — sæt GEMINI_IMAGE_MODEL i .env');
    if (res.status === 429) console.error('Tip: dagens gratis-kvote er brugt op — prøv igen i morgen');
    return;
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) {
    console.error(`Intet billede i svaret for artikel ${n}. Svar: ${JSON.stringify(data).slice(0, 400)}`);
    return;
  }
  writeFileSync(file, Buffer.from(img.inlineData.data, 'base64'));
  console.log(`Gemt: ${file}`);
}

for (const n of numbers) {
  await generate(Number(n));
}
