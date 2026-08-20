// app/[lang]/(main)/sustainability/faq.ts
//
// The questions people actually put to an assistant about Olivea, answered in
// the site's own words.
//
// Why this exists: the philosophy page already explains where the name comes
// from, and a crawler can read it — but nothing about the page *signalled*
// that it answers "why is it called Olivea?". The title says "Philosophy", the
// description lists themes, and the explanation sits under a heading that
// reads "Where the garden is the essence". Someone asking an assistant about
// the name got an inference about olive trees rather than the actual answer.
//
// FAQPage markup fixes both halves: the question wording becomes part of the
// page for retrieval, and the answer is a clean block an assistant can lift
// and attribute instead of paraphrasing.
//
// Answers are the site's own copy, condensed but not reworded. If the page
// copy changes, change it here too — a schema block that disagrees with the
// visible page is worse than no schema at all.

import type { Lang } from "./philosophyTypes";

interface QA {
  q: string;
  a: string;
}

const EN: QA[] = [
  {
    q: "Why is it called Olivea? What does the name Olivea mean?",
    a: "Olivea (IPA /oˈli.βe.a/ — o-LEE-beh-a) is a feminine name of Latin origin, derived from oliva, the olive. The olive tree symbolizes peace, prosperity, wisdom, and continuity: it grows slowly, adapts, and endures. For Olivea this meaning is not symbolic — it is structural.",
  },
  {
    q: "What is Olivea?",
    a: "Olivea is not a hotel, a restaurant, or a café — it is an ecosystem in Valle de Guadalupe, Baja California, Mexico. Casa Olivea (the farm stay), Olivea Farm To Table (the MICHELIN-starred restaurant), and Olivea Café Wine Bar are different expressions of the same core, unified by one philosophy and one working garden.",
  },
  {
    q: "What does the Olivea logo mean?",
    a: "The logo is an alebrije — in Mexican culture, a mythical hybrid being assembled from different animals, each part carrying meaning. Olivea's alebrije is an insect: an olive as the body, olive leaves as wings, and a radish as the head. Individually each part has its own identity; together they form something alive.",
  },
  {
    q: "How is Olivea sustainable?",
    a: "At Olivea sustainability is efficiency — not a trend and not a label, but respect made practical. In Valle de Guadalupe water is finite and electricity is unreliable, so sustainability is infrastructure rather than ideology: solar energy, water reused rather than discarded, and a cycle that carries the garden through the kitchens and back to the soil.",
  },
  {
    q: "When did Olivea open?",
    a: "Olivea opened in late summer of 2023. It was first conceived as something simple — a calm, easy-to-operate retreat — but as the land was worked and the garden began to respond, it became clear the project was asking for more intention rather than more scale.",
  },
];

const ES: QA[] = [
  {
    q: "¿Por qué se llama Olivea? ¿Qué significa el nombre Olivea?",
    a: "Olivea (IPA /oˈli.βe.a/ — o-LEE-beh-a) es un nombre femenino de origen latino, derivado de oliva, el olivo. El olivo simboliza paz, prosperidad, sabiduría y continuidad: crece lento, se adapta y perdura. Para Olivea este significado no es simbólico — es estructural.",
  },
  {
    q: "¿Qué es Olivea?",
    a: "Olivea no es un hotel, ni un restaurante, ni un café — es un ecosistema en Valle de Guadalupe, Baja California, México. Casa Olivea (la estancia de campo), Olivea Farm To Table (el restaurante con estrella MICHELIN) y Olivea Café Wine Bar son expresiones distintas de un mismo centro, unificadas por una filosofía y un huerto vivo.",
  },
  {
    q: "¿Qué significa el logo de Olivea?",
    a: "El logo es un alebrije — en la cultura mexicana, un ser mítico e híbrido compuesto de distintos animales, donde cada parte carga un significado. El alebrije de Olivea es un insecto: una oliva como cuerpo, hojas de olivo como alas y una cabeza de rábano. Cada parte tiene identidad propia; juntas forman algo vivo.",
  },
  {
    q: "¿Cómo es sustentable Olivea?",
    a: "En Olivea la sustentabilidad es eficiencia — no como tendencia ni como etiqueta, sino como respeto hecho práctica. En Valle de Guadalupe el agua es finita y la electricidad es poco confiable, así que la sustentabilidad es infraestructura y no ideología: energía solar, agua que se reutiliza en lugar de desecharse, y un ciclo que lleva el huerto por las cocinas y de vuelta a la tierra.",
  },
  {
    q: "¿Cuándo abrió Olivea?",
    a: "Olivea abrió a finales del verano de 2023. Al principio se concibió como algo simple — un lugar tranquilo y fácil de operar — pero conforme se trabajó la tierra y el huerto comenzó a responder, quedó claro que el proyecto pedía más intención, no más escala.",
  },
];

export function philosophyFaq(lang: Lang): QA[] {
  return lang === "en" ? EN : ES;
}

/** FAQPage JSON-LD for the philosophy page. */
export function philosophyFaqLd(lang: Lang, pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    inLanguage: lang === "en" ? "en-US" : "es-MX",
    mainEntity: philosophyFaq(lang).map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
