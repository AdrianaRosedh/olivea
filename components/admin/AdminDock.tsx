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
import { useDock, categoryFromPath, type AdminCategory } from "./AdminDockContext";
import { usePalette } from "./CommandPalette";
import { useAuth } from "./AuthProvider";
import { mockUser } from "@/lib/admin/mock-user";
import type { AdminUser } from "@/lib/auth/types";

/* ─── Category definitions ─── */
interface CategoryDef {
  key: AdminCategory;
  label: string;
  icon: React.ElementType;
  href: string; // landing route for this category
}

const categories: CategoryDef[] = [
  { key: "dashboard", label: "Dashboard",  icon: LayoutDashboard, href: "/admin" },
  { key: "pages",     label: "Pages",      icon: FileText,        href: "/admin/pages" },
  { key: "content",   label: "Content",    icon: Layers,          href: "/admin/content-hub" },
  { key: "settings",  label: "Settings",   icon: Settings,        href: "/admin/site-settings" },
];

/* ─── Dock icon button ─── */
function DockIcon({
  cat,
  isActive,
  expanded,
}: {
  cat: CategoryDef;
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
            {cat.label}
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
          {cat.label}
        </div>
      )}
    </Link>
  );
}

/* ─── Main Dock ─── */
export default function AdminDock() {
  const pathname = usePathname();
  const { expanded, toggle, setActiveCategory, activeCategory } = useDock();
  const { open: openPalette } = usePalette();
  const { user: authUser, signOut: handleSignOut } = useAuth();
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
        <div
          className="w-9 h-9 flex-shrink-0"
          style={{
            backgroundColor: "var(--olivea-olive)",
            WebkitMaskImage: "url(/brand/OliveaFTTIcon.svg)",
            maskImage: "url(/brand/OliveaFTTIcon.svg)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
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
                <span className="text-xs whitespace-nowrap">Search</span>
                <kbd className="text-[10px] text-[var(--olivea-olive)]/50 bg-[var(--olivea-cream)]/60 px-1.5 py-0.5 rounded border border-[var(--olivea-olive)]/10">
                  {"\u2318"}K
                </kbd>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── Category icons ── */}
      <div className={`flex-1 flex flex-col gap-1 ${expanded ? "px-3" : "px-2"} py-4`}>
        {categories.map((cat) => (
          <DockIcon
            key={cat.key}
            cat={cat}
            isActive={isActive(cat.key)}
            expanded={expanded}
          />
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
                Team
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
              Team
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
              aria-label="Sign out"
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
