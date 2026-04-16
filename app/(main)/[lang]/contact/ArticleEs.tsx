// app/(main)/[lang]/contact/ArticleEs.tsx
// Server component — semantic HTML for crawlers, AI assistants, and no-JS clients.

export default function ArticleEs() {
  return (
    <article
      aria-label="Contacto OLIVEA"
      className="ssr-article"
      lang="es"
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      <meta itemProp="name" content="OLIVEA" />
      <meta itemProp="url" content="https://oliveafarmtotable.com/es" />

      <header>
        <h1>Contacto — OLIVEA</h1>
        <p>
          <em>
            Olivea Farm To Table · Casa Olivea · Olivea Café — Valle de
            Guadalupe, Baja California.
          </em>
        </p>
      </header>

      {/* ── Dirección ── */}
      <section
        aria-label="Dirección"
        itemProp="address"
        itemScope
        itemType="https://schema.org/PostalAddress"
      >
        <h2>Dirección</h2>
        <p>
          <span itemProp="streetAddress">México 3 Km 92.5</span>,{" "}
          <span itemProp="postalCode">22766</span>{" "}
          <span itemProp="addressLocality">Villa de Juárez</span>,{" "}
          <span itemProp="addressRegion">Baja California</span>,{" "}
          <span itemProp="addressCountry">México</span>.
        </p>
        <p>
          <a
            href="https://maps.app.goo.gl/oySkL6k7G7t5VFus5"
            rel="noopener noreferrer"
          >
            Abrir en Google Maps →
          </a>
        </p>
      </section>

      {/* ── Contacto general ── */}
      <section aria-label="Contacto general">
        <h2>Contacto General</h2>
        <dl>
          <dt>Email</dt>
          <dd>
            <a href="mailto:hola@casaolivea.com" itemProp="email">
              hola@casaolivea.com
            </a>
          </dd>
          <dt>Teléfono</dt>
          <dd>
            <a href="tel:+5246463882369" itemProp="telephone">
              +52 (646) 388-2369
            </a>
          </dd>
        </dl>
      </section>

      {/* ── Farm To Table ── */}
      <section aria-label="Horario y teléfono de Olivea Farm To Table">
        <h2>Olivea Farm To Table</h2>
        <dl>
          <dt>Horario</dt>
          <dd>Mié 5–8 · Vie 2:30–8:30 · Dom 2–7</dd>
          <dt>Teléfono</dt>
          <dd>
            <a href="tel:+5246463836402">(646) 383-6402</a>
          </dd>
        </dl>
      </section>

      {/* ── Casa Olivea & Café ── */}
      <section aria-label="Horario y teléfono de Casa Olivea y Café">
        <h2>Casa Olivea &amp; Olivea Café</h2>
        <dl>
          <dt>Horario</dt>
          <dd>Mié–Lun 7:30–2:30 · Mar 7:30–9:30</dd>
          <dt>Teléfono</dt>
          <dd>
            <a href="tel:+5246463882369">(646) 388-2369</a>
          </dd>
        </dl>
      </section>

      {/* ── Eventos ── */}
      <section aria-label="Eventos especiales">
        <h2>Eventos Especiales</h2>
        <p>
          Para eventos especiales o coordinación de grupos, escríbenos a{" "}
          <a href="mailto:hola@casaolivea.com">hola@casaolivea.com</a> y te
          ayudamos a organizarlo.
        </p>
      </section>
    </article>
  );
}
