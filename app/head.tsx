import { SITE, absoluteUrl } from "@/lib/site";

export default function Head() {
  const orgId = `${SITE.baseUrl}#organization`;

  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId,
    name: "Olivea",
    url: SITE.baseUrl,
    logo: absoluteUrl("/images/logos/olivea-mark.png"),
    sameAs: [
      "https://www.instagram.com/oliveafarmtotable",
      "https://www.tiktok.com/@familiaolivea",
      "https://www.youtube.com/@grupoolivea",
    ],
    hasPart: [
      { "@id": absoluteUrl("/cafe") + "#cafe" },
      { "@id": absoluteUrl("/casa") + "#hotel" },
      { "@id": absoluteUrl("/farmtotable") + "#restaurant" },
    ],
  };

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.baseUrl}#website`,
    name: "Olivea",
    url: SITE.baseUrl,
    inLanguage: "es-MX",
    publisher: { "@id": orgId },
    potentialAction: {
      "@type": "SearchAction",
      target: absoluteUrl("/es?search={query}"),
      "query-input": "required name=query",
    },
  };

  return (
    <>
      {/* Preconnects */}
      <link rel="preconnect" href={SITE.baseUrl} crossOrigin="" />
      <link rel="preconnect" href="https://static1.cloudbeds.com" crossOrigin="" />
      <link rel="preconnect" href="https://hotels.cloudbeds.com" crossOrigin="" />
      <link rel="preconnect" href="https://www.opentable.com" crossOrigin="" />
      <link rel="preconnect" href="https://www.opentable.com.mx" crossOrigin="" />

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }}
      />
    </>
  );
}
