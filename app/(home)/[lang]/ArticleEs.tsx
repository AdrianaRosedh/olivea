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
            Restaurante de degustación con estrella MICHELIN, hospedaje y café
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
          Despierta dentro del huerto. Casa Olivea es un hospedaje integrado
          al huerto y conectado a Olivea Farm To Table — un restaurante con
          estrella MICHELIN — y Olivea Café. Catorce suites diseñadas por
          Ange Joy, cada una con terraza privada con vista al huerto, los
          olivos y el paisaje desértico de Baja California. El desayuno en
          el café está incluido.
        </p>
        <p>
          <Link href="/es/casa">Explorar Casa Olivea →</Link>
        </p>
      </section>

      {/* ── Farm To Table ── */}
      <section aria-label="Olivea Farm To Table">
        <h2>Olivea Farm To Table — Restaurante con Estrella MICHELIN</h2>
        <p>
          Un restaurante de menú de degustación arraigado al huerto.
          Galardonado con una Estrella MICHELIN y una Estrella Verde MICHELIN
          por sostenibilidad en 2025. El Chef Daniel Nates lidera una cocina
          que trabaja directamente con lo que el territorio ofrece — costa de
          Baja California, desierto y huerto — con técnica, mesura y memoria.
          Abierto para cena en noches selectas con reservación previa.
        </p>
        <p>
          <Link href="/es/farmtotable">Explorar Farm To Table →</Link>
        </p>
      </section>

      {/* ── Café ── */}
      <section aria-label="Olivea Café">
        <h2>Olivea Café — Café de Especialidad, Brunch y Pádel</h2>
        <p>
          Café de especialidad, pan de casa y desayunos junto al huerto.
          Abierto todos los días para servicio de mañana y tarde. El café
          también ofrece canchas de pádel, wine bar y cena casual. Un espacio
          tranquilo y sin prisa para pasar el día en Olivea.
        </p>
        <p>
          <Link href="/es/cafe">Explorar Olivea Café →</Link>
        </p>
      </section>

      {/* ── Ubicación ── */}
      <section aria-label="Ubicación" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
        <h2>Ubicación</h2>
        <p>
          <span itemProp="streetAddress">México 3 Km 92.5</span>,{" "}
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
          <li>Estrella MICHELIN y Estrella Verde (2025) — Olivea Farm To Table</li>
          <li>Casa Olivea en MICHELIN Guide Hotels &amp; Stays</li>
          <li>Premio México Gastronómico de Sustentabilidad 2026 — Culinaria Mexicana</li>
          <li>Wall Street Journal — Best Travel Destinations 2026</li>
          <li>MB100 — Marco Beteta (2025)</li>
        </ul>
      </section>
    </article>
  );
}
