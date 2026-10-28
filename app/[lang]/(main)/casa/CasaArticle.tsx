// app/[lang]/(main)/casa/CasaArticle.tsx
// Server-rendered semantic article for crawlers, AI assistants, screen readers
// and no-JS clients, in either language. Hidden via CSS once JS hydrates.
//
// It renders the same CMS sections as the page, so what search engines and AI
// assistants read is always what guests see. The hand-written ArticleEn /
// ArticleEs it replaced had drifted from the page (a "continental" breakfast,
// suites "opening to the huerto") and kept saying so after the page was fixed.

import Image from "next/image";
import { md, t } from "./sections/md";
import type { Lang, SectionData } from "./sections/types";

type Bi = { en: string; es: string };

function find(sections: SectionData[], id: string): SectionData {
  return sections.find((s) => s.id === id) ?? {};
}

export default function CasaArticle({ lang, sections }: { lang: Lang; sections: SectionData[] }) {
  const es = lang === "es";
  const hero = find(sections, "hero");
  const rooms = find(sections, "rooms");
  const design = find(sections, "design");
  const courtyard = find(sections, "courtyard");
  const mornings = find(sections, "mornings");
  const services = find(sections, "services");
  const practical = find(sections, "practical");
  const gallery = find(sections, "gallery");
  const faq = find(sections, "faq");

  const list = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
  const stats = list<{ label: Bi; value: Bi }>(rooms.stats);
  const columns = list<{ id: string; subHeading: Bi; body: Bi; note?: Bi }>(mornings.columns);
  const serviceCards = list<{ id: string; title: Bi; text: Bi }>(services.cards);
  const practicalCards = list<{ id: string; title: Bi; body: Bi }>(practical.cards);
  const images = [
    ...list<{ alt: Bi; src: string }>(gallery.topImages),
    ...list<{ alt: Bi; src: string }>(gallery.bottomImages),
  ];
  const items = list<{ q: Bi; a: Bi }>(faq.items);
  const para = (b: Bi | undefined, key?: string | number) =>
    b && t(b, lang) ? <p key={key}>{md(t(b, lang))}</p> : null;

  return (
    <article
      aria-label="Casa Olivea"
      className="ssr-article"
      lang={es ? "es" : "en"}
      itemScope
      itemType="https://schema.org/Hotel"
    >
      <meta itemProp="name" content="Casa Olivea" />

      <header>
        <h1>{t(hero.heading, lang) || "Casa Olivea"}</h1>
        {hero.slogan && <p><em>{t(hero.slogan, lang)}</em></p>}
        <Image
          src={hero.image?.src ?? "/images/casa/hero.jpg"}
          alt={t(hero.image?.alt, lang) || "Casa Olivea"}
          width={1200}
          height={630}
          priority
          className="ssr-article-hero"
        />
      </header>

      <section id={`rooms-${lang}`} aria-labelledby={`rooms-heading-${lang}`}>
        <h2 id={`rooms-heading-${lang}`}>{t(rooms.heading, lang)}</h2>
        {para(rooms.subtitle)}
        {list<Bi>(rooms.paragraphs).map((p, i) => para(p, i))}
        {para(rooms.lightParagraph)}
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
      </section>

      <section id={`design-${lang}`} aria-labelledby={`design-heading-${lang}`}>
        <h2 id={`design-heading-${lang}`}>{t(design.heading, lang)}</h2>
        {design.attribution && <p><em>{t(design.attribution, lang)}</em></p>}
        {list<Bi>(design.paragraphs).map((p, i) => para(p, i))}
      </section>

      <section id={`courtyard-${lang}`} aria-labelledby={`courtyard-heading-${lang}`}>
        <h2 id={`courtyard-heading-${lang}`}>{t(courtyard.heading, lang)}</h2>
        {list<Bi>(courtyard.paragraphs).map((p, i) => para(p, i))}
      </section>

      <section id={`mornings-${lang}`} aria-labelledby={`mornings-heading-${lang}`}>
        <h2 id={`mornings-heading-${lang}`}>{t(mornings.heading, lang)}</h2>
        {columns.map((c) => (
          <div key={c.id}>
            <h3>{t(c.subHeading, lang)}</h3>
            {para(c.body)}
            {para(c.note)}
          </div>
        ))}
      </section>

      <section id={`services-${lang}`} aria-labelledby={`services-heading-${lang}`}>
        <h2 id={`services-heading-${lang}`}>{t(services.heading, lang)}</h2>
        {serviceCards.map((c) => (
          <div key={c.id}>
            <h3>{t(c.title, lang)}</h3>
            {para(c.text)}
          </div>
        ))}
      </section>

      <section id={`practical-${lang}`} aria-labelledby={`practical-heading-${lang}`}>
        <h2 id={`practical-heading-${lang}`}>{t(practical.heading, lang)}</h2>
        {practicalCards.map((c) => (
          <div key={c.id}>
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
