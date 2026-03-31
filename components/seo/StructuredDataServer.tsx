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

export default function StructuredDataServer() {
  const base = SITE.canonicalBaseUrl;

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
    {
      "@type": "Organization",
      "@id": `${base}#organization`,
      name: "Familia Olivea",
      description: "Farm hospitality ecosystem in Valle de Guadalupe, Baja California — MICHELIN-starred restaurant, farm stay, and café born from a working garden.",
      url: base,
      logo: canonicalUrl("/images/oliveaFTT.png"),
      sameAs: [
        "https://www.instagram.com/oliveafarmtotable",
        "https://www.instagram.com/oliveacafe",
        "https://www.instagram.com/casaolivea",
        "https://www.facebook.com/oliveafarmtotable",
        "https://www.facebook.com/oliveacafe",
        "https://www.facebook.com/casaolivea",
        "https://www.youtube.com/grupoolivea",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+52-6463836402",
        contactType: "Customer Service",
        availableLanguage: ["Spanish", "English"],
      },
    },

    {
      "@type": "WebSite",
      "@id": `${base}#website`,
      url: base,
      name: "Olivea",
      publisher: { "@id": `${base}#organization` },
      inLanguage: ["es-MX", "en-US"],
    },

    {
      "@type": "Restaurant",
      "@id": `${base}#restaurant`,
      name: "Olivea Farm To Table",
      description: "MICHELIN-starred tasting-menu restaurant with farm stay and café on the same property. Farm hospitality in Valle de Guadalupe, Baja California.",
      url: canonicalUrl("/farmtotable"),
      mainEntityOfPage: canonicalUrl("/farmtotable"),
      telephone: "+52-6463836402",
      address: commonAddress,
      geo,
      servesCuisine: ["Farm-to-table", "Baja California", "Mexican"],
      containsPlace: [
        { "@id": `${base}#hotel` },
        { "@id": `${base}#cafe` },
      ],
      priceRange: "$$$",
      hasMap: GOOGLE_MAPS.restaurant,
      // ✅ Maps + official MICHELIN listing to anchor the entity
      sameAs: [GOOGLE_MAPS.restaurant, MICHELIN.restaurant],
      acceptsReservations: true,
      // ✅ Keep awards explicit + aligned with your Press page
      award: ["One MICHELIN Star", "MICHELIN Green Star"],
      subjectOf: recognitionWorks,
      // ✅ Opening hours for Google Knowledge Panel "Open now"
      // Wed 5–8pm · Fri 2:30–8:30pm · Sun 2–7pm
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "17:00", closes: "20:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "14:30", closes: "20:30" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "14:00", closes: "19:00" },
      ],
    },

    {
      "@type": "LodgingBusiness",
      additionalType: "https://schema.org/Resort",
      "@id": `${base}#hotel`,
      name: "Casa Olivea",
      description: "Farm stay integrated with a working garden and MICHELIN-starred restaurant in Valle de Guadalupe, Baja California. Farm hospitality where the garden is the essence.",
      url: canonicalUrl("/casa"),
      mainEntityOfPage: canonicalUrl("/casa"),
      telephone: "+52-6463882369",
      address: commonAddress,
      geo,
      priceRange: "$$$",
      hasMap: GOOGLE_MAPS.hotel,
      sameAs: [GOOGLE_MAPS.hotel, MICHELIN.hotel],
      subjectOf: recognitionWorks,
      containedInPlace: { "@id": `${base}#restaurant` },
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Working garden", value: true },
        { "@type": "LocationFeatureSpecification", name: "Farm-to-table restaurant", value: true },
        { "@type": "LocationFeatureSpecification", name: "Specialty café", value: true },
      ],
      // ✅ Hotel check-in/check-out (open daily)
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" },
      ],
    },

    {
      "@type": "CafeOrCoffeeShop",
      "@id": `${base}#cafe`,
      name: "Olivea Café",
      url: canonicalUrl("/cafe"),
      mainEntityOfPage: canonicalUrl("/cafe"),
      telephone: "+52-6463882369",
      address: commonAddress,
      geo,
      servesCuisine: ["Coffee", "Pastries"],
      priceRange: "$$",
      hasMap: GOOGLE_MAPS.cafe,
      sameAs: [GOOGLE_MAPS.cafe],
      subjectOf: recognitionWorks,
      // ✅ Wed–Mon 7:30am–2:30pm · Tue 7:30am–9:30am
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
