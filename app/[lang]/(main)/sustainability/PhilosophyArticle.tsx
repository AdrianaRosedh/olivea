// app/[lang]/(main)/sustainability/PhilosophyArticle.tsx
// Server-rendered semantic article for crawlers, AI assistants, screen readers
// and no-JS clients. Hidden via CSS once JS hydrates.
//
// Built from the CMS: the Philosophy record's title, intro and questions
// (/admin → Philosophy) and the six chapters (/admin → Philosophy sections),
// the same ones the page shows. The hand-written ArticleEn / ArticleEs it
// replaced repeated every chapter by hand — names, dates, practices — and
// could only drift from the page.

import Image from "next/image";
import type { PhilosophySection, Lang } from "./philosophyTypes";
import type { SustainabilityContent } from "@/lib/content/types";

const ENTITIES: Record<string, string> = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&nbsp;": " ", "&ldquo;": "“", "&rdquo;": "”", "&lsquo;": "‘", "&rsquo;": "’", "&mdash;": "—", "&ndash;": "–", "&hellip;": "…" };

/** A chapter body (simple HTML) as plain paragraphs. */
function paragraphs(html: string): string[] {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .split(/<\/(?:p|li|h[1-6]|blockquote)>|\n{2,}/i)
    .map((p) =>
      p
        .replace(/<[^>]+>/g, "")
        .replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e] ?? e)
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}

export default function PhilosophyArticle({
  lang,
  content,
  sections,
  faq,
}: {
  lang: Lang;
  content: SustainabilityContent;
  sections: PhilosophySection[];
  faq: Array<{ q: string; a: string }>;
}) {
  const es = lang === "es";
  const t = (b?: { en?: string; es?: string }) => (b?.[lang] || b?.es || "").trim();
  const title = t(content.title);

  return (
    <article
      aria-label={`${title} — OLIVEA`}
      className="ssr-article"
      lang={es ? "es" : "en"}
      itemScope
      itemType="https://schema.org/Article"
    >
      <meta itemProp="author" content="OLIVEA" />
      <meta itemProp="publisher" content="OLIVEA" />

      <header>
        <h1 itemProp="headline">{title} — OLIVEA</h1>
        {t(content.description) && (
          <p>
            <em>{t(content.description)}</em>
          </p>
        )}
        <Image
          src="/images/farm/garden.jpg"
          alt={`${title} — OLIVEA`}
          width={1200}
          height={630}
          className="ssr-article-hero"
          priority={false}
        />
      </header>

      {[...sections]
        .sort((a, b) => a.order - b.order)
        .map((s) => (
          <section key={s.id} aria-label={s.title}>
            <h2>{s.title}</h2>
            {s.subtitle && (
              <p>
                <em>{s.subtitle}</em>
              </p>
            )}
            {paragraphs(s.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {s.practices && s.practices.length > 0 && (
              <ul>
                {s.practices.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

      {/* Same text as the FAQPage markup in page.tsx, so the structured data
          describes content that is genuinely in the HTML. */}
      {faq.length > 0 && (
        <section aria-label={es ? "Preguntas frecuentes" : "Common questions"}>
          <h2>{es ? "Preguntas frecuentes" : "Common questions"}</h2>
          <dl>
            {faq.map((item) => (
              <div key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </article>
  );
}
