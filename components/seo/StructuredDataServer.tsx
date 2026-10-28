// components/seo/StructuredDataServer.tsx
import { MICHELIN } from "@/lib/michelin";
import { canonicalUrl, SITE, SITE_ADDRESS, SITE_GEO } from "@/lib/site";
import { getContent } from "@/lib/content";
import { jsonLdHtml } from "@/lib/seo/json-ld";

type Recognition = {
  name: string;
  publisher?: string;
  url?: string;
};

// ✅ Official sources, shared with the press page (lib/michelin.ts)

const RECOGNITION: Recognition[] = [
  {
    name: "MICHELIN Guide — One MICHELIN Star",
    publisher: "MICHELIN Guide",
    url: MICHELIN.restaurant,
  },
  {
    name: "MICHELIN Guide — MICHELIN Green Star",
    publisher: "MICHELIN Guide",
    url: MICHELIN.mexicoSelection,
  },
  {
    name: "MICHELIN Guide (Hotels & Stays) — Casa Olivea",
    publisher: "MICHELIN Guide",
    url: MICHELIN.hotel,
  },
  {
    name: "Featured in The Wall Street Journal — Best Travel Destinations 2026",
    publisher: "The Wall Street Journal",
    url: canonicalUrl("/es/press"),
  },
  {
    name: "Featured in Baja Flavors — Mesas de Vida",
    publisher: "Baja Flavors",
    url: canonicalUrl("/es/press"),
  },
];

// ─── Canonical @id anchors (single source of truth) ───────────────
// Every reference across head.tsx, per-page head.tsx, and this file
// MUST use these exact IDs so Google connects the entity graph.
const BASE = SITE.canonicalBaseUrl;
export const ENTITY_IDS = {
  organization: `${BASE}#organization`,
  website: `${BASE}#website`,
  restaurant: `${BASE}#restaurant`,
  hotel: `${BASE}#hotel`,
  cafe: `${BASE}#cafe`,
} as const;

export default async function StructuredDataServer() {
  const base = BASE;

  // Opening hours are admin-editable via global_settings → JSON-LD stays in
  // sync without a developer. There is no fallback; see hoursOf below.
  const settings = await getContent("global").catch(() => null);

  // Each house's Google listing (description, phone, price, Maps link,
  // cuisines, amenities) and Olivea's own entry are edited in /admin — the
  // "Google listing" card on each house page, and Brand & Identity. Same rule
  // as hours below: a field left empty is omitted, never invented.
  const [fttContent, casaContent, cafeContent] = await Promise.all([
    getContent("farmtotable").catch(() => null),
    getContent("casa").catch(() => null),
    getContent("cafe").catch(() => null),
  ]);
  const listing = {
    restaurant: fttContent?.listing ?? {},
    hotel: casaContent?.listing ?? {},
    cafe: cafeContent?.listing ?? {},
  };
  const org = settings?.organization ?? {};

  /** "+52 646 383 6402" → "+52-6463836402"; other numbers as "+<digits>". */
  const tel = (phone?: string) => {
    const d = phone?.replace(/\D/g, "") ?? "";
    if (!d) return undefined;
    return d.startsWith("52") && d.length === 12 ? `+52-${d.slice(2)}` : `+${d}`;
  };
  /** { key: value } when the value is set (non-empty string or list), else {}. */
  const opt = (key: string, value: unknown) =>
    value === undefined || value === "" || (Array.isArray(value) && value.length === 0)
      ? {}
      : { [key]: value };
  const amenities = (names?: string[]) =>
    opt(
      "amenityFeature",
      (names ?? []).filter(Boolean).map((name) => ({
        "@type": "LocationFeatureSpecification",
        name,
        value: true,
      })),
    );
  const maps = (url: string | undefined, ...more: string[]) => ({
    ...opt("hasMap", url),
    ...opt("sameAs", [url, ...more].filter(Boolean)),
  });
  const toSpecs = (venue: string) => {
    const slots = settings?.hours?.find((h) => h.venue === venue)?.slots;
    if (!slots?.length) return null;
    return slots.map((s) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: s.days.length === 1 ? s.days[0] : s.days,
      opens: s.opens,
      closes: s.closes,
    }));
  };

  /**
   * Hours, or NO hours — never invented ones.
   *
   * Each venue used to fall back to a hard-coded schedule when the lookup came
   * back empty. That is a second copy of a fact that changes, in a file nobody
   * opens when it does, and it had already drifted: the fallback said the
   * restaurant opened Wednesday, Friday and Sunday, while the kitchen has been
   * serving Thursday and Saturday too.
   *
   * The drift was survivable only because the database row existed, so the
   * fallback was unreachable. Had that row ever gone missing — a failed read,
   * a bad migration, a venue key renamed — the site would have published three
   * confident wrong days to Google, and guests would have driven to a locked
   * door on a Thursday.
   *
   * So there is no fallback. If the data is not there the property is OMITTED,
   * because schema.org treats a missing openingHoursSpecification as "not
   * stated" and treats a present one as fact. Losing the rich result for one
   * render costs a little search polish; publishing hours nobody verified
   * costs somebody their evening.
   *
   * Hours are edited in /admin/hours, which is the one place they live.
   */
  const hoursOf = (venue: string) => {
    const specs = toSpecs(venue);
    return specs ? { openingHoursSpecification: specs } : {};
  };

  /** Check-in / check-out, same rule as hoursOf: present only when set.
   *  These are what tell Google the property serves guests overnight even
   *  though reception closes at 22:00 — without them, reception hours alone
   *  make a hotel look shut for the night. */
  const stayTimesOf = (venue: string) => {
    const v = settings?.hours?.find((h) => h.venue === venue);
    return {
      ...(v?.checkinTime ? { checkinTime: v.checkinTime } : {}),
      ...(v?.checkoutTime ? { checkoutTime: v.checkoutTime } : {}),
    };
  };

  const commonAddress = { "@type": "PostalAddress", ...SITE_ADDRESS };

  const geo = { "@type": "GeoCoordinates", ...SITE_GEO };

  const recognitionWorks = RECOGNITION.map((r) => ({
    "@type": "CreativeWork",
    name: r.name,
    ...(r.publisher
      ? { publisher: { "@type": "Organization", name: r.publisher } }
      : {}),
    ...(r.url ? { url: r.url } : {}),
  }));

  const graph = [
    // ─── Organization (parent entity) ───────────────────────────
    {
      "@type": "Organization",
      "@id": ENTITY_IDS.organization,
      name: "Olivea",
      ...opt("alternateName", org.alternateName),
      ...opt("description", org.description),
      url: base,
      logo: {
        "@type": "ImageObject",
        url: canonicalUrl("/images/oliveaFTT.png"),
        width: 512,
        height: 512,
      },
      // ✅ department links sub-entities to Organization for Google sitelinks
      department: [
        { "@id": ENTITY_IDS.restaurant },
        { "@id": ENTITY_IDS.hotel },
        { "@id": ENTITY_IDS.cafe },
      ],
      ...opt("sameAs", org.sameAs),
      ...(tel(org.telephone)
        ? {
            contactPoint: {
              "@type": "ContactPoint",
              telephone: tel(org.telephone),
              contactType: "Customer Service",
              availableLanguage: ["Spanish", "English"],
            },
          }
        : {}),
      // ✅ Location context for regional SEO
      ...(org.areaServed ? { areaServed: { "@type": "Place", name: org.areaServed } } : {}),
      ...opt("knowsAbout", org.knowsAbout),
      // ✅ Key people as linked Person entities (resolve to /team/<id> pages)
      founder: {
        "@type": "Person",
        "@id": `${base}/team/ange#person`,
        name: "Ange Joy",
        jobTitle: "Founder & Designer",
        url: canonicalUrl("/es/team/ange"),
      },
      employee: [
        {
          "@type": "Person",
          "@id": `${base}/team/adrianarose#person`,
          name: "Adriana Rose",
          jobTitle: "CEO — Technology & Vision",
          url: canonicalUrl("/es/team/adrianarose"),
        },
        {
          "@type": "Person",
          "@id": `${base}/team/danielnates#person`,
          name: "Daniel Nates",
          jobTitle: "Executive Chef",
          url: canonicalUrl("/es/team/danielnates"),
        },
      ],
    },

    // ─── roseiies (Adriana Rose's hospitality-intelligence studio) ───
    {
      "@type": "Organization",
      "@id": "https://roseiies.com/#organization",
      name: "roseiies",
      alternateName: "Roseiies",
      description:
        "Hospitality intelligence studio founded by Adriana Rose, CEO of Olivea — applying technology and design to hospitality, beginning with the Olivea ecosystem.",
      url: "https://roseiies.com",
      founder: {
        "@type": "Person",
        "@id": `${base}/team/adrianarose#person`,
        name: "Adriana Rose",
      },
    },

    // ─── WebSite ────────────────────────────────────────────────
    {
      "@type": "WebSite",
      "@id": ENTITY_IDS.website,
      url: base,
      name: "OLIVEA",
      alternateName: ["Olivea Farm To Table", "Olivea", "Familia Olivea"],
      publisher: { "@id": ENTITY_IDS.organization },
      inLanguage: ["es-MX", "en-US"],
      potentialAction: [
        {
          "@type": "SearchAction",
          target: `${base}/es?search={query}`,
          "query-input": "required name=query",
        },
        {
          "@type": "SearchAction",
          target: `${base}/en?search={query}`,
          "query-input": "required name=query",
        },
      ],
    },

    // ─── Restaurant ─────────────────────────────────────────────
    {
      "@type": "Restaurant",
      "@id": ENTITY_IDS.restaurant,
      name: "Olivea Farm To Table",
      ...opt("alternateName", listing.restaurant.alternateName),
      ...opt("description", listing.restaurant.description),
      // ✅ Google's dining-style hints. schema.org has no "fine dining" type, so
      // the tier is carried by priceRange ($$$$), the description, cuisine, and
      // these keywords — kept unambiguous so Search/AI never read it as casual.
      ...opt("keywords", listing.restaurant.keywords),
      url: canonicalUrl("/es/farmtotable"),
      mainEntityOfPage: canonicalUrl("/es/farmtotable"),
      ...opt("telephone", tel(listing.restaurant.telephone)),
      image: canonicalUrl("/images/seo/farm-og.jpg"),
      address: commonAddress,
      geo,
      ...opt("servesCuisine", listing.restaurant.servesCuisine),
      ...amenities(listing.restaurant.amenities),
      // ✅ menu — the property Google documents for food establishments (menu URL)
      menu: canonicalUrl("/es/menu"),
      // ✅ containsPlace + parentOrganization for entity graph
      containsPlace: [
        { "@id": ENTITY_IDS.hotel },
        { "@id": ENTITY_IDS.cafe },
      ],
      parentOrganization: { "@id": ENTITY_IDS.organization },
      // Fine dining — top price tier ($$$$); "$$$" reads as upscale-casual.
      ...opt("priceRange", listing.restaurant.priceRange),
      ...maps(listing.restaurant.mapsUrl, MICHELIN.restaurant),
      acceptsReservations: true,
      // ✅ chef as an entity — common AI query for a MICHELIN restaurant
      employee: {
        "@type": "Person",
        "@id": `${base}/team/danielnates#person`,
        name: "Daniel Nates",
        jobTitle: "Executive Chef",
        url: canonicalUrl("/es/team/danielnates"),
      },
      // ✅ ReserveAction — lets AI/Google surface a "reserve a table" action
      potentialAction: {
        "@type": "ReserveAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://www.opentable.com.mx/booking/restref/availability?lang=es-MX&restRef=1313743&otSource=Restaurant%20website",
          inLanguage: "es-MX",
          actionPlatform: [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform",
          ],
        },
        result: {
          "@type": "Reservation",
          name: "Reservation at Olivea Farm To Table",
        },
      },
      award: ["One MICHELIN Star", "MICHELIN Green Star"],
      // NOTE: deliberately NO self-applied aggregateRating. Per Google's
      // review-snippet policy, a business rating itself is self-serving and makes
      // the page ineligible for review stars. Google surfaces the Business Profile
      // rating in Search natively; AI-facing ratings live in llms.txt.
      subjectOf: recognitionWorks,
      ...hoursOf("farmtotable"),
    },

    // ─── Hotel / Farm Stay ──────────────────────────────────────
    {
      "@type": "LodgingBusiness",
      additionalType: "https://schema.org/Resort",
      "@id": ENTITY_IDS.hotel,
      name: "Casa Olivea",
      ...opt("description", listing.hotel.description),
      url: canonicalUrl("/es/casa"),
      mainEntityOfPage: canonicalUrl("/es/casa"),
      ...opt("telephone", tel(listing.hotel.telephone)),
      image: canonicalUrl("/images/seo/casa-og.jpg"),
      address: commonAddress,
      geo,
      ...opt("priceRange", listing.hotel.priceRange),
      ...maps(listing.hotel.mapsUrl, MICHELIN.hotel),
      subjectOf: recognitionWorks,
      containedInPlace: { "@id": ENTITY_IDS.restaurant },
      parentOrganization: { "@id": ENTITY_IDS.organization },
      ...amenities(listing.hotel.amenities),
      ...hoursOf("casa"),
      ...stayTimesOf("casa"),
    },

    // ─── Café ───────────────────────────────────────────────────
    {
      "@type": ["CafeOrCoffeeShop", "BarOrPub"],
      "@id": ENTITY_IDS.cafe,
      name: "Olivea Café Wine Bar",
      ...opt("description", listing.cafe.description),
      ...opt("keywords", listing.cafe.keywords),
      url: canonicalUrl("/es/cafe"),
      mainEntityOfPage: canonicalUrl("/es/cafe"),
      ...opt("telephone", tel(listing.cafe.telephone)),
      image: canonicalUrl("/images/seo/cafe-og.jpg"),
      address: commonAddress,
      geo,
      ...opt("servesCuisine", listing.cafe.servesCuisine),
      ...amenities(listing.cafe.amenities),
      menu: canonicalUrl("/es/menu"),
      ...opt("priceRange", listing.cafe.priceRange),
      ...maps(listing.cafe.mapsUrl),
      subjectOf: recognitionWorks,
      // ✅ Café is also contained in the restaurant property
      containedInPlace: { "@id": ENTITY_IDS.restaurant },
      parentOrganization: { "@id": ENTITY_IDS.organization },
      ...hoursOf("cafe"),
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLdHtml({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
