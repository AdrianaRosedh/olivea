// components/seo/StructuredDataServer.tsx
import { canonicalUrl, SITE } from "@/lib/site";

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

export default function StructuredDataServer() {
  const base = BASE;

  const commonAddress = {
    "@type": "PostalAddress",
    streetAddress: "México 3 Km 92.5, 22766 Villa de Juárez",
    addressLocality: "Ensenada",
    addressRegion: "Baja California",
    postalCode: "22766",
    addressCountry: "MX",
  };

  const geo = {
    "@type": "GeoCoordinates",
    latitude: 31.9909261,
    longitude: -116.6420781,
  };

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
      description: "MICHELIN-starred tasting-menu restaurant with farm stay and café on the same property. Farm hospitality in Valle de Guadalupe, Baja California.",
      url: canonicalUrl("/es/farmtotable"),
      mainEntityOfPage: canonicalUrl("/es/farmtotable"),
      telephone: "+52-6463836402",
      image: canonicalUrl("/images/seo/farm-og.jpg"),
      address: commonAddress,
      geo,
      servesCuisine: ["Farm-to-table", "Baja California", "Mexican", "Tasting menu"],
      // ✅ containsPlace + parentOrganization for entity graph
      containsPlace: [
        { "@id": ENTITY_IDS.hotel },
        { "@id": ENTITY_IDS.cafe },
      ],
      parentOrganization: { "@id": ENTITY_IDS.organization },
      priceRange: "$$$",
      hasMap: GOOGLE_MAPS.restaurant,
      sameAs: [GOOGLE_MAPS.restaurant, MICHELIN.restaurant],
      acceptsReservations: true,
      award: ["One MICHELIN Star", "MICHELIN Green Star"],
      subjectOf: recognitionWorks,
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "17:00", closes: "20:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "14:30", closes: "20:30" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "14:00", closes: "19:00" },
      ],
    },

    // ─── Hotel / Farm Stay ──────────────────────────────────────
    {
      "@type": "LodgingBusiness",
      additionalType: "https://schema.org/Resort",
      "@id": ENTITY_IDS.hotel,
      name: "Casa Olivea",
      description: "Farm stay integrated with a working garden and MICHELIN-starred restaurant in Valle de Guadalupe, Baja California. Farm hospitality where the garden is the essence.",
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
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" },
      ],
    },

    // ─── Café ───────────────────────────────────────────────────
    {
      "@type": "CafeOrCoffeeShop",
      "@id": ENTITY_IDS.cafe,
      name: "Olivea Café",
      description: "Specialty coffee, house bread, and farm breakfast in Valle de Guadalupe, Baja California. Part of the Olivea farm hospitality ecosystem — where the garden is the essence.",
      url: canonicalUrl("/es/cafe"),
      mainEntityOfPage: canonicalUrl("/es/cafe"),
      telephone: "+52-6463882369",
      image: canonicalUrl("/images/seo/cafe-og.jpg"),
      address: commonAddress,
      geo,
      servesCuisine: ["Coffee", "Breakfast", "Pastries", "Mexican"],
      priceRange: "$$",
      hasMap: GOOGLE_MAPS.cafe,
      sameAs: [GOOGLE_MAPS.cafe],
      subjectOf: recognitionWorks,
      // ✅ Café is also contained in the restaurant property
      containedInPlace: { "@id": ENTITY_IDS.restaurant },
      parentOrganization: { "@id": ENTITY_IDS.organization },
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"], opens: "07:30", closes: "14:30" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Tuesday", opens: "07:30", closes: "09:30" },
      ],
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
