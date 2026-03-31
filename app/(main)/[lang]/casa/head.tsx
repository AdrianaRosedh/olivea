import { canonicalUrl } from "@/lib/site";
import { ENTITY_IDS } from "@/components/seo/StructuredDataServer";

/**
 * Casa Olivea page-level head.
 *
 * The full LodgingBusiness entity lives in StructuredDataServer (the @graph).
 * This file adds a lightweight WebPage + BreadcrumbList so Google
 * understands the page hierarchy and can generate sitelinks.
 */
export default function Head() {
  const url = canonicalUrl("/es/casa");

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: "Casa Olivea | Farm Stay in Valle de Guadalupe",
    description:
      "Farm stay integrated with a working garden and MICHELIN-starred restaurant in Valle de Guadalupe, Baja California.",
    isPartOf: { "@id": ENTITY_IDS.website },
    about: { "@id": ENTITY_IDS.hotel },
    breadcrumb: { "@id": `${url}#breadcrumb` },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "OLIVEA",
        item: canonicalUrl("/es"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Casa Olivea",
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
