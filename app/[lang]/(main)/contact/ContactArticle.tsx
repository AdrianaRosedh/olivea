// app/[lang]/(main)/contact/ContactArticle.tsx
// Server-rendered semantic article for crawlers, AI assistants, screen readers
// and no-JS clients, in either language. Hidden via CSS once JS hydrates.
//
// Built from the CMS: the Contact page's own text (/admin → Contact), each
// venue's hours (/admin/hours), the address, email and main line (site
// settings) and each venue's phone (its Google listing). The hand-written
// ArticleEn / ArticleEs it replaced had drifted — it listed the restaurant as
// open Wednesday, Friday and Sunday after Thursday and Saturday were added.

import type { BusinessListing, ContactContent, GlobalSettings } from "@/lib/content/types";
import type { Lang } from "@/lib/i18n";

type Venue = "farmtotable" | "cafe" | "casa";

const tel = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;

export default function ContactArticle({
  lang,
  content,
  global,
  listings,
}: {
  lang: Lang;
  content: ContactContent;
  global: GlobalSettings | null;
  listings: Partial<Record<Venue, BusinessListing | undefined>>;
}) {
  const es = lang === "es";
  const t = (b?: { en?: string; es?: string }) => (b?.[lang] || b?.en || "").trim();
  const info = global?.contactInfo;
  const address = t(info?.address);
  const email = info?.email?.trim();
  const phone = info?.phone?.trim();
  const venues = [...(global?.hours ?? [])]
    .filter((h) => h.venue !== "chat")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <article
      aria-label={`${t(content.kicker)} — OLIVEA`}
      className="ssr-article"
      lang={es ? "es" : "en"}
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      <meta itemProp="name" content="OLIVEA" />

      <header>
        <h1>{t(content.kicker)} — OLIVEA</h1>
        {t(content.subtitle) && (
          <p>
            <em>{t(content.subtitle)}</em>
          </p>
        )}
      </header>

      {address && (
        <section aria-label={t(content.labels.address)}>
          <h2>{t(content.labels.address)}</h2>
          <p itemProp="address">{address}</p>
          {info?.googleMapsUrl && (
            <p>
              <a href={info.googleMapsUrl} rel="noopener noreferrer">
                {t(content.map?.googleMapsCta)} →
              </a>
            </p>
          )}
        </section>
      )}

      {(email || phone) && (
        <section aria-label="OLIVEA">
          <h2>OLIVEA</h2>
          <dl>
            {email && (
              <>
                <dt>{t(content.labels.email)}</dt>
                <dd>
                  <a href={`mailto:${email}`} itemProp="email">{email}</a>
                </dd>
              </>
            )}
            {phone && (
              <>
                <dt>{t(content.labels.phone)}</dt>
                <dd>
                  <a href={tel(phone)} itemProp="telephone">{phone}</a>
                </dd>
              </>
            )}
          </dl>
        </section>
      )}

      {venues.map((v) => {
        const schedule = t(v.schedule);
        const venuePhone = v.venue === "chat" ? undefined : listings[v.venue]?.telephone?.trim();
        if (!schedule && !venuePhone) return null;
        return (
          <section key={v.venue} aria-label={t(v.label)}>
            <h2>{t(v.label)}</h2>
            <dl>
              {schedule && (
                <>
                  <dt>{t(content.labels.hours)}</dt>
                  <dd>{schedule}</dd>
                </>
              )}
              {venuePhone && (
                <>
                  <dt>{t(content.labels.phone)}</dt>
                  <dd>
                    <a href={tel(venuePhone)}>{venuePhone}</a>
                  </dd>
                </>
              )}
            </dl>
          </section>
        );
      })}

      {t(content.footerNote) && (
        <section aria-label={t(content.labels.events)}>
          <h2>{t(content.labels.events)}</h2>
          <p>
            {t(content.footerNote)}
            {email && (
              <>
                {" "}
                <a href={`mailto:${email}`}>{email}</a>
              </>
            )}
          </p>
        </section>
      )}
    </article>
  );
}
