import { absoluteUrl } from "@/lib/site";

export default function Head() {
  const hotel = {
    "@context": "https://schema.org",
    "@type": "Cafe",
    name: "OLIVEA Café",
    url: absoluteUrl("/cafe"),
    image: absoluteUrl("/images/og/cafe.jpg"),
    // ...
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hotel) }} />;
}
