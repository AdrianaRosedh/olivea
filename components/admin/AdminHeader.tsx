"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Plus, ExternalLink } from "lucide-react";

const pageTitles: Record<string, string> = {
  // Main sections
  "/admin": "Dashboard",
  "/admin/menu": "Food Menu",
  "/admin/journal": "Journal",
  "/admin/media": "Media Library",
  "/admin/hours": "Hours & Availability",
  "/admin/team": "Team",
  "/admin/banners": "Banners",
  "/admin/popups": "Popups",
  // Hub pages
  "/admin/pages": "Pages",
  "/admin/content-hub": "Content",
  "/admin/site-settings": "Settings",
  // Content editors
  "/admin/content/homepage": "Homepage",
  "/admin/content/farm-to-table": "Farm to Table",
  "/admin/content/casa": "Casa",
  "/admin/content/cafe": "Café",
  "/admin/content/contact": "Contact",
  "/admin/content/sustainability": "Sustainability",
  "/admin/content/press": "Press",
  "/admin/content/careers": "Careers",
  "/admin/content/legal": "Legal",
  "/admin/content/team": "Team Page",
  "/admin/content/not-found": "404 Page",
  "/admin/content/casa-faq": "Casa FAQ",
  "/admin/content/drawer": "Navigation",
  "/admin/content/footer": "Footer",
  "/admin/content/global": "Global Settings",
};

const pageDescriptions: Record<string, string> = {
  "/admin": "Welcome back. Here\u2019s what\u2019s happening.",
  "/admin/menu": "Your 9-course tasting menu.",
  "/admin/journal": "Stories from the garden.",
  "/admin/media": "Upload and manage images.",
  "/admin/hours": "Operating hours and special closures.",
  "/admin/team": "Manage team members and roles.",
  "/admin/banners": "Promotional banners across the site.",
  "/admin/popups": "Site popup announcements.",
  "/admin/pages": "Edit text and images across the site.",
  "/admin/content-hub": "Journal, popups, banners, FAQ, and media.",
  "/admin/site-settings": "Global settings, navigation, and footer.",
  "/admin/content/homepage": "Hero video and homepage content.",
  "/admin/content/farm-to-table": "Restaurant page content.",
  "/admin/content/casa": "Farm stay page content.",
  "/admin/content/cafe": "Café page content.",
  "/admin/content/contact": "Contact info and form settings.",
  "/admin/content/sustainability": "Sustainability page.",
  "/admin/content/press": "Press features and mentions.",
  "/admin/content/careers": "Job openings and careers page.",
  "/admin/content/legal": "Privacy policy and terms.",
  "/admin/content/team": "Team members page.",
  "/admin/content/not-found": "Custom not-found page.",
  "/admin/content/casa-faq": "Frequently asked questions for Casa.",
  "/admin/content/drawer": "Main navigation drawer links.",
  "/admin/content/footer": "Footer content and links.",
  "/admin/content/global": "Site-wide settings and defaults.",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Admin";
  const description = pageDescriptions[pathname] ?? "";
  const showAddButton = ["/admin/journal"].includes(pathname);

  return (
    <header className="
      sticky top-0 z-30
      flex items-center justify-between px-8 py-5
      border-b border-[var(--olivea-olive)]/[0.06]
      bg-white/40 backdrop-blur-xl
    ">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h1 className="text-xl font-semibold text-[var(--olivea-ink)]">{title}</h1>
        {description && (
          <p className="text-sm text-[var(--olivea-clay)] mt-0.5">{description}</p>
        )}
      </motion.div>

      <div className="flex items-center gap-2">
        {/* EN VIVO — live site preview */}
        <a
          href="https://oliveafarmtotable.com"
          target="_blank"
          rel="noopener noreferrer"
          className="
            group flex items-center gap-2 px-3.5 py-2 rounded-xl
            text-xs font-medium
            text-[var(--olivea-olive)] hover:text-[var(--olivea-ink)]
            bg-white/50 hover:bg-white/80
            border border-[var(--olivea-olive)]/[0.06] hover:border-[var(--olivea-olive)]/10
            transition-all duration-200
          "
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-wide">EN VIVO</span>
          <ExternalLink size={11} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>

        {showAddButton && (
          <button className="
            flex items-center gap-2 px-4 py-2 rounded-xl
            bg-[var(--olivea-olive)] text-white text-sm font-medium
            hover:bg-[var(--olivea-olive)]/90 transition-colors
            shadow-[0_2px_12px_rgba(94,118,88,0.2)]
          ">
            <Plus size={16} />
            <span>Add new</span>
          </button>
        )}

        <button className="
          relative p-2.5 rounded-xl
          text-[var(--olivea-olive)]/70 hover:text-[var(--olivea-olive)]
          hover:bg-[var(--olivea-cream)]/50
          transition-all
        ">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--olivea-olive)] rounded-full" />
        </button>
      </div>
    </header>
  );
}
