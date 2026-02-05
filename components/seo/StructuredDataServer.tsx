// components/seo/StructuredDataServer.tsx
import { canonicalUrl, SITE } from "@/lib/site";

type Recognition = {
  name: string;
  publisher?: string;
  url?: string;
};

const RECOGNITION: Recognition[] = [
  {
    name: "Featured in The Wall Street Journal – Best Travel Destinations 2026",
    publisher: "The Wall Street Journal",
    url: canonicalUrl("/press"),
  },
  {
    name: "Featured in Baja Flavors / Mesas de Vida",
    publisher: "Baja Flavors / Mesas de Vida",
    url: canonicalUrl("/press"),
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

  const recognitionWorks = RECOGNITION.map((r) => ({
    "@type": "CreativeWork",
    name: r.name,
    ...(r.publisher ? { publisher: { "@type": "Organization", name: r.publisher } } : {}),
    ...(r.url ? { url: r.url } : {}),
  }));

  const graph = [
    {
      "@type": "Organization",
      "@id": `${base}#organization`,
      name: "Familia Olivea",
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

    // Bind site → org for AI & crawlers
    {
      "@type": "WebSite",
      "@id": `${base}#website`,
      url: base,
      name: "Olivea",
      publisher: { "@id": `${base}#organization` },
      inLanguage: ["es-MX", "en-US"],
    },

    // Restaurant entity (most important for “best places to eat” queries)
    {
      "@type": "Restaurant",
      "@id": `${base}#restaurant`,
      name: "Olivea Farm To Table",
      url: canonicalUrl("/farmtotable"),
      telephone: "+52-6463836402",
      address: commonAddress,
      geo: {
        "@type": "GeoCoordinates",
        latitude: 31.9909261,
        longitude: -116.6420781,
      },
      servesCuisine: ["Farm-to-table", "Baja California"],
      priceRange: "$$$",
      hasMap: "https://maps.app.goo.gl/oySkL6k7G7t5VFus5",
      acceptsReservations: true,
      award: RECOGNITION.map((r) => r.name),
      subjectOf: recognitionWorks,
    },

    // Hotel entity
    {
      "@type": "Hotel",
      "@id": `${base}#hotel`,
      name: "Casa Olivea",
      url: canonicalUrl("/casa"),
      telephone: "+52-6463882369",
      address: commonAddress,
      geo: {
        "@type": "GeoCoordinates",
        latitude: 31.9909261,
        longitude: -116.6420781,
      },
      priceRange: "$$$",
      // Keep ratings factual/verified; omit if not official
      // starRating: { "@type": "Rating", ratingValue: "5" },
      subjectOf: recognitionWorks,
    },

    // Café entity
    {
      "@type": "CafeOrCoffeeShop",
      "@id": `${base}#cafe`,
      name: "Olivea Café",
      url: canonicalUrl("/cafe"),
      telephone: "+52-6463882369",
      address: commonAddress,
      geo: {
        "@type": "GeoCoordinates",
        latitude: 31.9909261,
        longitude: -116.6420781,
      },
      servesCuisine: ["Coffee", "Pastries"],
      priceRange: "$$",
      subjectOf: recognitionWorks,
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Server-rendered, no hydration dependency (best for crawlers + AI)
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
