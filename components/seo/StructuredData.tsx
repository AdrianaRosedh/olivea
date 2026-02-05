// components/seo/StructuredData.tsx
// Backwards-compatible wrapper.
// If any route still imports "@/components/seo/StructuredData",
// we render the server JSON-LD graph so crawlers/AI always see it.

import StructuredDataServer from "@/components/seo/StructuredDataServer";

export default function StructuredData() {
  return <StructuredDataServer />;
}
