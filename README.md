# Kobleverk

Sitio estático de **Kobleverk** (parte de ML Digital): AI-automatisering og vekstmarkedsføring for små bedrifter i Norge.

- URL temporal: `https://kobleverk.pages.dev`
- Stack: HTML + CSS + JS mínimo (sin framework ni build)
- Idiomas: bokmål (`/`) y español (`/es/`)
- Hosting previsto: Cloudflare Pages

## Estructura

| Ruta NO | Ruta ES |
|---|---|
| `/` | `/es/` |
| `/kartlegging/` | `/es/diagnostico/` |
| `/automatisering/` | `/es/automatizacion/` |
| `/vekstpartner/` | `/es/socio-de-crecimiento/` |
| `/personvern/` | `/es/privacidad/` |
| `/kontakt/` | `/es/contacto/` |

## Desarrollo local

Sirve la raíz del repo con cualquier servidor estático, por ejemplo:

```bash
npx --yes serve .
```

La Function de contacto (`functions/api/kontakt.js`) solo corre en Cloudflare Pages. Sin `KONTAKT_WEBHOOK_URL`, responde `503` y el frontend muestra el `mailto` de respaldo.

## Cambiar la URL base

La URL canónica vive en `site.config.json` (`BASE_URL`). Enlaces internos usan rutas relativas a la raíz (`/kartlegging/`). Para actualizar canonical, og:url, hreflang, sitemap, robots y JSON-LD:

```bash
node scripts/set-base-url.mjs https://kobleverk.no
```

## Deploy en Cloudflare Pages

### Opción A – Connect to Git (recomendado)

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Autoriza GitHub y elige el repo `willynoslo17/kobleverk`.
3. Proyecto: `kobleverk`
4. Production branch: `main`
5. Build command: *(vacío)*
6. Build output directory: `/`
7. Guarda. La web se publica cuando se haga merge del PR a `main`.
8. Si `kobleverk.pages.dev` ya está ocupado, elige otro nombre de proyecto y ejecuta:
   `node scripts/set-base-url.mjs https://<nuevo-nombre>.pages.dev`

### Opción B – Wrangler

```bash
npx wrangler pages deploy . --project-name kobleverk
```

### Webhook del formulario (secreto)

Willy decide el destino (p. ej. un webhook de Make). No hay claves en el repo. Configura:

```bash
wrangler pages secret put KONTAKT_WEBHOOK_URL --project-name kobleverk
```

## Textos noruegos

`TEXTOS_NO_PARA_REVISAR.md` recoge todos los textos en bokmål para revisión (p. ej. con Gemini) antes de publicar.

## Notas

- Sin Netlify, sin píxeles/analítica, sin embeds externos.
- Precios de Kartlegging y Enkel automatisering: propuestas (ver comentarios TODO en HTML).
- AI-integrasjon og vekst: aprobado (19 900 + 6 900/mnd, mínimo 3 meses).

## Cloudflare Pages (Git)

Proyecto conectado a GitHub: cada push a `main` publica automáticamente.
- Build command: `sh scripts/build-dist.sh`
- Build output directory: `dist` (excluye README, TEXTOS_NO_PARA_REVISAR.md, scripts/ y site.config.json)
- Formulario: si `KONTAKT_WEBHOOK_URL` no está configurado, `form.js` abre el correo del visitante con el mensaje listo para kontakt@mlinternasjonal.no (mailto, sin secretos).
