// app/(main)/[lang]/journal/head.tsx
import { SITE, absoluteUrl } from "@/lib/site";
import { listJournalIndex } from "@/lib/journal/load";

export default async function Head({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = raw === "es" ? "es" : "en";

  const orgId = `${SITE.baseUrl}#organization`;
  const websiteId = `${SITE.baseUrl}#website`;

  const path = `/${lang}/journal`;
  const url = absoluteUrl(path);

  // Keep this lightweight (top 10 is enough for discovery)
  let posts: Array<{ slug: string; title?: string }> = [];
  try {
    const index = await listJournalIndex(lang);
    posts = index.slice(0, 10).map((p) => ({ slug: p.slug, title: p.title }));
  } catch {
    posts = [];
  }

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${url}#blog`,
    name: "Olivea Journal",
    url,
    inLanguage: lang === "es" ? "es-MX" : "en-US",
    publisher: { "@id": orgId },
    isPartOf: { "@id": websiteId },
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    name: "Olivea Journal",
    url,
    isPartOf: { "@id": websiteId },
    about: { "@id": orgId },
  };

  const itemListLd =
    posts.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${url}#itemlist`,
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: posts.length,
          itemListElement: posts.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(`/${lang}/journal/${p.slug}`),
            name: p.title ?? `Post ${i + 1}`,
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      {itemListLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      ) : null}
    </>
  );
}
