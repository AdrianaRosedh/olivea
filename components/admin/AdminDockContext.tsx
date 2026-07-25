"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

/* ── Admin navigation categories ──
   Reorganized by INTENT, not data structure:
     - dashboard:  "Today" — what's live right now + quick actions
     - daily:      Things you might post or toggle this week (popups, banners,
                   journal articles, hours).
     - pages:      The brand pages — content that lives on each public page.
     - setup:      Site-wide settings that change rarely (footer, legal, contact,
                   navigation, brand identity).
   The previous "content" + "settings" bucket was confusing; "daily" surfaces
   the high-frequency tasks first.
*/
export type AdminCategory = "dashboard" | "daily" | "pages" | "setup";

/** Bilingual admin string (resolved via useAdminLocale().t) */
type B = { es: string; en: string };

export interface CategoryItem {
  label: B;
  href: string;
  icon: string; // lucide icon name — resolved in the component
  description: B;
}

export const categoryMeta: Record<AdminCategory, { label: B; description: B }> = {
  dashboard: {
    label: { es: "Hoy", en: "Today" },
    description: { es: "Lo que está en vivo ahora, más acciones rápidas", en: "What's live right now, plus quick actions" },
  },
  daily: {
    label: { es: "Actualizaciones", en: "Daily Updates" },
    description: { es: "Lo que publicas o activas seguido — especiales, banners, cuaderno, horarios", en: "Things you post or toggle often — specials, banners, journal, hours" },
  },
  pages: {
    label: { es: "Marca y Páginas", en: "Brand & Pages" },
    description: { es: "El contenido editorial de cada página del sitio público", en: "Editorial content for every page on the public site" },
  },
  setup: {
    label: { es: "Configuración", en: "Setup" },
    description: { es: "Identidad de marca, navegación, footer, legal — cambia poco", en: "Brand identity, navigation, footer, legal — rarely changes" },
  },
};

export const categoryItems: Record<AdminCategory, CategoryItem[]> = {
  dashboard: [], // Dashboard has its own layout
  // Daily/weekly cadence — the stuff that drives visitors today.
  daily: [
    { href: "/admin/popups",  icon: "Bell", label: { es: "Especiales y Anuncios", en: "Specials & Announcements" }, description: { es: "Mensajes emergentes para visitantes (especial del día, recordatorio de evento)", en: "Pop-up messages shown to visitors (today's special, event reminder)" } },
    { href: "/admin/banners", icon: "Flag", label: { es: "Banners del Sitio", en: "Site Banners" }, description: { es: "Barras arriba de la página (promoción, horario especial, aviso urgente)", en: "Top-of-page banners (sale, holiday hours, urgent notice)" } },
    { href: "/admin/promotions", icon: "Megaphone", label: { es: "Promociones", en: "Promotions" }, description: { es: "Ofertas por tiempo limitado en páginas seleccionadas", en: "Time-limited offers shown across selected pages" } },
    { href: "/admin/journal", icon: "BookOpen", label: { es: "Cuaderno", en: "Journal" }, description: { es: "Artículos e historias — flujo completo de borrador a publicado", en: "Long-form articles and stories — full draft/publish workflow" } },
    { href: "/admin/menu", icon: "UtensilsCrossed", label: { es: "Menús y Enlaces", en: "Menus & Links" }, description: { es: "Los menús en vivo — pestañas del degustación, carta de vinos, menú del café", en: "The live menu embeds — tasting menu tabs, wine list, café menu" } },
    { href: "/admin/press", icon: "Newspaper", label: { es: "Prensa y Reconocimientos", en: "Press Coverage" }, description: { es: "Premios y menciones que aparecen en la página de prensa", en: "Awards & mentions shown on the press page" } },
    { href: "/admin/hours", icon: "Clock", label: { es: "Horarios", en: "Operating Hours" }, description: { es: "Horarios de operación del distintivo en vivo y el pie de página", en: "Hours of operation shown on the live status badge and footer" } },
    { href: "/admin/media", icon: "Image", label: { es: "Fotos y Medios", en: "Photos & Media" }, description: { es: "Sube imágenes para usar en cualquier parte del sitio", en: "Upload images for use anywhere on the site" } },
  ],
  // Page editors — the editorial content per public page.
  pages: [
    { href: "/admin/content/homepage", icon: "Video", label: { es: "Página de Inicio", en: "Homepage" }, description: { es: "Video principal, titular y tarjetas de sección del inicio", en: "Hero video, headline, and section cards on the home page" } },
    { href: "/admin/content/casa", icon: "Home", label: { es: "Casa Olivea", en: "Casa Olivea" }, description: { es: "Página del hospedaje — hero, secciones, galería", en: "Farm-stay hotel page — hero, sections, gallery" } },
    { href: "/admin/content/casa-faq", icon: "HelpCircle", label: { es: "Preguntas de Casa", en: "Casa FAQ" }, description: { es: "Preguntas y respuestas de Casa Olivea (editor con reordenamiento)", en: "Casa Olivea questions & answers (separate editor with reorder)" } },
    { href: "/admin/content/farm-to-table", icon: "UtensilsCrossed", label: { es: "Olivea Farm to Table", en: "Olivea Farm to Table" }, description: { es: "Página del restaurante MICHELIN — hero, secciones, preguntas", en: "MICHELIN restaurant page — hero, sections, FAQ" } },
    { href: "/admin/content/cafe", icon: "Coffee", label: { es: "Olivea Café Wine Bar", en: "Olivea Café Wine Bar" }, description: { es: "Página del café y pádel — hero, secciones, preguntas", en: "Daytime café & padel page — hero, sections, FAQ" } },
    { href: "/admin/content/sustainability", icon: "Leaf", label: { es: "Filosofía", en: "Sustainability" }, description: { es: "Filosofía y prácticas de sostenibilidad", en: "Philosophy and sustainability practices" } },
    { href: "/admin/content/press", icon: "Newspaper", label: { es: "Página de Prensa", en: "Press" }, description: { es: "Textos de la página de prensa — titular y lema", en: "Press chrome — hero text and tagline" } },
    { href: "/admin/content/team", icon: "Users", label: { es: "Página del Equipo", en: "Team Page" }, description: { es: "Meta de la página pública del equipo + roster (editor JSON)", en: "Public team page meta + roster (JSON editor)" } },
    { href: "/admin/content/contact", icon: "Mail", label: { es: "Contacto", en: "Contact" }, description: { es: "Información de contacto, direcciones, redes, etiquetas del formulario", en: "Contact info, addresses, social, form labels" } },
    { href: "/admin/content/careers", icon: "Briefcase", label: { es: "Trabaja con Nosotros", en: "Careers" }, description: { es: "Página de carreras y vacantes activas", en: "Careers page chrome plus active job openings" } },
    { href: "/admin/content/innovation", icon: "Sparkles", label: { es: "Innovación", en: "Innovation" }, description: { es: "La página de innovación — laboratorio, roseiies y el método", en: "The innovation page — laboratory, roseiies, and the method" } },
    { href: "/admin/content/roseiies", icon: "Globe", label: { es: "roseiies", en: "roseiies" }, description: { es: "La página del estudio roseiies — fundadora, secciones, principios", en: "The roseiies studio page — founder story, sections, principles" } },
  ],
  // Site setup — rarely changed.
  setup: [
    { href: "/admin/content/global", icon: "Globe", label: { es: "Marca e Identidad", en: "Brand & Identity" }, description: { es: "Nombre del sitio, lema, redes sociales, imagen OG, contacto", en: "Site name, tagline, social URLs, default OG image, contact info" } },
    { href: "/admin/content/drawer", icon: "Menu", label: { es: "Navegación Móvil", en: "Mobile Navigation" }, description: { es: "Elementos del menú móvil desplegable", en: "Items shown in the mobile drawer menu" } },
    { href: "/admin/content/footer", icon: "PanelBottom", label: { es: "Pie de Página", en: "Footer" }, description: { es: "Textos y grupos de enlaces del pie de página", en: "Footer copy and link groups" } },
    { href: "/admin/content/legal", icon: "Scale", label: { es: "Páginas Legales", en: "Legal Pages" }, description: { es: "Aviso de privacidad, términos y cookies", en: "Privacy policy, terms, cookie statement" } },
    { href: "/admin/content/not-found", icon: "AlertCircle", label: { es: "Página 404", en: "404 Page" }, description: { es: "Mensaje cuando un visitante llega a una página inexistente", en: "Message shown when a visitor hits a missing page" } },
    { href: "/admin/audit-log", icon: "ScrollText", label: { es: "Registro de Cambios", en: "Audit Log" }, description: { es: "Quién editó qué, y cuándo", en: "Who edited what, and when" } },
    { href: "/admin/secure-docs", icon: "Fingerprint", label: { es: "Documentos Seguros", en: "Secure Documents" }, description: { es: "Sube documentos con QR, código y expiración; revisa quién los abrió", en: "Upload documents with QR, passcode & expiry; review who opened them" } },
  ],
};

/* ── Context ── */

interface DockContextValue {
  expanded: boolean;
  toggle: () => void;
  activeCategory: AdminCategory;
  setActiveCategory: (cat: AdminCategory) => void;
}

const DockContext = createContext<DockContextValue>({
  expanded: false,
  toggle: () => {},
  activeCategory: "dashboard",
  setActiveCategory: () => {},
});

/** Hub route → category mapping
 *  Hub URLs continue to work but map to the new category labels. The legacy
 *  hub paths are kept so existing bookmarks don't break. */
const hubRoutes: Record<string, AdminCategory> = {
  "/admin/pages": "pages",
  "/admin/content-hub": "daily",
  "/admin/site-settings": "setup",
};

/** Map any pathname to its parent category */
function categoryFromPath(pathname: string): AdminCategory {
  // Check hub routes first
  for (const [route, cat] of Object.entries(hubRoutes)) {
    if (pathname === route || pathname.startsWith(route + "/")) return cat;
  }
  // Check each category's items
  for (const [cat, items] of Object.entries(categoryItems) as [AdminCategory, CategoryItem[]][]) {
    if (items.some((item) => pathname.startsWith(item.href))) {
      return cat;
    }
  }
  return "dashboard";
}

export function DockProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded((prev) => !prev), []);
  const [activeCategory, setActiveCategory] = useState<AdminCategory>("dashboard");

  const value = useMemo(
    () => ({ expanded, toggle, activeCategory, setActiveCategory }),
    [expanded, toggle, activeCategory]
  );

  return (
    <DockContext.Provider value={value}>
      {children}
    </DockContext.Provider>
  );
}

export function useDock() {
  return useContext(DockContext);
}

export { categoryFromPath };
