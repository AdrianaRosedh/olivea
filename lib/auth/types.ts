// lib/auth/types.ts
// ─────────────────────────────────────────────────────────────────────
// Shared auth types for the admin portal.
// Roseiies-style permission system with per-section overrides.
// ─────────────────────────────────────────────────────────────────────

/** Global roles ordered by privilege level (highest first) */
export type AdminRole = "owner" | "manager" | "editor" | "host";

export const ROLE_HIERARCHY: AdminRole[] = ["owner", "manager", "editor", "host"];

export const ROLE_LABELS: Record<AdminRole, string> = {
  owner: "Dueño",
  manager: "Manager",
  editor: "Editor",
  host: "Host",
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  owner: "Full access to everything — content, team, settings, billing",
  manager: "Edit & delete content, manage settings, no team management",
  editor: "Edit content only — no delete, no settings",
  host: "View-only access with chat capabilities",
};

/** Section-level access levels (like Roseiies: Maestro/Editor/Lector/Oculto) */
export type SectionAccess = "maestro" | "editor" | "viewer" | "hidden";

export const SECTION_ACCESS_HIERARCHY: SectionAccess[] = ["maestro", "editor", "viewer", "hidden"];

export const SECTION_ACCESS_LABELS: Record<SectionAccess, string> = {
  maestro: "Maestro",
  editor: "Editor",
  viewer: "Lector",
  hidden: "Oculto",
};

export const SECTION_ACCESS_DESCRIPTIONS: Record<SectionAccess, string> = {
  maestro: "Full control — create, edit, delete, configure",
  editor: "Can create and edit, no delete or configure",
  viewer: "Read-only access",
  hidden: "Section is hidden from this user",
};

/** Admin sections that can have per-user permissions */
export interface AdminSection {
  key: string;
  label: string;
  icon: string;
  category: "pages" | "content" | "settings";
  /** Admin route to navigate to when section is clicked */
  href?: string;
}

export const ADMIN_SECTIONS: AdminSection[] = [
  // Pages
  { key: "pages.homepage",       label: "Homepage",       icon: "Video",           category: "pages",    href: "/admin/content/homepage" },
  { key: "pages.farmtotable",    label: "Farm to Table",  icon: "UtensilsCrossed", category: "pages",    href: "/admin/content/farm-to-table" },
  { key: "pages.casa",           label: "Casa",           icon: "Home",            category: "pages",    href: "/admin/content/casa" },
  { key: "pages.cafe",           label: "Café",           icon: "Coffee",          category: "pages",    href: "/admin/content/cafe" },
  { key: "pages.contact",        label: "Contact",        icon: "Mail",            category: "pages",    href: "/admin/content/contact" },
  { key: "pages.sustainability", label: "Sustainability", icon: "Leaf",            category: "pages",    href: "/admin/content/sustainability" },
  { key: "pages.press",          label: "Press",          icon: "Newspaper",       category: "pages",    href: "/admin/content/press" },
  { key: "pages.careers",        label: "Careers",        icon: "Briefcase",       category: "pages",    href: "/admin/content/careers" },
  { key: "pages.legal",          label: "Legal",          icon: "Scale",           category: "pages",    href: "/admin/content/legal" },
  { key: "pages.team",           label: "Team",           icon: "Users",           category: "pages",    href: "/admin/content/team" },
  { key: "pages.notfound",       label: "404 Page",       icon: "AlertCircle",     category: "pages",    href: "/admin/content/not-found" },
  // Content
  { key: "content.journal",      label: "Journal",        icon: "BookOpen",        category: "content",  href: "/admin/journal" },
  { key: "content.popups",       label: "Popups",         icon: "Bell",            category: "content",  href: "/admin/popups" },
  { key: "content.banners",      label: "Banners",        icon: "Flag",            category: "content",  href: "/admin/banners" },
  { key: "content.casafaq",      label: "Casa FAQ",       icon: "HelpCircle",      category: "content",  href: "/admin/content/casa-faq" },
  { key: "content.media",        label: "Media",          icon: "Image",           category: "content",  href: "/admin/media" },
  // Settings
  { key: "settings.global",      label: "Global",         icon: "Globe",           category: "settings", href: "/admin/content/global" },
  { key: "settings.navigation",  label: "Navigation",     icon: "Menu",            category: "settings", href: "/admin/content/drawer" },
  { key: "settings.footer",      label: "Footer",         icon: "PanelBottom",     category: "settings", href: "/admin/content/footer" },
  { key: "settings.promotions",  label: "Promotions",     icon: "Megaphone",       category: "settings", href: "/admin/promotions" },
  { key: "settings.hours",       label: "Hours",          icon: "Clock",           category: "settings", href: "/admin/hours" },
];

/** Per-section permission overrides stored as JSON */
export type SectionPermissions = Record<string, SectionAccess>;

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
  lastActiveAt?: string;
  createdAt?: string;
  sectionPermissions?: SectionPermissions;
}

/* ── Permission helpers ── */

/** Check if a role has at least the given privilege level */
export function hasRole(userRole: AdminRole, requiredRole: AdminRole): boolean {
  return ROLE_HIERARCHY.indexOf(userRole) <= ROLE_HIERARCHY.indexOf(requiredRole);
}

/** Get default section access for a global role */
export function defaultSectionAccess(role: AdminRole): SectionAccess {
  switch (role) {
    case "owner": return "maestro";
    case "manager": return "editor";
    case "editor": return "editor";
    case "host": return "viewer";
  }
}

/** Get effective access level for a section (override or role default) */
export function getSectionAccess(
  role: AdminRole,
  sectionKey: string,
  overrides?: SectionPermissions
): SectionAccess {
  return overrides?.[sectionKey] ?? defaultSectionAccess(role);
}

/** Check if user can access a section at minimum level */
export function canAccessSection(
  role: AdminRole,
  sectionKey: string,
  minAccess: SectionAccess,
  overrides?: SectionPermissions
): boolean {
  const access = getSectionAccess(role, sectionKey, overrides);
  return SECTION_ACCESS_HIERARCHY.indexOf(access) <= SECTION_ACCESS_HIERARCHY.indexOf(minAccess);
}

/** Can this role edit content (pages, popups, banners, etc.)? */
export function canEdit(role: AdminRole): boolean {
  return hasRole(role, "editor");
}

/** Can this role delete content? */
export function canDelete(role: AdminRole): boolean {
  return hasRole(role, "manager");
}

/** Can this role manage team members? */
export function canManageTeam(role: AdminRole): boolean {
  return role === "owner";
}

/** Can this role access chat? */
export function canAccessChat(role: AdminRole): boolean {
  return hasRole(role, "host");
}

/** Can this role change site settings? */
export function canManageSettings(role: AdminRole): boolean {
  return hasRole(role, "manager");
}
