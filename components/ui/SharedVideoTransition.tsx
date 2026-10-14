// components/ui/SharedVideoTransition.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  useSharedTransition,
  type SectionKey,
} from "@/contexts/SharedTransitionContext";
import { lockBodyScroll, unlockBodyScroll } from "@/components/ui/scrollLock";
import { setModalOpen } from "@/components/ui/modalFlag";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const LogoSrcMap: Record<SectionKey, string> = {
  casa: "/brand/herocasa.svg",
  cafe: "/brand/herocafe.svg",
  farmtotable: "/brand/herofarm.svg",
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// About 1.3 s from tap to page (was ~2.3 s on a phone, ~2.6 s on a desktop,
// most of it a flat green pause while the page only started loading after
// the panel had fully risen).
function getDurations(isPhone: boolean) {
  return {
    enter: isPhone ? 0.55 : 0.65,
    exit: isPhone ? 0.6 : 0.7,
    minHoldMs: 120,
    logoIn: isPhone ? 0.28 : 0.32,
  } as const;
}

/** Start navigating this far into the rise, so the page loads under the panel. */
const NAV_AT = 0.5;
/** Lift the panel even if the destination logo never appears. */
const MAX_WAIT_MS = 2500;

// ✅ Failsafe so scroll can’t be trapped on weird devices/transitions.
const FAILSAFE_MS = 9000;

// Desktop: match the desktop hero frame
const DESKTOP_FRAME = {
  top: "1vh",
  left: "1vw",
  width: "98vw",
  height: "98vh",
  radius: "22px",
} as const;

// Mobile: full-height inside safe areas with ~1vh/~1vw margins and rounded corners
const MOBILE_FRAME_LIGHT = {
  top: "max(1vh, env(safe-area-inset-top))",
  left: "1vw",
  width: "98vw",
  height:
    "calc((var(--vh, 1vh) * 100) - max(1vh, env(safe-area-inset-top)) - env(safe-area-inset-bottom))",
  radius: "24px",
} as const;

type Phase = "idle" | "enter" | "covered" | "exit";

/* Stable viewport: sets --vh and freezes while animating (prevents iOS URL bar jank) */
function useStableViewport(phase: Phase) {
  const [isPhone, setIsPhone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  const [vh, setVh] = useState<number>(() => {
    if (typeof window === "undefined") return 800;
    return window.visualViewport?.height ?? window.innerHeight;
  });

  const frozenRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const vv = window.visualViewport;
    const pickH = () => vv?.height ?? window.innerHeight;

    frozenRef.current = phase !== "idle";

    // Always set the CSS var once (even if frozen) so layout is correct.
    const h0 = pickH();
    setVh(h0);
    document.documentElement.style.setProperty("--vh", `${h0 * 0.01}px`);
    setIsPhone(window.innerWidth < 768);

    const applyIfNotFrozen = () => {
      if (frozenRef.current) return;
      const h = pickH();
      setVh(h);
      document.documentElement.style.setProperty("--vh", `${h * 0.01}px`);
      setIsPhone(window.innerWidth < 768);
    };

    const onResizeWin = () => applyIfNotFrozen();
    const onVVResize: EventListener = () => applyIfNotFrozen();
    const onVVScroll: EventListener = () => applyIfNotFrozen();

    window.addEventListener("resize", onResizeWin, { passive: true });
    vv?.addEventListener("resize", onVVResize, { passive: true });
    vv?.addEventListener("scroll", onVVScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", onResizeWin);
      vv?.removeEventListener("resize", onVVResize);
      vv?.removeEventListener("scroll", onVVScroll);
    };
  }, [phase]);

  return { isPhone, vh };
}

/* Capability sniff (strict-typed): saveData / deviceMemory */
interface NetworkInformationLike {
  saveData?: boolean;
}
interface NavigatorWithDM extends Navigator {
  deviceMemory?: number;
  connection?: NetworkInformationLike;
}

export default function SharedVideoTransition() {
  const { isActive, sectionKey, targetHref, clearTransition } =
    useSharedTransition();

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (isActive && sectionKey && targetHref) {
      setMounted(true);
      setPhase("enter");
    }
  }, [isActive, sectionKey, targetHref]);

  const handleDone = () => {
    setMounted(false);
    clearTransition();
    setPhase("idle");
  };

  if (!mounted || !sectionKey || !targetHref) return null;
  const logoSrc = LogoSrcMap[sectionKey];

  return createPortal(
    <Overlay
      logoSrc={logoSrc}
      targetHref={targetHref}
      phase={phase}
      setPhase={setPhase}
      onFullyDone={handleDone}
    />,
    document.body
  );
}

function Overlay({
  logoSrc,
  targetHref,
  phase,
  setPhase,
  onFullyDone,
}: {
  logoSrc: string;
  targetHref: string;
  phase: Phase;
  setPhase: (p: Exclude<Phase, "idle">) => void;
  onFullyDone: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = usePrefersReducedMotion();

  const { isPhone, vh } = useStableViewport(phase);
  const DUR = useMemo(() => getDurations(isPhone), [isPhone]);

  // Low-end mode: drop sheen on mobile if saveData or deviceMemory < 3
  const lowEndMobile = useMemo(() => {
    if (!isPhone) return false;
    const nav = navigator as NavigatorWithDM;
    const saveData = !!nav.connection?.saveData;
    const dm =
      typeof nav.deviceMemory === "number" ? nav.deviceMemory : undefined;
    return saveData || (dm !== undefined && dm < 3);
  }, [isPhone]);

  // Lock scroll & overscroll during the transition.
  useEffect(() => {
    const rootStyle = document.documentElement.style;

    setModalOpen(true);
    lockBodyScroll();

    const prevOB = rootStyle.getPropertyValue("overscroll-behavior");
    rootStyle.setProperty("overscroll-behavior", "none");

    return () => {
      unlockBodyScroll();
      setModalOpen(false);

      if (prevOB) rootStyle.setProperty("overscroll-behavior", prevOB);
      else rootStyle.removeProperty("overscroll-behavior");
    };
  }, []);

  // Hard failsafe: the overlay can never trap the page.
  useEffect(() => {
    const t = window.setTimeout(() => onFullyDone(), FAILSAFE_MS);
    return () => window.clearTimeout(t);
  }, [onFullyDone]);

  // Prefetch the destination as soon as the overlay mounts.
  useEffect(() => {
    try {
      router.prefetch(targetHref);
    } catch {
      /* ignore */
    }
  }, [router, targetHref]);

  // FRAME: desktop = full hero; mobile = full-height rounded card
  const frame = useMemo(() => (isPhone ? { ...MOBILE_FRAME_LIGHT } : { ...DESKTOP_FRAME }), [isPhone]);

  const containerCtrls = useAnimation();
  const logoCtrls = useAnimation();

  const enterY = useMotionValue<number>(0);
  const exitT = useMotionValue<number>(0);
  const irisT = useMotionValue<number>(0);

  const overlayY = useTransform([enterY, exitT], (vals: number[]) => {
    const e = vals[0] ?? 0;
    const t = vals[1] ?? 0;
    return e + -vh * t;
  });

  const sheenY = useTransform([enterY, exitT], (vals: number[]) => {
    const e = vals[0] ?? 0;
    const t = vals[1] ?? 0;
    return e + -vh * 1.04 * t;
  });

  const clipPath = useTransform(irisT, (p: number) => {
    const inset = 6 * (1 - p);
    return `inset(${inset}% ${inset}% ${inset}% ${inset}% round ${frame.radius})`;
  });

  // The logo rides with the panel on the way in, then stays where the
  // destination shows its own logo while the panel lifts away.
  const logoEnterY = useTransform(enterY, (e: number) => e);
  const logoOpacityOut = useTransform(exitT, [0, 0.55, 0.85], [1, 1, 0]);

  // Where the logo sits: an estimate of the destination hero's logo until the
  // page is there, then the measured box of that very logo.
  const [logoBox, setLogoBox] = useState<LogoBox>(() => estimateLogoBox());

  // Tap-blocking while the panel covers the page.
  const blockTaps = phase === "enter" || phase === "covered";

  const navFiredRef = useRef(false);

  // ENTER: the panel rises; navigation starts halfway, so the new page loads
  // while the panel finishes covering the old one.
  useEffect(() => {
    if (phase !== "enter") return;
    navFiredRef.current = false;

    containerCtrls.set({ opacity: 0 });
    enterY.set(reduce ? 0 : isPhone ? vh : 24);
    exitT.set(0);
    irisT.set(isPhone || reduce ? 1 : 0);

    logoCtrls.set({ opacity: 0, scale: 0.98, filter: "blur(8px)" });
    void logoCtrls.start({
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: reduce ? 0.18 : DUR.logoIn, ease: EASE, delay: 0.06 },
    });

    void containerCtrls.start({
      opacity: 1,
      transition: { duration: reduce ? 0.2 : isPhone ? 0.22 : DUR.enter, ease: EASE },
    });
    if (!isPhone && !reduce) animate(irisT, 1, { duration: DUR.enter, ease: EASE });
    if (!reduce) animate(enterY, 0, { duration: DUR.enter, ease: EASE });

    const enterMs = Math.round((reduce ? 0.2 : DUR.enter) * 1000);
    const navTimer = window.setTimeout(() => {
      if (navFiredRef.current) return;
      navFiredRef.current = true;
      router.push(targetHref);
    }, Math.round(enterMs * NAV_AT));
    const coveredTimer = window.setTimeout(() => setPhase("covered"), enterMs);

    return () => {
      window.clearTimeout(navTimer);
      window.clearTimeout(coveredTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // COVERED → EXIT: as soon as the destination is on screen (its hero logo is
  // laid out), with a short minimum hold and a cap if the page is slow.
  const arrived = samePath(pathname, targetHref);
  useEffect(() => {
    if (phase !== "covered") return;
    let cancelled = false;
    const startedAt = performance.now();

    const tryExit = () => {
      if (cancelled) return;
      const waited = performance.now() - startedAt;
      const dest = arrived ? findDestinationLogo(logoSrc) : null;
      if (dest || waited >= MAX_WAIT_MS) {
        if (dest) setLogoBox(dest);
        const holdLeft = Math.max(0, (reduce ? 80 : DUR.minHoldMs) - waited);
        window.setTimeout(() => !cancelled && setPhase("exit"), holdLeft);
        return;
      }
      requestAnimationFrame(tryExit);
    };
    requestAnimationFrame(tryExit);
    return () => {
      cancelled = true;
    };
  }, [phase, arrived, logoSrc, setPhase, reduce, DUR.minHoldMs]);

  // EXIT: the panel lifts; the logo stays and fades out last, over the
  // destination's own logo in the same place.
  useEffect(() => {
    if (phase !== "exit") return;
    const controls = animate(exitT, 1, {
      duration: reduce ? 0.3 : DUR.exit,
      ease: EASE,
      onComplete: onFullyDone,
    });
    return () => controls.stop();
  }, [phase, exitT, DUR.exit, reduce, onFullyDone]);

  const background = useMemo(
    () =>
      isPhone
        ? `radial-gradient(120% 120% at 50% 30%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.00) 55%),
           radial-gradient(circle at 50% 50%, var(--olivea-olive,#566d51) 0%, #4f5d46 60%, #3a4533 100%)`
        : `radial-gradient(120% 140% at 50% 0%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.00) 45%),
           radial-gradient(circle at 50% 45%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.00) 35%),
           radial-gradient(circle at 50% 50%, var(--olivea-olive,#566d51) 0%, #4f5d46 56%, #3a4533 100%)`,
    [isPhone]
  );

  const sheenOpacity = lowEndMobile ? 0 : isPhone ? 0.12 : 0.22;
  const resolvedClipPath = !isPhone && !reduce ? clipPath : undefined;

  return (
    <>
      <motion.div
        animate={containerCtrls}
        style={{
          position: "fixed",
          top: frame.top,
          left: frame.left,
          width: frame.width,
          height: frame.height,
          borderRadius: frame.radius,
          overflow: "hidden",
          zIndex: 2147483646,
          background,
          y: overlayY,
          clipPath: resolvedClipPath,
          WebkitClipPath: resolvedClipPath,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          isolation: "isolate",
          contain: "paint",
          pointerEvents: blockTaps ? "auto" : "none",
          touchAction: blockTaps ? "none" : "auto",
        }}
        onTouchMove={(e) => {
          if (blockTaps) e.preventDefault();
        }}
      >
        {!lowEndMobile && (
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "conic-gradient(from 210deg at 50% 50%, rgba(255,255,255,0.00) 0deg, rgba(255,255,255,0.20) 38deg, rgba(255,255,255,0.00) 120deg)",
              mixBlendMode: "soft-light",
              filter: "blur(16px)",
              opacity: sheenOpacity,
              y: sheenY,
            }}
          />
        )}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: isPhone ? 0.02 : 0.04,
            mixBlendMode: "overlay",
            background:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px), " +
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px)",
          }}
        />
      </motion.div>

      {/* The logo: its own layer, at the destination logo's size and place. */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          zIndex: 2147483647,
          pointerEvents: "none",
          left: logoBox.left,
          top: logoBox.top,
          width: logoBox.size,
          height: logoBox.size,
          y: logoEnterY,
          opacity: logoOpacityOut,
          transition: "left 0.25s ease, top 0.25s ease, width 0.25s ease, height 0.25s ease",
        }}
      >
        <motion.div animate={logoCtrls} style={{ position: "relative", width: "100%", height: "100%" }}>
          <Image src={logoSrc} alt="" fill className="object-contain" sizes="(max-width: 767px) 200px, 320px" priority />
        </motion.div>
      </motion.div>
    </>
  );
}

type LogoBox = { left: number; top: number; size: number };

/** The destination hero's logo box before the page exists: centred on the
 *  page, a little above the middle, at the hero's size (170 px on a phone,
 *  260 px on a desktop — measured on the three section pages). */
function estimateLogoBox(): LogoBox {
  const w = window.innerWidth;
  const h = window.visualViewport?.height ?? window.innerHeight;
  const size = w < 768 ? 170 : 260;
  const cy = w < 768 ? h * 0.425 : h * 0.4;
  return { left: w / 2 - size / 2, top: cy - size / 2, size };
}

/** The destination page's own hero logo, once it is laid out. */
function findDestinationLogo(logoSrc: string): LogoBox | null {
  const name = logoSrc.split("/").pop() ?? "";
  for (const img of Array.from(document.querySelectorAll<HTMLImageElement>("main img, section img"))) {
    if (!(img.currentSrc || img.src).includes(name)) continue;
    const r = img.getBoundingClientRect();
    if (r.width < 40 || r.height < 40) continue;
    const size = Math.min(r.width, r.height);
    return { left: r.left + (r.width - size) / 2, top: r.top + (r.height - size) / 2, size };
  }
  return null;
}

function samePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const strip = (p: string) => p.split(/[?#]/)[0].replace(/\/+$/, "");
  return strip(pathname) === strip(href);
}
