"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

/* ── Admin navigation categories ── */
export type AdminCategory = "dashboard" | "pages" | "content" | "settings";

export interface CategoryItem {
  label: string;
  href: string;
  icon: string; // lucide icon name — resolved in the component
  description: string;
}

export const categoryMeta: Record<AdminCategory, { label: string; description: string }> = {
  dashboard: { label: "Dashboard", description: "Overview and recent activity" },
  pages:     { label: "Pages", description: "Edit content for each page of the site" },
  content:   { label: "Content", description: "Journal, popups, banners, FAQ, and media" },
  settings:  { label: "Settings", description: "Global settings, navigation, and footer" },
};

export const categoryItems: Record<AdminCategory, CategoryItem[]> = {
  dashboard: [], // Dashboard has its own layout
  pages: [
    { label: "Homepage",       href: "/admin/content/homepage",        icon: "Video",           description: "Hero video and homepage content" },
    { label: "Farm to Table",  href: "/admin/content/farm-to-table",   icon: "UtensilsCrossed", description: "Restaurant page content" },
    { label: "Casa",           href: "/admin/content/casa",            icon: "Home",            description: "Farm stay page content" },
    { label: "Café",           href: "/admin/content/cafe",            icon: "Coffee",          description: "Café page content" },
    { label: "Contact",        href: "/admin/content/contact",         icon: "Mail",            description: "Contact info and form settings" },
    { label: "Sustainability", href: "/admin/content/sustainability",  icon: "Leaf",            description: "Sustainability page" },
    { label: "Press",          href: "/admin/content/press",           icon: "Newspaper",       description: "Press features and mentions" },
    { label: "Careers",        href: "/admin/content/careers",         icon: "Briefcase",       description: "Job openings and careers page" },
    { label: "Legal",          href: "/admin/content/legal",           icon: "Scale",           description: "Privacy policy and terms" },
    { label: "Team",           href: "/admin/content/team",            icon: "Users",           description: "Team members page" },
    { label: "404 Page",       href: "/admin/content/not-found",       icon: "AlertCircle",     description: "Custom not-found page" },
  ],
  content: [
    { label: "Journal",   href: "/admin/journal",            icon: "BookOpen",    description: "Blog posts and articles" },
    { label: "Popups",    href: "/admin/popups",             icon: "Bell",        description: "Site popup announcements" },
    { label: "Banners",   href: "/admin/banners",            icon: "Flag",        description: "Promotional site banners" },
    { label: "Casa FAQ",  href: "/admin/content/casa-faq",   icon: "HelpCircle",  description: "Frequently asked questions for Casa" },
    { label: "Media",     href: "/admin/media",              icon: "Image",       description: "Image library and uploads" },
  ],
  settings: [
    { label: "Global",     href: "/admin/content/global",  icon: "Globe",       description: "Site-wide settings and defaults" },
    { label: "Navigation", href: "/admin/content/drawer",  icon: "Menu",        description: "Main navigation drawer links" },
    { label: "Footer",     href: "/admin/content/footer",  icon: "PanelBottom", description: "Footer content and links" },
    { label: "Hours",      href: "/admin/hours",           icon: "Clock",       description: "Operating hours for all venues" },
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

/** Hub route → category mapping */
const hubRoutes: Record<string, AdminCategory> = {
  "/admin/pages": "pages",
  "/admin/content-hub": "content",
  "/admin/site-settings": "settings",
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
