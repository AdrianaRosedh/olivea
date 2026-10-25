// app/[lang]/(main)/cafe/CafeArticle.tsx
// Server-rendered semantic article for crawlers, AI assistants, screen readers
// and no-JS clients, in either language.
//
// It renders the same CMS sections as the page, so what search engines and AI
// assistants read is always what guests see. The two hand-written articles it
// replaced (ArticleEn / ArticleEs) had drifted: old hours, a pádel section,
// "Bread as Ritual" after the bakery copy changed, half the FAQ.

import Image from "next/image";
import { md, t } from "./sections/md";
import type { Lang, SectionData } from "./sections/types";

type Bi = { en: string; es: string };

function find(sections: SectionData[], id: string): SectionData {
  return sections.find((s) => s.id === id) ?? {};
}

export default function CafeArticle({ lang, sections }: { lang: Lang; sections: SectionData[] }) {
  const es = lang === "es";
  const hero = find(sections, "hero");
  const exp = find(sections, "experience");
  const breakfast = find(sections, "breakfast");
  const bread = find(sections, "bread");
  const menu = find(sections, "menu");
  const faq = find(sections, "faq");

  const stats = (exp.stats ?? []) as Array<{ label: Bi; value: Bi }>;
  const coffee = (exp.coffee ?? []) as Bi[];
  const paragraphs = (s: SectionData) => (s.paragraphs ?? []) as Bi[];
  const infoCards = (menu.infoCards ?? []) as Array<{ label: Bi; text: Bi }>;
  const items = (faq.items ?? []) as Array<{ q: Bi; a: Bi }>;

  return (
    <article
      aria-label="Olivea Café Wine Bar"
      className="ssr-article"
      lang={es ? "es" : "en"}
      itemScope
      itemType="https://schema.org/CafeOrCoffeeShop"
    >
      <meta itemProp="name" content="Olivea Café Wine Bar" />
      <meta
        itemProp="servesCuisine"
        content={
          es
            ? "Café de especialidad, Panadería de casa, Desayuno, Brunch, Vino"
            : "Specialty coffee, House bakery, Breakfast, Brunch, Wine"
        }
      />

      <header>
        <h1>Olivea Café Wine Bar</h1>
        {hero.slogan && <p><em>{t(hero.slogan, lang)}</em></p>}
        <Image
          src={hero.image?.src ?? "/images/cafe/hero.jpg"}
          alt={t(hero.image?.alt, lang) || "Olivea Café Wine Bar"}
          width={1200}
          height={630}
          priority
          className="ssr-article-hero"
        />
      </header>

      <section id={`experience-${lang}`} aria-labelledby={`exp-heading-${lang}`}>
        <h2 id={`exp-heading-${lang}`}>{t(exp.heading, lang)}</h2>
        {exp.subtitle && <p>{t(exp.subtitle, lang)}</p>}
        {exp.origin && <p>{md(t(exp.origin, lang))}</p>}
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
        {coffee.map((p, i) => <p key={i}>{md(t(p, lang))}</p>)}
        {exp.fieldNote && <aside><p>{t(exp.fieldNote, lang)}</p></aside>}
        {exp.bar && <p>{md(t(exp.bar, lang))}</p>}
      </section>

      <section id={`breakfast-${lang}`} aria-labelledby={`breakfast-heading-${lang}`}>
        <h2 id={`breakfast-heading-${lang}`}>{t(breakfast.heading, lang)}</h2>
        {paragraphs(breakfast).map((p, i) => <p key={i}>{md(t(p, lang))}</p>)}
      </section>

      <section id={`bread-${lang}`} aria-labelledby={`bread-heading-${lang}`}>
        <h2 id={`bread-heading-${lang}`}>{t(bread.heading, lang)}</h2>
        {paragraphs(bread).map((p, i) => <p key={i}>{md(t(p, lang))}</p>)}
      </section>

      <section id={`menu-info-${lang}`} aria-labelledby={`menu-heading-${lang}`}>
        <h2 id={`menu-heading-${lang}`}>{t(menu.heading, lang)}</h2>
        {menu.description && <p>{md(t(menu.description, lang))}</p>}
        {infoCards.map((c) => (
          <div key={t(c.label, lang)}>
            <h3>{t(c.label, lang)}</h3>
            <p>{md(t(c.text, lang))}</p>
          </div>
        ))}
      </section>

      {items.length > 0 && (
        <section id={`faq-${lang}`} aria-labelledby={`faq-heading-${lang}`}>
          <h2 id={`faq-heading-${lang}`}>{t(faq.heading, lang)}</h2>
          {items.map((it) => (
            <div key={t(it.q, lang)}>
              <h3>{t(it.q, lang)}</h3>
              <p>{md(t(it.a, lang))}</p>
            </div>
          ))}
        </section>
      )}
    </article>
  );
}
