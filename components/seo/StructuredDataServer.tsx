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

// ✅ Google Maps entity anchors (highest ROI)
const GOOGLE_MAPS = {
  restaurant: "https://maps.app.goo.gl/c2RsfNfQom2Jg73P7",
  hotel: "https://maps.app.goo.gl/CnKY7KYNN5yxYtfi8",
  cafe: "https://maps.app.goo.gl/gYH1qsUourCZqXiX6",
};

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

  const geo = {
    "@type": "GeoCoordinates",
    latitude: 31.9909261,
    longitude: -116.6420781,
  };

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

    // Restaurant entity (best places to eat)
    {
      "@type": "Restaurant",
      "@id": `${base}#restaurant`,
      name: "Olivea Farm To Table",
      url: canonicalUrl("/farmtotable"),
      mainEntityOfPage: canonicalUrl("/farmtotable"),
      telephone: "+52-6463836402",
      address: commonAddress,
      geo,
      servesCuisine: ["Farm-to-table", "Baja California"],
      priceRange: "$$$",
      hasMap: GOOGLE_MAPS.restaurant,
      sameAs: [GOOGLE_MAPS.restaurant],
      acceptsReservations: true,
      award: RECOGNITION.map((r) => r.name),
      subjectOf: recognitionWorks,
    },

    // Hotel entity (best places to stay)
    {
      "@type": "Hotel",
      "@id": `${base}#hotel`,
      name: "Casa Olivea",
      url: canonicalUrl("/casa"),
      mainEntityOfPage: canonicalUrl("/casa"),
      telephone: "+52-6463882369",
      address: commonAddress,
      geo,
      priceRange: "$$$",
      hasMap: GOOGLE_MAPS.hotel,
      sameAs: [GOOGLE_MAPS.hotel],
      subjectOf: recognitionWorks,
    },

    // Café entity
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
