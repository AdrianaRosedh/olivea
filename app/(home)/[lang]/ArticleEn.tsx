// app/(home)/[lang]/ArticleEn.tsx
// Server component — semantic HTML for crawlers, AI assistants, and no-JS clients.

import Image from "next/image";
import Link from "next/link";

export default function ArticleEn() {
  return (
    <article
      aria-label="OLIVEA — Farm Hospitality"
      className="ssr-article"
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      <meta itemProp="name" content="OLIVEA" />
      <meta itemProp="url" content="https://oliveafarmtotable.com/en" />

      <header>
        <h1 itemProp="description">
          OLIVEA — Farm Hospitality in Valle de Guadalupe, Baja California
        </h1>
        <p>
          <em>
            MICHELIN-starred tasting restaurant, farm stay, and café born from
            a working garden. Where the garden is the essence.
          </em>
        </p>
        <Image
          src="/images/seo/cover.jpg"
          alt="Aerial view of the OLIVEA property in Valle de Guadalupe — working garden, restaurant, farm stay, and café surrounded by Baja California landscape."
          width={1200}
          height={630}
          className="ssr-article-hero"
          priority={false}
        />
      </header>

      {/* ── Casa Olivea ── */}
      <section aria-label="Casa Olivea">
        <h2>Casa Olivea — Farm Stay</h2>
        <p>
          Wake up inside the garden. Casa Olivea is a farm stay integrated
          with the working garden and connected to Olivea Farm To Table — a
          MICHELIN-starred restaurant — and Olivea Café. Fourteen suites
          designed by Ange Joy, each with a private terrace overlooking the
          garden, olive trees, and the surrounding Baja California desert
          landscape. Breakfast at the café is included.
        </p>
        <p>
          <Link href="/en/casa">Explore Casa Olivea →</Link>
        </p>
      </section>

      {/* ── Farm To Table ── */}
      <section aria-label="Olivea Farm To Table">
        <h2>Olivea Farm To Table — MICHELIN-Starred Restaurant</h2>
        <p>
          A tasting-menu restaurant rooted in the garden. Awarded a MICHELIN
          Star and a MICHELIN Green Star for sustainability in 2025. Chef
          Daniel Nates leads a kitchen that works directly with what the
          territory gives — Baja California coast, desert, and garden — using
          technique, restraint, and memory. Open for dinner on select evenings
          with advance reservation.
        </p>
        <p>
          <Link href="/en/farmtotable">Explore Farm To Table →</Link>
        </p>
      </section>

      {/* ── Café ── */}
      <section aria-label="Olivea Café">
        <h2>Olivea Café — Specialty Coffee, Brunch &amp; Pádel</h2>
        <p>
          Specialty coffee, house bread, and breakfast next to the garden.
          Open daily for morning and afternoon service. The café also offers
          pádel courts, wine bar, and casual dinner service. A calm, unhurried
          space to spend the day at Olivea.
        </p>
        <p>
          <Link href="/en/cafe">Explore Olivea Café →</Link>
        </p>
      </section>

      {/* ── Location ── */}
      <section aria-label="Location" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
        <h2>Location</h2>
        <p>
          <span itemProp="streetAddress">México 3 Km 92.5</span>,{" "}
          <span itemProp="postalCode">22766</span>{" "}
          <span itemProp="addressLocality">Villa de Juárez</span>,{" "}
          <span itemProp="addressRegion">Baja California</span>,{" "}
          <span itemProp="addressCountry">Mexico</span>.
        </p>
        <p>
          Valle de Guadalupe — Baja California&apos;s wine country, 30 minutes
          from Ensenada and 90 minutes from the US border at Tijuana/San Diego.
        </p>
      </section>

      {/* ── Awards ── */}
      <section aria-label="Awards">
        <h2>Awards &amp; Recognition</h2>
        <ul>
          <li>MICHELIN Star &amp; Green Star (2025) — Olivea Farm To Table</li>
          <li>Casa Olivea listed in MICHELIN Guide Hotels &amp; Stays</li>
          <li>México Gastronómico Sustainability Award 2026 — Culinaria Mexicana</li>
          <li>Wall Street Journal — Best Travel Destinations 2026</li>
          <li>MB100 — Marco Beteta (2025)</li>
        </ul>
      </section>
    </article>
  );
}
