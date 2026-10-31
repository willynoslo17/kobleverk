(() => {
const FORM_I18N = {
  "en": {
    "Vent til sikkerhetssjekken er ferdig, og prøv igjen.": "Wait for the security check to finish and try again.",
    "Takk! Meldingen din er sendt. Vi tar kontakt så snart som mulig.": "Thanks! Your message has been sent. We will contact you as soon as possible.",
    "For mange forsøk. Vent et minutt og prøv igjen.": "Too many attempts. Wait a minute and try again.",
    "Vi kunne ikke bekrefte at du er et menneske. Last inn siden på nytt og prøv igjen.": "We could not verify that you are human. Please reload the page and try again.",
    "Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@kobleverk.no.": "Sorry, something went wrong. Try again, or send us an e-mail at kontakt@kobleverk.no."
  },
  "sv": {
    "Vent til sikkerhetssjekken er ferdig, og prøv igjen.": "Vänta tills säkerhetskontrollen är klar och försök igen.",
    "Takk! Meldingen din er sendt. Vi tar kontakt så snart som mulig.": "Tack! Ditt meddelande har skickats. Vi kommer att kontakta dig så snart som möjligt.",
    "For mange forsøk. Vent et minutt og prøv igjen.": "För många försök. Vänta en minut och försök igen.",
    "Vi kunne ikke bekrefte at du er et menneske. Last inn siden på nytt og prøv igjen.": "Vi kunde inte verifiera att du är människa. Ladda om sidan och försök igen.",
    "Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@kobleverk.no.": "Tyvärr, något gick fel. Försök igen, eller skicka oss ett e-postmeddelande på kontakt@kobleverk.no."
  },
  "pl": {
    "Vent til sikkerhetssjekken er ferdig, og prøv igjen.": "Poczekaj na zakończenie kontroli bezpieczeństwa i spróbuj ponownie.",
    "Takk! Meldingen din er sendt. Vi tar kontakt så snart som mulig.": "Dzięki! Twoja wiadomość została wysłana. Skontaktujemy się z Tobą tak szybko, jak to możliwe.",
    "For mange forsøk. Vent et minutt og prøv igjen.": "Zbyt wiele prób. Poczekaj chwilę i spróbuj ponownie.",
    "Vi kunne ikke bekrefte at du er et menneske. Last inn siden på nytt og prøv igjen.": "Nie mogliśmy zweryfikować, czy jesteś człowiekiem. Załaduj ponownie stronę i spróbuj ponownie.",
    "Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@kobleverk.no.": "Przepraszamy, coś poszło nie tak. Spróbuj ponownie lub wyślij nam e-mail na adres kontakt@kobleverk.no."
  }
};
const FORM_LANG = (document.documentElement.lang || "nb").slice(0, 2);
const T = (s) => (FORM_I18N[FORM_LANG] && FORM_I18N[FORM_LANG][s]) || s;

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
      setStatus(T("Vent til sikkerhetssjekken er ferdig, og prøv igjen."), "err");
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
        setStatus(T("Takk! Meldingen din er sendt. Vi tar kontakt så snart som mulig."), "ok");
        form.reset();
        if (pakkeSelect) pakkeSelect.value = "usikker";
        if (tsInput) tsInput.value = String(Date.now());
      } else if (res.status === 429) {
        setStatus(T("For mange forsøk. Vent et minutt og prøv igjen."), "err");
      } else if (res.status === 403) {
        setStatus(T("Vi kunne ikke bekrefte at du er et menneske. Last inn siden på nytt og prøv igjen."),
          "err"
        );
      } else {
        setStatus(T("Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@kobleverk.no."),
          "err"
        );
      }
    } catch {
      setStatus(T("Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@kobleverk.no."),
        "err"
      );
    } finally {
      resetTurnstile();
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
