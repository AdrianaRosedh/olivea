import { canonicalUrl } from "@/lib/site";
import { ENTITY_IDS } from "@/components/seo/StructuredDataServer";

/**
 * Olivea Farm To Table page-level head.
 *
 * The full Restaurant entity lives in StructuredDataServer (the @graph).
 * This file adds WebPage + BreadcrumbList for page hierarchy + sitelinks.
 */
export default function Head() {
  const url = canonicalUrl("/es/farmtotable");

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: "Olivea Farm To Table | MICHELIN-Starred Restaurant",
    description:
      "MICHELIN-starred tasting-menu restaurant with farm stay and café on the same property in Valle de Guadalupe, Baja California.",
    isPartOf: { "@id": ENTITY_IDS.website },
    about: { "@id": ENTITY_IDS.restaurant },
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
        name: "Olivea Farm To Table",
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
