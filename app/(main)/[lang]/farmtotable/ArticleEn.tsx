// app/(main)/[lang]/farmtotable/ArticleEn.tsx
// Server-rendered semantic article for crawlers, AI assistants, and no-JS clients.
// The client-rendered ContentEn provides the visual experience with animations.
// This component is hidden via CSS once JS hydrates.

import Image from "next/image";

export default function ArticleEn() {
  return (
    <article
      aria-label="Olivea Farm To Table"
      className="ssr-article"
      itemScope
      itemType="https://schema.org/Restaurant"
    >
      <meta itemProp="name" content="Olivea Farm To Table" />
      <meta itemProp="servesCuisine" content="Tasting Menu, Farm To Table, Baja Mediterranean" />

      {/* ── Hero ── */}
      <header>
        <h1>Olivea Farm To Table</h1>
        <p>
          <em>Where The Garden Is The Essence</em>
        </p>
        <Image
          src="/images/farm/hero.jpg"
          alt="Olivea Farm To Table — MICHELIN-starred tasting-menu restaurant in Valle de Guadalupe"
          width={1200}
          height={630}
          priority
          className="ssr-article-hero"
        />
      </header>

      {/* ── Experience ── */}
      <section id="experience" aria-labelledby="experience-heading">
        <h2 id="experience-heading">A Garden-Driven Culinary Journey</h2>
        <p>
          A single tasting menu, composed in seasons — guided by soil, climate,
          and time.
        </p>
        <p>
          Olivea Farm To Table is a <strong>tasting menu</strong> shaped by the
          garden. The kitchen reads climate and soil; the table translates that
          landscape into memory through time, technique, and restraint.
        </p>

        <dl>
          <dt>Format</dt>
          <dd>Tasting menu · 9 courses</dd>
          <dt>Season</dt>
          <dd>Changes every 5–6 weeks · garden-led</dd>
          <dt>Origin</dt>
          <dd>Private garden · Valle de Guadalupe</dd>
          <dt>Duration</dt>
          <dd>~3 hours · designed to unfold slowly</dd>
        </dl>

        <p>
          The Valley offers land, sea, and farm in constant dialogue. We work
          toward balance — acidity and richness, bitterness and sweetness,
          temperature and texture — guided by what the garden and nearby
          producers offer at their natural peak.
        </p>

        <aside>
          <p>
            The garden is a working system with a full return loop: harvest →
            kitchen → compost → soil → harvest. With <strong>prior notice</strong>,
            we adapt thoughtfully for important allergies or dietary restrictions
            while preserving the essence of the journey.
          </p>
        </aside>

        <p>
          Traceability, water stewardship, and circular thinking guide our
          decisions. Sustainability is practiced as daily discipline — measured,
          specific, and grounded in the realities of the land. The experience
          unfolds slowly, designed for adults who can dedicate{" "}
          <strong>~3 hours</strong> to the table.
        </p>
      </section>

      {/* ── Kitchen ── */}
      <section id="kitchen" aria-labelledby="kitchen-heading">
        <h2 id="kitchen-heading">Technique in Service of Origin</h2>
        <p>
          The product leads. The kitchen is rooted in the garden and nearby
          producers — clean layers, precise heat, and methods that respect each
          ingredient at its natural point.
        </p>
        <p>
          <strong>Led by Executive Chef Daniel Nates,</strong> the kitchen works
          in close dialogue with the territory — reading soil, climate, and
          season as the starting point for every dish.
        </p>
        <p>
          We work with a single seasonal tasting menu. Creativity lives inside
          the season: what is abundant, what is delicate, and what is ready to
          be carried forward.
        </p>
        <p>
          Technique exists to clarify flavor and preserve balance. Stocks,
          reductions, and careful seasoning build depth without masking origin.
          Fermentation extends the season — allowing continuity with elegance
          and restraint.
        </p>
        <p>
          The team cooks by reading climate, garden, and service as one system —
          understanding what is at its peak, what is being preserved, and what
          is evolving quietly in the pantry.
        </p>
      </section>

      {/* ── Table / Hospitality ── */}
      <section id="table" aria-labelledby="table-heading">
        <h2 id="table-heading">Hospitality as Calibration</h2>
        <p>
          We host friends. Service is present, discreet, and calibrated to the
          rhythm of each table.
        </p>
        <p>
          Timing and temperature are guided with care so each dish arrives at
          its ideal moment — composed, clear, and alive.
        </p>
        <p>
          Each course carries context: its origin, the hands that care for it,
          and the reasoning behind each pairing. The narrative remains honest
          and precise.
        </p>
        <p>
          We offer a <strong>garden-view terrace</strong> and warm interior
          spaces. Tables are assigned according to your preferences and service
          flow. We welcome dogs in designated terrace areas and can coordinate{" "}
          <strong>celebrations or special events</strong> with advance planning.
        </p>
      </section>

      {/* ── Ecosystem / Pantry ── */}
      <section id="pantry" aria-labelledby="pantry-heading">
        <h2 id="pantry-heading">The Olivea Ecosystem</h2>
        <p>A garden is the essence. But with a garden, what do you create?</p>
        <p>
          Food. And with food, good company. And with good company, experience.
        </p>
        <p>
          At Olivea, the garden is the origin — but it is not the only voice.
          Sustainability here is also restraint: cooking with what the territory
          gives, without forcing it.
        </p>

        <h3>Territory</h3>
        <p>
          We cook from place: Valle de Guadalupe, Baja California, Mexico. Soil
          and salt. Desert light, coastal wind, and a season that can change
          overnight.
        </p>

        <h3>One Kitchen System</h3>
        <p>
          Our kitchens are deeply connected. What one cannot use, the other
          often can — allowing ingredients, preparations, and ideas to find
          their right context.
        </p>

        <h3>The Continuous Cycle</h3>
        <p>
          The cycle is continuous: garden → Olivea Farm To Table → Olivea Café →
          fermentation → compost → back to the garden. Nothing stands alone;
          everything returns.
        </p>

        <h3>Fermentation as Time Intelligence</h3>
        <p>
          Fermentation extends the season without replacing it. It preserves
          peak moments, builds depth through living processes, and allows memory
          to remain active within the menu.
        </p>

        <h3>Comité de Investigación</h3>
        <p>
          Each season is studied. We document, test, refine, and decide —
          aligning garden reality, kitchen technique, and the rhythm of service
          into a precise, repeatable standard.
        </p>

        <h3>Shared Standard</h3>
        <p>
          This vision is deeply shared with Chef Daniel Nates — curious,
          disciplined, and exact. With him, gastronomy becomes dialogue: garden
          and coast, technique and memory, Baja and Mexico, translated with
          care.
        </p>

        <h3>Storytelling as Craft</h3>
        <p>
          Ingredients matter here. Storytelling matters. Every dish carries a
          season, a decision, and a place — communicated with honesty, without
          performance.
        </p>
      </section>

      {/* ── Menu ── */}
      <section id="menu-info" aria-labelledby="menu-heading">
        <h2 id="menu-heading">The Menu</h2>
        <p>
          A seasonal <strong>9-course tasting menu</strong>, composed as a
          single journey. The menu shifts with{" "}
          <strong>the garden</strong>, guided by what the garden and the season
          offer at their peak.
        </p>

        <h3>Pairings &amp; Corkage</h3>
        <p>
          A wine journey through the Valley and a <em>non-alcoholic pairing</em>.
          Corkage: <strong>$350 MXN per bottle</strong>.
        </p>

        <h3>Preferences &amp; Allergies</h3>
        <p>
          With advance notice, we adapt thoughtfully. Vegetarian available upon
          request.
        </p>

        <h3>The Garden at the Center</h3>
        <p>
          Seasonal produce; precise technique. The experience lasts{" "}
          <strong>~3 hours</strong>.
        </p>
      </section>

      {/* ── Gallery alt text ── */}
      <section id="gallery-info" aria-label="Gallery">
        <h2>Gallery</h2>
        <ul>
          <li>Duck from Valle</li>
          <li>Olivea Signature Plate</li>
          <li>Lobster from our Baja</li>
          <li>Choro Mussel with Vegetable Chorizo</li>
          <li>A curry paste made with our vegetables</li>
          <li>Amuse-bouche</li>
        </ul>
      </section>

      {/* ── FAQ (mirrors the JSON-LD already in page.tsx) ── */}
      <section id="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Before You Reserve</h2>

        <h3>What kind of experience is Olivea Farm To Table?</h3>
        <p>
          Olivea Farm To Table is a <strong>seasonal tasting menu</strong>{" "}
          shaped by our garden and nearby producers. The experience is designed
          as a complete journey — paced, immersive, and guided by the season.
        </p>

        <h3>How long should we plan for dinner?</h3>
        <p>
          Most guests enjoy the full experience in <strong>~3 hours</strong>. We
          pace each table with care so the menu arrives at its ideal rhythm.
        </p>

        <h3>Do you offer à la carte dishes?</h3>
        <p>
          The menu is served as a <strong>single tasting journey</strong>. This
          structure allows the kitchen to cook with precision and continuity
          across the season.
        </p>

        <h3>Can you accommodate allergies or dietary restrictions?</h3>
        <p>
          Yes — when shared with{" "}
          <strong>advance notice at the time of booking</strong>, we adapt
          thoughtfully for important allergies or dietary restrictions while
          preserving the intent of the menu. A{" "}
          <strong>vegetarian version</strong> may be available upon request,
          depending on the season.
        </p>

        <h3>Is Olivea Farm To Table designed for children?</h3>
        <p>
          The experience is designed primarily for <strong>adults</strong> who
          wish to dedicate time to the journey. If you're planning a family
          visit, we're happy to help you choose the Olivea experience that fits
          best.
        </p>

        <h3>Do you welcome pets?</h3>
        <p>
          We welcome dogs in <strong>designated terrace areas</strong>,
          depending on the service flow and the evening's rhythm.
        </p>

        <h3>Do you offer wine pairings and non-alcoholic pairings?</h3>
        <p>
          Yes. We offer a wine journey through Valle de Guadalupe and a{" "}
          <strong>non-alcoholic pairing</strong> designed through flavor science.
        </p>

        <h3>Do you offer corkage?</h3>
        <p>
          Yes — corkage is available at{" "}
          <strong>$350 MXN per bottle</strong>.
        </p>

        <h3>Is there a dress code?</h3>
        <p>
          We suggest <strong>smart casual</strong> — comfortable, polished, and
          suited to an evening in Valle de Guadalupe.
        </p>

        <h3>Can I request a terrace table or a specific view?</h3>
        <p>
          We take preferences into account with care, and assign tables based on
          availability and service flow. If you have a specific request, include
          it in your reservation notes.
        </p>

        <h3>Can you help plan celebrations or special events?</h3>
        <p>
          Yes — celebrations are welcome with{" "}
          <strong>advance planning</strong>. Share your intention when booking
          and we'll guide the best way to honor the moment.
        </p>
      </section>
    </article>
  );
}
