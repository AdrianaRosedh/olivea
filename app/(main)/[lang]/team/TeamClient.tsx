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
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { X } from "lucide-react";

import { TEAM, type LeaderProfile } from "./teamData";
import { useRouter, usePathname } from "next/navigation";


type Lang = "es" | "en";

export type TeamDict = {
  title: string;
  description: string;
  body?: string | string[];
  leadersTitle?: string;
  leadersHint?: string;
};

type TileSize = "hero" | "md";
type Leader = LeaderProfile;

type Category = "all" | "hotel" | "restaurant" | "cafe";

function tileClass(tile: TileSize): string {
  switch (tile) {
    case "hero":
      return "col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-4";
    case "md":
    default:
      return "col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3";
  }
}

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

/**
 * Olivea The Experience appears in ALL filters.
 */
function matchesFilter(leader: Leader, filter: Category): boolean {
  if (filter === "all") return true;
  const cat = leaderCategoryFromOrg(leader.org);
  return cat === filter || cat === "experience";
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
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-contain"
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

  const getW = (src: string) => {
    const r = ratios[src] ?? 0.75;
    const w = Math.round(cardH * r);
    return Math.max(minW, Math.min(maxW, w));
  };

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
                const w = getW(src);
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
                      scale: isFocused ? 1.10 : 1,
                      zIndex: isFocused ? 30 : 1,
                    }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="absolute inset-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-contain"
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

export default function TeamClient({
  lang,
  team,
}: {
  lang: Lang;
  team: TeamDict;
}) {

  const router = useRouter();
  const pathname = usePathname();

  // ✅ Source-of-truth language from URL: /es/... or /en/...
  const resolvedLang: Lang =
    pathname?.split("/")[1]?.toLowerCase().startsWith("es") ? "es" : "en";

  // If you want: prefer prop lang when it’s correct, otherwise fall back:
  const uiLang: Lang = (lang === "es" || lang === "en") ? lang : resolvedLang;

  const t = (x?: { es: string; en: string }) => (x ? x[uiLang] : "");


  const leadersRaw: Leader[] = useMemo(() => TEAM, []);

  const leadersSorted = useMemo(
    () => [...leadersRaw].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999)),
    [leadersRaw]
  );

  const [category, setCategory] = useState<Category>("all");

  const visibleLeaders = useMemo(
    () => leadersSorted.filter((l) => matchesFilter(l, category)),
    [leadersSorted, category]
  );

  const [openId, setOpenId] = useState<string | null>(null);

  // IMPORTANT: look up active leader from full list (not filtered list)
  const active = leadersSorted.find((l) => l.id === openId) ?? null;

  // ✅ FIX: Always give the galleries at least 3 items so autoplay works again.
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
    lang === "es" ? "Historia en desarrollo — pronto." : "Story in progress — coming soon.";

  const label = (c: Category) => {
    if (c === "all") return "Olivea";
    if (c === "hotel") return "Hotel";
    if (c === "restaurant") return lang === "es" ? "Restaurante" : "Restaurant";
    return lang === "es" ? "Café" : "Cafe";
  };

  const FULL_BLEED = "w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]";
  const PAGE_PAD = "px-6 sm:px-10 md:px-12 lg:px-12";
  const RAIL = "max-w-[1400px]";

  // ===== Animations =====
  const EASE = [0.22, 1, 0.36, 1] as const;

  const pageRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end start"],
  });

  const heroY = useSpring(useTransform(scrollYProgress, [0, 0.25], [0, -16]), {
    stiffness: 120,
    damping: 22,
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0.92]);

  return (
    <>
      <motion.div
        ref={pageRef}
        className="-mt-10 md:mt-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {/* HERO */}
        <section className="mt-0 sm:mt-2">
          <div className={`${FULL_BLEED} ${PAGE_PAD}`}>
            <div className={`${RAIL} mx-auto`}>
              <div className="grid grid-cols-12 gap-8 items-end">
                <div className="col-span-12 lg:col-span-8">
                  <div className="grid grid-cols-12">
                    <div className="col-span-12 lg:col-span-8">
                      <div className="flex items-start gap-5">
                        <div className="hidden sm:block shrink-0 opacity-80">
                          {/* mark */}
                        </div>

                        <motion.header
                          className="max-w-245 mt-0 sm:mt-6 lg:mt-10"
                          style={{ y: heroY, opacity: heroOpacity }}
                        >

                          <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
                            className="mt-1 text-(--olivea-ink) text-3xl md:text-4xl font-semibold leading-[1.05]"
                            style={{ fontFamily: "var(--font-serif)" }}
                          >
                            {team.leadersTitle ?? (lang === "es" ? "Lideres de Olivea" : "Leaders of Olivea")}
                          </motion.h1>
                        </motion.header>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DESKTOP FILTERS */}
                <motion.div
                  className="hidden lg:block col-span-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
                >
                  <div className="mt-4 flex flex-wrap gap-2 bg-transparent p-0 ring-0">
                    {(["all", "hotel", "restaurant", "cafe"] as Category[]).map((c) => {
                      const on = category === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCategory(c)}
                          className={[
                            "inline-flex items-center rounded-full px-4 py-2 text-sm transition",
                            on
                              ? "bg-(--olivea-olive) text-(--olivea-cream)"
                              : "bg-transparent text-(--olivea-ink)/70 ring-1 ring-(--olivea-ink)/20 hover:ring-(--olivea-ink)/35 hover:text-(--olivea-ink)",
                          ].join(" ")}
                        >
                          {label(c)}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE FILTER */}
        <motion.div
          className="lg:hidden mt-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
        >
          <div className={`${FULL_BLEED} ${PAGE_PAD}`}>
            <div className={`${RAIL} mx-auto`}>
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.24em] text-(--olivea-ink)/55">
                  {lang === "es" ? "Filtrar" : "Filter"}
                </div>
                <div className="text-xs text-(--olivea-ink)/55">
                  {visibleLeaders.length}
                </div>
              </div>

              <div className="mt-3 w-full overflow-x-auto no-scrollbar">
                <div className="flex w-full gap-2">
                  {(["all", "hotel", "restaurant", "cafe"] as Category[]).map((c) => {
                    const on = category === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={[
                          "shrink-0 rounded-full px-4 py-2 text-sm ring-1 transition",
                          on
                            ? "bg-(--olivea-olive) text-(--olivea-cream) ring-black/10"
                            : "bg-(--olivea-cream)/80 text-(--olivea-ink)/70 ring-black/10",
                        ].join(" ")}
                      >
                        {label(c)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* GRID */}
        <section className="mt-7">
          <div className={`${FULL_BLEED} ${PAGE_PAD}`}>
            <div className={`${RAIL} mx-auto`}>
              {/* Desktop grid */}
              <div className="hidden lg:grid grid-cols-12 gap-6 auto-rows-[360px]">
                {visibleLeaders.map((l) => (
                  <motion.button
                    key={l.id}
                    type="button"
                    onClick={() => setOpenId(l.id)}
                    className={[
                      "group relative overflow-hidden rounded-3xl ring-1 ring-black/10 transition",
                      tileClass((l.tile as TileSize) ?? "md"),
                    ].join(" ")}
                    whileHover={{ y: -2, scale: 1.01 }}
                  >
                    <div className="absolute inset-0 bg-white/35" />
                    <div className="absolute inset-0">
                      <Image
                        src={l.avatar ?? "/images/team/persona.jpg"}
                        alt={l.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain object-bottom"
                      />
                    </div>

                    <div className="absolute left-5 bottom-5">
                      <div className="inline-flex items-center rounded-full bg-white/85 backdrop-blur px-2 py-1 ring-1 ring-black/10">
                        <span className="inline-flex items-center rounded-full bg-(--olivea-olive) text-(--olivea-cream) text-xs font-medium px-3 py-1">
                          {l.name}
                        </span>
                        <span className="ml-2 mr-2 text-xs text-(--olivea-ink)/70 whitespace-nowrap">
                          {t(l.role)}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden grid grid-cols-1 gap-6 pb-28">
                {visibleLeaders.map((l) => (
                  <motion.button
                    key={l.id}
                    type="button"
                    onClick={() => setOpenId(l.id)}
                    className="group relative overflow-hidden rounded-3xl ring-1 ring-black/10 w-full h-85"
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
            </div>
          </div>
        </section>
      </motion.div>

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
                      {/* ✅ FIX: remove the border that looked like a random line */}
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
                            {t(active.tag) || (lang === "es" ? "Equipo" : "Team")}
                          </span>
                        </div>

                        <button type="button" onClick={goToProfile} className="text-left">
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

                        <p className="mt-6 text-base leading-relaxed text-(--olivea-ink)/80 max-w-xl">
                          {t(active.bio) || bioFallback}
                        </p>

                        {/* Linktree CTA */}
                        <div className="mt-7">
                          <button
                            type="button"
                            onClick={goToProfile}
                            className={[
                              "w-full sm:w-fit inline-flex items-center justify-center gap-2",
                              "rounded-2xl px-5 py-3 ring-1 ring-black/10 transition",
                              "bg-(--olivea-olive) text-(--olivea-cream)",
                              "hover:brightness-[1.02] active:scale-[0.99]",
                            ].join(" ")}
                          >
                            <span className="text-sm font-medium">
                              {lang === "es" ? "Ver links" : "View links"}
                            </span>
                            <span className="opacity-90">↗</span>
                          </button>

                          <div className="mt-2 text-[12px] text-(--olivea-ink)/55">
                            {lang === "es"
                              ? "Abre el perfil tipo Linktree de este miembro del equipo."
                              : "Opens this team member’s Linktree-style profile."}
                          </div>
                        </div>

                        <div className="mt-7 inline-flex rounded-full px-4 py-1 text-xs text-(--olivea-ink)/65 ring-1 ring-black/10 w-fit bg-white/40">
                          OLIVEA · {t(active.org)}
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
    </>
  );
}
