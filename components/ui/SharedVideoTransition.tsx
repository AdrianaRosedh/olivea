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
import { useSharedTransition, type SectionKey } from "@/contexts/SharedTransitionContext";

import HeroCasaLogo from "@/assets/herocasa.svg";
import HeroCafeLogo from "@/assets/herocafe.svg";
import HeroFarmLogo from "@/assets/herofarm.svg";

const LogoMap: Record<SectionKey, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  casa: HeroCasaLogo,
  cafe: HeroCafeLogo,
  farmtotable: HeroFarmLogo,
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getDurations(isPhone: boolean) {
  return {
    enter:  isPhone ? 0.90 : 1.10,
    exit:   isPhone ? 0.85 : 1.05,
    hold:   0.22,
    logoIn: isPhone ? 0.32 : 0.38,
  } as const;
}

const NAV_BUFFER_MS = 60;

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
  const [isPhone, setIsPhone] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [vh, setVh] = useState<number>(
    typeof window !== "undefined"
      ? (window.visualViewport?.height ?? window.innerHeight)
      : 800
  );
  const frozenRef = useRef(false);

  useEffect(() => {
    const vv = window.visualViewport;
    const pickH = () => vv?.height ?? window.innerHeight;

    frozenRef.current = phase !== "idle";

    const apply = () => {
      if (frozenRef.current) return;
      setIsPhone(window.innerWidth < 768);
      const h = pickH();
      setVh(h);
      document.documentElement.style.setProperty("--vh", `${h * 0.01}px`);
    };

    // initial
    const h0 = pickH();
    setVh(h0);
    document.documentElement.style.setProperty("--vh", `${h0 * 0.01}px`);
    setIsPhone(window.innerWidth < 768);

    // listeners
    const onResizeWin = () => { if (!frozenRef.current) apply(); };
    const onVVResize: EventListener = () => { if (!frozenRef.current) apply(); };
    const onVVScroll: EventListener = () => { if (!frozenRef.current) apply(); };

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
interface NetworkInformationLike { saveData?: boolean }
interface NavigatorWithDM extends Navigator { deviceMemory?: number; connection?: NetworkInformationLike }

export default function SharedVideoTransition() {
  const { isActive, sectionKey, targetHref, clearTransition } = useSharedTransition();
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
  const Logo = LogoMap[sectionKey];

  return createPortal(
    <Overlay
      Logo={Logo}
      targetHref={targetHref}
      phase={phase}
      setPhase={setPhase}
      onFullyDone={handleDone}
    />,
    document.body
  );
}

function Overlay({
  Logo,
  targetHref,
  phase,
  setPhase,
  onFullyDone,
}: {
  Logo: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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
    const dm = typeof nav.deviceMemory === "number" ? nav.deviceMemory : undefined;
    return saveData || (dm !== undefined && dm < 3);
  }, [isPhone]);

  // lock scroll & overscroll during the transition
  useEffect(() => {
    const rootStyle = document.documentElement.style;
    const bodyStyle = document.body.style;

    const prevOverflow = bodyStyle.overflow;
    const prevOB = rootStyle.getPropertyValue("overscroll-behavior");
    const prevTA = bodyStyle.getPropertyValue("touch-action");

    bodyStyle.overflow = "hidden";
    rootStyle.setProperty("overscroll-behavior", "none");
    bodyStyle.setProperty("touch-action", "none");

    return () => {
      bodyStyle.overflow = prevOverflow || "";
      if (prevOB) rootStyle.setProperty("overscroll-behavior", prevOB);
      else rootStyle.removeProperty("overscroll-behavior");

      if (prevTA) bodyStyle.setProperty("touch-action", prevTA);
      else bodyStyle.removeProperty("touch-action");
    };
  }, []);

  // optional prefetch (inline type guard; no deps warning)
  useEffect(() => {
    type Prefetchable = { prefetch?: (href: string) => void | Promise<void> };
    const r = router as unknown as Prefetchable;
    if (typeof r.prefetch === "function") {
      try { void r.prefetch(targetHref); } catch { /* ignore */ }
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
  const exitT  = useMotionValue<number>(0);
  const irisT  = useMotionValue<number>(0);

  const overlayY = useTransform([enterY, exitT], (vals: number[]) => {
    const e = vals[0] ?? 0;
    const t = vals[1] ?? 0;
    return e + -vh * t;
  });
  const logoY  = useTransform([enterY, exitT], (vals: number[]) => {
    const e = vals[0] ?? 0; const t = vals[1] ?? 0;
    return e + -vh * 0.92 * t;
  });
  const sheenY = useTransform([enterY, exitT], (vals: number[]) => {
    const e = vals[0] ?? 0; const t = vals[1] ?? 0;
    return e + -vh * 1.04 * t;
  });

  const clipPath = useTransform(irisT, (p: number) => {
    const inset = 6 * (1 - p);
    return `inset(${inset}% ${inset}% ${inset}% ${inset}% round ${frame.radius})`;
  });

  // Tap-blocking: keep pointerEvents active during animation
  const [blockTaps, setBlockTaps] = useState(true);

  // ENTER
  useEffect(() => {
    if (phase !== "enter") return;

    setBlockTaps(true); // start catching taps

    containerCtrls.set({ opacity: 0, willChange: "transform, opacity" });
    logoCtrls.set({ willChange: "transform, opacity, filter" });

    enterY.set(isPhone ? vh : 24);
    exitT.set(0);
    irisT.set(isPhone ? 1 : 0); // desktop irises in; mobile already card-sized

    logoCtrls.set({ opacity: 0, scale: 0.98, filter: "blur(8px)" });
    logoCtrls.start({
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: reduce ? 0.18 : DUR.logoIn, ease: EASE, delay: 0.06 },
    });

    if (!isPhone) {
      containerCtrls.start({
        opacity: 1,
        transition: { duration: reduce ? 0.25 : DUR.enter, ease: EASE },
      });
      animate(irisT, 1, { duration: reduce ? 0.25 : DUR.enter, ease: EASE });
    } else {
      containerCtrls.start({
        opacity: 1,
        transition: { duration: reduce ? 0.20 : 0.26, ease: EASE },
      });
    }

    animate(enterY, 0, { duration: reduce ? 0.25 : DUR.enter, ease: EASE });

    const navTimer = window.setTimeout(() => {
      router.push(targetHref);
      const raf = requestAnimationFrame(() => setPhase("covered"));
      const tm  = window.setTimeout(() => setPhase("covered"), 80);
      return () => { cancelAnimationFrame(raf); clearTimeout(tm); };
    }, Math.max(1, Math.round(DUR.enter * 1000)) + NAV_BUFFER_MS);

    return () => { clearTimeout(navTimer); };
  }, [phase, isPhone, vh, DUR.enter, DUR.logoIn, router, targetHref, setPhase, logoCtrls, containerCtrls, reduce, enterY, exitT, irisT]);

  // COVERED → EXIT
  useEffect(() => {
    if (phase !== "covered") return;
    const t = window.setTimeout(() => setPhase("exit"), reduce ? 80 : Math.round(DUR.hold * 1000));
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
        setBlockTaps(false); // release tap capture (defensive; we unmount next anyway)
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

  // Sheen opacity with low-end guard (mobile only)
  const sheenOpacity = lowEndMobile ? 0 : (isPhone ? 0.12 : 0.22);

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
        clipPath: isPhone ? undefined : clipPath,
        WebkitClipPath: isPhone ? undefined : clipPath,
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        isolation: "isolate",
        contain: "paint",
        // Tap-blocking ON during animation
        pointerEvents: blockTaps ? "auto" : "none",
        touchAction: "none",
      }}
      // prevent accidental scroll bounce when tapped
      onTouchMove={(e) => {
        if (blockTaps) e.preventDefault();
      }}
    >
      {/* sheen (micro-parallax) */}
      {(!lowEndMobile) && (
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

      {/* logo (micro-lag) */}
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
        <Logo width={220} className="h-auto" />  
      </motion.div>

      {/* subtle texture */}
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
