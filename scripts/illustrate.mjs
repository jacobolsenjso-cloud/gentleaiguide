// Laver én illustration pr. artikel med Googles Gemini-API (gratis niveau).
//
//   npm run illustrate 7        -> public/images/articles/07-ai-scams.png
//   npm run illustrate 7 13 3   -> flere ad gangen
//   npm run illustrate 7 --force  overskriver, hvis filen findes
//   npm run illustrate 7 --style=photo --suffix=photo   prøv en anden stil, gem som 07-ai-scams-photo.png
//   npm run illustrate --spot basics tools    frie figurer (spot-stil) -> public/images/spots/<navn>.png
//   (baggrunden fjernes bagefter i skyen, så de bliver gennemsigtige)
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
// To måder at være logget ind hos Cloudflare på:
//  - På Jacobs pc: CF_API_TOKEN (+ evt. CF_ACCOUNT_ID) i .env.
//  - I skyen (Claude Code på nettet): nøglen ligger som "API credential" på
//    miljøet. Sessionen ser den aldrig — skyens proxy sætter selv
//    Authorization-headeren på kald til api.cloudflare.com. Derfor må scriptet
//    IKKE kræve CF_API_TOKEN, og det må ikke sende en tom header selv.
//    Sæt CF_VIA_PROXY=1 for at sige "nøglen kommer udefra".
const viaProxy = process.env.CF_VIA_PROXY === '1';
if (provider === 'cloudflare' && !process.env.CF_API_TOKEN && !viaProxy) {
  console.error('Mangler CF_API_TOKEN i .env (eller CF_VIA_PROXY=1 i skyen).\nToken laves på https://dash.cloudflare.com/profile/api-tokens (skabelon "Workers AI").');
  process.exit(1);
}
function cfHeaders(extra = {}) {
  return process.env.CF_API_TOKEN ? { ...extra, Authorization: `Bearer ${process.env.CF_API_TOKEN}` } : extra;
}
// Konto-id: fra .env hvis det findes, ellers slås det op hos Cloudflare — så
// ingen skal indtaste det i skyen.
let cfAccountId = process.env.CF_ACCOUNT_ID || '';
async function hentAccountId() {
  if (cfAccountId) return cfAccountId;
  const r = await fetch('https://api.cloudflare.com/client/v4/accounts', { headers: cfHeaders() });
  if (!r.ok) { console.error(`Kunne ikke slå Cloudflare-konto op (${r.status}): ${(await r.text()).slice(0, 300)}`); process.exit(1); }
  const j = await r.json();
  cfAccountId = j.result?.[0]?.id || '';
  if (!cfAccountId) { console.error('Cloudflare svarede uden konto-id'); process.exit(1); }
  return cfAccountId;
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const styleKey = (args.find((a) => a.startsWith('--style=')) || '').slice(8) || cfg.defaultStyle;
const suffix = (args.find((a) => a.startsWith('--suffix=')) || '').slice(9);
const style = cfg.styles[styleKey];
if (!style) { console.error(`Ukendt stil "${styleKey}". Muligheder: ${Object.keys(cfg.styles).join(', ')}`); process.exit(1); }
const numbers = args.filter((a) => /^\d+$/.test(a));
const spotMode = args.includes('--spot');
const spotKeys = spotMode ? args.filter((a) => !a.startsWith('--')) : [];
if (numbers.length === 0 && spotKeys.length === 0) {
  console.error('Angiv mindst ét artikelnummer, fx: npm run illustrate 7');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

// --- Cloudflare Workers AI: FLUX.1-schnell (gratis daglig kvote, kvadratisk 1024x1024)
async function viaCloudflare(prompt, n) {
  const model = process.env.CF_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';
  const url = `https://api.cloudflare.com/client/v4/accounts/${await hentAccountId()}/ai/run/${model}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: cfHeaders({ 'Content-Type': 'application/json' }),
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
  const file = resolve(outDir, `${String(n).padStart(2, '0')}-${entry.slug}${suffix ? '-' + suffix : ''}.png`);
  if (existsSync(file) && !force) { console.log(`Springer over ${file} (findes allerede — brug --force for at lave ny)`); return; }

  const prompt = `${style}\n\nSubject: ${entry.motif}`;
  console.log(`Laver illustration ${n} (${entry.slug}) via ${provider}, stil "${styleKey}" …`);

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

async function generateSpot(key) {
  // Et tal = artiklens motiv som fri figur; et navn = fra "spots"-listen
  const isArticle = /^\d+$/.test(key);
  const motif = isArticle ? cfg.articles[String(Number(key))]?.motif : cfg.spots?.[key];
  if (!motif) { console.error(`Spot "${key}" findes ikke. Muligheder: ${Object.keys(cfg.spots || {}).join(', ')} eller et artikelnummer`); return; }
  const dir = resolve(root, isArticle ? 'public/images/articles' : 'public/images/spots');
  mkdirSync(dir, { recursive: true });
  const file = isArticle
    ? resolve(dir, `${String(Number(key)).padStart(2, '0')}-${cfg.articles[String(Number(key))].slug}-spot.png`)
    : resolve(dir, `${key}.png`);
  if (existsSync(file) && !force) { console.log(`Springer over ${file} (findes allerede)`); return; }
  const prompt = `${cfg.styles.spot}\n\nSubject: ${motif}`;
  console.log(`Laver spot "${key}" via ${provider} …`);
  const png = provider === 'gemini' ? await viaGemini(prompt, key) : await viaCloudflare(prompt, key);
  if (!png) return;
  writeFileSync(file, png);
  console.log(`Gemt: ${file}`);
}

if (!spotMode) for (const n of numbers) {
  await generate(Number(n));
}
for (const k of spotKeys) {
  await generateSpot(k);
}
