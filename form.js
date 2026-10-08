(() => {
  const ALLOWED = new Set([
    "kartlegging",
    "enkel-automatisering",
    "ai-integrasjon-og-vekst",
    "usikker",
  ]);

  const form = document.getElementById("kontakt-form");
  if (!form) return;

  const pakkeSelect = form.querySelector('[name="pakke"]');
  const statusEl = document.getElementById("form-status");
  const lang = form.dataset.lang === "es" ? "es" : "nb";

  const params = new URLSearchParams(window.location.search);
  const pakke = params.get("pakke");
  if (pakkeSelect) {
    pakkeSelect.value = ALLOWED.has(pakke) ? pakke : "usikker";
  }

  const msg = {
    nb: {
      ok: "Takk! Jeg svarer innen 1 virkedag.",
      err: 'Noe gikk galt. Send e-post til <a href="mailto:willynoslo17@gmail.com?subject=Kobleverk">willynoslo17@gmail.com</a>.',
      sending: "Sender…",
    },
    es: {
      ok: "¡Gracias! Respondo en 1 día laborable.",
      err: 'Algo falló. Envía un correo a <a href="mailto:willynoslo17@gmail.com?subject=Kobleverk">willynoslo17@gmail.com</a>.',
      sending: "Enviando…",
    },
  }[lang];

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (statusEl) {
      statusEl.className = "form-status";
      statusEl.style.display = "block";
      statusEl.textContent = msg.sending;
    }

    const data = new FormData(form);
    const payload = {
      navn: String(data.get("navn") || "").trim(),
      bedrift: String(data.get("bedrift") || "").trim(),
      email: String(data.get("email") || "").trim(),
      telefon: String(data.get("telefon") || "").trim(),
      verktoy: String(data.get("verktoy") || "").trim(),
      melding: String(data.get("melding") || "").trim(),
      pakke: String(data.get("pakke") || "usikker"),
      consent: data.get("consent") === "on" || data.get("consent") === "true",
      website: String(data.get("website") || ""),
      lang,
    };

    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        form.reset();
        if (pakkeSelect) pakkeSelect.value = "usikker";
        if (statusEl) {
          statusEl.className = "form-status is-ok";
          statusEl.textContent = msg.ok;
        }
        return;
      }

      throw new Error("fail");
    } catch {
      if (statusEl) {
        statusEl.className = "form-status is-err";
        statusEl.innerHTML = msg.err;
      }
    }
  });
})();
