"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import type { PhilosophySection, Lang } from "./philosophyTypes";

gsap.registerPlugin(ScrollTrigger);

// optional; ok to keep
gsap.ticker.lagSmoothing(1000, 16);

function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
}

/* ---------------- tuning ---------------- */

const FIRST_CHAPTER_ID = "origins";

const STICKY_TOP = 150;
const PICK_LINE = STICKY_TOP + 40;

const REVEAL_OFFSET_Y = 10;
const REVEAL_IN_DUR = 0.35;
const REVEAL_OUT_DUR = 0.22;

const MOVE_DUR = 0.45;
const RESIZE_DUR = 0.55;
const TEXT_FADE_DUR = 0.30;
const EASE = "power3.out";

const INK = "#5e7658";
const INK_SOFT = "#a3b09d";

/* ---------------- UI ---------------- */

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="mt-1.5 h-1.5 w-1.5 rounded-full bg-(--olivea-olive) opacity-60"
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
    />
  );
}

function PracticesContent({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  const hasItems = !!items?.length;

  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-4">
        <div
          className="text-[11px] uppercase tracking-[0.42em] text-(--olivea-olive)"
          style={{ opacity: 0.85 }}
        >
          {title}
        </div>
        <div className="h-px flex-1 bg-(--olivea-olive)/25" />
      </div>

      {hasItems ? (
        <ul
          className="mt-4 space-y-3 text-[15px] leading-[1.65]"
          style={{ color: INK }}
        >
          {items!.map((x) => (
            <li key={x} className="flex gap-3">
              <Dot />
              <span className="flex-1">{x}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="mt-4 text-[15px] leading-[1.65]"
          style={{ color: INK_SOFT }}
        >
          —
        </div>
      )}
    </div>
  );
}

/* ---------------- Mobile accordion (smooth open + stagger text) ---------------- */

function MobilePracticesAccordion({
  lang,
  sections,
}: {
  lang: Lang;
  sections: PhilosophySection[];
}) {
  const title = tt(lang, "Prácticas", "Practices");
  const viewLabel = tt(lang, "Ver", "View");

  // start closed (recommended)
  const [openId, setOpenId] = useState<string>("");

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
    );
  }, []);

  // per-card refs
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tlRefs = useRef<Record<string, gsap.core.Timeline | null>>({});

  const setPanelRef = useCallback((id: string) => {
    return (el: HTMLDivElement | null) => {
      panelRefs.current[id] = el;
    };
  }, []);

  // init: force all panels collapsed and content hidden (prevents first-tap pop)
  useEffect(() => {
    for (const s of sections) {
      const panel = panelRefs.current[s.id];
      if (!panel) continue;

      gsap.set(panel, { height: 0, overflow: "hidden" });

      const inner = panel.querySelector<HTMLElement>("[data-panel-inner]");
      if (inner) gsap.set(inner, { opacity: 0, y: 10 });

      const items = panel.querySelectorAll<HTMLElement>("[data-practice-item]");
      if (items.length) gsap.set(items, { opacity: 0, y: 10 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animateOpen = useCallback(
    (id: string) => {
      const panel = panelRefs.current[id];
      if (!panel) return;

      const inner = panel.querySelector<HTMLElement>("[data-panel-inner]");
      const items = panel.querySelectorAll<HTMLElement>("[data-practice-item]");

      // kill in-flight
      tlRefs.current[id]?.kill();
      tlRefs.current[id] = null;

      // ensure collapsed baseline
      gsap.set(panel, { overflow: "hidden" });
      gsap.set(panel, { height: 0 });

      // keep content hidden at start
      if (inner) gsap.set(inner, { opacity: 0, y: 10 });
      if (items.length) gsap.set(items, { opacity: 0, y: 10 });

      // IMPORTANT: measure AFTER DOM is in "open" state (content exists),
      // but while height is 0; scrollHeight still gives target.
      const target = Math.ceil(panel.scrollHeight);

      if (prefersReducedMotion) {
        gsap.set(panel, { height: "auto" });
        if (inner) gsap.set(inner, { opacity: 1, y: 0 });
        if (items.length) gsap.set(items, { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
      tlRefs.current[id] = tl;

      // 1) grow the card (visible growth)
      tl.to(panel, { height: target, duration: 0.55, ease: "power3.out" }, 0);

      // 2) reveal inner after growth begins (feels intentional)
      if (inner) {
        tl.to(inner, { opacity: 1, y: 0, duration: 0.38, ease: "power2.out" }, 0.14);
      }

      // 3) stagger bullet lines
      if (items.length) {
        tl.to(
          items,
          {
            opacity: 1,
            y: 0,
            duration: 0.32,
            ease: "power2.out",
            stagger: 0.055,
          },
          0.18
        );
      }

      // 4) after animation, allow auto height for orientation/font changes
      tl.set(panel, { height: "auto" }, ">");
    },
    [prefersReducedMotion]
  );

  const animateClose = useCallback(
    (id: string) => {
      const panel = panelRefs.current[id];
      if (!panel) return;

      const inner = panel.querySelector<HTMLElement>("[data-panel-inner]");
      const items = panel.querySelectorAll<HTMLElement>("[data-practice-item]");

      tlRefs.current[id]?.kill();
      tlRefs.current[id] = null;

      if (prefersReducedMotion) {
        gsap.set(panel, { height: 0, overflow: "hidden" });
        if (inner) gsap.set(inner, { opacity: 0, y: 10 });
        if (items.length) gsap.set(items, { opacity: 0, y: 10 });
        return;
      }

      // lock current pixel height (because it may be auto)
      const current = Math.ceil(panel.getBoundingClientRect().height);
      gsap.set(panel, { height: current, overflow: "hidden" });

      const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
      tlRefs.current[id] = tl;

      // fade text out slightly before collapse
      if (items.length) {
        tl.to(
          items,
          {
            opacity: 0,
            y: 6,
            duration: 0.16,
            ease: "power2.out",
            stagger: { each: 0.025, from: "end" },
          },
          0
        );
      }
      if (inner) {
        tl.to(inner, { opacity: 0, y: 6, duration: 0.20, ease: "power2.out" }, 0.02);
      }

      // then collapse
      tl.to(panel, { height: 0, duration: 0.36, ease: "power3.inOut" }, 0.05);
    },
    [prefersReducedMotion]
  );

  const toggle = useCallback(
    (id: string) => {
      const next = openId === id ? "" : id;

      // close currently open
      if (openId) animateClose(openId);

      setOpenId(next);

      // open new
      if (next) {
        // ensure next tick so layout has settled
        requestAnimationFrame(() => animateOpen(next));
      }
    },
    [openId, animateOpen, animateClose]
  );

  return (
    <div className="lg:hidden px-4 pb-6">
      <div className="space-y-3">
        {sections.map((s) => {
          const isOpen = openId === s.id;
          const items = s.practices ?? [];
          const panelId = `practices-panel-${s.id}`;

          return (
            <div
              key={s.id}
              className={[
                "rounded-2xl overflow-hidden",
                "bg-(--olivea-cream)/70",
                "ring-1 ring-(--olivea-olive)/18",
                "shadow-[0_14px_34px_rgba(18,24,16,0.08)]",
              ].join(" ")}
              style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
            >
              {/* Header */}
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-4">
                    <div
                      className="text-[11px] uppercase tracking-[0.42em] text-(--olivea-olive)"
                      style={{ opacity: 0.85 }}
                    >
                      {title}
                    </div>
                    <div className="h-px flex-1 bg-(--olivea-olive)/18" />
                  </div>

                  <div className="mt-3 text-[12px] uppercase tracking-[0.32em] text-(--olivea-olive)/70">
                    {tt(lang, "Capítulo", "Chapter")}{" "}
                    {String(s.order ?? "").padStart(2, "0")}
                  </div>

                  <div className="mt-2 text-[18px] leading-tight text-(--olivea-olive) font-medium">
                    {s.title}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-[14px] text-(--olivea-olive)/65">
                    {viewLabel}
                  </span>

                  <span
                    aria-hidden="true"
                    className="h-9 w-9 rounded-full ring-1 ring-(--olivea-olive)/18 bg-white/35 flex items-center justify-center"
                  >
                    <span
                      className="block h-2.5 w-2.5 border-r border-b border-(--olivea-olive)/70"
                      style={{
                        transform: isOpen
                          ? "rotate(-135deg) translateY(1px)"
                          : "rotate(45deg) translateY(-1px)",
                        transition: "transform 180ms ease",
                      }}
                    />
                  </span>
                </div>
              </button>

              {/* Expandable panel — THIS is what grows */}
              <div
                id={panelId}
                ref={setPanelRef(s.id)}
                className="border-t border-(--olivea-olive)/12 will-change-[height]"
                style={{ height: 0, overflow: "hidden" }}
              >
                <div data-panel-inner className="px-6 pb-5">
                  {items.length ? (
                    <ul
                      className="pt-4 space-y-3 text-[15px] leading-[1.65]"
                      style={{ color: INK }}
                    >
                      {items.map((x) => (
                        <li key={x} data-practice-item className="flex gap-3">
                          <Dot />
                          <span className="flex-1">{x}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div
                      className="pt-4 text-[15px] leading-[1.65]"
                      style={{ color: INK_SOFT }}
                    >
                      —
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Desktop floating card (GSAP) ---------------- */

export default function FloatingPracticesCardGSAP({
  lang,
  sections,
}: {
  lang: Lang;
  sections: PhilosophySection[];
}) {
  const sectionById = useMemo(() => {
    const m = new Map<string, PhilosophySection>();
    sections.forEach((s) => m.set(s.id, s));
    return m;
  }, [sections]);

  /* ---- DESKTOP-ONLY SWITCH (prevents heavy work on phones) ---- */
  const [isDesktop, setIsDesktop] = useState(false);
  const isDesktopRef = useRef(false);

  const triggersRef = useRef<ScrollTrigger[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setIsDesktop(mq.matches);
      isDesktopRef.current = mq.matches;
    };

    sync();

    if (mq.addEventListener) mq.addEventListener("change", sync);
    else mq.addListener(sync);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", sync);
      else mq.removeListener(sync);
    };
  }, []);

  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [frontId, setFrontId] = useState<string>(sections[0]?.id ?? "");
  const [backId, setBackId] = useState<string>(sections[0]?.id ?? "");

  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);
  enabledRef.current = enabled;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  const measureFrontRef = useRef<HTMLDivElement | null>(null);
  const measureBackRef = useRef<HTMLDivElement | null>(null);

  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const title = tt(lang, "Prácticas", "Practices");

  const getAnchorRect = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return null;
    const anchor = section.querySelector<HTMLElement>("[data-practices-anchor]");
    if (!anchor) return null;
    const r = anchor.getBoundingClientRect();
    return { left: r.left, width: r.width };
  };

  // When leaving desktop, HARD kill all GSAP work from this component
  useEffect(() => {
    if (isDesktop) return;

    setEnabled(false);

    tlRef.current?.kill();
    tlRef.current = null;

    triggersRef.current.forEach((t) => t.kill());
    triggersRef.current = [];

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;

    if (wrapRef.current) {
      gsap.set(wrapRef.current, { opacity: 0, clearProps: "x,width,y" });
    }
  }, [isDesktop]);

  // initial hidden (desktop only)
  useEffect(() => {
    if (!isDesktop) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    gsap.set(wrap, { opacity: 0, y: STICKY_TOP + REVEAL_OFFSET_Y });
  }, [isDesktop]);

  // Reveal/hide (desktop only)
  useEffect(() => {
    if (!isDesktop) return;

    const wrap = wrapRef.current;
    if (!wrap) return;

    const firstMarker = document.querySelector<HTMLElement>(
      `[data-practices-switch][data-section-id="${FIRST_CHAPTER_ID}"]`
    );
    if (!firstMarker) return;

    const show = () => {
      if (!isDesktopRef.current) return;
      if (enabledRef.current) return;
      setEnabled(true);

      const ar = getAnchorRect(activeId) ?? getAnchorRect(frontId);
      if (ar) gsap.set(wrap, { x: ar.left, width: ar.width });

      gsap.to(wrap, {
        opacity: 1,
        y: STICKY_TOP,
        duration: REVEAL_IN_DUR,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const hide = () => {
      if (!enabledRef.current) return;
      setEnabled(false);

      tlRef.current?.kill();
      tlRef.current = null;

      gsap.to(wrap, {
        opacity: 0,
        y: STICKY_TOP + REVEAL_OFFSET_Y,
        duration: REVEAL_OUT_DUR,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const st = ScrollTrigger.create({
      trigger: firstMarker,
      start: () => `top top+=${STICKY_TOP}`,
      onEnter: show,
      onEnterBack: show,
      onLeaveBack: hide,
    });

    triggersRef.current.push(st);
    rafRef.current = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      st.kill();
      triggersRef.current = triggersRef.current.filter((x) => x !== st);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [isDesktop, activeId, frontId]);

  // Deterministic switching (desktop only)
  useEffect(() => {
    if (!isDesktop) return;

    const markers = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-practices-switch][data-section-id]"
      )
    );
    if (!markers.length) return;

    const local: ScrollTrigger[] = [];

    for (const el of markers) {
      const id = el.dataset.sectionId;
      if (!id) continue;

      const st = ScrollTrigger.create({
        trigger: el,
        start: () => `top top+=${PICK_LINE}`,
        onEnter: () =>
          enabledRef.current && isDesktopRef.current && setActiveId(id),
        onEnterBack: () =>
          enabledRef.current && isDesktopRef.current && setActiveId(id),
      });

      local.push(st);
      triggersRef.current.push(st);
    }

    rafRef.current = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      local.forEach((t) => t.kill());
      triggersRef.current = triggersRef.current.filter(
        (t) => !local.includes(t)
      );
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [isDesktop]);

  // Align on resize (desktop only)
  useEffect(() => {
    if (!isDesktop) return;
    if (!enabled) return;

    const wrap = wrapRef.current;
    if (!wrap) return;

    const onResize = () => {
      if (!isDesktopRef.current) return;
      const ar = getAnchorRect(activeId);
      if (!ar) return;
      gsap.set(wrap, { x: ar.left, width: ar.width, y: STICKY_TOP });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isDesktop, enabled, activeId]);

  // Morph on active change (desktop only)
  useEffect(() => {
    if (!isDesktop) return;
    if (!enabled) return;
    if (!activeId) return;
    if (activeId === frontId) return;

    const wrap = wrapRef.current;
    const card = cardRef.current;
    const front = frontRef.current;
    const back = backRef.current;
    const mf = measureFrontRef.current;
    const mb = measureBackRef.current;

    if (!wrap || !card || !front || !back || !mf || !mb) return;

    const ar = getAnchorRect(activeId);
    if (!ar) return;

    tlRef.current?.kill();
    tlRef.current = null;

    setBackId(activeId);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(() => {
      const frontH = mf.getBoundingClientRect().height;
      const backH = mb.getBoundingClientRect().height;

      const tl = gsap.timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
          setFrontId(activeId);
          gsap.set(front, { opacity: 1 });
          gsap.set(back, { opacity: 0 });
          gsap.set(card, { clearProps: "height" });
          tlRef.current = null;
        },
      });

      tlRef.current = tl;

      tl.set(card, { height: frontH }, 0);

      tl.to(
        wrap,
        { x: ar.left, width: ar.width, duration: MOVE_DUR, ease: EASE },
        0
      );

      tl.to(card, { height: backH, duration: RESIZE_DUR, ease: EASE }, 0);

      tl.to(
        front,
        { opacity: 0, duration: TEXT_FADE_DUR, ease: "power2.out" },
        0.12
      );
      tl.fromTo(
        back,
        { opacity: 0 },
        { opacity: 1, duration: TEXT_FADE_DUR, ease: "power2.out" },
        0.18
      );
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [isDesktop, enabled, activeId, frontId]);

  const frontSection = sectionById.get(frontId);
  const backSection = sectionById.get(backId);
  const frontItems = frontSection?.practices ?? [];
  const backItems = backSection?.practices ?? [];

  return (
    <>
      {/* ✅ Mobile: light accordion only */}
      <MobilePracticesAccordion lang={lang} sections={sections} />

      {/* ✅ Desktop: floating card only (and GSAP only runs on desktop) */}
      <div
        ref={wrapRef}
        className="pointer-events-none fixed z-80 hidden lg:block"
        style={{
          left: 0,
          top: 0,
          opacity: 0,
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          willChange: "transform, width, opacity",
        }}
      >
        <div
          ref={cardRef}
          className={[
            "relative overflow-hidden rounded-2xl",
            "bg-(--olivea-cream)/70",
            "ring-1 ring-(--olivea-olive)/18",
            "shadow-[0_18px_44px_rgba(18,24,16,0.10)]",
          ].join(" ")}
          style={{
            willChange: "height",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/70" />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/20 via-transparent to-(--olivea-olive)/3" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_1px_1px,rgba(40,60,35,0.22)_1px,transparent_0)] bg-size-[10px_10px]"
            aria-hidden="true"
          />

          <div className="relative">
            <div
              ref={frontRef}
              className="relative"
              style={{ willChange: "opacity", transform: "translateZ(0)" }}
            >
              <PracticesContent title={title} items={frontItems} />
            </div>

            <div
              ref={backRef}
              className="absolute inset-0"
              style={{
                opacity: 0,
                willChange: "opacity",
                transform: "translateZ(0)",
              }}
            >
              <PracticesContent title={title} items={backItems} />
            </div>
          </div>
        </div>
      </div>

      {/* Offscreen measurers */}
      <div
        className="fixed -left-156.25 top-0 opacity-0 pointer-events-none hidden lg:block"
        aria-hidden="true"
      >
        <div className="w-105">
          <div ref={measureFrontRef}>
            <div className="rounded-2xl bg-(--olivea-cream)/70 ring-1 ring-(--olivea-olive)/18 overflow-hidden">
              <PracticesContent title={title} items={frontItems} />
            </div>
          </div>

          <div ref={measureBackRef} className="mt-6">
            <div className="rounded-2xl bg-(--olivea-cream)/70 ring-1 ring-(--olivea-olive)/18 overflow-hidden">
              <PracticesContent title={title} items={backItems} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}