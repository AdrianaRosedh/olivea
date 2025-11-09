import { absoluteUrl } from "@/lib/site";

export default function Head() {
  const hotel = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "OLIVEA Farm To Table",
    url: absoluteUrl("/farmtotable"),
    image: absoluteUrl("/images/og/farmtotable.jpg"),
    // ...
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hotel) }} />;
}
