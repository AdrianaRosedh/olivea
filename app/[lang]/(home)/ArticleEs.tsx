// app/(home)/[lang]/ArticleEs.tsx
// Server component — semantic HTML for crawlers, AI assistants, and no-JS clients.

import Image from "next/image";
import Link from "next/link";

export default function ArticleEs() {
  return (
    <article
      aria-label="OLIVEA — Hospitalidad del Huerto"
      className="ssr-article"
      lang="es"
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      <meta itemProp="name" content="OLIVEA" />
      <meta itemProp="url" content="https://oliveafarmtotable.com/es" />

      <header>
        <h1 itemProp="description">
          OLIVEA — Hospitalidad del Huerto en Valle de Guadalupe, Baja California
        </h1>
        <p>
          <em>
            Restaurante de menú holístico con estrella MICHELIN, hospedaje y café
            nacidos del huerto. Donde el huerto es la esencia.
          </em>
        </p>
        <Image
          src="/images/seo/cover.jpg"
          alt="Vista aérea de la propiedad OLIVEA en Valle de Guadalupe — huerto, restaurante, hospedaje y café rodeados del paisaje de Baja California."
          width={1200}
          height={630}
          className="ssr-article-hero"
          priority={false}
        />
      </header>

      {/* ── Casa Olivea ── */}
      <section aria-label="Casa Olivea">
        <h2>Casa Olivea — Hospedaje del Huerto</h2>
        <p>
          Despierta junto al huerto. Casa Olivea es un hospedaje integrado
          al huerto y conectado a Olivea Farm To Table — un restaurante con
          estrella MICHELIN — y Olivea Café Wine Bar. Catorce suites diseñadas por
          Ange Joy, cada una con terraza privada con vista al huerto, los
          olivos y el paisaje desértico de Baja California. El desayuno está
          disponible en el café (no incluido).
        </p>
        <p>
          <Link href="/es/casa">Explorar Casa Olivea →</Link>
        </p>
      </section>

      {/* ── Farm To Table ── */}
      <section aria-label="Olivea Farm To Table">
        <h2>Olivea Farm To Table — Restaurante con Estrella MICHELIN</h2>
        <p>
          Un restaurante de menú holístico de degustación arraigado al huerto.
          Galardonado con una Estrella MICHELIN y una Estrella Verde MICHELIN
          por sostenibilidad en 2025, ambas refrendadas en la selección 2026.
          El Chef Daniel Nates lidera una cocina
          que trabaja directamente con lo que el territorio ofrece — costa de
          Baja California, desierto y huerto — con técnica, mesura y memoria.
          Cultivamos nuestros propios hongos y trabajamos koji y fermentaciones
          propias en nuestro propio laboratorio. Abierto para cena en noches
          selectas con reservación previa.
        </p>
        <p>
          <Link href="/es/farmtotable">Explorar Farm To Table →</Link>
        </p>
      </section>

      {/* ── Café ── */}
      <section aria-label="Olivea Café Wine Bar">
        <h2>Olivea Café Wine Bar — Café de Especialidad, Panadería, Brunch y Vino del Valle de Guadalupe</h2>
        <p>
          Café de especialidad, croissants, conchas y panes de temporada de
          nuestra propia panadería, y desayuno y brunch. Cuando la tarde baja,
          el café se vuelve wine bar, con Valle de Guadalupe y Baja California
          por copa y tapas del huerto. Los sofás del lounge miran al huerto, y
          puedes recorrerlo. De entrada libre, todos los días.
        </p>
        <p>
          <Link href="/es/cafe">Explorar Olivea Café Wine Bar →</Link>
        </p>
      </section>

      {/* ── Ubicación ── */}
      <section aria-label="Ubicación" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
        <h2>Ubicación</h2>
        <p>
          <span itemProp="streetAddress">Carretera Ensenada-Tecate Km 92.5</span>,{" "}
          <span itemProp="postalCode">22766</span>{" "}
          <span itemProp="addressLocality">Villa de Juárez</span>,{" "}
          <span itemProp="addressRegion">Baja California</span>,{" "}
          <span itemProp="addressCountry">México</span>.
        </p>
        <p>
          Valle de Guadalupe — la región vinícola de Baja California, a 30
          minutos de Ensenada y 90 minutos de la frontera con Estados Unidos
          en Tijuana/San Diego.
        </p>
      </section>

      {/* ── Reconocimientos ── */}
      <section aria-label="Reconocimientos">
        <h2>Reconocimientos y Premios</h2>
        <ul>
          <li>Estrella MICHELIN y Estrella Verde (2025, 2026) — Olivea Farm To Table</li>
          <li>Casa Olivea en MICHELIN Guide Hotels &amp; Stays</li>
          <li>Premio México Gastronómico de Sustentabilidad 2026 — Culinaria Mexicana</li>
          <li>Wall Street Journal — Best Travel Destinations 2026</li>
          <li>MB100 — Marco Beteta (2025)</li>
        </ul>
      </section>
    </article>
  );
}
