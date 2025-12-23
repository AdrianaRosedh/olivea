// components/navigation/MobileSectionNav.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/contexts/NavigationContext";

/* ===========================
   Types
   =========================== */
export interface MobileSectionNavItem {
  id: string; // anchor id (must be unique in the DOM)
  label: string;
  subs?: { id: string; label: string }[]; // optional nested anchors (we won’t show on mobile row)
}

type I18nText = { es: string; en: string };

interface Props {
  items: MobileSectionNavItem[];
  pageTitle: I18nText; // localized
  lang: "es" | "en";
  enableSheet?: boolean;
  /** Default false on mobile bar: subs live in Outline, not the bar */
  enableSubRow?: boolean;
}

/* ===========================
   Constants
   =========================== */
const MANUAL_MS = 900;
const STABLE_MS = 220;
const RAF_MIN_MS = 16;

// Top row appears only at bottom; hide immediately on scroll up
const BOTTOM_THRESHOLD_PX = 48;

/* ===========================
   Helpers
   =========================== */
const canUseDom = () =>
  typeof window !== "undefined" && typeof document !== "undefined";

function headerPx(): number {
  if (!canUseDom()) return 64;
  const v = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
  const n = parseInt(v || "", 10);
  return Number.isFinite(n) && n > 0 ? n : 64;
}

function setSnapDisabled(disabled: boolean) {
  if (!canUseDom()) return;
  document.documentElement.classList.toggle("snap-disable", disabled);
}

function findTarget(id: string): HTMLElement | null {
  if (!canUseDom()) return null;
  return (
    document.querySelector<HTMLElement>(`.main-section#${CSS.escape(id)}`) ||
    document.getElementById(id)
  );
}

type EffectiveConnectionType = "slow-2g" | "2g" | "3g" | "4g";
interface NetworkInformation {
  readonly effectiveType?: EffectiveConnectionType;
  readonly saveData?: boolean;
  addEventListener?: (
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) => void;
  removeEventListener?: (
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions
  ) => void;
}
type NavigatorWithConnection = Navigator & { connection?: NetworkInformation };

/* ===========================
   Component
   =========================== */
export default function MobileSectionNav({
  items,
  pageTitle,
  lang,
  enableSheet = true,
  enableSubRow = false, // ✅ default: don’t show subs on mobile bar
}: Props) {
  const pathname = usePathname();
  const { isManualNavigation, setIsManualNavigation, setActiveSection } = useNavigation();

  // Flattened id list for scrollspy (mains + subs for picking active)
  const flatIds = useMemo(() => {
    const out: string[] = [];
    for (const it of items) {
      out.push(it.id);
      if (it.subs?.length) out.push(...it.subs.map((s) => s.id));
    }
    return out;
  }, [items]);

  const [activeId, setActiveId] = useState(items[0]?.id || "");
  const [open, setOpen] = useState(false);

  // Top row visibility (only at bottom; hides on scroll up)
  const [showTopRow, setShowTopRow] = useState(false);
  const lastYRef = useRef(0);
  const showRef = useRef(false);

  // For horizontal centering of active chip
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Hysteresis
  const pendingIdRef = useRef<string | null>(null);
  const pendingAtRef = useRef<number>(0);

  // Scrollspy caches
  const allTargets = useRef<HTMLElement[]>([]);
  const tickingRef = useRef(false);
  const lastTsRef = useRef(0);

  // Manual nav safety unlock
  const safetyTO = useRef<number | null>(null);

  // Reduced motion / data saver
  const reduceMotion = useRef(false);
  const saveData = useRef(false);

  useEffect(() => {
    if (!canUseDom()) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotion.current = mql.matches;
    const onMqlChange = () => (reduceMotion.current = mql.matches);
    mql.addEventListener?.("change", onMqlChange);

    const nav = navigator as NavigatorWithConnection;
    saveData.current = !!nav.connection?.saveData;

    return () => mql.removeEventListener?.("change", onMqlChange);
  }, []);

  // Close sheet on route change
  useEffect(() => setOpen(false), [pathname]);

  const resolvedPageTitle = useMemo(() => pageTitle[lang], [pageTitle, lang]);

  // Build target list (mains + subs)
  const rebuildTargets = useCallback(() => {
    if (!canUseDom()) return [] as HTMLElement[];
    const targets = flatIds
      .map((id) => findTarget(id))
      .filter((x): x is HTMLElement => Boolean(x));
    allTargets.current = targets;
    return targets;
  }, [flatIds]);

  // Smooth scroll (native)
  const scrollToId = useCallback(
    (id: string) => {
      if (!canUseDom()) return;

      const el = findTarget(id);
      if (!el) {
        console.warn(`[MobileSectionNav] target not found: #${id}`);
        return;
      }

      setIsManualNavigation(true);
      setSnapDisabled(true);

      if (safetyTO.current) {
        window.clearTimeout(safetyTO.current);
        safetyTO.current = null;
      }

      const header = headerPx() + 10;
      const rect = el.getBoundingClientRect();
      const targetY = Math.max(0, window.scrollY + rect.top - header);

      const behavior: ScrollBehavior =
        reduceMotion.current || saveData.current ? "auto" : "smooth";

      window.scrollTo({ top: targetY, behavior });

      setActiveId(id);
      setActiveSection(id);

      safetyTO.current = window.setTimeout(() => {
        if (window.location.hash.slice(1) !== id) {
          history.replaceState(null, "", `#${id}`);
        }
        setIsManualNavigation(false);
        setSnapDisabled(false);
        safetyTO.current = null;
      }, MANUAL_MS);
    },
    [setIsManualNavigation, setActiveSection]
  );

  // Active main (for centering)
  const activeMain = useMemo(() => {
    for (const m of items) {
      if (m.id === activeId) return m;
      if (m.subs?.some((s) => s.id === activeId)) return m;
    }
    return items[0];
  }, [items, activeId]);

  const handleTap = useCallback(
    (id: string) => {
      scrollToId(id);
      setOpen(false);
    },
    [scrollToId]
  );

  // Scrollspy (stable)
  useEffect(() => {
    if (!canUseDom()) return;

    rebuildTargets();

    const pickActive = () => {
      if (isManualNavigation) return;

      const targets = allTargets.current;
      if (!targets.length) return;

      const header = headerPx() + 10;

      let candidate: string | null = null;
      let best = Number.POSITIVE_INFINITY;

      for (const el of targets) {
        const top = el.getBoundingClientRect().top - header;
        if (top <= 24) {
          const dist = Math.abs(top);
          if (dist < best) {
            best = dist;
            candidate = el.id || null;
          }
        }
      }

      if (!candidate) {
        let bestTop = Number.POSITIVE_INFINITY;
        for (const el of targets) {
          const t = el.getBoundingClientRect().top - header;
          if (t >= -8 && t < bestTop) {
            bestTop = t;
            candidate = el.id || null;
          }
        }
      }

      if (!candidate || candidate === activeId) return;

      const now = performance.now();
      if (pendingIdRef.current !== candidate) {
        pendingIdRef.current = candidate;
        pendingAtRef.current = now;
        return;
      }
      if (now - pendingAtRef.current >= STABLE_MS) {
        setActiveId(candidate);
        setActiveSection(candidate);
      }
    };

    const onScroll = (ts?: number) => {
      const now = ts ?? performance.now();
      if (tickingRef.current && now - lastTsRef.current < RAF_MIN_MS) return;
      tickingRef.current = true;
      lastTsRef.current = now;

      requestAnimationFrame(() => {
        tickingRef.current = false;
        pickActive();
      });
    };

    const handler = () => onScroll(performance.now());
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);

    const t1 = window.setTimeout(() => rebuildTargets(), 400);
    const t2 = window.setTimeout(() => rebuildTargets(), 1200);

    handler();

    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [activeId, isManualNavigation, rebuildTargets, setActiveSection]);

  // Center active chip horizontally (no side gutters; still centers nicely)
  useEffect(() => {
    const cont = containerRef.current;
    const btn = buttonRefs.current[activeMain?.id || activeId];
    if (!cont || !btn) return;

    const half = (cont.clientWidth - btn.offsetWidth) / 2;
    const left = btn.offsetLeft - half;
    const max = cont.scrollWidth - cont.clientWidth;

    cont.scrollTo({
      left: Math.max(0, Math.min(left, max)),
      behavior: reduceMotion.current ? "auto" : "smooth",
    });
  }, [activeId, activeMain]);

  // Top row visibility: show only at bottom; hide immediately on scroll up
  useEffect(() => {
    if (!canUseDom()) return;

    lastYRef.current = window.scrollY || 0;
    showRef.current = false;
    setShowTopRow(false);

    const atBottom = () => {
      const doc = document.documentElement;
      const scrollY = window.scrollY || 0;
      const viewport = window.innerHeight || 0;
      const height = doc.scrollHeight || 0;
      return scrollY + viewport >= height - BOTTOM_THRESHOLD_PX;
    };

    const onScroll = () => {
      const y = window.scrollY || 0;
      const goingUp = y < lastYRef.current - 2;
      lastYRef.current = y;

      if (goingUp) {
        if (showRef.current) {
          showRef.current = false;
          setShowTopRow(false);
        }
        return;
      }

      const shouldShow = atBottom();
      if (shouldShow !== showRef.current) {
        showRef.current = shouldShow;
        setShowTopRow(shouldShow);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (safetyTO.current) {
        clearTimeout(safetyTO.current);
        safetyTO.current = null;
      }
      setSnapDisabled(false);
    };
  }, []);

  const progressText = useMemo(() => {
    const mains = items.length || 1;
    const idx = Math.max(0, items.findIndex((m) => m.id === activeMain?.id));
    return `${idx + 1}/${mains}`;
  }, [items, activeMain]);

  return (
    <>
      {/* Bottom bar: edge-to-edge + pinned to safe-area bottom */}
      <nav
        className={cn("fixed inset-x-0 bottom-0 z-96 lg:hidden", "pointer-events-none")}
        aria-label="Mobile section navigation"
      >
        {/* ✅ No max width, no side px — true full width */}
        <div className="pointer-events-auto w-full pb-[env(safe-area-inset-bottom)]">
          {/* ✅ Full width card, flush to edges */}
          <div
            className={cn(
              "w-full",
              "relative overflow-hidden",
              "ring-1 ring-(--olivea-olive)/18",
              "bg-(--olivea-cream)/80 backdrop-blur-md",
              "shadow-[0_18px_44px_rgba(18,24,16,0.12)]",
              // keep the nice corners but let it hit edges:
              // use rounded-t only so it feels “docked”
              "rounded-t-2xl"
            )}
          >
            {/* Top row: only appears at bottom */}
            <AnimatePresence initial={false}>
              {showTopRow ? (
                <motion.div
                  className="flex items-center justify-between gap-3 px-4 pt-3"
                  initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 6, filter: "blur(2px)" }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    type="button"
                    className={cn(
                      "min-w-0 flex-1 text-left",
                      "text-[13px] uppercase tracking-[0.36em]",
                      "text-(--olivea-olive)"
                    )}
                    onClick={() => enableSheet && setOpen(true)}
                    aria-label="Open section outline"
                  >
                    <span className="block truncate">{resolvedPageTitle}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className={cn("text-[11px] tracking-[0.18em]", "text-(--olivea-olive)/65")}>
                      {progressText}
                    </span>

                    {enableSheet && (
                      <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className={cn(
                          "inline-flex items-center gap-2",
                          "rounded-xl px-3 py-2",
                          "bg-(--olivea-olive)/10 hover:bg-(--olivea-olive)/14",
                          "text-(--olivea-olive)",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)"
                        )}
                        aria-label="Open outline"
                      >
                        <ChevronUp className="h-4 w-4" />
                        <span className="text-[12px] font-medium">Outline</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Main chips row (always visible) */}
            <div
              ref={containerRef}
              className={cn(
                "no-scrollbar flex gap-2 overflow-x-auto",
                // ✅ full width padding, but no “side gaps” relative to screen
                // (this is content padding, not outer margin)
                "px-4",
                showTopRow ? "mt-2 pb-3" : "mt-3 pb-3"
              )}
              role="tablist"
            >
              {items.map((m) => {
                const isActive = activeMain?.id === m.id;
                return (
                  <button
                    key={m.id}
                    ref={(el) => {
                      buttonRefs.current[m.id] = el;
                    }}
                    type="button"
                    onClick={() => handleTap(m.id)}
                    role="tab"
                    aria-selected={isActive}
                    className={cn(
                      // ✅ thinner + perfectly centered text
                      "shrink-0 inline-flex items-center justify-center",
                      "rounded-xl border",
                      "px-3 py-1.75",
                      "text-[12px] leading-none font-medium uppercase tracking-[0.22em] whitespace-nowrap",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)",
                      isActive
                        ? "bg-(--olivea-olive) text-white border-(--olivea-olive)"
                        : "bg-(--olivea-cream) text-(--olivea-olive) border-(--olivea-olive)/55 hover:bg-(--olivea-olive)/10"
                    )}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Sub row (disabled by default on mobile bar; keep for Outline if you ever want it) */}
            {enableSubRow && activeMain?.subs?.length ? (
              <div className="no-scrollbar -mt-1 flex gap-2 overflow-x-auto px-4 pb-3">
                {activeMain.subs.map((s) => {
                  const isSubActive = activeId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleTap(s.id)}
                      className={cn(
                        "shrink-0 rounded-xl border px-3 py-1.5",
                        "text-[12px] leading-none tracking-[0.06em] whitespace-nowrap",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)",
                        isSubActive
                          ? "bg-(--olivea-olive)/14 text-(--olivea-olive) border-(--olivea-olive)/40"
                          : "bg-transparent text-(--olivea-olive)/80 border-(--olivea-olive)/20 hover:bg-(--olivea-olive)/8"
                      )}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Bottom Sheet Outline */}
      <AnimatePresence>
        {enableSheet && open ? (
          <>
            <motion.div
              className="fixed inset-0 z-120 bg-black/30 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              className={cn("fixed inset-x-0 bottom-0 z-121 lg:hidden", "pb-[env(safe-area-inset-bottom)]")}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Section outline"
            >
              {/* ✅ Full width sheet (no mx/max caps) */}
              <div className="w-full px-3 pb-3">
                <div
                  className={cn(
                    "relative overflow-hidden rounded-3xl",
                    "bg-(--olivea-cream)/92 backdrop-blur-xl",
                    "ring-1 ring-(--olivea-olive)/18",
                    "shadow-[0_26px_68px_rgba(18,24,16,0.20)]"
                  )}
                >
                  <div className="flex items-center justify-between gap-3 px-4 py-4">
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-[0.38em] text-(--olivea-olive)/70">
                        Outline
                      </div>
                      <div className="mt-1 text-[15px] font-medium text-(--olivea-olive) truncate">
                        {resolvedPageTitle}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={cn(
                        "rounded-2xl p-2",
                        "bg-(--olivea-olive)/10 hover:bg-(--olivea-olive)/14",
                        "text-(--olivea-olive)",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)"
                      )}
                      onClick={() => setOpen(false)}
                      aria-label="Close outline"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="max-h-[62vh] overflow-auto px-2 pb-3">
                    {items.map((m) => {
                      const isMainActive = activeMain?.id === m.id;
                      return (
                        <div key={m.id} className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() => handleTap(m.id)}
                            className={cn(
                              "w-full rounded-2xl border px-4 py-3 text-left",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)",
                              isMainActive
                                ? "bg-(--olivea-olive)/12 border-(--olivea-olive)/30"
                                : "bg-transparent border-(--olivea-olive)/18 hover:bg-(--olivea-olive)/8"
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-[12px] uppercase tracking-[0.26em] text-(--olivea-olive)/80 truncate">
                                  {m.label}
                                </div>
                              </div>
                              <span className="text-[11px] tracking-[0.18em] text-(--olivea-olive)/55">
                                {m.subs?.length ? `${m.subs.length}` : ""}
                              </span>
                            </div>
                          </button>

                          {m.subs?.length ? (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {m.subs.map((s) => {
                                const isSubActive = activeId === s.id;
                                return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleTap(s.id)}
                                    className={cn(
                                      "rounded-2xl border px-3 py-2 text-left",
                                      "text-[13px] leading-tight",
                                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)",
                                      isSubActive
                                        ? "bg-(--olivea-olive) text-white border-(--olivea-olive)"
                                        : "bg-(--olivea-cream)/60 text-(--olivea-olive) border-(--olivea-olive)/18 hover:bg-(--olivea-olive)/10"
                                    )}
                                  >
                                    {s.label}
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
