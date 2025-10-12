export default function Head() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OLIVEA",
    url: "https://www.oliveafarmtotable.com",
    logo: "https://www.oliveafarmtotable.com/images/logos/olivea-mark.png",
    sameAs: [
      "https://www.instagram.com/oliveafarmtotable",
      "https://www.tiktok.com/@familiaolivea",
      "https://www.youtube.com/@grupoolivea"
    ]
  };

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OLIVEA",
    url: "https://www.oliveafarmtotable.com",
    inLanguage: "es-MX",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.oliveafarmtotable.com/es?search={query}",
      "query-input": "required name=query"
    }
  };

  return (
    <>
      {/* perf preconnects optional */}
      <link rel="preconnect" href="https://www.oliveafarmtotable.com" crossOrigin="" />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }} />
    </>
  );
}
