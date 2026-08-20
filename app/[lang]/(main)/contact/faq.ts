// app/[lang]/(main)/contact/faq.ts
//
// Hours, address, and how to reach a person — the three things a contact page
// is asked for, phrased as questions so they can be retrieved as answers.
//
// Hours are built from the values the page itself renders (global_settings,
// editable at /admin/hours) rather than written out here. Hardcoding them
// would guarantee that the markup and the page disagree the first time
// someone changes a service — and stale opening hours are worse than none,
// because a guest drives out to a closed gate.

import type { FaqItem } from "@/components/seo/FaqJsonLd";
import type { Lang } from "@/lib/i18n";

export interface ContactFacts {
  hours: { farmToTable?: string; cafe?: string; casa?: string };
  email: string;
  phone: string;
}

/** Farm To Table keeps its own line; see the note in contact/page.tsx. */
const FTT_PHONE = "+52 646 383 6402";

const ADDRESS =
  "Carretera Ensenada-Tecate Km 92.5, 22766 Villa de Juárez, Baja California, Mexico";

export function contactFaq(lang: Lang, f: ContactFacts): FaqItem[] {
  const es = lang === "es";
  const items: FaqItem[] = [];

  const h = f.hours ?? {};
  if (h.farmToTable || h.cafe || h.casa) {
    const lines = [
      h.farmToTable &&
        (es
          ? `Olivea Farm To Table: ${h.farmToTable}.`
          : `Olivea Farm To Table: ${h.farmToTable}.`),
      h.cafe &&
        (es
          ? `Olivea Café Wine Bar: ${h.cafe}.`
          : `Olivea Café Wine Bar: ${h.cafe}.`),
      h.casa && (es ? `Casa Olivea: ${h.casa}.` : `Casa Olivea: ${h.casa}.`),
    ].filter(Boolean);

    items.push({
      q: es
        ? "¿Cuáles son los horarios de Olivea?"
        : "What are Olivea's opening hours?",
      a:
        (es
          ? "Cada experiencia tiene su propio horario. "
          : "Each experience keeps its own hours. ") +
        lines.join(" ") +
        (es
          ? " Olivea Farm To Table es solo con reservación."
          : " Olivea Farm To Table is by reservation only."),
    });
  }

  items.push({
    q: es ? "¿Dónde está Olivea?" : "Where is Olivea located?",
    a: es
      ? `Olivea está en Valle de Guadalupe (Villa de Juárez), dentro del municipio de Ensenada, Baja California, México: ${ADDRESS}. Olivea Farm To Table, Casa Olivea y Olivea Café Wine Bar comparten la misma propiedad y el mismo huerto.`
      : `Olivea is in Valle de Guadalupe (Villa de Juárez), within Ensenada, Baja California, Mexico: ${ADDRESS}. Olivea Farm To Table, Casa Olivea, and Olivea Café Wine Bar share one property and one garden.`,
  });

  items.push({
    q: es
      ? "¿Olivea está en Valle de Guadalupe o en Ensenada?"
      : "Is Olivea in Valle de Guadalupe or Ensenada?",
    a: es
      ? "Ambos: Olivea está en Valle de Guadalupe (Villa de Juárez), que forma parte del municipio de Ensenada, Baja California."
      : "Both: Olivea is in Valle de Guadalupe (Villa de Juárez), which sits within Ensenada, Baja California.",
  });

  items.push({
    q: es ? "¿Cómo contacto a Olivea?" : "How do I contact Olivea?",
    a: es
      ? `Escríbenos a ${f.email} o llama al ${f.phone}. Olivea Farm To Table tiene línea directa: ${FTT_PHONE}.`
      : `Write to ${f.email} or call ${f.phone}. Olivea Farm To Table has its own direct line: ${FTT_PHONE}.`,
  });

  return items;
}
