// app/(main)/[lang]/casa/ArticleEn.tsx
// Server-rendered semantic article for crawlers, AI assistants, and no-JS clients.

import Image from "next/image";

export default function ArticleEn() {
  return (
    <article aria-label="Casa Olivea" className="ssr-article" itemScope itemType="https://schema.org/Hotel">
      <meta itemProp="name" content="Casa Olivea" />

      <header>
        <h1>Casa Olivea</h1>
        <p><em>Where The Garden Is The Essence</em></p>
        <Image src="/images/casa/hero.jpg" alt="Casa Olivea — farm stay in Valle de Guadalupe" width={1200} height={630} priority className="ssr-article-hero" />
      </header>

      {/* ── Rooms ── */}
      <section id="rooms" aria-labelledby="rooms-heading">
        <h2 id="rooms-heading">Our Suites</h2>
        <p>Fourteen suites — each named after an aromatic plant or tree — offer space, warmth, and a sense of return. This is where your rhythm resets.</p>
        <p>King-size beds, blackout curtains, and natural fiber textures invite deep rest. All rooms are designed for two adults — quiet, light-filled, and considered.</p>
        <p>Light shifts throughout the day. In the morning, it filters softly through curtains. In the evening, it settles — warm, indirect, grounding.</p>
      </section>

      {/* ── Design ── */}
      <section id="design" aria-labelledby="design-heading">
        <h2 id="design-heading">Design That Feels</h2>
        <p><em>Design conceived by Ange Joy, founder of Olivea.</em></p>
        <p>Light leads the architecture. In the morning, it's soft and indirect. By afternoon, warm and grounding. Every surface avoids glare, favoring calm.</p>
        <p>We use stone, wood, cotton, and clay — materials that age well and hold warmth. Nothing calls attention. Everything invites touch.</p>
        <p>Glass water. Refillable amenities. Solar power. Sustainability is embedded — not signposted.</p>
      </section>

      {/* ── Courtyard ── */}
      <section id="courtyard" aria-labelledby="courtyard-heading">
        <h2 id="courtyard-heading">Spaces to Breathe</h2>
        <p>Inspired by nature, the courtyard opens at the heart of the property. Two long corridors connect your room to open air and rhythm.</p>
        <p>A sense of calm lives in the courtyard — gravel paths, aromatic plants, and a sunlit pool that follows the rhythm of the seasons. Light filters naturally. Sound settles softly.</p>
        <p>From morning to evening, the courtyard holds a steady presence — inviting you to step outside or simply pause and observe.</p>
      </section>

      {/* ── Mornings ── */}
      <section id="mornings" aria-labelledby="mornings-heading">
        <h2 id="mornings-heading">Mornings at Olivea</h2>
        <h3>Breakfast</h3>
        <p>Hotel guests begin the day with a thoughtfully designed continental breakfast, created by the Olivea kitchen. House-made bread, vegetables from our garden, and a selection of local and in-house preparations are served simply — fresh, balanced, and rooted in the garden.</p>
        <p>Coffee service included with breakfast consists of an americano or tea.</p>
        <h3>Coffee &amp; Olivea Café</h3>
        <p>For guests seeking a broader or more expressive morning experience, Olivea Café offers an expanded breakfast menu alongside a full selection of crafted coffee drinks. Espresso-based beverages, specialty preparations, and additional breakfast plates are available directly at the café.</p>
      </section>

      {/* ── Services ── */}
      <section id="services" aria-labelledby="services-heading">
        <h2 id="services-heading">Essentials, Thoughtfully Chosen</h2>
        <h3>Connectivity</h3>
        <p>Wi-Fi is available throughout the property, including all rooms, patios, and the paddle court. Electrical outlets are thoughtfully placed across shared and private spaces.</p>
        <h3>Comfort</h3>
        <p>Blackout curtains, natural airflow, and climate control — every detail designed to protect your rest.</p>
        <h3>Room Details</h3>
        <p>Filtered water in glass, refillable amenities, and our own house scent — botanical, balanced, and understated.</p>
        <h3>Accessible Design</h3>
        <p>All rooms at Casa Olivea are located on the ground floor, ensuring easy access without steps or level changes.</p>
        <h3>Concierge</h3>
        <p>Reach us anytime via WhatsApp or through our guest portal. We're happy to assist with reservations, transportation, or local recommendations.</p>
        <h3>Local Connection</h3>
        <p>Looking for a vineyard or a quiet place to explore? We'll share our personal recommendations — from long-table lunches to hidden corners.</p>
      </section>

      {/* ── Stay Info ── */}
      <section id="practical" aria-labelledby="practical-heading">
        <h2 id="practical-heading">Stay Info</h2>
        <h3>Check-In / Check-Out</h3>
        <p>Check-in from 3:00 pm. Check-out by 11:00 am.</p>
        <h3>Breakfast &amp; Inclusions</h3>
        <p>A continental breakfast is included daily for two. Paddle courts, pool access, and daily housekeeping are also part of your stay.</p>
        <h3>Getting Here</h3>
        <p>We don't offer airport pickup, but we're happy to coordinate with trusted local drivers or help you arrange transport.</p>
        <h3>Concierge</h3>
        <p>Message us anytime via WhatsApp. We'll assist with reservations, custom itineraries, and Valle de Guadalupe suggestions.</p>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Before You Book</h2>
        <h3>Is breakfast included?</h3>
        <p>Yes — a seasonal continental breakfast is included daily for two people, designed by the Olivea kitchen.</p>
        <h3>Do you allow children or pets?</h3>
        <p>Casa Olivea is adults-only (18+). Dogs are welcomed in designated areas.</p>
        <h3>Can I use the paddle courts?</h3>
        <p>Yes — guests may use the paddle courts during daylight hours, until sunset, with reservation.</p>
        <h3>Do you offer airport pickup?</h3>
        <p>We can coordinate trusted local drivers upon request.</p>
        <h3>Are you part of the Michelin Guide?</h3>
        <p>Casa Olivea appears in the Michelin Guide, and our restaurant Olivea Farm To Table holds a Michelin Star and Green Star.</p>
      </section>
    </article>
  );
}
