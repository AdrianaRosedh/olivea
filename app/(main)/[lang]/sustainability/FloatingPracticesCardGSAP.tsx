"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import type { PhilosophySection, Lang } from "./philosophyTypes";

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(1000, 16);

function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
}

/* ---------------- tuning ---------------- */

const FIRST_CHAPTER_ID = "origins";

const STICKY_TOP = 150; // move to 120–140 if you want it higher
const PICK_LINE = STICKY_TOP + 40;

const REVEAL_OFFSET_Y = 10;
const REVEAL_IN_DUR = 0.35;
const REVEAL_OUT_DUR = 0.22;

const MOVE_DUR = 0.45;
const RESIZE_DUR = 0.55;
const TEXT_FADE_DUR = 0.30;
const EASE = "power3.out";

// Olivea “ink” (darker + warmer)
const INK = "#5e7658";
const INK_SOFT = "a3b09d";

/* ---------------- UI: Olivea Field Note ---------------- */

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="mt-1.75 h-1.5 w-1,5 rounded-full bg-(--olivea-olive) opacity-60"
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
      {/* Label row */}
      <div className="flex items-center gap-4">
        <div
          className="text-[11px] uppercase tracking-[0.42em] text-(--olivea-olive)"
          style={{ opacity: 0.85 }}
        >
          {title}
        </div>
        <div className="h-px flex-1 bg-(--olivea-olive)/25" />
      </div>

      {/* Body (editorial) */}
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

  // initial hidden
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    gsap.set(wrap, {
      opacity: 0,
      y: STICKY_TOP + REVEAL_OFFSET_Y,
      filter: "blur(2px)",
    });
  }, []);

  // Reveal/hide: chapter 01 marker hits card top line
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const firstMarker = document.querySelector<HTMLElement>(
      `[data-practices-switch][data-section-id="${FIRST_CHAPTER_ID}"]`
    );
    if (!firstMarker) return;

    const show = () => {
      if (enabledRef.current) return;
      setEnabled(true);

      const ar = getAnchorRect(activeId) ?? getAnchorRect(frontId);
      if (ar) gsap.set(wrap, { x: ar.left, width: ar.width });

      gsap.to(wrap, {
        opacity: 1,
        y: STICKY_TOP,
        filter: "blur(0px)",
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
        filter: "blur(2px)",
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

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => st.kill();
  }, [activeId, frontId]);

  // Deterministic switching: marker hits PICK_LINE → setActiveId
  useEffect(() => {
    const markers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-practices-switch][data-section-id]")
    );
    if (!markers.length) return;

    const triggers: ScrollTrigger[] = [];

    for (const el of markers) {
      const id = el.dataset.sectionId;
      if (!id) continue;

      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: () => `top top+=${PICK_LINE}`,
          onEnter: () => enabledRef.current && setActiveId(id),
          onEnterBack: () => enabledRef.current && setActiveId(id),
        })
      );
    }

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => triggers.forEach((t) => t.kill());
  }, []);

  // Keep x/width aligned on resize
  useEffect(() => {
    if (!enabled) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onResize = () => {
      const ar = getAnchorRect(activeId);
      if (!ar) return;
      gsap.set(wrap, { x: ar.left, width: ar.width, y: STICKY_TOP });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [enabled, activeId]);

  // Morph on active change (dual-layer). Kill in-flight morph to handle fast scrolling.
  useEffect(() => {
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

    let raf = 0;
    raf = window.requestAnimationFrame(() => {
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

      tl.to(wrap, { x: ar.left, width: ar.width, duration: MOVE_DUR, ease: EASE }, 0);

      tl.to(card, { height: backH, duration: RESIZE_DUR, ease: EASE }, 0);

      tl.to(front, { opacity: 0, duration: TEXT_FADE_DUR, ease: "power2.out" }, 0.18);
      tl.fromTo(back, { opacity: 0 }, { opacity: 1, duration: TEXT_FADE_DUR, ease: "power2.out" }, 0.24);

      tl.fromTo(card, { scale: 0.996 }, { scale: 1, duration: 0.30, ease: "power2.out" }, 0.10);
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, activeId, frontId]);

  const frontSection = sectionById.get(frontId);
  const backSection = sectionById.get(backId);
  const frontItems = frontSection?.practices ?? [];
  const backItems = backSection?.practices ?? [];

  return (
    <>
      <div
        ref={wrapRef}
        className="pointer-events-none fixed z-80 hidden lg:block"
        style={{ left: 0, top: 0, opacity: 0 }}
      >
        {/* Olivea Field Note card */}
        <div
          ref={cardRef}
          className={[
            "relative overflow-hidden",
            // less “bubble”, more “artifact”
            "rounded-2xl",
            // paper tint (not bright white)
            "bg-(--olivea-cream)/70",
            // subtle border like stationery
            "ring-1 ring-(--olivea-olive)/18",
            // calm shadow
            "shadow-[0_18px_44px_rgba(18,24,16,0.10)]",
          ].join(" ")}
          style={{ willChange: "height, transform, filter" }}
        >
          {/* top paper edge */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/70" />
          {/* gentle wash */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/20 via-transparent to-(--olivea-olive)/3" />
          {/* micro grain */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_1px_1px,rgba(40,60,35,0.22)_1px,transparent_0)] bg-size-[10pm_10px]" />

          <div className="relative">
            <div ref={frontRef} className="relative">
              <PracticesContent title={title} items={frontItems} />
            </div>

            <div ref={backRef} className="absolute inset-0" style={{ opacity: 0 }}>
              <PracticesContent title={title} items={backItems} />
            </div>
          </div>
        </div>
      </div>

      {/* Offscreen measurers */}
      <div
        className="fixed -left-625] top-0 opacity-0 pointer-events-none hidden lg:block"
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
