// app/[lang]/(home)/HomeArticle.tsx
// Server component — semantic HTML for crawlers, AI assistants, screen readers
// and no-JS clients. Hidden via CSS once JS hydrates.
//
// Everything here comes from the CMS: the home text, each house's own page
// description, the address and the awards (/admin/press). The hand-written
// ArticleEn / ArticleEs it replaced had drifted — it still promised suites
// "with a private terrace overlooking the garden" after the Casa page was
// corrected — because nobody edits a file to change a sentence on the site.

import Image from "next/image";
import Link from "next/link";
import { getContent, t } from "@/lib/content";
import type { Lang } from "@/lib/i18n";
import { loadPressItems } from "@/app/[lang]/(main)/press/load";
import { recognitionLabel } from "@/lib/seo/awards";

const HOUSES = [
  { key: "casa", name: "Casa Olivea", href: "casa", cta: { en: "Explore Casa Olivea", es: "Conocer Casa Olivea" } },
  { key: "farmtotable", name: "Olivea Farm To Table", href: "farmtotable", cta: { en: "Explore Farm To Table", es: "Conocer Farm To Table" } },
  { key: "cafe", name: "Olivea Café Wine Bar", href: "cafe", cta: { en: "Explore Olivea Café Wine Bar", es: "Conocer Olivea Café Wine Bar" } },
] as const;

export default async function HomeArticle({ lang }: { lang: Lang }) {
  const es = lang === "es";
  const [home, global, awards, ...houses] = await Promise.all([
    getContent("home"),
    getContent("global").catch(() => null),
    loadPressItems(lang)
      .then((items) => items.filter((i) => i.kind === "award"))
      .catch(() => []),
    ...HOUSES.map((h) => getContent(h.key).catch(() => null)),
  ]);

  const tagline = home.hero?.subtitle ? t(lang, home.hero.subtitle) : "";
  const address = global?.contactInfo?.address ? t(lang, global.contactInfo.address) : "";

  return (
    <article
      aria-label="OLIVEA"
      className="ssr-article"
      lang={es ? "es" : "en"}
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      <meta itemProp="name" content="OLIVEA" />
      <meta itemProp="url" content={`https://oliveafarmtotable.com/${lang}`} />

      <header>
        <h1>{t(lang, home.meta.title)}</h1>
        <p itemProp="description">{t(lang, home.meta.description)}</p>
        {tagline && <p><em>{tagline}</em></p>}
        <Image
          src="/images/seo/cover.jpg"
          alt={home.hero?.image?.alt ? t(lang, home.hero.image.alt) : "OLIVEA"}
          width={1200}
          height={630}
          className="ssr-article-hero"
          priority={false}
        />
      </header>

      {HOUSES.map((h, i) => {
        const meta = houses[i]?.meta;
        if (!meta) return null;
        return (
          <section key={h.key} aria-label={h.name}>
            <h2>{t(lang, meta.title)}</h2>
            <p>{t(lang, meta.description)}</p>
            <p>
              <Link href={`/${lang}/${h.href}`}>{h.cta[lang]} →</Link>
            </p>
          </section>
        );
      })}

      {address && (
        <section aria-label={es ? "Ubicación" : "Location"}>
          <h2>{es ? "Ubicación" : "Location"}</h2>
          <p itemProp="address">{address}</p>
        </section>
      )}

      {awards.length > 0 && (
        <section aria-label={es ? "Reconocimientos" : "Awards"}>
          <h2>{es ? "Reconocimientos" : "Awards & Recognition"}</h2>
          <ul>
            {awards.map((a) => (
              <li key={a.id}>
                {recognitionLabel(a)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
