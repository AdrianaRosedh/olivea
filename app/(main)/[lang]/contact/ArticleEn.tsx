// app/(main)/[lang]/contact/ArticleEn.tsx
// Server component — semantic HTML for crawlers, AI assistants, and no-JS clients.

export default function ArticleEn() {
  return (
    <article
      aria-label="Contact OLIVEA"
      className="ssr-article"
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      <meta itemProp="name" content="OLIVEA" />
      <meta itemProp="url" content="https://oliveafarmtotable.com/en" />

      <header>
        <h1>Contact — OLIVEA</h1>
        <p>
          <em>
            Olivea Farm To Table · Casa Olivea · Olivea Café — Valle de
            Guadalupe, Baja California.
          </em>
        </p>
      </header>

      {/* ── Address ── */}
      <section
        aria-label="Address"
        itemProp="address"
        itemScope
        itemType="https://schema.org/PostalAddress"
      >
        <h2>Address</h2>
        <p>
          <span itemProp="streetAddress">México 3 Km 92.5</span>,{" "}
          <span itemProp="postalCode">22766</span>{" "}
          <span itemProp="addressLocality">Villa de Juárez</span>,{" "}
          <span itemProp="addressRegion">Baja California</span>,{" "}
          <span itemProp="addressCountry">Mexico</span>.
        </p>
        <p>
          <a
            href="https://maps.app.goo.gl/oySkL6k7G7t5VFus5"
            rel="noopener noreferrer"
          >
            Open in Google Maps →
          </a>
        </p>
      </section>

      {/* ── General contact ── */}
      <section aria-label="General contact">
        <h2>General Contact</h2>
        <dl>
          <dt>Email</dt>
          <dd>
            <a href="mailto:hola@casaolivea.com" itemProp="email">
              hola@casaolivea.com
            </a>
          </dd>
          <dt>Phone</dt>
          <dd>
            <a href="tel:+5246463882369" itemProp="telephone">
              +52 (646) 388-2369
            </a>
          </dd>
        </dl>
      </section>

      {/* ── Farm To Table ── */}
      <section aria-label="Olivea Farm To Table hours and phone">
        <h2>Olivea Farm To Table</h2>
        <dl>
          <dt>Hours</dt>
          <dd>Wed 5–8 · Fri 2:30–8:30 · Sun 2–7</dd>
          <dt>Phone</dt>
          <dd>
            <a href="tel:+5246463836402">(646) 383-6402</a>
          </dd>
        </dl>
      </section>

      {/* ── Casa Olivea & Café ── */}
      <section aria-label="Casa Olivea and Café hours and phone">
        <h2>Casa Olivea &amp; Olivea Café</h2>
        <dl>
          <dt>Hours</dt>
          <dd>Wed–Mon 7:30–2:30 · Tue 7:30–9:30</dd>
          <dt>Phone</dt>
          <dd>
            <a href="tel:+5246463882369">(646) 388-2369</a>
          </dd>
        </dl>
      </section>

      {/* ── Events ── */}
      <section aria-label="Special events">
        <h2>Special Events</h2>
        <p>
          For special events or group coordination, email us at{" "}
          <a href="mailto:hola@casaolivea.com">hola@casaolivea.com</a> and
          we&apos;ll help you plan it.
        </p>
      </section>
    </article>
  );
}
