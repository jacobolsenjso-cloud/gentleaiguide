// Finder de spørgsmål, folk faktisk stiller Google om AI — filtreret til
// læseren over 50 og sitets fem kategorier.
//
//   node scripts/find-topic.mjs              -> kandidater pr. kategori (JSON + læsbar liste)
//   node scripts/find-topic.mjs --category=staying-safe
//
// Hvorfor: en artikel om noget ingen søger på, bliver aldrig fundet — uanset
// hvor god den er (lært på techfeedwatch, målt 8/9-2026). Googles autocomplete
// er det gratis fingerpeg på, hvad folk skriver. Rå autocomplete duer dog ikke:
// "chatgpt login", "ai stocks" og "ai app download" er ikke spørgsmål fra vores
// læser. Derfor spørges der med de sætninger, en forsigtig begynder bruger, og
// købs-/login-/kursus-ord afvises.
//
// Scriptet vælger IKKE selv. Det leverer kandidater; den der skriver (robotten
// eller Jacob) vælger ét spørgsmål, der passer til målgruppen. Brugte spørgsmål
// står i docs/used-questions.json og i artiklernes targetQuestion, og udelades.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const wanted = (process.argv.find((a) => a.startsWith('--category=')) || '').slice(11);

// Sådan spørger en begynder over 50 — ikke "best", ikke "vs", ikke "api".
const PREFIXES = ['how do i', 'how to', 'what is', 'what does', 'is it safe to', 'can ai', 'should i', 'why does', 'what happens if'];

// Emne-frø pr. kategori. Korte og almindelige — autocomplete fylder resten ud.
const SEEDS = {
  basics: ['ai', 'artificial intelligence', 'chatbot', 'ai assistant', 'ai for beginners', 'ai for seniors'],
  'staying-safe': ['ai scam', 'ai voice scam', 'ai privacy', 'ai and my data', 'deepfake', 'ai phone call', 'fake ai video'],
  'everyday-use': ['use ai to write', 'ai for recipes', 'ai to plan a trip', 'ai to explain', 'ai for letters', 'ai for photos', 'ai for health questions'],
  tools: ['chatgpt', 'google gemini', 'copilot', 'siri', 'alexa', 'ai on my phone', 'ai in gmail', 'ai in whatsapp'],
  questions: ['ai remember', 'ai free', 'ai cost', 'ai replace', 'ai lie', 'trust ai', 'ai listening', 'turn off ai'],
};

// Ord der afslører en søgning vi ikke skal skrive til.
const AFVIS = /\b(login|log in|sign in|download|app store|apk|stock|stocks|invest|price|pricing|coupon|discount|api|python|code|coding|developer|jobs?|salary|course|courses|certification|reddit|youtube|tiktok|crypto|nsfw|girlfriend|boyfriend|jailbreak|india|nigeria|philippines|uk|usa|australia|canada)\b/i;

async function suggest(q) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=gb&q=${encodeURIComponent(q)}`;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return [];
    const j = await r.json();
    return (j[1] || []).map((s) => String(s).toLowerCase().trim());
  } catch { return []; }
}

// Allerede brugte spørgsmål: artiklernes targetQuestion + docs/used-questions.json
const used = new Set();
const guidesDir = resolve(root, 'src/content/guides');
for (const f of readdirSync(guidesDir).filter((f) => f.endsWith('.md'))) {
  const m = readFileSync(resolve(guidesDir, f), 'utf8').match(/^targetQuestion:\s*"(.*)"/m);
  if (m) used.add(m[1].toLowerCase());
}
const usedFile = resolve(root, 'docs/used-questions.json');
if (existsSync(usedFile)) for (const u of JSON.parse(readFileSync(usedFile, 'utf8'))) used.add(String(u.q || u).toLowerCase());

const out = {};
for (const [cat, seeds] of Object.entries(SEEDS)) {
  if (wanted && cat !== wanted) continue;
  const found = new Map();
  for (const seed of seeds) {
    for (const p of PREFIXES) {
      const q = `${p} ${seed}`;
      for (const s of await suggest(q)) {
        if (s === q) continue;
        if (s.length < 14 || s.length > 80) continue;
        if (AFVIS.test(s)) continue;
        if (!/\b(ai|artificial intelligence|chatgpt|gemini|copilot|chatbot|siri|alexa|deepfake)\b/.test(s)) continue; // skal handle om AI
        if (used.has(s)) continue;
        found.set(s, (found.get(s) || 0) + 1); // ses den fra flere frø, er den mere "rigtig"
      }
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  out[cat] = [...found.entries()].sort((a, b) => b[1] - a[1]).map(([q, n]) => ({ q, hits: n }));
}

for (const [cat, list] of Object.entries(out)) {
  console.log(`\n## ${cat} (${list.length})`);
  for (const { q, hits } of list.slice(0, 25)) console.log(`  ${hits > 1 ? '★' : ' '} ${q}`);
}
console.log('\nJSON skrevet til _topic-candidates.json (ikke en del af sitet).');
const { writeFileSync } = await import('node:fs');
writeFileSync(resolve(root, '_topic-candidates.json'), JSON.stringify(out, null, 1));
