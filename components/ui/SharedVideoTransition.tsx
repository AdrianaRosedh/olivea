// components/ui/SharedVideoTransition.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
    enter: isPhone ? 0.90 : 1.10,
    exit:  isPhone ? 0.85 : 1.05,
    hold:  0.22,
    logoIn:isPhone ? 0.32 : 0.38,
  } as const;
}

const NAV_BUFFER_MS = 60;

// === NEW: frame tuning tokens ===
// Desktop must *exactly* match your old video frame:
const DESKTOP_FRAME = {
  top: "1vh",
  left: "1vw",
  width: "98vw",
  height: "98vh",
  radius: "22px", // keep in sync with your video corner radius
} as const;

// Mobile should be *slightly larger* than the viewport.
// Overscan adds bleed on all sides, avoiding edge glitches.
const MOBILE_OVERSCAN = 0.06; // 6% overscan; tweak to taste (0.04–0.08 works great)

export default function SharedVideoTransition() {
  const { isActive, sectionKey, targetHref, clearTransition } = useSharedTransition();

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "enter" | "covered" | "exit">("idle");

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
  phase: "idle" | "enter" | "covered" | "exit";
  setPhase: (p: "enter" | "covered" | "exit") => void;
  onFullyDone: () => void;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [isMobile, setIsMobile] = useState(false);
  const [vh, setVh] = useState<number>(typeof window !== "undefined" ? window.innerHeight : 800);
  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      setVh(window.innerHeight);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const DUR = useMemo(() => getDurations(isMobile), [isMobile]);

  // lock body scroll during transition
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // optional prefetch
  useEffect(() => {
    try {
      (router as unknown as { prefetch?: (href: string) => void | Promise<void> }).prefetch?.(targetHref);
    } catch {}
  }, [router, targetHref]);

  // === UPDATED: frame computation ===
  const frame = useMemo(() => {
    if (!isMobile) {
      // exact desktop mask
      return {
        top: DESKTOP_FRAME.top,
        left: DESKTOP_FRAME.left,
        width: DESKTOP_FRAME.width,
        height: DESKTOP_FRAME.height,
        radius: DESKTOP_FRAME.radius,
      };
    }
    // mobile overscan (slightly larger than viewport)
    const p = MOBILE_OVERSCAN * 100; // percent
    const half = p / 2;
    return {
      top: `-${half}vh`,
      left: `-${half}vw`,
      width: `calc(100vw + ${p}vw)`,
      height:`calc(100vh + ${p}vh)`,
      radius: "0px",
    };
  }, [isMobile]);

  const containerCtrls = useAnimation();
  const logoCtrls = useAnimation();

  const enterY = useMotionValue<number>(0);
  const exitT  = useMotionValue<number>(0);

  const overlayY = useTransform([enterY, exitT], (vals: number[]) => {
    const e = vals[0] ?? 0; const t = vals[1] ?? 0;
    return e + -vh * t;
    });
  const logoY    = useTransform([enterY, exitT], (vals: number[]) => {
    const e = vals[0] ?? 0; const t = vals[1] ?? 0;
    return e + -vh * 0.92 * t; // micro lag
  });
  const sheenY   = useTransform([enterY, exitT], (vals: number[]) => {
    const e = vals[0] ?? 0; const t = vals[1] ?? 0;
    return e + -vh * 1.04 * t; // micro lead
  });

  const irisT = useMotionValue<number>(0);
  const clipPath = useTransform(irisT, (p: number) => {
    const inset = 6 * (1 - p);
    return `inset(${inset}% ${inset}% ${inset}% ${inset}% round ${frame.radius})`;
  });

  // ENTER
  useEffect(() => {
    if (phase !== "enter") return;

    enterY.set(isMobile ? vh : 24);
    exitT.set(0);
    irisT.set(isMobile ? 1 : 0);

    logoCtrls.set({ opacity: 0, scale: 0.98, filter: "blur(8px)" });
    logoCtrls.start({
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: reduce ? 0.18 : DUR.logoIn, ease: EASE, delay: 0.06 },
    });

    if (!isMobile) {
      containerCtrls.set({ opacity: 0 });
      containerCtrls.start({
        opacity: 1,
        transition: { duration: reduce ? 0.25 : DUR.enter, ease: EASE },
      });
      animate(irisT, 1, { duration: reduce ? 0.25 : DUR.enter, ease: EASE });
    }

    animate(enterY, 0, { duration: reduce ? 0.25 : DUR.enter, ease: EASE });

    const navTimer = window.setTimeout(() => {
      router.push(targetHref);
      const raf = requestAnimationFrame(() => setPhase("covered"));
      const tm = window.setTimeout(() => setPhase("covered"), 80);
      return () => { cancelAnimationFrame(raf); clearTimeout(tm); };
    }, Math.max(1, Math.round(DUR.enter * 1000)) + NAV_BUFFER_MS);

    return () => { clearTimeout(navTimer); };
  }, [phase, isMobile, vh, DUR.enter, DUR.logoIn, router, targetHref, setPhase, logoCtrls, containerCtrls, reduce, enterY, exitT, irisT]);

  // COVERED → EXIT
  useEffect(() => {
    if (phase !== "covered") return;
    const t = window.setTimeout(() => setPhase("exit"), reduce ? 80 : Math.round(DUR.hold * 1000));
    return () => clearTimeout(t);
  }, [phase, setPhase, DUR.hold, reduce]);

  // EXIT (one driver)
  useEffect(() => {
    if (phase !== "exit") return;
    const controls = animate(exitT, 1, {
      duration: reduce ? 0.35 : DUR.exit,
      ease: EASE,
      onComplete: onFullyDone,
    });
    return () => controls.stop();
  }, [phase, exitT, DUR.exit, reduce, onFullyDone]);

  const background = useMemo(
    () =>
      `radial-gradient(120% 140% at 50% 0%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.00) 45%),
       radial-gradient(circle at 50% 45%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.00) 35%),
       radial-gradient(circle at 50% 50%, var(--olivea-olive,#5a6852) 0%, #4f5d46 56%, #3a4533 100%)`,
    []
  );

  const sheenOpacity = isMobile ? 0.16 : 0.22;

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
        clipPath: isMobile ? undefined : (clipPath as unknown as string),
        WebkitClipPath: isMobile ? undefined : (clipPath as unknown as string),
        willChange: "transform, opacity, clip-path",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        isolation: "isolate",
        contain: "paint",
      }}
    >
      {/* sheen (micro-parallax) */}
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
        <Logo width={220} height="auto" />
      </motion.div>
      {/* light texture */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: isMobile ? 0.02 : 0.04,
          mixBlendMode: "overlay",
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px), " +
            "repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px)",
        }}
      />
    </motion.div>
  );
}
