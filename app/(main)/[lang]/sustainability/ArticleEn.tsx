// app/(main)/[lang]/sustainability/ArticleEn.tsx
// Server component — semantic HTML for crawlers, AI assistants, and no-JS clients.

import Image from "next/image";

export default function ArticleEn() {
  return (
    <article
      aria-label="OLIVEA Philosophy"
      className="ssr-article"
      itemScope
      itemType="https://schema.org/Article"
    >
      <meta itemProp="author" content="OLIVEA" />
      <meta itemProp="publisher" content="OLIVEA" />

      <header>
        <h1 itemProp="headline">Philosophy — OLIVEA</h1>
        <p>
          <em>
            Origin, identity, efficiency, innovation, gastronomy, and community
            — from garden to table.
          </em>
        </p>
        <Image
          src="/images/sustainability/hero.jpg"
          alt="The OLIVEA garden in Valle de Guadalupe — olive trees, raised beds, and the surrounding Baja California desert landscape."
          width={1200}
          height={630}
          className="ssr-article-hero"
          priority={false}
        />
      </header>

      {/* ── 1. Origins ── */}
      <section aria-label="Origins">
        <h2>Origins</h2>
        <p>
          Olivea opened in late summer 2023. It was initially conceived as a
          simple, calm retreat — low marketing, easy to operate. But the
          project evolved and asked for more intention. What emerged was not
          just a property but a living system with distributed responsibility.
        </p>
        <p>
          Ange Joy, founder and designer, shaped the physical space and
          atmosphere — design as a conscious reading of place. Cristina, a
          psychologist leading HR, built the internal culture, treating it as
          true infrastructure. Adriana Rose, CEO with a background in computer
          science and an MBA, brought alignment and systematic thinking:
          urgency that organizes rather than pressures.
        </p>
        <p>
          Together, they established a foundation where design decisions are
          grounded in operational reality, culture is infrastructure, and
          clarity comes before expansion.
        </p>
      </section>

      {/* ── 2. Vision ── */}
      <section aria-label="Vision">
        <h2>Vision &amp; Identity</h2>
        <p>
          Olivea is an ecosystem — not a hotel, a restaurant, and a café
          that happen to share a property. One unified philosophy connects
          every expression: Farm To Table, Café, and Casa Olivea.
        </p>
        <p>
          The central symbol is an alebrije — a Mexican mythical hybrid
          creature — specifically an insect with an olive body, olive-leaf
          wings, and a radish head. It represents garden, growth, and
          nourishment. The same alebrije appears across all three properties
          in different positions, emphasizing coherence over uniformity.
        </p>
      </section>

      {/* ── 3. Sustainability ── */}
      <section aria-label="Sustainability">
        <h2>Sustainability</h2>
        <p>
          In Valle de Guadalupe — where water is finite and electricity
          unreliable — sustainability is not ideology; it is efficiency and
          respect practiced daily. It is infrastructure.
        </p>
        <ul>
          <li>Solar energy ensures operational continuity.</li>
          <li>Grey water is reused for irrigation.</li>
          <li>
            Vegetables are washed under running water that is then collected
            and directed to irrigate specific areas of the garden.
          </li>
          <li>
            Centerpiece plants on dining tables serve as living nurseries —
            they return to the garden when their time at the table ends.
          </li>
          <li>Connected kitchens share resources across properties.</li>
          <li>
            A continuous cycle: garden → Farm To Table → Café → fermentation →
            compost → back to garden.
          </li>
        </ul>
        <p>
          The pursuit is zero waste — not claimed as perfected, but
          constantly measured and adapted.
        </p>
      </section>

      {/* ── 4. Technology ── */}
      <section aria-label="Technology">
        <h2>Technology &amp; Innovation</h2>
        <p>
          Technology at Olivea is intentionally quiet and invisible. It
          exists to bring clarity, consistency, and improvement — not
          spectacle. It lives in scheduling, energy monitoring, knowledge
          systems, and feedback loops that reduce friction and increase
          focus.
        </p>
        <p>
          Innovation is not about novelty; it is about asking better
          questions. How can teams work more intelligently? How can systems
          support people rather than replace them? How can hospitality
          become calmer, clearer, and more human?
        </p>
      </section>

      {/* ── 5. Gastronomy ── */}
      <section aria-label="Gastronomy">
        <h2>Gastronomy</h2>
        <p>
          The garden is the essence but not the only voice. Cooking at
          Olivea emphasizes origin and restraint — using what the territory
          of Valle de Guadalupe, Baja California gives, without forcing.
        </p>
        <p>
          Olivea functions as a complete gastronomic ecosystem: guests stay
          where food is grown and eat there morning and night. Chef Daniel
          Nates embodies the philosophy — curious, disciplined, precise —
          understanding origin and restraint. Every dish carries a season,
          a decision, and a place: garden and coast, technique and memory,
          Baja and Mexico.
        </p>
        <p>
          Gastronomy becomes a dialogue between garden, sea, kitchen, and
          guest.
        </p>
      </section>

      {/* ── 6. Community ── */}
      <section aria-label="Community">
        <h2>Community</h2>
        <p>
          Team members at Olivea become <em>Colibríes</em> (hummingbirds) —
          representing precision, generosity, and purposeful movement.
          Culture is treated as a living system that requires daily
          attention and care.
        </p>
        <p>
          The approach emphasizes healthy work rhythms, conscious
          nourishment, real rest, and emotional well-being as part of the
          system — not benefits adjacent to it. Community is reciprocity:
          &ldquo;You take care of me. I take care of you. And together, we
          take care of the place we share.&rdquo;
        </p>
        <p>
          Hospitality is choreography — each movement intentional, each
          role connected to the whole.
        </p>
      </section>
    </article>
  );
}
