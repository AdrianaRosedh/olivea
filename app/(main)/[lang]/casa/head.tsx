import { absoluteUrl } from "@/lib/site";

export default function Head() {
  const url = absoluteUrl("/casa");

  const hotelLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "@id": `${url}#hotel`,
    name: "Casa Olivea",
    url,
    image: [absoluteUrl("/images/seo/casa-og.jpg")],
    description:
      "A garden-centered boutique hotel located in Valle de Guadalupe, Baja California. Part of the Olivea ecosystem, where the garden is the essence.",
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelLd) }}
    />
  );
}
