# Robotten for gentleaiguide.com — opskrift pr. kørsel

Denne fil læses af en frisk Claude-session, der starter af sig selv mandag og
torsdag morgen. Sessionen har ingen hukommelse om tidligere kørsler — alt den
skal vide, står her. Læs hele filen, før du gør noget.

**Målet med én kørsel:** skriv ÉN ny artikel og læg den som **pull request**
på GitHub (et forslag til ændring, som Jacob godkender med ét klik). Du
udgiver ALDRIG selv på main. GitHub mailer Jacob om forslaget; Cloudflare
bygger en preview-adresse, hvor han læser artiklen i det rigtige layout.
Trykker han "Merge", går artiklen live. Trykker han "Close", forsvinder den.

---

## 0. Rammer

- Du kører i skyen (Claude Code på nettet) med repoet
  `jacobolsenjso-cloud/gentleaiguide` klonet i din arbejdsmappe. Alt sker med
  almindelig bash: `git`, `node`, `npm`. Rør ALDRIG Jacobs pc.
- Arbejd altid på en ny gren `draft/<slug>` — aldrig direkte på `main`.
- Kommunikation med Jacob: dansk, kort, forklar hvorfor. Sitets tekst: engelsk
  (britisk stavning: recognise, organise, colour).
- Jacob er ikke udvikler. Han skal aldrig selv rette i filer.
- Hemmeligheder (`.env`) læses aldrig og nævnes aldrig i chatten.
- Hvis noget fejler, som du ikke kan løse på 2 forsøg: stop, skriv til Jacob
  hvad der gik galt, og gør INTET destruktivt. En kørsel uden artikel er i
  orden. En dårlig artikel er det ikke.
- Én kørsel = én artikel. Aldrig flere.

## 1. Se, hvad der findes

```bash
git checkout main && git pull --rebase
git log --oneline -5
ls src/content/guides/
grep -H -E '^(title|category|order|targetQuestion):' src/content/guides/*.md
npm ci   # kun første gang i en frisk session
```

Er der allerede en åben pull request fra en tidligere kørsel (`gh pr list`
eller `git ls-remote --heads origin 'draft/*'`)? Så venter Jacob stadig på at
læse den. **Skriv ikke en ny.** Stop, og skriv til Jacob at forslaget stadig
venter (med link).

Læs to eksisterende artikler i den kategori, du ender med at vælge, så tonen
sidder — fx `src\content\guides\ai-scams.md` og `never-type-this.md`.

## 2. Vælg kategorien

Fem kategorier (`src\site.ts`): Basics · Staying safe · Everyday use · Tools ·
Questions. Vælg den med FÆRREST artikler (tæl `category:` i trin 1). Ved
uafgjort: Staying safe før Everyday use før Questions før Tools før Basics —
sikkerhed og praktisk hjælp er dét, læseren over 50 har mest brug for.

## 3. Find spørgsmålet (Google-søgeforslag)

```bash
node scripts/find-topic.mjs --category=<slug>     # fx staying-safe
```

Virker Googles autocomplete ikke fra skyen (tomt svar / netværksfejl): stop,
og skriv det til Jacob. Gæt ALDRIG et spørgsmål selv.

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

Fil: `src/content/guides/<slug>.md`. Slug: 2-4 engelske ord med bindestreg,
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
# INGEN draft-linje: artiklen skal vises fuldt ud på preview-sitet (forside,
# lister), så Jacob ser den i sammenhæng. Preview-adresser er automatisk
# skjult for Google (Cloudflare sætter noindex på dem).
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

Tilføj artiklen i `scripts/illustrations.json` under `"articles"` med nøglen
`"NN"` (samme tal som `order`):

```json
"NN": { "slug": "<slug>", "motif": "<motiv på engelsk>" }
```

Motiv-regler (stilen er låst, kun motivet skifter): én tydelig genstand eller
mini-scene, roligt, ingen tekst/logoer/bogstaver, helst ting frem for personer
(en telefon med et rødt kryds, et brev med en lup, en kop te ved en tablet).
Skriv POSITIVT hvad der skal være — "no people" ignoreres af billed-AI'en.

```bash
npm run illustrate NN     # kræver CF_ACCOUNT_ID + CF_API_TOKEN som miljøvariabler
```

Mangler nøglerne i skyen (scriptet siger det selv): spring billedet over, lad
`image`-linjen stå, og skriv i pull request-teksten at illustrationen mangler
og skal laves fra Jacobs pc med `npm run illustrate NN`. Det er i orden.

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

## 6. Byg, gren, pull request

```bash
npm run build            # skal ende med 0 fejl
grep -c "<loc>" dist/sitemap-0.xml          # ét mere end før
ls dist/guides/<slug>/index.html            # findes

git checkout -b draft/<slug>
git add src/content/guides/<slug>.md scripts/illustrations.json docs/used-questions.json
git add public/images/articles/NN-<slug>.png   # kun hvis billedet blev lavet
git commit -F /tmp/msg.txt   # engelsk: hvilket spørgsmål, hvilken kategori, hvorfor
git push -u origin draft/<slug>
```

Opret pull request'en mod `main` — med `gh` hvis det findes, ellers via
GitHubs API med GITHUB_TOKEN (`POST /repos/jacobolsenjso-cloud/gentleaiguide/pulls`).
Titel: `New article: <titel>`. Tekst (engelsk er fint på GitHub, men skriv
den til Jacob på dansk):

> **Ny artikel til godkendelse**
> Kategori: <kategori> · Søgning: "<spørgsmål>" · <ord> ord · Illustration: ja/nej (tjekket for tekst)
>
> Læs den her (Cloudflare bygger preview på 1-3 min):
> https://draft-<slug>.gentleaiguide.pages.dev/guides/<slug>/
>
> Tryk **Merge pull request** for at udgive. Tryk **Close** for at droppe den.
> Rettelser: skriv dem som kommentar her, så retter robotten næste gang.

Preview-adressen dannes af grennavnet: `draft/<slug>` bliver til
`draft-<slug>.gentleaiguide.pages.dev`. Tjek den med curl efter et par minutter,
hvis du kan; ellers stol på mønstret.

## 7. Giv Jacob besked

GitHub mailer ham automatisk om pull request'en. Afslut alligevel med en kort
dansk besked (SendUserMessage) med titel, link til pull request'en og
preview-linket. Så stop. Vent ikke.

## 8. Kommentarer på en åben pull request

Er der ved næste kørsel en åben pull request MED en kommentar fra Jacob:
ret præcis det, han beder om, på samme gren, commit, push (pull request'en
opdateres selv), svar kort i en kommentar, og skriv ingen ny artikel den dag.

## 9. Det du ikke gør

- Ikke ændre design, layout, andre artikler eller `src\site.ts`.
- Ikke slå AdSense, analytics eller andre scripts til.
- Ikke pushe til `main`. Ikke merge selv. Ikke skrive mere end én artikel.
- Ikke skrive om noget, du ikke kan svare ærligt på.
