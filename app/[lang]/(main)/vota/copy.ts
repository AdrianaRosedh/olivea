// app/[lang]/(main)/vota/copy.ts
// Campaign copy for the MexBest 2026 Reader's Choice vote page.
// Kept beside the route (like carreras/sections.*.ts) rather than in the
// shared dictionaries: this is a dated campaign, and it should be deletable
// in one `rm -r` when the ballot closes.

export type VoteCopy = {
  eyebrow: string;
  title: string;
  /** Sits under the title inside the hero, over the image. Keep it short. */
  heroLine: string;
  heroAlt: string;
  lead: string;
  /** Shown once at least one vote is marked done on this device. */
  progressOne: string;
  progressBoth: string;
  cards: {
    key: "restaurant" | "hotel";
    category: string;
    name: string;
    line: string;
    cta: string;
    /** Inside the card, where the name already says what you're voting for. */
    ctaShort: string;
    done: string;
    href: string;
    /** The same alebrije the homepage uses for this property, so the card is
     *  recognisable before the title is read. */
    logoSrc: string;
    /** Basename in /public/videos; `-HD.webm` / `-HD.mp4` are the homepage's
     *  own card clips. Desktop hover only — see CardVideo. */
    videoBase: string;
  }[];
  shareTitle: string;
  shareLead: string;
  shareCta: string;
  shareCopied: string;
  shareText: string;
  /** Share-sheet chrome. Brand names (WhatsApp/Facebook/X/Telegram) are
   *  universal, so only the localisable bits live here. */
  shareEmailSubject: string;
  shareEmailLabel: string;
  shareCopyLabel: string;
  /** One line, in the homepage's MICHELIN-line slot. */
  fineShort: string;
  fine: string[];
};

/**
 * The zone is a form POST on the ballot, but it also reads from the query
 * string — so `regions__select=1` (Baja California) deep-links past the
 * dropdown. Without it the ballot opens on Mexico City and Olivea is not on
 * the page at all, which is where most of the drop-off was.
 */
const BALLOT = "https://readerschoice.mex-best.mx/?regions__select=1&category_id=";

/**
 * Landing on the right list is not enough: the ballot renders every nominee on
 * one page, and Olivea Farm to Table sits ~9,200px down a ~12,400px document —
 * roughly eleven phone screens of scrolling past the competition.
 *
 * We cannot script another origin's page, and the ballot offers nothing to aim
 * at: no per-nominee anchor, every vote button reuses `id="btn_vote"`, and there
 * is no search or filter parameter. What is left is a scroll-to-text fragment,
 * which the browser resolves itself — it scrolls the nominee's name into view
 * and highlights it.
 *
 * Support is Chrome/Edge, Safari 16.1+, Firefox 131+, and it requires a
 * user-activated cross-document navigation, which a tap on these buttons is.
 * The ballot sends no `Document-Policy: force-load-at-top`, so nothing blocks
 * it. Where it is unsupported the directive is ignored and the page opens at
 * the top — exactly what happened before — so this can only help.
 *
 * Matching is case-insensitive and runs against the DOM text, not the
 * uppercasing the ballot's CSS applies. If MexBest ever renames a card, this
 * silently stops scrolling and nothing else breaks.
 */
function ballotUrl(categoryId: 1 | 2, nomineeAsListed: string): string {
  return `${BALLOT}${categoryId}#:~:text=${encodeURIComponent(nomineeAsListed)}`;
}

export const VOTE_COPY: Record<"es" | "en", VoteCopy> = {
  es: {
    eyebrow: "Premios MexBest 2026 · Reader's Choice",
    title: "Dos votos por Olivea",
    heroLine: "El único premio que no decide el jurado.",
    heroAlt: "El valle desde Olivea al caer la tarde",
    // Deliberately does not repeat heroLine, which already says the jury does
    // not decide this one. On a phone that repetition cost a whole screen.
    lead:
      "Lo decide quien ya se sentó en la mesa y quien ya durmió en la casa. Son dos categorías distintas — restaurante y hotel — y puedes votar en las dos desde este mismo teléfono.",
    progressOne: "Va uno. Te falta el otro — son categorías distintas y no se estorban.",
    progressBoth: "Listo, los dos. Gracias de verdad.",
    cards: [
      {
        key: "restaurant",
        category: "Restaurantes",
        name: "Olivea Farm to Table",
        line: "Diecinueve nominados en Baja California.",
        cta: "Votar por el restaurante",
        ctaShort: "Votar",
        done: "Votado",
        href: ballotUrl(1, "Olivea Farm to Table"),
        logoSrc: "/brand/alebrije-1-Green.svg",
        videoBase: "farmtotable",
      },
      {
        key: "hotel",
        category: "Hoteles",
        name: "Casa Olivea",
        line: "Cinco nominados en total. Aquí un voto pesa muchísimo.",
        cta: "Votar por la casa",
        ctaShort: "Votar",
        done: "Votado",
        href: ballotUrl(2, "Casa Olivea"),
        logoSrc: "/brand/alebrije-2.svg",
        videoBase: "casa",
      },
    ],
    shareTitle: "Pásalo a una persona más",
    shareLead:
      "El conteo no sube votando otra vez — sube cuando alguien más que ya nos quiere hace sus dos votos.",
    shareCta: "Compartir",
    shareCopied: "Enlace copiado",
    shareText:
      "Olivea está nominado en los Premios MexBest 2026. Son dos votos y toma un minuto:",
    shareEmailSubject: "Vota por Olivea — MexBest 2026",
    shareEmailLabel: "Correo",
    shareCopyLabel: "Copiar enlace",
    fineShort: "Un voto por categoría · Sin registro · Un minuto",
    fine: [
      "Un voto por categoría, por dispositivo. No pide correo ni registro.",
      "Al tocar el botón se abre la boleta de MexBest en la lista de Baja California, en la tarjeta de Olivea. Ahí se pulsa VOTAR y se confirma.",
    ],
  },
  en: {
    eyebrow: "MexBest 2026 Awards · Reader's Choice",
    title: "Two votes for Olivea",
    heroLine: "The one award the jury doesn't decide.",
    heroAlt: "The valley from Olivea at dusk",
    lead:
      "It's decided by the people who sat at the table and slept in the house. Two separate categories — restaurant and hotel — and you can vote in both from this same phone.",
    progressOne: "That's one. One to go — they're separate categories and don't cancel out.",
    progressBoth: "Both done. Thank you, genuinely.",
    cards: [
      {
        key: "restaurant",
        category: "Restaurants",
        name: "Olivea Farm to Table",
        line: "Nineteen nominees in Baja California.",
        cta: "Vote for the restaurant",
        ctaShort: "Vote",
        done: "Voted",
        href: ballotUrl(1, "Olivea Farm to Table"),
        logoSrc: "/brand/alebrije-1-Green.svg",
        videoBase: "farmtotable",
      },
      {
        key: "hotel",
        category: "Hotels",
        name: "Casa Olivea",
        line: "Five nominees in total. A single vote goes a long way here.",
        cta: "Vote for the house",
        ctaShort: "Vote",
        done: "Voted",
        href: ballotUrl(2, "Casa Olivea"),
        logoSrc: "/brand/alebrije-2.svg",
        videoBase: "casa",
      },
    ],
    shareTitle: "Pass it to one more person",
    shareLead:
      "The count doesn't move by voting twice — it moves when one more person who already loves this place casts their two.",
    shareCta: "Share",
    shareCopied: "Link copied",
    shareText:
      "Olivea is nominated in the MexBest 2026 awards. Two votes, takes a minute:",
    shareEmailSubject: "Vote for Olivea — MexBest 2026",
    shareEmailLabel: "Email",
    shareCopyLabel: "Copy link",
    fineShort: "One vote per category · No signup · One minute",
    fine: [
      "One vote per category, per device. No email, no signup.",
      "The button opens the MexBest ballot on the Baja California list, at Olivea's card. Tap VOTAR there and confirm.",
    ],
  },
};
