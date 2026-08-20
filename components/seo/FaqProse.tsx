// components/seo/FaqProse.tsx
//
// Renders FAQ entries as real text inside the server-side article.
//
// Structured data is supposed to describe what a page says. Questions that
// live only in JSON-LD assert answers the document never contains — so the
// ones written for search get rendered here, in the crawler-facing article,
// rather than declared in markup and nowhere else.

import type { FaqItem } from "./FaqJsonLd";

export default function FaqProse({
  items,
  heading,
  label,
}: {
  items: FaqItem[];
  heading: string;
  label: string;
}) {
  if (!items?.length) return null;

  return (
    <section aria-label={label}>
      <h2>{heading}</h2>
      <dl>
        {items.map((item) => (
          <div key={item.q}>
            <dt>{item.q}</dt>
            <dd>{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
