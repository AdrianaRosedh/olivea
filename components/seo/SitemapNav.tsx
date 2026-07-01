// components/seo/SitemapNav.tsx
//
// Always-rendered, screen-reader-accessible navigation landmark.
//
// Why this exists: Olivea's visual navigation is a tap-to-open drawer that is
// NOT in the DOM until a visitor opens it (`{isOpen && …}`). Search crawlers
// never tap, so on a normal page load they only saw the handful of in-content
// links — which is why Search Console reported very few internal links. This
// component renders real <a href> links to every primary page on every page
// load, giving crawlers (and assistive-tech users) the full internal link
// graph. It is a genuine accessibility nav (sr-only keeps it available to
// screen readers), not hidden-for-SEO markup.
//
// Server Component (no "use client") → the anchors are part of the server-
// rendered output, not gated behind any client interaction.
import Link from "next/link";

type Lang = "en" | "es";

type Item = { path: string; en: string; es: string };

// Mirrors the indexable routes in app/sitemap.ts (keep in sync).
const ITEMS: Item[] = [
  { path: "", en: "Home", es: "Inicio" },
  { path: "/farmtotable", en: "Olivea Farm To Table", es: "Olivea Farm To Table" },
  { path: "/casa", en: "Casa Olivea", es: "Casa Olivea" },
  { path: "/cafe", en: "Olivea Café", es: "Olivea Café" },
  { path: "/menu", en: "Menu", es: "Menú" },
  { path: "/sustainability", en: "Philosophy & Sustainability", es: "Filosofía y sostenibilidad" },
  { path: "/team", en: "Team", es: "Equipo" },
  { path: "/press", en: "Press", es: "Prensa" },
  { path: "/journal", en: "Journal", es: "Cuaderno" },
  { path: "/innovation", en: "Innovation", es: "Innovación" },
  { path: "/roseiies", en: "roseiies", es: "roseiies" },
  { path: "/contact", en: "Contact", es: "Contacto" },
  { path: "/carreras", en: "Careers", es: "Carreras" },
  { path: "/about", en: "About", es: "Nosotros" },
  { path: "/legal", en: "Privacy & Terms", es: "Privacidad y términos" },
];

export default function SitemapNav({ lang }: { lang: Lang }) {
  const label = lang === "es" ? "Mapa del sitio Olivea" : "Olivea site map";
  return (
    <nav aria-label={label} className="sr-only">
      <ul>
        {ITEMS.map((it) => (
          <li key={it.path || "home"}>
            <Link href={`/${lang}${it.path}`}>{lang === "es" ? it.es : it.en}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
