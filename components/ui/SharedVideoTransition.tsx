// components/ui/SharedVideoTransition.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  motion,
  useAnimation,
  useReducedMotion,
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

const LogoSrcMap: Record<SectionKey, string> = {
  casa: "/brand/herocasa.svg",
  cafe: "/brand/herocafe.svg",
  farmtotable: "/brand/herofarm.svg",
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getDurations(isPhone: boolean) {
  return {
    enter: isPhone ? 0.9 : 1.1,
    exit: isPhone ? 0.85 : 1.05,
    hold: 0.22,
    logoIn: isPhone ? 0.32 : 0.38,
  } as const;
}

const NAV_BUFFER_MS = 60;

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
  const reduce = useReducedMotion();

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

  // ✅ lock scroll & overscroll during the transition (FIXED: no "unlock()" function)
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

  // ✅ HARD FAILSAFE (prevents “stuck overlay => stuck scroll” on some Androids/PCs)
  useEffect(() => {
    const t = window.setTimeout(() => {
      onFullyDone();
    }, FAILSAFE_MS);
    return () => window.clearTimeout(t);
  }, [onFullyDone]);

  // optional prefetch (inline type guard)
  useEffect(() => {
    type Prefetchable = { prefetch?: (href: string) => void | Promise<void> };
    const r = router as unknown as Prefetchable;
    if (typeof r.prefetch === "function") {
      try {
        void r.prefetch(targetHref);
      } catch {
        /* ignore */
      }
    }
  }, [router, targetHref]);

  // FRAME: desktop = full hero; mobile = full-height rounded card
  const frame = useMemo(() => {
    if (!isPhone) return { ...DESKTOP_FRAME };
    return { ...MOBILE_FRAME_LIGHT };
  }, [isPhone]);

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

  const logoY = useTransform([enterY, exitT], (vals: number[]) => {
    const e = vals[0] ?? 0;
    const t = vals[1] ?? 0;
    return e + -vh * 0.92 * t;
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

  // Tap-blocking:
  const shouldBlockNow = phase === "enter" || phase === "covered";
  const [blockTaps, setBlockTaps] = useState(true);

  useEffect(() => {
    setBlockTaps(shouldBlockNow);
  }, [shouldBlockNow]);

  // Strict-mode safe: prevent double nav / double setPhase in dev
  const navFiredRef = useRef(false);
  const rafCoveredRef = useRef<number | null>(null);
  const tmCoveredRef = useRef<number | null>(null);
  const navTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
      if (rafCoveredRef.current) cancelAnimationFrame(rafCoveredRef.current);
      if (tmCoveredRef.current) window.clearTimeout(tmCoveredRef.current);
    };
  }, []);

  // ENTER
  useEffect(() => {
    if (phase !== "enter") return;

    navFiredRef.current = false;

    containerCtrls.set({ opacity: 0, willChange: "transform, opacity" });
    logoCtrls.set({ willChange: "transform, opacity, filter" });

    enterY.set(isPhone ? vh : 24);
    exitT.set(0);
    irisT.set(isPhone ? 1 : 0);

    logoCtrls.set({ opacity: 0, scale: 0.98, filter: "blur(8px)" });
    void logoCtrls.start({
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: reduce ? 0.18 : DUR.logoIn,
        ease: EASE,
        delay: 0.06,
      },
    });

    if (!isPhone) {
      void containerCtrls.start({
        opacity: 1,
        transition: { duration: reduce ? 0.25 : DUR.enter, ease: EASE },
      });

      if (!reduce) {
        animate(irisT, 1, { duration: DUR.enter, ease: EASE });
      } else {
        irisT.set(1);
      }
    } else {
      void containerCtrls.start({
        opacity: 1,
        transition: { duration: reduce ? 0.2 : 0.26, ease: EASE },
      });
    }

    animate(enterY, 0, { duration: reduce ? 0.25 : DUR.enter, ease: EASE });

    if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
    navTimerRef.current = window.setTimeout(() => {
      if (navFiredRef.current) return;
      navFiredRef.current = true;

      router.push(targetHref);

      if (rafCoveredRef.current) cancelAnimationFrame(rafCoveredRef.current);
      if (tmCoveredRef.current) window.clearTimeout(tmCoveredRef.current);

      rafCoveredRef.current = requestAnimationFrame(() => setPhase("covered"));
      tmCoveredRef.current = window.setTimeout(() => setPhase("covered"), 80);
    }, Math.max(1, Math.round(DUR.enter * 1000)) + NAV_BUFFER_MS);

    return () => {
      if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
      if (rafCoveredRef.current) cancelAnimationFrame(rafCoveredRef.current);
      if (tmCoveredRef.current) window.clearTimeout(tmCoveredRef.current);
    };
  }, [
    phase,
    isPhone,
    vh,
    DUR.enter,
    DUR.logoIn,
    router,
    targetHref,
    setPhase,
    logoCtrls,
    containerCtrls,
    reduce,
    enterY,
    exitT,
    irisT,
  ]);

  // COVERED → EXIT
  useEffect(() => {
    if (phase !== "covered") return;
    const t = window.setTimeout(
      () => setPhase("exit"),
      reduce ? 80 : Math.round(DUR.hold * 1000)
    );
    return () => clearTimeout(t);
  }, [phase, setPhase, DUR.hold, reduce]);

  // EXIT
  useEffect(() => {
    if (phase !== "exit") return;

    const controls = animate(exitT, 1, {
      duration: reduce ? 0.35 : DUR.exit,
      ease: EASE,
      onComplete: () => {
        containerCtrls.set({ willChange: "auto" });
        logoCtrls.set({ willChange: "auto" });
        onFullyDone();
      },
    });

    return () => controls.stop();
  }, [phase, exitT, DUR.exit, reduce, onFullyDone, containerCtrls, logoCtrls]);

  const background = useMemo(
    () =>
      isPhone
        ? `radial-gradient(120% 120% at 50% 30%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.00) 55%),
           radial-gradient(circle at 50% 50%, var(--olivea-olive,#5e7658) 0%, #4f5d46 60%, #3a4533 100%)`
        : `radial-gradient(120% 140% at 50% 0%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.00) 45%),
           radial-gradient(circle at 50% 45%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.00) 35%),
           radial-gradient(circle at 50% 50%, var(--olivea-olive,#5e7658) 0%, #4f5d46 56%, #3a4533 100%)`,
    [isPhone]
  );

  const sheenOpacity = lowEndMobile ? 0 : isPhone ? 0.12 : 0.22;
  const resolvedClipPath = !isPhone && !reduce ? clipPath : undefined;

  return (
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
        zIndex: 2147483647,
        background,
        y: overlayY,
        clipPath: resolvedClipPath,
        WebkitClipPath: resolvedClipPath,
        transform: "translate3d(0,0,0)",
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

      <motion.div
        animate={logoCtrls}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          y: logoY,
        }}
      >
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          <Image
            src={logoSrc}
            alt=""
            fill
            className="object-contain"
            sizes="128px"
            priority={false}
          />
        </div>
      </motion.div>

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
  );
}
