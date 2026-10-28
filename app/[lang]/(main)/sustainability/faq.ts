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
// The questions and answers live in sustainability_content.faq, edited in
// /admin → Philosophy, so they change with the page copy instead of in a file.

import type { Lang } from "./philosophyTypes";

/** FAQPage JSON-LD for the philosophy page. */
export function philosophyFaqLd(lang: Lang, pageUrl: string, items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    inLanguage: lang === "en" ? "en-US" : "es-MX",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
