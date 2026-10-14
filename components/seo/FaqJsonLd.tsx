// components/seo/FaqJsonLd.tsx
import { jsonLdHtml } from "@/lib/seo/json-ld";

export type FaqItem = { q: string; a: string };

export default function FaqJsonLd({ id, items }: { id: string; items: FaqItem[] }) {
  if (!items?.length) return null;

  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": id,
    mainEntity: items.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdHtml(json) }}
    />
  );
}
