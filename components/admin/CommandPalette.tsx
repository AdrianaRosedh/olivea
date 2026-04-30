"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  FileText,
  Layers,
  Settings,
  X,
  ArrowRight,
  // Page icons
  Video,
  UtensilsCrossed,
  Home,
  Coffee,
  Mail,
  Leaf,
  Newspaper,
  Briefcase,
  Scale,
  Users,
  AlertCircle,
  // Content icons
  BookOpen,
  Bell,
  Flag,
  HelpCircle,
  Image,
  // Settings icons
  Globe,
  Menu,
  PanelBottom,
  Clock,
  Megaphone,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

/* ─── Icon map ─── */
const iconMap: Record<string, LucideIcon> = {
  Video,
  UtensilsCrossed,
  Home,
  Coffee,
  Mail,
  Leaf,
  Newspaper,
  Briefcase,
  Scale,
  Users,
  AlertCircle,
  BookOpen,
  Bell,
  Flag,
  HelpCircle,
  Image,
  Globe,
  Menu,
  PanelBottom,
  Clock,
  Megaphone,
  ScrollText,
};

const categoryIcons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  pages: FileText,
  content: Layers,
  settings: Settings,
};

/* ─── Search items ─── */
interface SearchItem {
  label: string;
  href: string;
  icon: string;
  description: string;
  category: string;
  categoryLabel: string;
}

const allItems: SearchItem[] = [
  // Today (dashboard)
  { label: "Today",                   href: "/admin",                        icon: "LayoutDashboard", description: "What's live right now and recent activity",                          category: "dashboard", categoryLabel: "Today" },
  // Daily Updates — high-frequency edits
  { label: "Specials & Announcements", href: "/admin/popups",                icon: "Bell",            description: "Pop-up messages (today's special, event reminder)",                  category: "daily", categoryLabel: "Daily Updates" },
  { label: "Site Banners",            href: "/admin/banners",                icon: "Flag",            description: "Top-of-page banners (sale, holiday hours, urgent notice)",          category: "daily", categoryLabel: "Daily Updates" },
  { label: "Promotions",              href: "/admin/promotions",             icon: "Megaphone",       description: "Time-limited offers across selected pages",                          category: "daily", categoryLabel: "Daily Updates" },
  { label: "Journal",                 href: "/admin/journal",                icon: "BookOpen",        description: "Long-form articles — full draft/publish workflow",                   category: "daily", categoryLabel: "Daily Updates" },
  { label: "Operating Hours",         href: "/admin/hours",                  icon: "Clock",           description: "Hours shown on the live status badge and footer",                    category: "daily", categoryLabel: "Daily Updates" },
  { label: "Photos & Media",          href: "/admin/media",                  icon: "Image",           description: "Upload images for use anywhere on the site",                         category: "daily", categoryLabel: "Daily Updates" },
  // Brand & Pages — editorial content per public page
  { label: "Homepage",                href: "/admin/content/homepage",       icon: "Video",           description: "Hero video, headline, and section cards",                            category: "pages", categoryLabel: "Brand & Pages" },
  { label: "Casa Olivea",             href: "/admin/content/casa",           icon: "Home",            description: "Farm-stay hotel page",                                               category: "pages", categoryLabel: "Brand & Pages" },
  { label: "Casa FAQ",                href: "/admin/content/casa-faq",       icon: "HelpCircle",      description: "Casa Olivea questions & answers (separate editor)",                  category: "pages", categoryLabel: "Brand & Pages" },
  { label: "Olivea Farm to Table",    href: "/admin/content/farm-to-table",  icon: "UtensilsCrossed", description: "MICHELIN restaurant page",                                           category: "pages", categoryLabel: "Brand & Pages" },
  { label: "Olivea Café",             href: "/admin/content/cafe",           icon: "Coffee",          description: "Daytime café & padel page",                                          category: "pages", categoryLabel: "Brand & Pages" },
  { label: "Sustainability",          href: "/admin/content/sustainability", icon: "Leaf",            description: "Philosophy and sustainability practices",                            category: "pages", categoryLabel: "Brand & Pages" },
  { label: "Press",                   href: "/admin/content/press",          icon: "Newspaper",       description: "Press chrome (awards live in MDX files)",                            category: "pages", categoryLabel: "Brand & Pages" },
  { label: "Team Page",               href: "/admin/content/team",           icon: "Users",           description: "Public team page meta + roster",                                     category: "pages", categoryLabel: "Brand & Pages" },
  { label: "Contact",                 href: "/admin/content/contact",        icon: "Mail",            description: "Contact info, addresses, social, form labels",                       category: "pages", categoryLabel: "Brand & Pages" },
  { label: "Careers",                 href: "/admin/content/careers",        icon: "Briefcase",       description: "Careers page chrome plus active job openings",                       category: "pages", categoryLabel: "Brand & Pages" },
  // Setup — rarely-changed
  { label: "Brand & Identity",        href: "/admin/content/global",         icon: "Globe",           description: "Site name, tagline, social URLs, default OG image, contact info",    category: "setup", categoryLabel: "Setup" },
  { label: "Mobile Navigation",       href: "/admin/content/drawer",         icon: "Menu",            description: "Items shown in the mobile drawer menu",                              category: "setup", categoryLabel: "Setup" },
  { label: "Footer",                  href: "/admin/content/footer",         icon: "PanelBottom",     description: "Footer copy and link groups",                                        category: "setup", categoryLabel: "Setup" },
  { label: "Legal Pages",             href: "/admin/content/legal",          icon: "Scale",           description: "Privacy policy, terms, cookie statement",                            category: "setup", categoryLabel: "Setup" },
  { label: "404 Page",                href: "/admin/content/not-found",      icon: "AlertCircle",     description: "Message shown when a visitor hits a missing page",                   category: "setup", categoryLabel: "Setup" },
  { label: "Audit Log",               href: "/admin/audit-log",              icon: "ScrollText",      description: "Who edited what, and when",                                          category: "setup", categoryLabel: "Setup" },
  // Admin user management (separate from public team page)
  { label: "Admin Users",              href: "/admin/team",                  icon: "Users",           description: "Manage who can log in to admin and what they can edit",              category: "setup", categoryLabel: "Setup" },
  { label: "Menu (Canva links)",       href: "/admin/menu",                  icon: "UtensilsCrossed", description: "Quick links to the Canva-hosted PDF menus",                          category: "daily", categoryLabel: "Daily Updates" },
];

/* ─── Context for opening palette from anywhere ─── */
interface PaletteContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const PaletteContext = createContext<PaletteContextValue>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

export function usePalette() {
  return useContext(PaletteContext);
}

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <PaletteContext.Provider value={{ open, close, isOpen }}>
      {children}
      <CommandPalette isOpen={isOpen} onClose={close} />
    </PaletteContext.Provider>
  );
}

/* ─── Component ─── */
function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter items
  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
    );
  }, [query]);

  // Group by category, preserving flat index for keyboard navigation
  const { grouped, flatList } = useMemo(() => {
    const groups: Record<string, { item: SearchItem; flatIdx: number }[]> = {};
    for (let i = 0; i < filtered.length; i++) {
      const item = filtered[i];
      const key = item.categoryLabel;
      if (!groups[key]) groups[key] = [];
      groups[key].push({ item, flatIdx: i });
    }
    return { grouped: groups, flatList: filtered };
  }, [filtered]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      // Focus after animation
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-palette-item]");
    items[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const navigate = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, flatList.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (flatList[selectedIndex]) {
            navigate(flatList[selectedIndex].href);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [flatList, selectedIndex, navigate, onClose]
  );

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-1/2 top-[15%] z-[101] w-full max-w-lg -translate-x-1/2"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              className="
                bg-white rounded-2xl overflow-hidden
                shadow-[0_24px_80px_rgba(94,118,88,0.18),0_0_0_1px_rgba(94,118,88,0.06)]
                border border-[var(--olivea-olive)]/[0.08]
              "
              onKeyDown={handleKeyDown}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--olivea-olive)]/[0.06]">
                <Search
                  size={20}
                  strokeWidth={1.5}
                  className="text-[var(--olivea-olive)]/40 flex-shrink-0"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages, settings, content..."
                  className="
                    flex-1 text-sm text-[var(--olivea-ink)] bg-transparent
                    outline-none placeholder:text-[var(--olivea-olive)]/30
                  "
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 rounded-md hover:bg-[var(--olivea-cream)]/50 text-[var(--olivea-olive)]/40"
                  >
                    <X size={14} />
                  </button>
                )}
                <kbd className="text-[10px] text-[var(--olivea-olive)]/40 bg-[var(--olivea-cream)]/60 px-1.5 py-0.5 rounded border border-[var(--olivea-olive)]/10">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
                {flatList.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-[var(--olivea-olive)]/40">
                      No results for &ldquo;{query}&rdquo;
                    </p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([groupLabel, entries]) => (
                    <div key={groupLabel}>
                      <div className="px-5 pt-3 pb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--olivea-olive)]/40">
                          {groupLabel}
                        </span>
                      </div>
                      {entries.map(({ item, flatIdx }) => {
                        const isSelected = flatIdx === selectedIndex;
                        const Icon = iconMap[item.icon] || categoryIcons[item.category] || FileText;

                        return (
                          <button
                            key={item.href}
                            data-palette-item
                            onClick={() => navigate(item.href)}
                            onMouseEnter={() => setSelectedIndex(flatIdx)}
                            className={`
                              flex items-center gap-3 w-full px-5 py-2.5 text-left
                              transition-colors duration-75
                              ${isSelected
                                ? "bg-[var(--olivea-olive)]/[0.06]"
                                : "hover:bg-[var(--olivea-olive)]/[0.03]"
                              }
                            `}
                          >
                            <div
                              className={`
                                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                ${isSelected
                                  ? "bg-[var(--olivea-olive)]/[0.10] text-[var(--olivea-olive)]"
                                  : "bg-[var(--olivea-cream)]/60 text-[var(--olivea-olive)]/50"
                                }
                              `}
                            >
                              <Icon size={16} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-sm font-medium truncate ${
                                  isSelected
                                    ? "text-[var(--olivea-ink)]"
                                    : "text-[var(--olivea-ink)]/70"
                                }`}
                              >
                                {item.label}
                              </div>
                              <div className="text-[11px] text-[var(--olivea-olive)]/40 truncate">
                                {item.description}
                              </div>
                            </div>
                            {isSelected && (
                              <ArrowRight
                                size={14}
                                className="text-[var(--olivea-olive)]/40 flex-shrink-0"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer hints */}
              <div className="flex items-center gap-4 px-5 py-2.5 border-t border-[var(--olivea-olive)]/[0.06] bg-[var(--olivea-cream)]/20">
                <span className="flex items-center gap-1.5 text-[10px] text-[var(--olivea-olive)]/40">
                  <kbd className="px-1 py-0.5 rounded bg-[var(--olivea-cream)]/60 border border-[var(--olivea-olive)]/10">
                    &uarr;&darr;
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-[var(--olivea-olive)]/40">
                  <kbd className="px-1 py-0.5 rounded bg-[var(--olivea-cream)]/60 border border-[var(--olivea-olive)]/10">
                    &crarr;
                  </kbd>
                  open
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-[var(--olivea-olive)]/40">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--olivea-cream)]/60 border border-[var(--olivea-olive)]/10">
                    {"\u2318"}K
                  </kbd>
                  toggle
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
