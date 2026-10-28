// app/(main)/[lang]/menu/ArticleMenu.tsx
// Server component — semantic HTML for crawlers, AI assistants, and no-JS clients.
// The /menu page is a client-side redirect to /farmtotable#menu, so crawlers see nothing.
// This article provides the essential menu context.
//
// Built from the CMS: each house's own page description, its hours from
// /admin/hours and its phone from its Google listing. The hand-written version
// had drifted (it still listed the restaurant as open Wednesday, Friday and
// Sunday after Thursday and Saturday were added).

import Link from "next/link";
import { getContent, t } from "@/lib/content";
import type { Lang } from "@/lib/i18n";

const HOUSES = [
  { key: "farmtotable", name: "Olivea Farm To Table", cta: { en: "View the Farm To Table menu", es: "Ver el menú de Farm To Table" } },
  { key: "cafe", name: "Olivea Café Wine Bar", cta: { en: "View the Café menu", es: "Ver el menú del Café" } },
] as const;

export default async function ArticleMenu({ lang }: { lang: Lang }) {
  const isEs = lang === "es";
  const [global, ...houses] = await Promise.all([
    getContent("global").catch(() => null),
    ...HOUSES.map((h) => getContent(h.key).catch(() => null)),
  ]);
  const address = global?.contactInfo?.address ? t(lang, global.contactInfo.address) : "";

  return (
    <article
      aria-label={isEs ? "Menú OLIVEA" : "OLIVEA Menu"}
      className="ssr-article"
      lang={isEs ? "es" : "en"}
      itemScope
      itemType="https://schema.org/Menu"
    >
      <meta itemProp="name" content={isEs ? "Menú OLIVEA" : "OLIVEA Menu"} />

      <header>
        <h1>{isEs ? "Menú — OLIVEA en Valle de Guadalupe" : "Menu — OLIVEA in Valle de Guadalupe"}</h1>
      </header>

      {HOUSES.map((h, i) => {
        const meta = houses[i]?.meta;
        const hours = global?.hours?.find((x) => x.venue === h.key)?.schedule;
        const phone = houses[i]?.listing?.telephone;
        return (
          <section key={h.key} aria-label={h.name}>
            <h2>{h.name}</h2>
            {meta && <p>{t(lang, meta.description)}</p>}
            {(hours || phone) && (
              <dl>
                {hours && (
                  <>
                    <dt>{isEs ? "Horario" : "Hours"}</dt>
                    <dd>{t(lang, hours)}</dd>
                  </>
                )}
                {phone && (
                  <>
                    <dt>{isEs ? "Teléfono" : "Phone"}</dt>
                    <dd><a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a></dd>
                  </>
                )}
              </dl>
            )}
            <p>
              <Link href={`/${lang}/${h.key}`}>{h.cta[lang]} →</Link>
            </p>
          </section>
        );
      })}

      {address && (
        <section aria-label={isEs ? "Ubicación" : "Location"}>
          <h2>{isEs ? "Ubicación" : "Location"}</h2>
          <p>{address}</p>
        </section>
      )}
    </article>
  );
}
