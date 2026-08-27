// components/seo/StructuredDataServer.tsx
import { canonicalUrl, SITE, SITE_ADDRESS, SITE_GEO } from "@/lib/site";
import { getContent } from "@/lib/content";

type Recognition = {
  name: string;
  publisher?: string;
  url?: string;
};

// ✅ Google Maps entity anchors (your URLs)
const GOOGLE_MAPS = {
  restaurant: "https://maps.app.goo.gl/c2RsfNfQom2Jg73P7",
  hotel: "https://maps.app.goo.gl/CnKY7KYNN5yxYtfi8",
  cafe: "https://maps.app.goo.gl/gYH1qsUourCZqXiX6",
};

// ✅ Official sources (from your /press page links)
const MICHELIN = {
  restaurant:
    "https://guide.michelin.com/en/baja-california/ensenada_2059847/restaurant/olivea-farm-to-table",
  hotel:
    "https://guide.michelin.com/mx/es/hotels-stays/Ensenada/casa-olivea-14762",
  mexicoSelection:
    "https://www.michelin.com/en/publications/products-and-services/the-michelin-guide-mexico-2025-selection",
};

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
      alternateName: "Familia Olivea",
      description: "Farm hospitality in Valle de Guadalupe, Baja California — MICHELIN-starred restaurant, farm stay, and café born from a working garden.",
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
      sameAs: [
        "https://www.instagram.com/oliveafarmtotable",
        "https://www.instagram.com/oliveacafe",
        "https://www.instagram.com/casaolivea",
        "https://www.facebook.com/oliveafarmtotable",
        "https://www.facebook.com/oliveacafe",
        "https://www.facebook.com/casaolivea",
        "https://www.youtube.com/grupoolivea",
        "https://www.tiktok.com/@familiaolivea",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+52-6463836402",
        contactType: "Customer Service",
        availableLanguage: ["Spanish", "English"],
      },
      // ✅ Location context for regional SEO
      areaServed: {
        "@type": "Place",
        name: "Valle de Guadalupe, Ensenada, Baja California, Mexico",
      },
      knowsAbout: [
        "Farm hospitality",
        "Farm-to-table dining",
        "Agritourism",
        "Valle de Guadalupe wine region",
        "Baja California gastronomy",
      ],
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
      alternateName: "Olivea FTT",
      description: "One MICHELIN Star fine-dining restaurant serving a single prix-fixe tasting menu born from its own working garden — by reservation only, in Valle de Guadalupe, Baja California. The fine-dining heart of Olivea; the casual daytime café (Olivea Café Wine Bar) and the farm stay (Casa Olivea) share the same property.",
      // ✅ Google's dining-style hints. schema.org has no "fine dining" type, so
      // the tier is carried by priceRange ($$$$), the description, cuisine, and
      // these keywords — kept unambiguous so Search/AI never read it as casual.
      keywords: "fine dining, alta cocina, MICHELIN Star, tasting menu, menú degustación, prix fixe, farm-to-table, del huerto, reservation only, Valle de Guadalupe",
      url: canonicalUrl("/es/farmtotable"),
      mainEntityOfPage: canonicalUrl("/es/farmtotable"),
      telephone: "+52-6463836402",
      image: canonicalUrl("/images/seo/farm-og.jpg"),
      address: commonAddress,
      geo,
      servesCuisine: ["Fine dining", "Tasting menu", "Farm-to-table", "Contemporary Mexican", "Baja California"],
      // ✅ menu — the property Google documents for food establishments (menu URL)
      menu: canonicalUrl("/es/menu"),
      // ✅ containsPlace + parentOrganization for entity graph
      containsPlace: [
        { "@id": ENTITY_IDS.hotel },
        { "@id": ENTITY_IDS.cafe },
      ],
      parentOrganization: { "@id": ENTITY_IDS.organization },
      // Fine dining — top price tier. Was "$$$" (upscale-casual), which
      // undersold a One-MICHELIN-Star prix-fixe tasting-menu restaurant.
      priceRange: "$$$$",
      hasMap: GOOGLE_MAPS.restaurant,
      sameAs: [GOOGLE_MAPS.restaurant, MICHELIN.restaurant],
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
      description: "The complete Olivea experience — a farm stay that brings together the One-MICHELIN-Star Olivea Farm To Table restaurant, the casual Olivea Café Wine Bar, and the working garden into a single stay in Valle de Guadalupe, Baja California. Farm hospitality where the garden is the essence.",
      url: canonicalUrl("/es/casa"),
      mainEntityOfPage: canonicalUrl("/es/casa"),
      telephone: "+52-6463882369",
      image: canonicalUrl("/images/seo/casa-og.jpg"),
      address: commonAddress,
      geo,
      priceRange: "$$$",
      hasMap: GOOGLE_MAPS.hotel,
      sameAs: [GOOGLE_MAPS.hotel, MICHELIN.hotel],
      subjectOf: recognitionWorks,
      containedInPlace: { "@id": ENTITY_IDS.restaurant },
      parentOrganization: { "@id": ENTITY_IDS.organization },
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Working garden", value: true },
        { "@type": "LocationFeatureSpecification", name: "Farm-to-table restaurant", value: true },
        { "@type": "LocationFeatureSpecification", name: "Specialty café", value: true },
        { "@type": "LocationFeatureSpecification", name: "Pádel court", value: true },
      ],
      ...hoursOf("casa"),
      ...stayTimesOf("casa"),
    },

    // ─── Café ───────────────────────────────────────────────────
    {
      "@type": ["CafeOrCoffeeShop", "BarOrPub"],
      "@id": ENTITY_IDS.cafe,
      name: "Olivea Café Wine Bar",
      description: "Café and wine bar on Olivea's working-garden property in Valle de Guadalupe, Baja California. Specialty coffee, artisan bread, and farm breakfast by day; Valle de Guadalupe and Baja California wine, house wine, and tapas as the day softens. The relaxed counterpart to the One-MICHELIN-Star Olivea Farm To Table restaurant.",
      keywords: "café, wine bar, specialty coffee, Valle de Guadalupe wine, Baja California wine, breakfast, walk-in, cafetería",
      url: canonicalUrl("/es/cafe"),
      mainEntityOfPage: canonicalUrl("/es/cafe"),
      telephone: "+52-6463882369",
      image: canonicalUrl("/images/seo/cafe-og.jpg"),
      address: commonAddress,
      geo,
      servesCuisine: ["Coffee", "Breakfast", "Pastries", "Mexican"],
      menu: canonicalUrl("/es/menu"),
      priceRange: "$$",
      hasMap: GOOGLE_MAPS.cafe,
      sameAs: [GOOGLE_MAPS.cafe],
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
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
