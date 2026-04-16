// app/(main)/[lang]/press/ArticlePress.tsx
// Server component — semantic HTML for crawlers, AI assistants, and no-JS clients.

import type { PressItem, Lang } from "./pressTypes";

export default function ArticlePress({
  lang,
  items,
}: {
  lang: Lang;
  items: PressItem[];
}) {
  const isEs = lang === "es";

  const awards = items.filter((i) => i.kind === "award");
  const mentions = items.filter((i) => i.kind === "mention");

  return (
    <article
      aria-label={isEs ? "Prensa OLIVEA" : "OLIVEA Press"}
      className="ssr-article"
      lang={isEs ? "es" : undefined}
      itemScope
      itemType="https://schema.org/Article"
    >
      <meta itemProp="author" content="OLIVEA" />

      <header>
        <h1 itemProp="headline">
          {isEs ? "Prensa — OLIVEA" : "Press — OLIVEA"}
        </h1>
        <p>
          <em>
            {isEs
              ? "Reconocimientos, menciones en medios y recursos de prensa de Olivea — hospitalidad del huerto, restaurante con estrella MICHELIN y hospedaje en Valle de Guadalupe."
              : "Awards, media coverage, and press resources for Olivea — farm hospitality, MICHELIN-starred restaurant, and farm stay in Valle de Guadalupe."}
          </em>
        </p>
      </header>

      {/* ── Awards ── */}
      {awards.length > 0 && (
        <section aria-label={isEs ? "Reconocimientos" : "Awards"}>
          <h2>{isEs ? "Reconocimientos" : "Awards"}</h2>
          {awards.map((item) => (
            <article key={item.id}>
              <h3>{item.title}</h3>
              <p>
                {item.issuer} · {item.publishedAt}
                {item.for !== "olivea" && (
                  <> · {item.for === "restaurant" ? "Olivea Farm To Table" : item.for === "hotel" ? "Casa Olivea" : "Olivea Café"}</>
                )}
              </p>
              {item.blurb && <p>{item.blurb}</p>}
              {item.links.length > 0 && (
                <p>
                  {item.links.map((link, i) => (
                    <span key={i}>
                      {i > 0 && " · "}
                      <a href={link.href} rel="noopener noreferrer">
                        {link.label}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </article>
          ))}
        </section>
      )}

      {/* ── Press Mentions ── */}
      {mentions.length > 0 && (
        <section aria-label={isEs ? "Menciones en medios" : "Press Mentions"}>
          <h2>{isEs ? "Menciones en Medios" : "Press Mentions"}</h2>
          {mentions.map((item) => (
            <article key={item.id}>
              <h3>{item.title}</h3>
              <p>
                {item.issuer} · {item.publishedAt}
                {item.section && <> · {item.section}</>}
              </p>
              {item.blurb && <p>{item.blurb}</p>}
              {item.links.length > 0 && (
                <p>
                  {item.links.map((link, i) => (
                    <span key={i}>
                      {i > 0 && " · "}
                      <a href={link.href} rel="noopener noreferrer">
                        {link.label}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </article>
          ))}
        </section>
      )}

      {/* ── Contact ── */}
      <section aria-label={isEs ? "Contacto de prensa" : "Press Contact"}>
        <h2>{isEs ? "Contacto de Prensa" : "Press Contact"}</h2>
        <p>
          {isEs ? "Para consultas de prensa:" : "For press inquiries:"}{" "}
          <a href="mailto:pr@casaolivea.com">pr@casaolivea.com</a>
        </p>
      </section>
    </article>
  );
}
