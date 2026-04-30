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

export interface CategoryItem {
  label: string;
  href: string;
  icon: string; // lucide icon name — resolved in the component
  description: string;
}

export const categoryMeta: Record<AdminCategory, { label: string; description: string }> = {
  dashboard: {
    label: "Today",
    description: "What's live right now, plus quick actions",
  },
  daily: {
    label: "Daily Updates",
    description: "Things you post or toggle often — specials, banners, journal, hours",
  },
  pages: {
    label: "Brand & Pages",
    description: "Editorial content for every page on the public site",
  },
  setup: {
    label: "Setup",
    description: "Brand identity, navigation, footer, legal — rarely changes",
  },
};

export const categoryItems: Record<AdminCategory, CategoryItem[]> = {
  dashboard: [], // Dashboard has its own layout
  // Daily/weekly cadence — the stuff that drives visitors today.
  daily: [
    { label: "Specials & Announcements", href: "/admin/popups",            icon: "Bell",       description: "Pop-up messages shown to visitors (today's special, event reminder)" },
    { label: "Site Banners",             href: "/admin/banners",           icon: "Flag",       description: "Top-of-page banners (sale, holiday hours, urgent notice)" },
    { label: "Promotions",               href: "/admin/promotions",        icon: "Megaphone",  description: "Time-limited offers shown across selected pages" },
    { label: "Journal",                  href: "/admin/journal",           icon: "BookOpen",   description: "Long-form articles and stories — full draft/publish workflow" },
    { label: "Operating Hours",          href: "/admin/hours",             icon: "Clock",      description: "Hours of operation shown on the live status badge and footer" },
    { label: "Photos & Media",           href: "/admin/media",             icon: "Image",      description: "Upload images for use anywhere on the site" },
  ],
  // Page editors — the editorial content per public page.
  pages: [
    { label: "Homepage",                 href: "/admin/content/homepage",       icon: "Video",           description: "Hero video, headline, and section cards on the home page" },
    { label: "Casa Olivea",              href: "/admin/content/casa",           icon: "Home",            description: "Farm-stay hotel page — hero, sections, gallery" },
    { label: "Casa FAQ",                 href: "/admin/content/casa-faq",       icon: "HelpCircle",      description: "Casa Olivea questions & answers (separate editor with reorder)" },
    { label: "Olivea Farm to Table",     href: "/admin/content/farm-to-table",  icon: "UtensilsCrossed", description: "MICHELIN restaurant page — hero, sections, FAQ" },
    { label: "Olivea Café",              href: "/admin/content/cafe",           icon: "Coffee",          description: "Daytime café & padel page — hero, sections, FAQ" },
    { label: "Sustainability",           href: "/admin/content/sustainability", icon: "Leaf",            description: "Philosophy and sustainability practices" },
    { label: "Press",                    href: "/admin/content/press",          icon: "Newspaper",       description: "Press chrome — hero text and tagline (awards live in MDX files)" },
    { label: "Team Page",                href: "/admin/content/team",           icon: "Users",           description: "Public team page meta + roster (JSON editor)" },
    { label: "Contact",                  href: "/admin/content/contact",        icon: "Mail",            description: "Contact info, addresses, social, form labels" },
    { label: "Careers",                  href: "/admin/content/careers",        icon: "Briefcase",       description: "Careers page chrome plus active job openings" },
  ],
  // Site setup — rarely changed.
  setup: [
    { label: "Brand & Identity",         href: "/admin/content/global",   icon: "Globe",       description: "Site name, tagline, social URLs, default OG image, contact info" },
    { label: "Mobile Navigation",        href: "/admin/content/drawer",   icon: "Menu",        description: "Items shown in the mobile drawer menu" },
    { label: "Footer",                   href: "/admin/content/footer",   icon: "PanelBottom", description: "Footer copy and link groups" },
    { label: "Legal Pages",              href: "/admin/content/legal",    icon: "Scale",       description: "Privacy policy, terms, cookie statement" },
    { label: "404 Page",                 href: "/admin/content/not-found",icon: "AlertCircle", description: "Message shown when a visitor hits a missing page" },
    { label: "Audit Log",                href: "/admin/audit-log",        icon: "ScrollText",  description: "Who edited what, and when" },
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
