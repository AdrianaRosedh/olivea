import { SITE, absoluteUrl } from "@/lib/site";

export default function Head() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OLIVEA",
    url: SITE.baseUrl,
    logo: absoluteUrl("/images/logos/olivea-mark.png"),
    sameAs: [
      "https://www.instagram.com/oliveafarmtotable",
      "https://www.tiktok.com/@familiaolivea",
      "https://www.youtube.com/@grupoolivea",
    ],
  };

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OLIVEA",
    url: SITE.baseUrl,
    inLanguage: "es-MX",
    potentialAction: {
      "@type": "SearchAction",
      target: absoluteUrl("/es?search={query}"),
      "query-input": "required name=query",
    },
  };

  return (
    <>
      {/* Existing preconnect to your own origin */}
      <link rel="preconnect" href={SITE.baseUrl} crossOrigin="" />

      {/* New: preconnects to Cloudbeds for faster Immersive loading */}
      <link
        rel="preconnect"
        href="https://static1.cloudbeds.com"
        crossOrigin=""
      />
      <link
        rel="preconnect"
        href="https://hotels.cloudbeds.com"
        crossOrigin=""
      />

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
