export default function Head() {
  const cafe = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: "Olivea Café",
    url: "https://www.oliveafarmtotable.com/cafe",
    image: "https://www.oliveafarmtotable.com/images/og/cafe.jpg",
    servesCuisine: "Coffee & Breakfast",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Valle de Guadalupe",
      addressRegion: "BC",
      addressCountry: "MX"
    },
    telephone: "+52 646 123 4567"
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cafe) }} />;
}
