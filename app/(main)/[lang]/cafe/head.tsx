import { canonicalUrl } from "@/lib/site";
import { ENTITY_IDS } from "@/components/seo/StructuredDataServer";

/**
 * Olivea Café page-level head.
 *
 * The full CafeOrCoffeeShop entity lives in StructuredDataServer (the @graph).
 * This file adds WebPage + BreadcrumbList for page hierarchy + sitelinks.
 */
export default function Head() {
  const url = canonicalUrl("/es/cafe");

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: "Olivea Café | Farm Breakfast & Specialty Coffee",
    description:
      "Specialty coffee, house bread, and farm breakfast in Valle de Guadalupe, Baja California. Part of the Olivea farm hospitality ecosystem.",
    isPartOf: { "@id": ENTITY_IDS.website },
    about: { "@id": ENTITY_IDS.cafe },
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
        name: "Olivea Café",
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
