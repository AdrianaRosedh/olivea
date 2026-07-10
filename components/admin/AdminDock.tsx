"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Settings,
  Search,
  LogOut,
  Users,
} from "lucide-react";
import ProfilePanel from "./ProfilePanel";
import {
  useDock,
  categoryFromPath,
  categoryMeta,
  categoryItems,
  type AdminCategory,
} from "./AdminDockContext";
import { usePalette } from "./CommandPalette";
import { useAuth } from "./AuthProvider";
import { mockUser } from "@/lib/admin/mock-user";
import type { AdminUser } from "@/lib/auth/types";
import { canSeeNavHref } from "@/lib/auth/types";
import { useAdminLocale, STR } from "@/lib/admin/i18n";

/* ─── Category definitions ─── */
interface CategoryDef {
  key: AdminCategory;
  icon: React.ElementType;
  href: string; // landing route for this category
}

const categories: CategoryDef[] = [
  { key: "dashboard", icon: LayoutDashboard, href: "/admin" },
  { key: "daily",     icon: Layers,          href: "/admin/content-hub" },
  { key: "pages",     icon: FileText,        href: "/admin/pages" },
  { key: "setup",     icon: Settings,        href: "/admin/site-settings" },
];

/* ─── Dock icon button ─── */
function DockIcon({
  cat,
  label,
  isActive,
  expanded,
}: {
  cat: CategoryDef;
  label: string;
  isActive: boolean;
  expanded: boolean;
}) {
  const Icon = cat.icon;

  return (
    <Link
      href={cat.href}
      className={`
        group relative flex items-center gap-3 rounded-2xl py-3
        transition-all duration-200 ease-out
        ${expanded ? "px-3" : "justify-center"}
        ${isActive
          ? "bg-[var(--olivea-olive)]/[0.10] text-[var(--olivea-olive)]"
          : "text-[var(--olivea-olive)]/50 hover:text-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)]/[0.04]"
        }
      `}
    >
      {/* Active indicator pill */}
      {isActive && (
        <motion.div
          layoutId="dock-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--olivea-olive)]"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      <Icon size={22} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />

      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip — only when collapsed */}
      {!expanded && (
        <div className="
          absolute left-full ml-3 px-3 py-1.5 rounded-lg
          bg-white text-[var(--olivea-ink)] text-xs font-medium
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-150
          whitespace-nowrap z-50
          shadow-[0_4px_16px_rgba(94,118,88,0.12)]
          border border-[var(--olivea-olive)]/[0.06]
        ">
          {label}
        </div>
      )}
    </Link>
  );
}

/* ─── Inline child pages for the active category ───
   When the dock is expanded, the active category's pages are listed
   right in the dock — one click to any editor, no hub detour. */
function CategoryChildren({ cat }: { cat: AdminCategory }) {
  const pathname = usePathname();
  const { t } = useAdminLocale();
  const { user } = useAuth();
  // Hide allowlist-only destinations (e.g. secure docs) from users without access.
  const items = categoryItems[cat].filter(
    (it) => !user || canSeeNavHref(user.role, it.href, user.sectionPermissions),
  );
  if (!items.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="ml-[13px] border-l border-[var(--olivea-olive)]/[0.10] pl-2 py-1 space-y-0.5">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={t(item.description)}
              className={`block rounded-lg px-2.5 py-1.5 text-[12px] leading-snug truncate transition-colors ${
                active
                  ? "bg-[var(--olivea-olive)]/[0.10] text-[var(--olivea-olive)] font-medium"
                  : "text-[var(--olivea-ink)]/55 hover:text-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)]/[0.04]"
              }`}
            >
              {t(item.label)}
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Main Dock ─── */
export default function AdminDock() {
  const pathname = usePathname();
  const { expanded, toggle, setActiveCategory, activeCategory } = useDock();
  const { open: openPalette } = usePalette();
  const { user: authUser, signOut: handleSignOut } = useAuth();
  const { t } = useAdminLocale();
  const [profileOpen, setProfileOpen] = useState(false);
  // Use real auth user if available, fall back to mockUser for dev
  const [user, setUser] = useState<AdminUser>(authUser ?? mockUser);

  // Keep user in sync with auth state
  useEffect(() => {
    if (authUser) setUser(authUser);
  }, [authUser]);

  // Sync active category from URL
  useEffect(() => {
    const cat = categoryFromPath(pathname);
    setActiveCategory(cat);
  }, [pathname, setActiveCategory]);

  // Don't highlight any category dock icon when Team page is active
  const isOnTeamPage = pathname.startsWith("/admin/team");
  const isActive = useCallback(
    (cat: AdminCategory) => !isOnTeamPage && activeCategory === cat,
    [activeCategory, isOnTeamPage]
  );

  /* Toggle dock when clicking empty space */
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, input, [role='button']")) return;
      toggle();
    },
    [toggle]
  );

  return (
    <motion.nav
      animate={{ width: expanded ? 200 : 72 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      onClick={handleNavClick}
      className="
        fixed left-0 top-0 bottom-0 z-50
        flex flex-col cursor-pointer
        bg-white/70 backdrop-blur-2xl
        border-r border-[var(--olivea-olive)]/[0.06]
        shadow-[1px_0_24px_rgba(94,118,88,0.04)]
        overflow-hidden
      "
    >
      {/* ── Logo area ── */}
      <div className={`flex items-center gap-3 h-16 border-b border-[var(--olivea-olive)]/[0.06] ${expanded ? "px-4" : "justify-center"}`}>
        {/* The green alebrije — the brand mark used across the site (Navbar,
            team). Rendered as a plain <img> so it shows in its own colors; the
            previous CSS-mask of OliveaFTTIcon.svg went blank because that SVG
            fills with `currentColor`, which resolves to nothing in a mask. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/alebrije-1-Green.svg"
          alt="Olivea"
          className="w-9 h-9 object-contain flex-shrink-0"
        />
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="text-[var(--olivea-ink)] text-sm font-semibold whitespace-nowrap">
                Olivea
              </div>
              <div className="text-[var(--olivea-clay)] text-[10px] uppercase tracking-widest whitespace-nowrap">
                Admin
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Search trigger ── */}
      <div className={expanded ? "px-3 pt-4 pb-2" : "px-2 pt-4 pb-2"}>
        <button
          className={`
            flex items-center justify-center gap-3 w-full rounded-xl py-2.5
            text-[var(--olivea-olive)]/60 hover:text-[var(--olivea-olive)]
            hover:bg-[var(--olivea-cream)]/50
            transition-all duration-200
            border border-dashed border-[var(--olivea-olive)]/15
            ${expanded ? "px-3" : "px-0"}
          `}
          onClick={() => openPalette()}
        >
          <Search size={18} strokeWidth={1.5} className="flex-shrink-0" />
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <span className="text-xs whitespace-nowrap">{t(STR.search)}</span>
                <kbd className="text-[10px] text-[var(--olivea-olive)]/50 bg-[var(--olivea-cream)]/60 px-1.5 py-0.5 rounded border border-[var(--olivea-olive)]/10">
                  {"\u2318"}K
                </kbd>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── Category icons (+ inline pages of the active category) ──
          Collapsed: overflow-visible so the hover tooltips (rendered to the
          RIGHT of the 72px dock) aren't clipped — and, crucially, don't create
          a phantom horizontal scrollbar (overflow-y:auto otherwise forces
          overflow-x to compute to auto, and the off-dock tooltips widen it).
          Expanded: no tooltips, but the inline page list can be tall, so scroll
          vertically with the scrollbar hidden for a clean chrome look. */}
      <style>{`.dock-scroll{scrollbar-width:none}.dock-scroll::-webkit-scrollbar{display:none}`}</style>
      <div
        className={`dock-scroll flex-1 flex flex-col gap-1 ${expanded ? "px-3" : "px-2"} py-4 ${
          expanded ? "overflow-y-auto overflow-x-hidden" : "overflow-visible"
        }`}
      >
        {categories.map((cat) => (
          <div key={cat.key}>
            <DockIcon
              cat={cat}
              label={t(categoryMeta[cat.key].label)}
              isActive={isActive(cat.key)}
              expanded={expanded}
            />
            <AnimatePresence>
              {expanded && isActive(cat.key) && <CategoryChildren cat={cat.key} />}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* ── Bottom: Team + User ── */}
      <div className={`${expanded ? "px-3" : "px-2"} py-3 border-t border-[var(--olivea-olive)]/[0.06] space-y-1`}>
        <Link
          href="/admin/team"
          className={`
            group relative flex items-center gap-3 rounded-2xl py-3
            transition-all duration-200 ease-out
            ${expanded ? "px-3" : "justify-center"}
            ${pathname.startsWith("/admin/team")
              ? "bg-[var(--olivea-olive)]/[0.10] text-[var(--olivea-olive)]"
              : "text-[var(--olivea-olive)]/50 hover:text-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)]/[0.04]"
            }
          `}
        >
          {/* Active indicator pill */}
          {pathname.startsWith("/admin/team") && (
            <motion.div
              layoutId="dock-active"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--olivea-olive)]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <Users size={22} strokeWidth={pathname.startsWith("/admin/team") ? 2 : 1.5} className="flex-shrink-0" />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {t(STR.team)}
              </motion.span>
            )}
          </AnimatePresence>
          {!expanded && (
            <div className="
              absolute left-full ml-3 px-3 py-1.5 rounded-lg
              bg-white text-[var(--olivea-ink)] text-xs font-medium
              opacity-0 group-hover:opacity-100 pointer-events-none
              transition-opacity duration-150 whitespace-nowrap z-50
              shadow-[0_4px_16px_rgba(94,118,88,0.12)]
              border border-[var(--olivea-olive)]/[0.06]
            ">
              {t(STR.team)}
            </div>
          )}
        </Link>

        {/* User avatar */}
        <button
          onClick={() => setProfileOpen(true)}
          className={`
            relative flex items-center gap-3 py-2.5 w-full rounded-xl
            transition-all duration-200 ease-out
            group/user
            ${expanded ? "px-3" : "justify-center"}
            ${profileOpen
              ? "bg-[var(--olivea-olive)]/[0.08]"
              : "hover:bg-[var(--olivea-cream)]/40"
            }
          `}
        >
          {/* Active indicator pill */}
          {profileOpen && (
            <motion.div
              layoutId="dock-profile-active"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--olivea-clay)]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <div className={`w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[var(--olivea-clay)] to-[var(--olivea-olive)] flex items-center justify-center flex-shrink-0 ring-2 ${profileOpen ? "ring-[var(--olivea-olive)]/25" : "ring-[var(--olivea-olive)]/[0.08]"} transition-all duration-200`}>
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-[11px] font-bold">
                {user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            )}
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0 overflow-hidden text-left"
              >
                <div className="text-[var(--olivea-ink)] text-xs font-medium truncate">
                  {user.fullName}
                </div>
                <div className="text-[var(--olivea-clay)] text-[10px] truncate capitalize">
                  {user.role}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {expanded && (
            <span
              role="button"
              tabIndex={0}
              aria-label={t(STR.signOut)}
              onClick={(e) => {
                e.stopPropagation();
                handleSignOut();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  handleSignOut();
                }
              }}
              className="p-1 -m-1 rounded-md hover:bg-[var(--olivea-olive)]/10 transition-colors"
            >
              <LogOut
                size={14}
                className="text-[var(--olivea-olive)]/50 group-hover/user:text-[var(--olivea-olive)] transition-colors flex-shrink-0"
              />
            </span>
          )}
        </button>
      </div>

      {/* Profile slide-in panel */}
      <ProfilePanel
        user={user}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSave={(updated) => setUser(updated)}
      />
    </motion.nav>
  );
}
