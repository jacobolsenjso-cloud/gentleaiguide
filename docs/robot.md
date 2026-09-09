# Robotten for gentleaiguide.com — opskrift pr. kørsel

Denne fil læses af en frisk Claude-session, der starter af sig selv mandag og
torsdag morgen. Sessionen har ingen hukommelse om tidligere kørsler — alt den
skal vide, står her. Læs hele filen, før du gør noget.

**Målet med én kørsel:** skriv ÉN ny artikel som KLADDE, læg den på sitet,
og giv Jacob besked. Du udgiver ALDRIG selv. Jacob læser kladden og svarer
"ok" i samme samtale — først da går den live (trin 8).

---

## 0. Rammer

- Repoet ligger på Jacobs pc: `C:\Users\jacob\gentleaiguide`. Alt arbejde sker
  dér via Desktop Commander (PowerShell) — også git og build. Kør ALDRIG git
  fra Linux-VM'en (`device_bash`): selv et `git status` derfra efterlader en
  `.git/index.lock`, som blokerer git på Windows.
- Kommunikation med Jacob: dansk, kort, forklar hvorfor. Sitets tekst: engelsk
  (britisk stavning: recognise, organise, colour).
- Jacob er ikke udvikler. Han skal aldrig selv rette i filer.
- Hemmeligheder (`.env`) læses aldrig og nævnes aldrig i chatten.
- Hvis noget fejler, som du ikke kan løse på 2 forsøg: stop, skriv til Jacob
  hvad der gik galt, og gør INTET destruktivt. En kørsel uden artikel er i
  orden. En dårlig artikel er det ikke.
- Én kørsel = én artikel. Aldrig flere.

## 1. Se, hvad der findes

```powershell
cd C:\Users\jacob\gentleaiguide
git pull --rebase
git log --oneline -5
Get-ChildItem src\content\guides\*.md | Select-Object Name
Select-String -Path src\content\guides\*.md -Pattern '^(title|category|order|draft|targetQuestion):' | ForEach-Object { $_.Line }
```

Er der allerede en artikel med `draft: true`? Så venter Jacob stadig på at
læse den. **Skriv ikke en ny.** Mind ham i stedet om linket (trin 7) og stop.

Læs to eksisterende artikler i den kategori, du ender med at vælge, så tonen
sidder — fx `src\content\guides\ai-scams.md` og `never-type-this.md`.

## 2. Vælg kategorien

Fem kategorier (`src\site.ts`): Basics · Staying safe · Everyday use · Tools ·
Questions. Vælg den med FÆRREST artikler (tæl `category:` i trin 1). Ved
uafgjort: Staying safe før Everyday use før Questions før Tools før Basics —
sikkerhed og praktisk hjælp er dét, læseren over 50 har mest brug for.

## 3. Find spørgsmålet (Google-søgeforslag)

```powershell
node scripts/find-topic.mjs --category=<slug>     # fx staying-safe
```

Scriptet spørger Googles autocomplete med sætninger, som en begynder over 50
bruger, og viser rigtige søgninger. ★ = set fra flere frø = stærkere. Allerede
brugte spørgsmål er filtreret fra.

**Vælg ét spørgsmål efter disse regler:**
- Det skal være noget, en forsigtig 55-75-årig faktisk ville spørge om. Ikke
  "how to make a deepfake", ikke "how to build an ai".
- Artiklen skal kunne besvares ærligt uden at opfinde fakta. Er du usikker på
  svaret, vælg et andet spørgsmål.
- Det må ikke overlappe en eksisterende artikel (læs titlerne fra trin 1). Én
  søgning = én artikel; to artikler om samme søgning konkurrerer i Google.
- Foretræk ★-spørgsmål, men målgruppen vejer tungere end stjernen.

Skriv det valgte spørgsmål i `docs\used-questions.json` (tilføj
`{"q": "...", "date": "ÅÅÅÅ-MM-DD", "slug": "..."}` til listen), så det aldrig
vælges igen — også hvis Jacob afviser artiklen.

## 4. Skriv artiklen

Fil: `src\content\guides\<slug>.md`. Slug: 2-4 engelske ord med bindestreg,
uden "ai" hvis det kan undgås (fx `stop-ai-phone-calls`, `spot-fake-videos`).
Filnavnet ER adressen: `/guides/<slug>/`. Det ændres aldrig bagefter.

**Frontmatter (alle felter, i denne rækkefølge):**

```yaml
---
title: "Den fulde overskrift — indeholder spørgsmålets kerneord, i samme rækkefølge som i søgningen"
seoTitle: "Kort udgave, MAKS 42 tegn, samme kerneord"
summary: "Under 155 tegn. Én hel sætning der besvarer spørgsmålet. Ingen '…'."
description: "1-2 sætninger, den ærlige lede-tekst under overskriften."
category: "Staying safe"        # præcis som i src\site.ts
order: NN                       # højeste eksisterende order + 1
updated: ÅÅÅÅ-MM-DD             # dagens dato
image: "/images/articles/NN-<slug>.png"
label: "Staying safe"           # samme som category
figure: "scene"                 # robot-artikler er altid 'scene' (ingen frilægning nødvendig)
draft: true                     # ALTID true ved oprettelse. Kun trin 8 fjerner den.
targetQuestion: "det valgte spørgsmål, små bogstaver, ordret fra scriptet"
---
```

**Overskriften er det vigtigste ord-for-ord-krav:** Google matcher på
overskrift og `<title>`. Spørgsmålet "how to stop ai phone calls" → overskrift
"How to Stop AI Phone Calls — Without Changing Your Number" (kerneord: stop,
ai, phone, calls — alle med, i rækkefølge). Ikke "Silence the Machines".

**Teksten:**
- 900-1.400 ord. Første afsnit besvarer spørgsmålet direkte — læseren skal
  have svaret, før forklaringen kommer.
- Skriv til én person, som du sidder ved siden af. Korte sætninger. Ingen
  jargon uden en forklaring i samme sætning. Ingen "delve", "unlock",
  "game-changing", "revolutionise", "in today's digital age".
- 3-5 `##`-mellemoverskrifter, som er almindelige sætninger, ikke slagord.
- Konkrete, kopiérbare eksempler hvor det giver mening (hvad man skriver til
  AI'en, hvad man siger i telefonen).
- **Ingen opfundne tal, priser, datoer eller navne.** Kender du ikke tallet,
  så skriv det uden tal. Priser og produktindstillinger ændrer sig — skriv
  "at the time of writing" og hold det generelt frem for præcist-men-forkert.
- Sikkerhed og sundhed: aldrig råd der kan skade. Ved læge-, penge- eller
  juridiske emner: sig tydeligt, hvornår man skal tale med et menneske.
- Slut med et kort "The short version"-afsnit: 3-5 punkter man kan huske.
- **Link til mindst én "Start here"-guide** med almindelig markdown, fx
  `[what AI actually is](/guides/what-is-ai/)`. De fem: `what-is-ai`,
  `your-first-conversation`, `is-it-safe`, `when-ai-is-wrong`,
  `everyday-uses`. Link gerne også til én anden relevant artikel.
- Ingen billeder i teksten, ingen HTML, ingen tabeller.

## 5. Illustration

Tilføj artiklen i `scripts\illustrations.json` under `"articles"` med nøglen
`"NN"` (samme tal som `order`):

```json
"NN": { "slug": "<slug>", "motif": "<motiv på engelsk>" }
```

Motiv-regler (stilen er låst, kun motivet skifter): én tydelig genstand eller
mini-scene, roligt, ingen tekst/logoer/bogstaver, helst ting frem for personer
(en telefon med et rødt kryds, et brev med en lup, en kop te ved en tablet).
Skriv POSITIVT hvad der skal være — "no people" ignoreres af billed-AI'en.

```powershell
npm run illustrate NN
```

Fejler Cloudflare med 429 "Capacity temporarily exceeded": vent 1-2 minutter
og kør igen (det er ikke dagskvoten). Fejler det stadig efter 3 forsøg: brug
`figure: "spot"`-løsningen IKKE — lad `image` stå, skriv til Jacob at billedet
mangler, og fortsæt.

**OBLIGATORISK billedtjek — spring det ALDRIG over.** Åbn PNG-filen med
Read-værktøjet og SE på den. Billed-AI'en sætter ofte vrøvle-tekst ind
("SELAI VIDEO" stod på en skærm i den første kørsel 9/9, og Jacob så det før
robotten gjorde). Er der bogstaver, tal, ord, et logo eller noget der ligner
skrift — hvor som helst i billedet — kør `npm run illustrate NN -- --force` og
se igen. Højst 3 forsøg. Er der stadig skrift, så skriv i beskeden til Jacob
at billedet har tekst der skal males over, og fortsæt. Skriv i beskeden til
Jacob, at billedet er tjekket, og hvad det forestiller.

## 6. Byg og læg kladden op

```powershell
npm run build            # skal ende med 0 fejl
```

Tjek i `dist\`: findes `dist\guides\<slug>\index.html`? Står `noindex` i
den? Står slug'en IKKE i `dist\sitemap-0.xml` og ikke i `dist\index.html`?
Alle tre skal være ja — ellers er kladde-tilstanden i stykker: stop og skriv
til Jacob.

Commit KUN de filer, du har rørt (aldrig `git add .`):

```powershell
git add src/content/guides/<slug>.md public/images/articles/NN-<slug>.png scripts/illustrations.json docs/used-questions.json
git commit -F _commitmsg.txt      # engelsk besked: hvilket spørgsmål, hvilken kategori, hvorfor det spørgsmål
git pull --rebase
git push
```

Skriv commit-beskeden til `_commitmsg.txt` BOM-frit:
`[System.IO.File]::WriteAllText("$PWD\_commitmsg.txt", $msg, (New-Object System.Text.UTF8Encoding($false)))`.

Cloudflare Pages bygger selv ved push (1-3 minutter). Kladden er derefter på
`https://gentleaiguide.com/guides/<slug>/` — synlig for den der har linket,
usynlig for forsiden, Google og sitemap.

## 7. Giv Jacob besked

Send med `SendUserMessage` (dansk, kort):

> Ny kladde klar til gennemlæsning: **<titel>**
> https://gentleaiguide.com/guides/<slug>/
> Kategori: <kategori> · Søgning: "<spørgsmål>" · <ord> ord
> Svar **ok** for at udgive, eller skriv hvad der skal rettes.

Og stop dér. Vent på svar.

## 8. Når Jacob svarer

- **"ok"** (eller tilsvarende): fjern linjen `draft: true` fra frontmatter,
  sæt `updated:` til dagens dato, `npm run build`, tjek at slug'en NU står i
  `dist\sitemap-0.xml`, commit ("Publish: <titel>"), `git pull --rebase`,
  `git push`. Skriv til Jacob: "Udgivet: <link>".
- **Rettelser:** ret præcis det han beder om, byg, commit, push, send linket
  igen, vent.
- **"nej"/"drop den":** slet artikel-filen og billedet, fjern posten i
  `illustrations.json`, commit ("Drop draft: <titel>"), push. Spørgsmålet
  bliver stående i `used-questions.json`, så det ikke foreslås igen.

## 9. Det du ikke gør

- Ikke ændre design, layout, andre artikler eller `src\site.ts`.
- Ikke slå AdSense, analytics eller andre scripts til.
- Ikke udgive uden "ok". Ikke skrive mere end én artikel.
- Ikke skrive om noget, du ikke kan svare ærligt på.
