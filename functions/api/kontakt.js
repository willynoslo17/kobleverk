const ALLOWED_PAKKE = new Set([
  "kartlegging",
  "enkel-automatisering",
  "ai-integrasjon-og-vekst",
  "usikker",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function clip(value, max) {
  return String(value || "").trim().slice(0, max);
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return json(405, { ok: false, error: "method_not_allowed" });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const navn = clip(body.navn, 120);
  const email = clip(body.email, 200).toLowerCase();
  const bedrift = clip(body.bedrift, 160);
  const telefon = clip(body.telefon, 40);
  const verktoy = clip(body.verktoy, 300);
  const melding = clip(body.melding, 4000);
  const pakke = clip(body.pakke, 64);
  const lang = body.lang === "es" ? "es" : "nb";
  const website = clip(body.website, 200);
  const consent = body.consent === true;

  if (!navn || !EMAIL_RE.test(email) || !consent) {
    return json(400, { ok: false, error: "validation" });
  }
  if (website) {
    return json(200, { ok: true });
  }
  if (!ALLOWED_PAKKE.has(pakke)) {
    return json(400, { ok: false, error: "validation" });
  }

  const webhook = env && env.KONTAKT_WEBHOOK_URL;
  if (!webhook) {
    return json(503, { ok: false, error: "not_configured" });
  }

  const payload = {
    source: "kobleverk",
    lang,
    timestamp: new Date().toISOString(),
    navn,
    bedrift,
    email,
    telefon,
    verktoy,
    melding,
    pakke,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      return json(502, { ok: false, error: "upstream" });
    }
    return json(200, { ok: true });
  } catch {
    return json(502, { ok: false, error: "upstream" });
  } finally {
    clearTimeout(timer);
  }
}
