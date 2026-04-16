// app/(main)/[lang]/menu/ArticleMenu.tsx
// Server component — semantic HTML for crawlers, AI assistants, and no-JS clients.
// The /menu page is a client-side redirect to /farmtotable#menu, so crawlers see nothing.
// This article provides the essential menu context.

import Link from "next/link";
import type { Lang } from "@/lib/i18n";

export default function ArticleMenu({ lang }: { lang: Lang }) {
  const isEs = lang === "es";

  return (
    <article
      aria-label={isEs ? "Menú OLIVEA" : "OLIVEA Menu"}
      className="ssr-article"
      lang={isEs ? "es" : undefined}
      itemScope
      itemType="https://schema.org/Menu"
    >
      <meta itemProp="name" content={isEs ? "Menú OLIVEA" : "OLIVEA Menu"} />

      <header>
        <h1>
          {isEs
            ? "Menú — OLIVEA en Valle de Guadalupe"
            : "Menu — OLIVEA in Valle de Guadalupe"}
        </h1>
        <p>
          <em>
            {isEs
              ? "Menú de temporada de Olivea Farm To Table y Olivea Café — cocina arraigada al huerto en Valle de Guadalupe, Baja California."
              : "Seasonal menu for Olivea Farm To Table and Olivea Café — garden-rooted cuisine in Valle de Guadalupe, Baja California."}
          </em>
        </p>
      </header>

      {/* ── Farm To Table ── */}
      <section aria-label="Olivea Farm To Table">
        <h2>Olivea Farm To Table</h2>
        <p>
          {isEs
            ? "Menú de degustación de temporada. Cocina guiada por el huerto y el territorio de Baja California — costa, desierto y jardín. Restaurante con Estrella MICHELIN y Estrella Verde. Abierto para cena con reservación previa."
            : "Seasonal tasting menu. Cuisine guided by the garden and the territory of Baja California — coast, desert, and garden. MICHELIN Star and Green Star restaurant. Open for dinner with advance reservation."}
        </p>
        <dl>
          <dt>{isEs ? "Horario" : "Hours"}</dt>
          <dd>{isEs ? "Mié 5–8 · Vie 2:30–8:30 · Dom 2–7" : "Wed 5–8 · Fri 2:30–8:30 · Sun 2–7"}</dd>
          <dt>{isEs ? "Teléfono" : "Phone"}</dt>
          <dd><a href="tel:+5246463836402">(646) 383-6402</a></dd>
        </dl>
        <p>
          <Link href={`/${lang}/farmtotable`}>
            {isEs ? "Ver menú completo de Farm To Table →" : "View full Farm To Table menu →"}
          </Link>
        </p>
      </section>

      {/* ── Café ── */}
      <section aria-label="Olivea Café">
        <h2>Olivea Café</h2>
        <p>
          {isEs
            ? "Café de especialidad, pan de casa, desayunos y brunch junto al huerto. También ofrece servicio de tarde con wine bar y cena casual."
            : "Specialty coffee, house bread, breakfast, and brunch next to the garden. Also offers afternoon service with wine bar and casual dinner."}
        </p>
        <dl>
          <dt>{isEs ? "Horario" : "Hours"}</dt>
          <dd>{isEs ? "Mié–Lun 7:30–2:30 · Mar 7:30–9:30" : "Wed–Mon 7:30–2:30 · Tue 7:30–9:30"}</dd>
          <dt>{isEs ? "Teléfono" : "Phone"}</dt>
          <dd><a href="tel:+5246463882369">(646) 388-2369</a></dd>
        </dl>
        <p>
          <Link href={`/${lang}/cafe`}>
            {isEs ? "Ver menú completo del Café →" : "View full Café menu →"}
          </Link>
        </p>
      </section>

      {/* ── Location ── */}
      <section aria-label={isEs ? "Ubicación" : "Location"}>
        <h2>{isEs ? "Ubicación" : "Location"}</h2>
        <p>
          México 3 Km 92.5, 22766 Villa de Juárez, Baja California, {isEs ? "México" : "Mexico"}.
        </p>
      </section>
    </article>
  );
}
