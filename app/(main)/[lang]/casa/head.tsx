import { absoluteUrl } from "@/lib/site";

export default function Head() {
  const hotel = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "Casa Olivea",
    url: absoluteUrl("/casa"),
    image: absoluteUrl("/images/og/casa.jpg"),
    // ...
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hotel) }} />;
}
