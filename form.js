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
  const submitBtn = form.querySelector('[type="submit"]');
  const tsInput = form.querySelector('[name="ts"]');
  const bedriftInput = form.querySelector('[name="bedrift"]');

  if (tsInput) {
    tsInput.value = String(Date.now());
  }

  const params = new URLSearchParams(window.location.search);
  const pakke = params.get("pakke");
  if (pakkeSelect) {
    pakkeSelect.value = ALLOWED.has(pakke) ? pakke : "usikker";
  }

  function setStatus(text, kind) {
    if (!statusEl) return;
    statusEl.className =
      kind === "ok" ? "form-status is-ok" : kind === "err" ? "form-status is-err" : "form-status";
    statusEl.style.display = "block";
    statusEl.textContent = text;
  }

  function resetTurnstile() {
    if (window.turnstile && typeof window.turnstile.reset === "function") {
      window.turnstile.reset();
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const tokenEl = form.querySelector('[name="cf-turnstile-response"]');
    const turnstile_token = tokenEl ? String(tokenEl.value || "").trim() : "";
    if (!turnstile_token) {
      setStatus("Vent til sikkerhetssjekken er ferdig, og prøv igjen.", "err");
      return;
    }

    if (submitBtn) submitBtn.disabled = true;

    const data = new FormData(form);
    const payload = {
      nombre: String(data.get("navn") || "").trim(),
      email: String(data.get("email") || "").trim(),
      telefono: String(data.get("telefon") || "").trim(),
      mensaje: String(data.get("melding") || "").trim(),
      marca: "kobleverk",
      pagina: window.location.pathname,
      turnstile_token,
      website: String(data.get("website") || ""),
      ts: Number(data.get("ts")) || Date.now(),
    };

    if (bedriftInput) {
      payload.empresa = String(data.get("bedrift") || "").trim();
    }

    try {
      const res = await fetch("https://ml-inbox.willynoslo17.workers.dev/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 200) {
        setStatus("Takk! Meldingen din er sendt. Vi tar kontakt så snart som mulig.", "ok");
        form.reset();
        if (pakkeSelect) pakkeSelect.value = "usikker";
        if (tsInput) tsInput.value = String(Date.now());
      } else if (res.status === 429) {
        setStatus("For mange forsøk. Vent et minutt og prøv igjen.", "err");
      } else if (res.status === 403) {
        setStatus(
          "Vi kunne ikke bekrefte at du er et menneske. Last inn siden på nytt og prøv igjen.",
          "err"
        );
      } else {
        setStatus(
          "Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@mlinternasjonal.no.",
          "err"
        );
      }
    } catch {
      setStatus(
        "Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@mlinternasjonal.no.",
        "err"
      );
    } finally {
      resetTurnstile();
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
