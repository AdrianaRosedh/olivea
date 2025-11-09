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
      <link rel="preconnect" href={SITE.baseUrl} crossOrigin="" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }} />
    </>
  );
}