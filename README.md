# Kobleverk

Nettsted for **Kobleverk** – koble forretningsverktøy og automatiser arbeidsflyter for små bedrifter i Norge.  
Kobleverk er en del av **ML Digital** (MARTINEZ LOZANO INTERNASJONAL HANDEL, Org.nr. 935 407 095 MVA).

Statisk HTML + CSS. Ingen build-steg. Hosting: **Cloudflare Pages** (gratis).

**Midlertidig URL:** `https://kobleverk.pages.dev`  
**Domene kobleverk.no:** ikke kjøpt ennå.

> Norske tekster er utkast. Se `TEXTOS_NO_PARA_REVISAR.md` før publisering. Ikke annonser nettsiden før norsk er gjennomgått.  
> Alle priser på siden er **forslag** – ikke endelig avtale.

## Stack

- HTML + `styles.css` + `form.js` (vanilla, `defer`)
- Meny uten JS (`<details>`)
- Cloudflare Pages Function: `functions/api/kontakt.js`
- Base-URL i `site.config.json` + manuelt skript `scripts/set-base-url.mjs`

## Lokal forhåndsvisning

```bash
npx --yes serve -l 4173 .
# eller: python3 -m http.server 4173
```

Åpne `http://localhost:4173/`.

Bytte base-URL (når eget domene er kjøpt):

```bash
node scripts/set-base-url.mjs https://eksempel.no
```

## Cloudflare Pages – oppsett

### Alternativ A: Dashboard (anbefalt)

1. Gå til [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Velg repoet `willynoslo17/kobleverk`.
3. Prosjektnavn: `kobleverk` (gir `https://kobleverk.pages.dev`).
4. **Build command:** tom (la stå blank).
5. **Build output directory:** `/` (eller `.` / la stå som rot).
6. Deploy.
7. Hvis `kobleverk.pages.dev` allerede er opptatt: velg et annet prosjektnavn (f.eks. `kobleverk-oslo`), oppdater URL med  
   `node scripts/set-base-url.mjs https://<nytt-navn>.pages.dev` og push.

### Alternativ B: Wrangler

```bash
npx wrangler pages deploy . --project-name kobleverk
```

### Kontaktskjema (webhook)

Functionen `POST /api/kontakt` videresender lead som JSON til `KONTAKT_WEBHOOK_URL`.  
Hvis variabelen mangler, returneres `503` og frontenden viser `mailto:`-fallback.

Willy velger mottaker (f.eks. Make-webhook). Ingen nøkler i repoet.

```bash
npx wrangler pages secret put KONTAKT_WEBHOOK_URL --project-name kobleverk
```

Payload inkluderer `source: "kobleverk"`, `lang` (`nb`/`es`) og `timestamp`.

## Priser (eks. mva.) – alle er forslag

| Pakke | Pris | Status |
|-------|------|--------|
| Start | 3 490 kr/mnd + 1 990 kr oppstart | Forslag (TODO i HTML) |
| Pluss | 5 990 kr/mnd + 2 490 kr oppstart | Forslag (TODO i HTML) |
| Engangs oppsett | 4 990 kr engang | Forslag (TODO i HTML) |

## Struktur

Se rotmappen: `/`, `/pakker/`, `/slik-jobber-jeg/`, `/arbeid/`, `/kontakt/`, `/personvern/` og speil i `/es/`.

## TODO (Willy)

- Ekte foto (`img/willy.webp`)
- Bekrefte alle priser (Start, Pluss, Engangs oppsett)
- Bekrefte prefererte plattformer (Make / Zapier / native)
- Eksempler til Arbeid (når det finnes materiale å vise)
- Eksakte diplomititler (Toulouse Lautrec)
- Betalingsfrister og oppsigelsesvarsel
- `KONTAKT_WEBHOOK_URL`
- Bytt til eget .no-domene når det er kjøpt (ikke kjøpt ennå)
- Gjennomgang av norsk med Gemini (`TEXTOS_NO_PARA_REVISAR.md`)
