// app/(main)/[lang]/team/TeamClient.tsx
"use client";

import {
  useMemo,
  useState,
  useEffect,
  useRef,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  type Variants,
} from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { TEAM, type LeaderProfile } from "./teamData";
import { useRouter, usePathname } from "next/navigation";

import TeamDockLeft, { type TeamCategory } from "./TeamDockLeft";
import TeamMobileNav from "./TeamMobileNav";
import { NavigationProvider } from "@/contexts/NavigationContext";

type Lang = "es" | "en";

export type TeamDict = {
  title: string;
  description: string;
  body?: string | string[];
  leadersTitle?: string;
  leadersHint?: string;
};

type Leader = LeaderProfile;
type Category = TeamCategory;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ---------------- scroll-in animations ---------------- */
const cardInV: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: EASE,
      delay: Math.min(0.9, i * 0.1),
    },
  }),
};

function leaderCategoryFromOrg(
  org?: { es: string; en: string }
): Category | "experience" {
  const raw = (org?.en || org?.es || "").toLowerCase();
  if (!raw) return "experience";
  if (raw.includes("casa olivea")) return "hotel";
  if (raw.includes("farm to table")) return "restaurant";
  if (raw.includes("olivea café") || raw.includes("olivea cafe")) return "cafe";
  if (raw.includes("the experience")) return "experience";
  return "experience";
}

function matchesFilter(leader: Leader, filter: Category): boolean {
  if (filter === "all") return true;
  const cat = leaderCategoryFromOrg(leader.org);
  return cat === filter || cat === "experience";
}

/* ---------------- breakpoint (prevents duplicate DOM ids) ---------------- */
function useIsLg(): boolean | null {
  const [isLg, setIsLg] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLg(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return isLg;
}

/* ---------------- modal helpers: dummy story ---------------- */

function getModalDummy(lang: Lang, name: string) {
  const es = [
    `Este perfil está en construcción — pero el diseño ya es el final.`,
    `Aquí irá una historia breve sobre ${name}: su rol, su enfoque, y cómo se conecta con el huerto.`,
    `Agrega un detalle humano (origen, filosofía, método) + una nota concreta (por ejemplo, un ingrediente favorito de temporada).`,
    `También puedes incluir responsabilidades clave, logros y una mini “firma” personal.`,
  ].join(" ");

  const en = [
    `This profile is being built — but the layout is already in its final style.`,
    `This is where a short story about ${name} will live: their role, their focus, and how it connects back to the garden.`,
    `Add a human detail (origin, philosophy, method) plus one concrete touch (e.g. a favorite seasonal ingredient).`,
    `You can also include key responsibilities, milestones, and a small personal signature.`,
  ].join(" ");

  return lang === "es" ? es : en;
}

/** Desktop vertical autoplay gallery (variable height per image) */
function AutoSlideGalleryVerticalVariableHeight({
  images,
  width = 252,
  gap = 14,
  speed = 44,
  minH = 120,
  maxH = 260,
}: {
  images: string[];
  width?: number;
  gap?: number;
  speed?: number;
  minH?: number;
  maxH?: number;
}) {
  const safe = useMemo(
    () => (images.length ? images : ["/images/team/persona.jpg"]),
    [images]
  );
  const items = [...safe, ...safe];

  const y = useMotionValue(0);
  const [hovered, setHovered] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [ratios, setRatios] = useState<Record<string, number>>({});

  const [pausedUntil, setPausedUntil] = useState(0);
  const pause = (ms = 4500) => setPausedUntil(Date.now() + ms);

  const getH = (src: string) => {
    const r = ratios[src] ?? 1;
    const h = Math.round(width / r);
    return Math.max(minH, Math.min(maxH, h));
  };

  const loopLen = useMemo(() => {
    return safe.reduce((acc, src) => {
      const r = ratios[src] ?? 1;
      const h = Math.round(width / r);
      const clampedH = Math.max(minH, Math.min(maxH, h));
      return acc + clampedH + gap;
    }, 0);
  }, [safe, ratios, width, gap, minH, maxH]);

  useAnimationFrame((_t, delta) => {
    if (hovered) return;
    if (focusedIdx !== null) return;
    if (safe.length <= 1) return;
    if (Date.now() < pausedUntil) return;

    const dy = (speed * delta) / 1000;
    let next = y.get() - dy;
    if (Math.abs(next) >= loopLen) next = 0;
    y.set(next);
  });

  const onImgLoad =
    (src: string) => (e: SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const r =
        img.naturalWidth && img.naturalHeight
          ? img.naturalWidth / img.naturalHeight
          : 1;

      setRatios((prev) => {
        const prevR = prev[src];
        if (prevR && Math.abs(prevR - r) < 0.01) return prev;
        return { ...prev, [src]: r };
      });
    };

  useEffect(() => {
    y.set(0);
  }, [loopLen, y]);

  return (
    <div
      className="relative h-full"
      style={{ width }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={() => pause()}
      onWheelCapture={() => pause(3000)}
    >
      <div className="relative h-full overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0">
          <div className="flex flex-col" style={{ gap }}>
            {items.map((src, idx) => {
              const h = getH(src);
              const isFocused = focusedIdx === idx;

              return (
                <motion.button
                  key={`${src}-${idx}`}
                  type="button"
                  onClick={() => {
                    pause();
                    setFocusedIdx(isFocused ? null : idx);
                  }}
                  className="relative overflow-hidden rounded-2xl bg-white/35 ring-1 ring-black/10"
                  style={{ width, height: h }}
                  whileHover={{ scale: 1.02 }}
                  animate={{
                    scale: isFocused ? 1.06 : 1,
                    zIndex: isFocused ? 30 : 1,
                  }}
                  transition={{ duration: 0.32, ease: EASE }}
                >
                  <div className="absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover object-center"
                      onLoad={onImgLoad(src)}
                      draggable={false}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** Mobile horizontal autoplay gallery (variable width per image) */
function AutoSlideGalleryHorizontalVariableWidth({
  images,
  cardH = 190,
  gap = 18,
  speed = 52,
  minW = 180,
  maxW = 520,
}: {
  images: string[];
  cardH?: number;
  gap?: number;
  speed?: number;
  minW?: number;
  maxW?: number;
}) {
  const safe = useMemo(
    () => (images.length ? images : ["/images/team/persona.jpg"]),
    [images]
  );

  const items = [...safe, ...safe];

  const x = useMotionValue(0);
  const [hovered, setHovered] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [ratios, setRatios] = useState<Record<string, number>>({});

  const [pausedUntil, setPausedUntil] = useState(0);
  const pause = (ms = 4500) => setPausedUntil(Date.now() + ms);

  const loopLen = useMemo(() => {
    return safe.reduce((acc, src) => {
      const r = ratios[src] ?? 0.75;
      const w = Math.round(cardH * r);
      const clampedW = Math.max(minW, Math.min(maxW, w));
      return acc + clampedW + gap;
    }, 0);
  }, [safe, ratios, cardH, gap, minW, maxW]);

  useAnimationFrame((_t, delta) => {
    if (hovered) return;
    if (focusedIdx !== null) return;
    if (safe.length <= 1) return;
    if (Date.now() < pausedUntil) return;

    const dx = (speed * delta) / 1000;
    let next = x.get() - dx;
    if (Math.abs(next) >= loopLen) next = 0;
    x.set(next);
  });

  const onImgLoad =
    (src: string) => (e: SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const r =
        img.naturalWidth && img.naturalHeight
          ? img.naturalWidth / img.naturalHeight
          : 0.75;

      setRatios((prev) => {
        const prevR = prev[src];
        if (prevR && Math.abs(prevR - r) < 0.01) return prev;
        return { ...prev, [src]: r };
      });
    };

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={() => pause()}
      onWheelCapture={() => pause(2500)}
    >
      <div className="relative overflow-hidden rounded-xl">
        <div className="relative" style={{ height: cardH + 26 }}>
          <motion.div className="absolute inset-0 flex items-center" style={{ x }}>
            <div className="flex items-center" style={{ gap }}>
              {items.map((src, idx) => {
                const w = Math.max(
                  180,
                  Math.min(520, Math.round(cardH * (ratios[src] ?? 0.75)))
                );
                const isFocused = focusedIdx === idx;

                return (
                  <motion.button
                    key={`${src}-${idx}`}
                    type="button"
                    onClick={() => {
                      pause();
                      setFocusedIdx(isFocused ? null : idx);
                    }}
                    className="relative shrink-0 overflow-hidden rounded-2xl bg-white/35 ring-1 ring-black/10"
                    style={{ width: w, height: cardH }}
                    whileHover={{ scale: 1.02 }}
                    animate={{
                      scale: isFocused ? 1.1 : 1,
                      zIndex: isFocused ? 30 : 1,
                    }}
                    transition={{ duration: 0.32, ease: EASE }}
                  >
                    <div className="absolute inset-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover object-center"
                        onLoad={onImgLoad(src)}
                        draggable={false}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LeaderCard({
  l,
  roleText,
  onOpen,
  sizes,
  className,
  imageMode = "contain",
  motionProps,
}: {
  l: Leader;
  roleText: string;
  onOpen: () => void;
  sizes: string;
  className: string;
  imageMode?: "contain" | "cover";
  motionProps?: {
    variants?: Variants;
    initial?: "hidden" | "show";
    whileInView?: "hidden" | "show";
    viewport?: { once?: boolean; amount?: number; margin?: string };
    custom?: number;
  };
}) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative overflow-hidden rounded-3xl ring-1 ring-black/10",
        className
      )}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.25, ease: EASE }}
      style={{ willChange: "transform, opacity" }}
      {...motionProps}
    >
      <div className="absolute inset-0 bg-white/35" />
      <div className="absolute inset-0">
        <Image
          src={l.avatar ?? "/images/team/persona.jpg"}
          alt={l.name}
          fill
          sizes={sizes}
          className={cn(
            imageMode === "cover"
              ? "object-cover object-center"
              : "object-contain object-bottom"
          )}
        />
      </div>

      <div className="absolute left-5 bottom-4">
        <div className="inline-flex items-center rounded-full bg-white/85 backdrop-blur px-2 py-1 ring-1 ring-black/10">
          <span className="inline-flex items-center rounded-full bg-(--olivea-olive) text-(--olivea-cream) text-xs font-medium px-3 py-1">
            {l.name}
          </span>
          <span className="ml-2 mr-2 text-xs text-(--olivea-ink)/70 whitespace-nowrap">
            {roleText}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

/* ---------------- page ---------------- */
export default function TeamClient({
  lang,
  team,
}: {
  lang: Lang;
  team: TeamDict;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLg = useIsLg(); // ✅ ensures we don't render both grids

  const resolvedLang: Lang =
    pathname?.split("/")[1]?.toLowerCase().startsWith("es") ? "es" : "en";
  const uiLang: Lang = lang === "es" || lang === "en" ? lang : resolvedLang;

  const t = (x?: { es: string; en: string }) => (x ? x[uiLang] : "");

  const leadersSorted = useMemo(() => {
    return [...TEAM].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
  }, []);

  const [category, setCategory] = useState<Category>("all");

  // Desktop grouping stays
  const featured = useMemo(() => leadersSorted.slice(0, 3), [leadersSorted]);
  const featuredIds = useMemo(
    () => new Set(featured.map((x) => x.id)),
    [featured]
  );

  const restVisible = useMemo(() => {
    return leadersSorted
      .filter((l) => !featuredIds.has(l.id))
      .filter((l) => matchesFilter(l, category));
  }, [leadersSorted, featuredIds, category]);

  const dockCount = featured.length + restVisible.length;

  // ✅ Mobile nav list should match what exists in DOM on mobile
  const mobileLeaders = useMemo(() => {
    return leadersSorted.filter((l) => matchesFilter(l, category));
  }, [leadersSorted, category]);

  const [openId, setOpenId] = useState<string | null>(null);
  const active = leadersSorted.find((l) => l.id === openId) ?? null;

  const modalImages = useMemo(() => {
    const base =
      active?.gallery?.length
        ? active.gallery
        : active?.avatar
          ? [active.avatar]
          : ["/images/team/persona.jpg"];

    const first = base[0] ?? "/images/team/persona.jpg";
    if (base.length >= 3) return base;
    if (base.length === 2) return [base[0], base[1], `${base[0]}?dup=1`];
    return [first, `${first}?dup=1`, `${first}?dup=2`];
  }, [active]);

  const isOpen = !!active;

  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => setPortalReady(true), []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const [present, setPresent] = useState(false);
  useEffect(() => {
    if (isOpen) setPresent(true);
  }, [isOpen]);

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const close = () => setOpenId(null);

  const goToProfile = () => {
    if (!active) return;
    close();
    router.push(`/${lang}/team/${active.id}`);
  };

  const bioFallback =
    lang === "es"
      ? "Historia en desarrollo — pronto."
      : "Story in progress — coming soon.";

  const FULL_BLEED =
    "w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]";
  const PAGE_PAD = "px-6 sm:px-10 md:px-12 lg:px-12";
  const RAIL = "max-w-[1400px]";

  const CARD_VIEWPORT = {
    once: true,
    amount: 0.22,
    margin: "0px 0px -18% 0px",
  } as const;

  return (
    <NavigationProvider>
      <main id="top" className="w-full pt-0 pb-36 sm:pb-24">
        <TeamDockLeft
          lang={lang}
          category={category}
          setCategory={setCategory}
          count={dockCount}
        />

        {/* ✅ Team MobileSectionNav */}
        <TeamMobileNav lang={uiLang} leaders={mobileLeaders} />

        <section className="mt-0 sm:mt-2">
          <div className={FULL_BLEED}>
            <div className={PAGE_PAD}>
              <div
                className={cn(
                  `${RAIL} mx-auto`,
                  "md:ml-80 xl:ml-85",
                  "md:mr-(--dock-right)",
                  "pr-2 sm:pr-0"
                )}
              >
                <h1 className="sr-only">
                  {team.leadersTitle ??
                    (lang === "es" ? "Líderes de Olivea" : "Leaders of Olivea")}
                </h1>

                {/* While breakpoint is unknown (first paint), don't render either grid → avoids duplicate ids */}
                {isLg === null ? null : isLg ? (
                  /* ========================= DESKTOP GRID (only rendered on lg+) ========================= */
                  <div>
                    <div className="mt-6 sm:mt-10">
                      <div className="grid grid-cols-12 gap-6">
                        {featured.map((l, idx) => (
                          <div
                            key={l.id}
                            id={l.id}
                            className={cn(
                              "main-section",
                              "scroll-mt-[calc(var(--header-h,64px)+18px)]",
                              "col-span-4 h-85 xl:h-90"
                            )}
                          >
                            <LeaderCard
                              l={l}
                              roleText={t(l.role)}
                              onOpen={() => setOpenId(l.id)}
                              sizes="(max-width: 1200px) 33vw, 520px"
                              className="w-full h-full"
                              imageMode="cover"
                              motionProps={{
                                variants: cardInV,
                                initial: "hidden",
                                whileInView: "show",
                                viewport: CARD_VIEWPORT,
                                custom: idx,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-7 grid grid-cols-12 gap-6 auto-rows-[320px] xl:auto-rows-[340px]">
                      {restVisible.map((l, idx) => (
                        <div
                          key={l.id}
                          id={l.id}
                          className={cn(
                            "main-section",
                            "scroll-mt-[calc(var(--header-h,64px)+18px)]",
                            "col-span-3"
                          )}
                        >
                          <LeaderCard
                            l={l}
                            roleText={t(l.role)}
                            onOpen={() => setOpenId(l.id)}
                            sizes="(max-width: 1200px) 25vw, 360px"
                            className="w-full h-full"
                            imageMode="contain"
                            motionProps={{
                              variants: cardInV,
                              initial: "hidden",
                              whileInView: "show",
                              viewport: CARD_VIEWPORT,
                              custom: idx % 4,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* ========================= MOBILE GRID (only rendered below lg) ========================= */
                  <div className="mt-4 grid grid-cols-1 gap-6 pb-28">
                    {mobileLeaders.map((l, idx) => (
                      <motion.button
                        key={l.id}
                        id={l.id}
                        type="button"
                        onClick={() => setOpenId(l.id)}
                        className={cn(
                          "main-section",
                          "scroll-mt-[calc(var(--header-h,64px)+18px)]",
                          "group relative overflow-hidden rounded-3xl ring-1 ring-black/10 w-full h-85"
                        )}
                        whileTap={{ scale: 0.995 }}
                        transition={{ duration: 0.2, ease: EASE }}
                        variants={cardInV}
                        initial="hidden"
                        whileInView="show"
                        viewport={CARD_VIEWPORT}
                        custom={idx % 6}
                      >
                        <div className="absolute inset-0 bg-white/35" />
                        <div className="absolute inset-0">
                          <Image
                            src={l.avatar ?? "/images/team/persona.jpg"}
                            alt={l.name}
                            fill
                            sizes="100vw"
                            className="object-cover object-center"
                          />
                        </div>

                        <div className="absolute left-4 right-4 bottom-4">
                          <div className="flex items-stretch rounded-full bg-white/85 backdrop-blur ring-1 ring-black/10 overflow-hidden">
                            <span className="shrink-0 inline-flex items-center rounded-full bg-(--olivea-olive) text-(--olivea-cream) text-sm font-medium px-5 py-3 max-w-[46%]">
                              <span className="block leading-none truncate whitespace-nowrap">
                                {l.name}
                              </span>
                            </span>
                            <span className="min-w-0 flex-1 px-4 py-2 text-sm text-(--olivea-ink)/70 text-left truncate">
                              {t(l.role)}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MODAL */}
        {portalReady &&
          createPortal(
            <AnimatePresence>
              {(isOpen || present) && active && (
                <>
                  <motion.div
                    className="fixed inset-0 bg-black/55 backdrop-blur-sm"
                    style={{ zIndex: 99998 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isOpen ? 1 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    onClick={close}
                    aria-hidden
                  />

                  <motion.div
                    className="fixed inset-0 flex items-center justify-center p-3 sm:p-4"
                    style={{ zIndex: 99999 }}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{
                      opacity: isOpen ? 1 : 0,
                      scale: isOpen ? 1 : 0.98,
                    }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    onAnimationComplete={() => {
                      if (!isOpen) setPresent(false);
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={active.name}
                  >
                    <div className="bg-(--olivea-cream) overflow-hidden ring-1 ring-black/10 w-[min(96vw,1000px)] h-[78vh] rounded-2xl">
                      <div className="grid h-full grid-cols-1 lg:grid-cols-[260px_1fr] grid-rows-[48px_1fr]">
                        <div className="hidden lg:block row-span-2 pl-6 pr-3">
                          <AutoSlideGalleryVerticalVariableHeight
                            images={modalImages.slice(0, 12)}
                            width={260}
                          />
                        </div>

                        <div className="relative h-12 flex items-center justify-center">
                          <span
                            className="uppercase tracking-[0.25em] text-(--olivea-ink)/70"
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontSize: 18,
                              fontWeight: 200,
                            }}
                          >
                            {lang === "es" ? "Perfil" : "Profile"}
                          </span>

                          <button
                            ref={closeBtnRef}
                            onClick={close}
                            aria-label={lang === "es" ? "Cerrar" : "Close"}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-(--olivea-olive) hover:text-(--olivea-cream) transition-colors"
                          >
                            <X size={18} className="text-current" />
                          </button>
                        </div>

                        <div
                          className="px-6 py-8 overflow-auto lg:pl-10"
                          onWheelCapture={(e) => e.stopPropagation()}
                          style={{
                            WebkitOverflowScrolling: "touch",
                            overscrollBehavior: "contain",
                          }}
                        >
                          <div className="lg:hidden mb-6">
                            <AutoSlideGalleryHorizontalVariableWidth
                              images={modalImages.slice(0, 12)}
                            />
                          </div>

                          <div className="mb-3">
                            <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] bg-white/60 ring-1 ring-black/10 text-(--olivea-ink)/70">
                              {t(active.tag) ||
                                (lang === "es" ? "Equipo" : "Team")}
                            </span>
                          </div>

                          {/* ✅ name click goes to Linktree */}
                          <button
                            type="button"
                            onClick={goToProfile}
                            className="text-left"
                          >
                            <h3
                              className="text-3xl font-semibold tracking-[-0.02em] text-(--olivea-ink) hover:opacity-90 transition"
                              style={{ fontFamily: "var(--font-serif)" }}
                            >
                              {active.name}
                            </h3>
                          </button>

                          <div className="mt-1 text-sm text-(--olivea-ink)/70">
                            {t(active.role)} · {t(active.org)}
                          </div>

                          {/* story: real if present, otherwise dummy so modal doesn't feel empty */}
                          <p className="mt-6 text-base leading-relaxed text-(--olivea-ink)/80 max-w-xl">
                            {(() => {
                              const bio = (t(active.bio) || "").trim();
                              if (!bio || bio.length < 28)
                                return getModalDummy(lang, active.name);
                              return bio;
                            })() || bioFallback}
                          </p>

                          {/* ✅ ONLY BUTTON: go to Linktree/profile page */}
                          <div className="mt-7">
                            <Link
                              href={`/${lang}/team/${active.id}`}
                              onClick={() => close()}
                              className={cn(
                                "inline-flex w-full items-center justify-center gap-2",
                                "rounded-2xl px-5 py-3 text-sm font-semibold",
                                "bg-(--olivea-olive) text-(--olivea-cream)",
                                "ring-1 ring-black/10 hover:opacity-95 transition",
                                "shadow-[0_18px_44px_-22px_rgba(0,0,0,0.35)]"
                              )}
                            >
                              {lang === "es" ? "Ver perfil completo" : "View full profile"}
                              <ArrowUpRight
                                size={16}
                                className="opacity-90"
                                aria-hidden="true"
                              />
                            </Link>
                          </div>

                          {/* tiny hint (optional, keeps it feeling intentional) */}
                          <div className="mt-3 text-[11px] tracking-wide text-(--olivea-ink)/45">
                            {lang === "es"
                              ? "El perfil completo vive en el Linktree."
                              : "Full profile lives on the Linktree."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>,
            document.body
          )}
      </main>
    </NavigationProvider>
  );
}
