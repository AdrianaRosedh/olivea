export default function Head() {
  const restaurant = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Olivea Farm To Table",
    url: "https://www.oliveafarmtotable.com/farmtotable",
    image: "https://www.oliveafarmtotable.com/images/og/farmtotable.jpg",
    servesCuisine: ["Contemporary Mexican", "Garden Cuisine"],
    priceRange: "$$$",
    acceptsReservations: "True",
    hasMenu: "https://www.oliveafarmtotable.com/farmtotable/menu",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Carretera Ensenada-Tecate Km 87.5",
      addressLocality: "Valle de Guadalupe",
      addressRegion: "BC",
      postalCode: "22750",
      addressCountry: "MX"
    },
    telephone: "+52 646 123 4567",
    sameAs: ["https://www.instagram.com/oliveafarmtotable"]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurant) }} />;
}
