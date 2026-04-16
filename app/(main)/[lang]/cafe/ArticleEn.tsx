// app/(main)/[lang]/cafe/ArticleEn.tsx
// Server-rendered semantic article for crawlers, AI assistants, and no-JS clients.

import Image from "next/image";

export default function ArticleEn() {
  return (
    <article aria-label="Olivea Café" className="ssr-article" itemScope itemType="https://schema.org/CafeOrCoffeeShop">
      <meta itemProp="name" content="Olivea Café" />
      <meta itemProp="servesCuisine" content="Specialty Coffee, Farm Breakfast, House Bread" />

      <header>
        <h1>Olivea Café</h1>
        <p><em>Where The Garden Is The Essence</em></p>
        <Image src="/images/cafe/hero.jpg" alt="Olivea Café — specialty coffee and farm breakfast in Valle de Guadalupe" width={1200} height={630} priority className="ssr-article-hero" />
      </header>

      {/* ── Experience ── */}
      <section id="experience" aria-labelledby="exp-heading">
        <h2 id="exp-heading">The Daily Rhythm of Olivea</h2>
        <p>Slow coffee. Slow food. Calm energy — built as practice, as daily discipline.</p>
        <p>Olivea Café is the most relaxed expression of the Olivea ecosystem — where mornings unfold slowly, movement stays human, and the garden remains the source. It carries the same leaders, the same standards, and the same philosophy as Casa Olivea and Olivea Farm To Table.</p>

        <dl>
          <dt>Hours</dt><dd>Daily · 7:30 am – 5:30 pm</dd>
          <dt>Coffee</dt><dd>Sourced in Mexico · crafted with technique</dd>
          <dt>Kitchen</dt><dd>Connected to Farm To Table · shared system</dd>
          <dt>Rhythm</dt><dd>Breakfast · padel · return to calm</dd>
        </dl>

        <p>Our coffee is sourced exclusively from Mexico. We choose it for balance, clarity, and a finish that stays clean — designed to feel calm and unhurried. Roasting in-house is part of a future phase, introduced once the system is ready.</p>
        <p>Technique lives quietly here. Espresso is tuned for structure. Filter stays transparent. Consistency and restraint guide every cup — excellence that feels effortless.</p>
        <p>Ceremonial matcha is prepared with the same care we bring to coffee. We also play with the garden — creating syrups and jarabes that keep the menu seasonal while staying clear and balanced.</p>

        <aside>
          <p>At Olivea, sustainability is efficiency: respect made practical. The café shares ingredients, fermentation work, and a continuous return loop with Farm To Table — garden → kitchen → compost → back to the soil.</p>
        </aside>

        <p>Olivea Café is calm by design. In the afternoons, we serve a small selection of cocktails, wine, and tapas — a soft continuation of the day. Looking forward, an evening wine-bar format is being explored, built slowly and intentionally, consistent with the Olivea ecosystem.</p>
      </section>

      {/* ── Breakfast ── */}
      <section id="breakfast" aria-labelledby="breakfast-heading">
        <h2 id="breakfast-heading">Breakfast, Homey &amp; Precise</h2>
        <p>Breakfast at Olivea Café moves at a calm pace. The goal is rhythm: plates that feel warm and familiar, while staying clean and intentional.</p>
        <p>The style is mostly savory, rooted in Mexican comfort — simple food, done with care, guided by what the garden and the season are offering.</p>
        <p>We share ingredients and preparations with Olivea Farm To Table when it makes sense — supporting efficiency and coherence. One ecosystem: less waste, more continuity.</p>
        <p>Casa Olivea guests begin the day with Olivea Café. Guests visiting for the day are welcome as well — the café is an open door into the Olivea rhythm.</p>
      </section>

      {/* ── Bread ── */}
      <section id="bread" aria-labelledby="bread-heading">
        <h2 id="bread-heading">Bread as Ritual</h2>
        <p>Flour is structure. We choose it for flavor and fermentation performance — the kind of crumb that feels light yet complete, never heavy, never loud.</p>
        <p>Recipes are composed for clarity: clean layers, balanced seasoning, and texture that feels intentional. The goal is precision that stays quiet.</p>
        <p>The café shares leadership with Farm To Table — led by Chef Daniel Nates — alongside a dedicated pastry and bread chef who supports both kitchens. Coherence over uniformity: one vision, many expressions.</p>
        <p>Bread here pairs naturally with slow coffee in the morning, and it carries the same standard that lives throughout Olivea. Fermentation is time intelligence: it extends the season with elegance, preserves peak moments, and keeps the menu continuous — always returning what remains back into the system through compost.</p>
      </section>

      {/* ── Padel ── */}
      <section id="padel" aria-labelledby="padel-heading">
        <h2 id="padel-heading">Padel as Lifestyle</h2>
        <p>Olivea is a garden ecosystem, and a full experience includes rhythm. Movement helps the day feel clearer. The café brings you back to calm.</p>
        <p>Padel here is social and curated: coffee, music, good energy — integrated with the property, carried in the same Olivea tone.</p>

        <h3>Courts</h3>
        <p>We offer both a doubles court and a singles court. Padel is available to Casa Olivea guests and day visitors by reservation, from 8:00 am until daylight hours.</p>
        <h3>Rhythm &amp; Energy</h3>
        <p>The atmosphere stays clean, calm, and fun — our music, our pace, and a smooth flow between play and café.</p>
        <h3>Rackets &amp; Balls</h3>
        <p>Rackets are available for rent. Casa Olivea guests enjoy rackets as part of their stay. New balls are available for purchase.</p>
        <h3>Community &amp; Flow</h3>
        <p>Tuesdays welcome local hospitality industry friends for free play. Courtside, guests enjoy food and beverages from Olivea Café. Café and padel areas are pet friendly.</p>
      </section>

      {/* ── Menu ── */}
      <section id="menu-info" aria-labelledby="menu-heading">
        <h2 id="menu-heading">The Menu</h2>
        <p>A curated <strong>coffee + café menu</strong>, designed around clarity and rhythm — espresso with structure, filter with transparency, tea with calm, and cold drinks that feel bright. Coffee is sourced exclusively from <strong>Mexico</strong>. Matcha is ceremonial. Syrups and jarabes evolve with the garden.</p>
        <h3>Coffee · Mexico-sourced</h3>
        <p>Espresso and filter are tuned for clarity and balance. In-house roasting is part of a future phase, introduced once the system is ready.</p>
        <h3>Matcha · Garden Jarabes</h3>
        <p>Ceremonial matcha, prepared with technique. Seasonal syrups and jarabes evolve with the garden — expressive, while staying clear.</p>
        <h3>Afternoons · Small List</h3>
        <p>Afternoons offer a small selection of cocktails, wine, and tapas — a relaxed continuation of the day, designed to remain calm and coherent with Olivea.</p>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Good to Know</h2>
        <h3>Who is Olivea Café for?</h3>
        <p>Casa Olivea guests begin the day here, and day visitors are welcome as well — the café is an open door into the Olivea rhythm.</p>
        <h3>What are the café hours?</h3>
        <p>Olivea Café is open daily from 7:30 am to 5:30 pm.</p>
        <h3>What is the breakfast style?</h3>
        <p>Breakfast is mostly savory, rooted in Mexican comfort — designed to feel calm, nourishing, and intentional.</p>
        <h3>How does breakfast work for Casa Olivea guests?</h3>
        <p>Breakfast is included for two, served at Olivea Café.</p>
        <h3>Where does the coffee come from?</h3>
        <p>Coffee is sourced exclusively from Mexico, crafted with technique and consistency.</p>
        <h3>Do you serve matcha?</h3>
        <p>Yes — ceremonial matcha, prepared with care. Seasonal syrups and jarabes evolve with the garden.</p>
        <h3>When are padel courts available?</h3>
        <p>Courts are available by reservation between 8:00 am and 6:00 pm.</p>
        <h3>How many courts are available?</h3>
        <p>One doubles court and one singles court.</p>
        <h3>What equipment is available?</h3>
        <p>Rackets are available for rent. Casa Olivea guests enjoy rackets as part of their stay. New balls are available for purchase.</p>
        <h3>Is there a community padel day?</h3>
        <p>Tuesdays welcome local hospitality industry friends for free play.</p>
        <h3>What is the courtside experience like?</h3>
        <p>Courtside, guests enjoy food and beverages from Olivea Café — coffee, music, and a relaxed flow between play and the table.</p>
        <h3>Are pets welcome?</h3>
        <p>Yes — café and padel areas are pet friendly.</p>
        <h3>What happens in the afternoons?</h3>
        <p>Afternoons offer a small list of cocktails, wine, and tapas as a relaxed continuation of the day.</p>
      </section>
    </article>
  );
}
