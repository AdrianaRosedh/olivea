export default function Head() {
  const hotel = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "Casa Olivea",
    url: "https://www.oliveafarmtotable.com/casa",
    image: "https://www.oliveafarmtotable.com/images/og/casa.jpg",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Valle de Guadalupe",
      addressRegion: "BC",
      addressCountry: "MX"
    },
    telephone: "+52 646 123 4567",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Garden tours", value: true },
      { "@type": "LocationFeatureSpecification", name: "Gastronomic hotel", value: true }
    ]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hotel) }} />;
}
