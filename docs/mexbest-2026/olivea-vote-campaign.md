# Olivea — MexBest 2026 Reader's Choice campaign kit

**Guest page (share this):** https://oliveafarmtotable.com/vota
**QR code:** `qr-vota.png` / `qr-vota.svg`
**Campaign plan:** `plan.html`

Direct ballot links — Baja California list, scrolled to our card:

- Restaurantes → `https://readerschoice.mex-best.mx/?regions__select=1&category_id=1#:~:text=Olivea%20Farm%20to%20Table`
- Hoteles → `https://readerschoice.mex-best.mx/?regions__select=1&category_id=2#:~:text=Casa%20Olivea`

---

## What we're working with

| | Category | Zone | Field |
|---|---|---|---|
| Olivea Farm to Table | Restaurantes | Baja California | 19 nominees |
| Casa Olivea | Hoteles | Baja California | **5 nominees** |

Restaurant competition: Animalón, Fauna, Deckman's, Lunario, Bruma Wine Garden, Damiana, Villa Torél, Monteliebre, Manzanilla, Maíz de Loto, Da Toni, La Morocha, Bianca, Meno Male, Amapola, Diego Hernández, Mariscos El Gordito, El Güero Ensenada.

Hotel competition: Banyan Tree Veya, Bruma Wine Resort, La Villa del Valle, MIRA Earth Studios. **Four.** This is the one to press hardest — the margin between winning and not is probably a few dozen votes.

## How the ballot actually works

- Click **VOTAR** → confirm **"Sí, quiero votar"**. No email, no account, no captcha.
- Vote is stored as a **per-category cookie** (`MexBest2024_Restaurantes`, `MexBest2024_Hoteles`, 30-day expiry) plus a **FingerprintJS device fingerprint** sent to their server.
- **One vote per category per device — but the categories are independent.** Every person can vote for Olivea Farm to Table *and* Casa Olivea. Most people won't realize this. Say it in every message.
- **The zone can be deep-linked.** The ballot defaults to Mexico City, and the zone selector is a form POST — but the page also reads `regions__select` from the query string. Adding `?regions__select=1` lands straight on Baja California. This removes the step that was killing most votes; `/vota` uses it on both buttons.
- **And the page can be scrolled to our card.** Landing on the right list still leaves Olivea Farm to Table ~9,200px down a ~12,400px page — about eleven phone screens, past every competitor. The ballot has no per-nominee anchor (every vote button reuses `id="btn_vote"`) and no search parameter, so the only lever is a scroll-to-text fragment: `#:~:text=Olivea%20Farm%20to%20Table`. The browser scrolls the name into view and highlights it. Chrome/Edge, Safari 16.1+, Firefox 131+; where unsupported the page just opens at the top, as before. **Verify on a real phone before printing** — this pane can't test scrolling.

**Do not** script votes, use VPN/incognito loops, or ask staff to vote from a stack of devices. Fingerprinting is exactly what catches that, and the downside is disqualification from a hotel category we can genuinely win.

## What `/vota` does

- Lives on our own domain, in both languages, using the site's own layout and type.
- Both buttons deep-link past the zone dropdown.
- **Remembers which category you've cast** on that device (localStorage) and tells you the other one is still open. This is the single biggest source of extra votes: it converts one-category voters into two-category voters.
- **One-tap share** via the Web Share API (falls back to clipboard). Repeat voting is capped by fingerprint, so the only honest way the count grows is another person.
- The site banner points at it from every page.

## Deadline

Not published anywhere on the site. Awards are handed out each August in a different Mexican city (2026: Mazatlán). **Worth one email to MexBest to confirm the close date** — it determines whether this is a two-week sprint or a two-month drip. The banner is currently set to expire 31 Dec 2026; tighten it once we know.

---

## The plan

**Highest-value asks, in order:**

1. **Guests at the table, at the end of the meal.** Highest conversion by far. QR on the check presenter.
2. **Casa Olivea guests at checkout.** Same, plus they can cast both.
3. **Past guests via email list.** One send, one reminder. Don't segment.
4. **Instagram stories** with the link sticker — repeat, don't do it once.
5. **Wine club / repeat guests via WhatsApp.** Personal message converts far better than a broadcast.

**Cadence:** launch email + story day 1. Table cards live permanently. Story reminder every 4–5 days. One "we're close" push in the final week, only if we can honestly say it.

---

## Copy — Spanish

### Table tent / check presenter
> **Olivea está nominado.**
> Dos votos, un minuto, sin registro.
> oliveafarmtotable.com/vota
> *MexBest 2026 · Reader's Choice*

### Server script
> "Antes de que se vayan — Olivea y Casa Olivea están nominados en los Premios MexBest. Es un código, son dos votos y toma un minuto. Nos ayudaría muchísimo."

### Instagram story (3 frames)
1. "Olivea Farm to Table y Casa Olivea están nominados 🫒 Premios MexBest 2026 · Reader's Choice"
2. "Son **dos** votos distintos — restaurante y hotel. Puedes hacer los dos."
3. "Un minuto. Sin registro. 👇" + link sticker a oliveafarmtotable.com/vota

### Instagram feed caption
> Estamos nominados en los Reader's Choice de MexBest 2026 — Olivea Farm to Table en restaurantes y Casa Olivea en hoteles.
>
> Reader's Choice no lo decide un jurado. Lo decide quien se sentó en la mesa.
>
> Son dos votos distintos y toma un minuto: link en bio.
>
> Gracias por cada comida en este valle. 🫒

### WhatsApp (personal, a un habitual)
> Hola [nombre] — Olivea está nominado en los MexBest de este año, y Casa Olivea también. Reader's Choice se decide por votos del público. Son dos votos, toma un minuto y no pide registro: oliveafarmtotable.com/vota. Te lo agradecería un montón.

### Email a la lista
**Asunto:** Olivea está nominado — ¿nos ayudas con un minuto?

> Hola [nombre],
>
> Olivea Farm to Table y Casa Olivea están nominados en los Reader's Choice de los Premios MexBest 2026.
>
> A diferencia del resto de los premios, esta categoría no la decide el jurado — la deciden las personas que han comido y se han quedado con nosotros. Por eso te escribimos.
>
> Son **dos votos distintos**: uno en Restaurantes y otro en Hoteles. Puedes hacer los dos desde el mismo teléfono, no pide correo ni registro, y toma menos de un minuto.
>
> **[Votar aquí →]** (oliveafarmtotable.com/vota)
>
> Gracias por ser parte de este valle.
>
> — El equipo de Olivea

---

## Copy — English

### Table tent
> **Olivea is nominated.**
> Two votes, one minute, no signup.
> oliveafarmtotable.com/vota
> *MexBest 2026 · Reader's Choice*

### Server script
> "Before you go — Olivea and Casa Olivea are both nominated for the MexBest awards. It's a QR code, it's two votes, takes a minute. It'd mean a lot to us."

### Instagram story (3 frames)
1. "Olivea Farm to Table & Casa Olivea are nominated 🫒 MexBest 2026 · Reader's Choice"
2. "It's **two** separate votes — restaurant and hotel. You can cast both."
3. "One minute. No signup. 👇" + link sticker

### Email to the list
**Subject:** Olivea is nominated — got a minute?

> Hi [name],
>
> Olivea Farm to Table and Casa Olivea are both nominated in the MexBest 2026 Reader's Choice awards.
>
> Unlike the rest of the awards, this category isn't decided by the jury — it's decided by the people who've actually eaten and stayed with us. Which is why we're writing to you.
>
> It's **two separate votes**: one in Restaurants, one in Hotels. You can cast both from the same phone, it asks for no email and no signup, and it takes under a minute.
>
> **[Vote here →]** (oliveafarmtotable.com/vota)
>
> Thank you for being part of this valley.
>
> — The Olivea team

---

## Where the code lives

| File | What it is |
|---|---|
| `app/[lang]/(main)/vota/page.tsx` | The route. Metadata, hreflang, static params. |
| `app/[lang]/(main)/vota/copy.ts` | All campaign copy, ES + EN. Deletable in one `rm -r` when the ballot closes. |
| `app/[lang]/(main)/vota/VoteClient.tsx` | The two ballot links, per-device progress memory, share sheet. |
| `proxy.ts` | `/vota` added to `SHORT_URL_PREFIXES` so the bare URL resolves. |
| `app/sitemap.ts` | `/vota` added to static routes. |
| `content/banners/active.json` | Site-wide banner pointing at the page. |
