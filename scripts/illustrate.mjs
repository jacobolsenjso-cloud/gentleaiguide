// Laver én illustration pr. artikel med Googles Gemini-API (gratis niveau).
//
//   npm run illustrate 7        -> public/images/articles/07-ai-scams.png
//   npm run illustrate 7 13 3   -> flere ad gangen
//   npm run illustrate 7 --force  overskriver, hvis filen findes
//
// To udbydere, valgt med IMAGE_PROVIDER i .env:
//   cloudflare (standard) -> CF_ACCOUNT_ID + CF_API_TOKEN, model FLUX.1-schnell, gratis daglig kvote
//   gemini                -> GEMINI_API_KEY, model gemini-2.5-flash-image (kræver betalt kvote i EU)
// Nøglerne ligger i .env (filen er ignoreret af Git).
// Stil-prompt og motiver ligger i scripts/illustrations.json — samme stil
// hver gang, kun motivet skifter. Det er dét, der holder billederne ens.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/images/articles');
const cfg = JSON.parse(readFileSync(resolve(root, 'scripts/illustrations.json'), 'utf8'));

const provider = (process.env.IMAGE_PROVIDER || 'cloudflare').toLowerCase();
if (provider === 'gemini' && !process.env.GEMINI_API_KEY) {
  console.error('Mangler GEMINI_API_KEY i .env');
  process.exit(1);
}
if (provider === 'cloudflare' && (!process.env.CF_ACCOUNT_ID || !process.env.CF_API_TOKEN)) {
  console.error('Mangler CF_ACCOUNT_ID og/eller CF_API_TOKEN i .env.\nToken laves på https://dash.cloudflare.com/profile/api-tokens (skabelon "Workers AI").');
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

// --- Cloudflare Workers AI: FLUX.1-schnell (gratis daglig kvote, kvadratisk 1024x1024)
async function viaCloudflare(prompt, n) {
  const model = process.env.CF_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${model}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CF_API_TOKEN}` },
    body: JSON.stringify({ prompt, steps: 8 }),
  });
  if (!res.ok) {
    console.error(`Fejl fra Cloudflare (${res.status}) for artikel ${n}:\n${(await res.text()).slice(0, 600)}`);
    if (res.status === 429) console.error('Tip: dagens gratis-kvote er brugt op — prøv igen i morgen');
    return null;
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const data = await res.json();
    const b64 = data?.result?.image;
    if (!b64) { console.error(`Intet billede i svaret: ${JSON.stringify(data).slice(0, 400)}`); return null; }
    return Buffer.from(b64, 'base64');
  }
  return Buffer.from(await res.arrayBuffer()); // nogle modeller svarer med rå PNG
}

// --- Google Gemini: gemini-2.5-flash-image (16:9)
async function viaGemini(prompt, n) {
  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
    }),
  });
  if (!res.ok) {
    console.error(`Fejl fra Gemini (${res.status}) for artikel ${n}:\n${(await res.text()).slice(0, 600)}`);
    if (res.status === 429) console.error('Tip: kvoten er 0 eller opbrugt — se https://ai.dev/rate-limit');
    return null;
  }
  const data = await res.json();
  const img = (data?.candidates?.[0]?.content?.parts ?? []).find((p) => p.inlineData?.data);
  if (!img) { console.error(`Intet billede i svaret: ${JSON.stringify(data).slice(0, 400)}`); return null; }
  return Buffer.from(img.inlineData.data, 'base64');
}

async function generate(n) {
  const entry = cfg.articles[String(n)];
  if (!entry) { console.error(`Artikel ${n} findes ikke i illustrations.json`); return; }
  const file = resolve(outDir, `${String(n).padStart(2, '0')}-${entry.slug}.png`);
  if (existsSync(file) && !force) { console.log(`Springer over ${file} (findes allerede — brug --force for at lave ny)`); return; }

  const prompt = `${cfg.style}\n\nSubject: ${entry.motif}`;
  console.log(`Laver illustration ${n} (${entry.slug}) via ${provider} …`);

  let png;
  if (provider === 'gemini') {
    png = await viaGemini(prompt, n);
  } else {
    png = await viaCloudflare(prompt, n);
  }
  if (!png) return;
  writeFileSync(file, png);
  console.log(`Gemt: ${file}`);
}

for (const n of numbers) {
  await generate(Number(n));
}
