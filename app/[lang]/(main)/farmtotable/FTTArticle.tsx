// app/[lang]/(main)/farmtotable/FTTArticle.tsx
// Server-rendered semantic article for crawlers, AI assistants, screen readers
// and no-JS clients, in either language. Hidden via CSS once JS hydrates.
//
// It renders the same CMS sections as the page, so what search engines and AI
// assistants read is always what guests see. The hand-written ArticleEn /
// ArticleEs it replaced had drifted from the page (the season line, the
// ecosystem cards, the FAQ).

import Image from "next/image";
import { md, t } from "./sections/md";
import type { Lang, SectionData } from "./sections/types";

type Bi = { en: string; es: string };

function find(sections: SectionData[], id: string): SectionData {
  return sections.find((s) => s.id === id) ?? {};
}

export default function FTTArticle({ lang, sections }: { lang: Lang; sections: SectionData[] }) {
  const es = lang === "es";
  const hero = find(sections, "hero");
  const exp = find(sections, "experience");
  const kitchen = find(sections, "kitchen");
  const table = find(sections, "table");
  const pantry = find(sections, "pantry");
  const gallery = find(sections, "gallery");
  const menu = find(sections, "menu");
  const faq = find(sections, "faq");

  const list = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
  const stats = list<{ label: Bi; value: Bi }>(exp.stats);
  const cards = list<{ id: string; title: Bi; body: Bi }>(pantry.cards);
  const infoCards = list<{ title: Bi; body: Bi }>(menu.infoCards);
  const images = list<{ alt: Bi; src: string }>(gallery.images);
  const items = list<{ q: Bi; a: Bi }>(faq.items);
  const para = (b: Bi | undefined, key?: string | number) =>
    b && t(b, lang) ? <p key={key}>{md(t(b, lang))}</p> : null;

  return (
    <article
      aria-label="Olivea Farm To Table"
      className="ssr-article"
      lang={es ? "es" : "en"}
      itemScope
      itemType="https://schema.org/Restaurant"
    >
      <meta itemProp="name" content="Olivea Farm To Table" />
      <meta
        itemProp="servesCuisine"
        content={
          es
            ? "Menú holístico, Menú degustación, Del huerto a la mesa, Cocina de Baja California"
            : "Holistic menu, Tasting menu, Farm to table, Baja California cuisine"
        }
      />

      <header>
        <h1>Olivea Farm To Table</h1>
        {hero.slogan && <p><em>{t(hero.slogan, lang)}</em></p>}
        <Image
          src={hero.image?.src ?? "/images/farm/hero.jpg"}
          alt={t(hero.image?.alt, lang) || "Olivea Farm To Table"}
          width={1200}
          height={630}
          priority
          className="ssr-article-hero"
        />
      </header>

      <section id={`experience-${lang}`} aria-labelledby={`experience-heading-${lang}`}>
        <h2 id={`experience-heading-${lang}`}>{t(exp.heading, lang)}</h2>
        {para(exp.subtitle)}
        {para(exp.origin)}
        {stats.length > 0 && (
          <dl>
            {stats.map((s) => (
              <div key={t(s.label, lang)}>
                <dt>{t(s.label, lang)}</dt>
                <dd>{t(s.value, lang)}</dd>
              </div>
            ))}
          </dl>
        )}
        {para(exp.balance)}
        {para(exp.values)}
        {exp.fieldNote && <aside>{para(exp.fieldNote)}</aside>}
      </section>

      <section id={`kitchen-${lang}`} aria-labelledby={`kitchen-heading-${lang}`}>
        <h2 id={`kitchen-heading-${lang}`}>{t(kitchen.heading, lang)}</h2>
        {list<Bi>(kitchen.product).map((p, i) => para(p, i))}
        {para(kitchen.team)}
        {para(kitchen.technique)}
      </section>

      <section id={`table-${lang}`} aria-labelledby={`table-heading-${lang}`}>
        <h2 id={`table-heading-${lang}`}>{t(table.heading, lang)}</h2>
        {list<Bi>(table.hospitality).map((p, i) => para(p, i))}
        {para(table.narrative)}
        {para(table.terrace)}
      </section>

      <section id={`pantry-${lang}`} aria-labelledby={`pantry-heading-${lang}`}>
        <h2 id={`pantry-heading-${lang}`}>{t(pantry.heading, lang)}</h2>
        {list<Bi>(pantry.intro).map((p, i) => para(p, i))}
        {cards.map((c) => (
          <div key={c.id}>
            <h3>{t(c.title, lang)}</h3>
            {para(c.body)}
          </div>
        ))}
      </section>

      <section id={`menu-${lang}`} aria-labelledby={`menu-heading-${lang}`}>
        <h2 id={`menu-heading-${lang}`}>{t(menu.heading, lang)}</h2>
        {para(menu.body)}
        {infoCards.map((c) => (
          <div key={t(c.title, lang)}>
            <h3>{t(c.title, lang)}</h3>
            {para(c.body)}
          </div>
        ))}
      </section>

      {images.length > 0 && (
        <section id={`gallery-${lang}`} aria-label={es ? "Galería" : "Gallery"}>
          <h2>{es ? "Galería" : "Gallery"}</h2>
          <ul>
            {/* By position: one photo can sit in the gallery twice. */}
            {images.map((img, i) => (
              <li key={`${i}-${img.src}`}>{t(img.alt, lang)}</li>
            ))}
          </ul>
        </section>
      )}

      {items.length > 0 && (
        <section id={`faq-${lang}`} aria-labelledby={`faq-heading-${lang}`}>
          <h2 id={`faq-heading-${lang}`}>{t(faq.heading, lang)}</h2>
          {items.map((it) => (
            <div key={t(it.q, lang)}>
              <h3>{t(it.q, lang)}</h3>
              {para(it.a)}
            </div>
          ))}
        </section>
      )}
    </article>
  );
}
