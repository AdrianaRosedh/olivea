import { absoluteUrl } from "@/lib/site";

export default function Head() {
  const url = absoluteUrl("/cafe");

  const cafeLd = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${url}#cafe`,
    name: "Olivea Café",
    url,
    image: [absoluteUrl("/images/seo/cafe-og.jpg")],
    description:
      "Specialty coffee, house bread and breakfast next to the Olivea garden in Valle de Guadalupe, Baja California. Where the garden is the essence.",
    servesCuisine: ["Coffee", "Breakfast", "Mexican"],
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cafeLd) }}
    />
  );
}
