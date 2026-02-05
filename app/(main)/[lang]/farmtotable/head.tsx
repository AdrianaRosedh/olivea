import { absoluteUrl } from "@/lib/site";

export default function Head() {
  const url = absoluteUrl("/farmtotable");

  const restaurantLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${url}#restaurant`,
    name: "Olivea Farm To Table",
    url,
    image: [absoluteUrl("/images/seo/farmtotable-og.jpg")],
    description:
      "A garden-led tasting menu restaurant located in Valle de Guadalupe, Baja California. Part of the Olivea ecosystem, where the garden is the essence.",
    servesCuisine: ["Mexican", "Farm-to-table"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Valle de Guadalupe",
      addressRegion: "Baja California",
      addressCountry: "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 31.9909578,
      longitude: -116.6421398,
    },
    isPartOf: {
      "@type": "Organization",
      name: "Olivea",
      url: absoluteUrl("/"),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantLd) }}
    />
  );
}
