// components/ui/SharedVideoTransition.tsx
"use client";

import type React from "react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { useSharedTransition, type SectionKey } from "@/contexts/SharedTransitionContext";

// Logos (SVG React components)
import HeroCasaLogo from "@/assets/herocasa.svg";
import HeroCafeLogo from "@/assets/herocafe.svg";
import HeroFarmLogo from "@/assets/herofarm.svg";

const LogoMap: Record<SectionKey, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  casa: HeroCasaLogo,
  cafe: HeroCafeLogo,
  farmtotable: HeroFarmLogo,
};

// Easing & timings
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)" as const;
const DUR = {
  logoIn: 0.38,
  expandIn: 1.25,   // cover
  hold: 0.25,       // paint next page
  scrollAway: 1.10, // overlay + logo scroll upward
  logoOut: 0.36,
} as const;

// Geometry (hoisted)
const VB = 1000 as const;
const CENTER = VB / 2; // 500
const R_START = 0 as const;

export default function SharedVideoTransition() {
  const { isActive, sectionKey, targetHref, clearTransition } = useSharedTransition();
  if (!isActive || !sectionKey || !targetHref) return null;
  const Logo = LogoMap[sectionKey];

  return createPortal(
    <OverlayRunner Logo={Logo} targetHref={targetHref} onDone={clearTransition} />,
    document.body
  );
}

function OverlayRunner({
  Logo,
  targetHref,
  onDone,
}: {
  Logo: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  targetHref: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();

  // Refs
  const stageRef = useRef<HTMLDivElement | null>(null);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const turbRef = useRef<SVGFETurbulenceElement | null>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const sweepRef = useRef<HTMLDivElement | null>(null);
  const vignetteRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);

  // Computed geom (viewBox + viewport)
  const coverGeomRef = useRef<{ rCover: number; cyOff: number; logoTravelPx: number } | null>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current!;
    const circle = circleRef.current!;
    const turb = turbRef.current!;
    const disp = dispRef.current!;
    const sweep = sweepRef.current!;
    const vignette = vignetteRef.current!;
    const logo = logoRef.current!;

    // Force GPU & stable stacking
    gsap.set(stage, {
      perspective: 1200,
      transformStyle: "preserve-3d",
      rotateX: -1.2,
      rotateZ: -0.2,
      willChange: "transform",
    });

    // Compute radius to cover viewport diagonal (map px→viewBox)
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const shortSide = Math.min(vw, vh);
    const unitsPerPx = 1000 / shortSide;
    const diagonalPx = Math.hypot(vw, vh);
    const rCover = Math.ceil((diagonalPx * unitsPerPx) / 2) + 90; // bigger safety pad
    const cyOff = CENTER - rCover * 2.2; // push much farther past top
    const logoTravelPx = Math.round(vh * 1.35); // ensure logo fully exits on tall phones

    coverGeomRef.current = { rCover, cyOff, logoTravelPx };

    // Start values
    circle.setAttribute("cx", String(CENTER));
    circle.setAttribute("cy", String(CENTER));
    circle.setAttribute("r", String(R_START));
    turb.setAttribute("baseFrequency", "0.015");
    disp.setAttribute("scale", "36");

    gsap.set(sweep, { opacity: 0, rotate: -18, transformOrigin: "50% 50%" });
    gsap.set(vignette, { opacity: 0 });
    gsap.set(logo, {
      opacity: 0,
      scale: 1,
      y: 0,
      filter: "blur(8px)",
      willChange: "transform, opacity",
      force3D: true as unknown as undefined, // gsap accepts this internally
    });
  }, []);

  useEffect(() => {
    const stage = stageRef.current!;
    const circle = circleRef.current!;
    const turb = turbRef.current!;
    const disp = dispRef.current!;
    const sweep = sweepRef.current!;
    const vignette = vignetteRef.current!;
    const logo = logoRef.current!;

    const rCover = coverGeomRef.current?.rCover ?? 900;
    const cyOff = coverGeomRef.current?.cyOff ?? (CENTER - 900 * 2.2);
    const logoTravelPx = coverGeomRef.current?.logoTravelPx ?? Math.round(window.innerHeight * 1.35);

    let cancelled = false;
    let pushed = false;

    try {
      (router as unknown as { prefetch?: (href: string) => void | Promise<void> })
        .prefetch?.(targetHref);
    } catch {}

    if (reduce) {
      (async () => {
        await gsap.to(logo, { opacity: 1, filter: "blur(0)", duration: 0.2, ease: EASE });
        if (!pushed) { pushed = true; router.push(targetHref); }
        await gsap.to(logo, { y: -logoTravelPx, duration: 0.6, ease: EASE });
        if (!cancelled) onDone();
      })();
      return () => { cancelled = true; };
    }

    // Typed proxies (no any)
    const turbAnim = { bf: 0.015 };
    const dispAnim = { sc: 36 };
    const scroll = { t: 0 }; // 0→1 driver for scroll-away

    const tl = gsap.timeline({
      defaults: { ease: EASE },
      onComplete: () => { if (!cancelled) onDone(); },
    });

    // Camera micro settle
    tl.to(stage, { rotateX: -0.6, rotateZ: 0, duration: DUR.expandIn }, 0);

    // Logo in (minimal scale)
    tl.to(logo, { opacity: 1, filter: "blur(0px)", duration: DUR.logoIn }, 0.08);
    tl.to(logo, { scale: 1.02, duration: DUR.logoIn * 0.55 }, "<");
    tl.to(logo, { scale: 1.0,  duration: DUR.logoIn * 0.45 }, ">");

    // EXPAND (organic edge)
    tl.to(circle, { attr: { r: rCover }, duration: DUR.expandIn }, 0.05);
    tl.to(
      turbAnim,
      { bf: 0.010, duration: DUR.expandIn, onUpdate: () => turb.setAttribute("baseFrequency", turbAnim.bf.toFixed(3)) },
      0.05
    );
    tl.to(
      dispAnim,
      { sc: 22, duration: DUR.expandIn, onUpdate: () => disp.setAttribute("scale", Math.round(dispAnim.sc).toString()) },
      0.05
    );

    tl.to(sweep,    { opacity: 0.26, rotate: 22, duration: DUR.expandIn }, 0.06);
    tl.to(vignette, { opacity: 1, duration: 0.35 }, DUR.expandIn - 0.2);

    // FULL COVER → navigate + brief hold
    tl.add(() => { if (!pushed) { pushed = true; setTimeout(() => router.push(targetHref), 50); } });
    tl.to({}, { duration: DUR.hold });

    // SCROLL-AWAY — one driver animates BOTH mask cy and logo y every frame
    tl.to(
      scroll,
      {
        t: 1,
        duration: DUR.scrollAway,
        ease: EASE,
        onUpdate: () => {
          // circle center Y: CENTER → cyOff (viewBox units)
          const cy = CENTER + (cyOff - CENTER) * scroll.t;
          circle.setAttribute("cy", String(cy));
          // logo moves up by viewport height smoothly
          const y = -logoTravelPx * scroll.t;
          gsap.set(logo, { y, force3D: true as unknown as undefined });
        },
      },
      "scroll"
    );

    // Lights & frame easing out while scrolling
    tl.to(sweep,    { opacity: 0, rotate: 40, duration: DUR.scrollAway * 0.9 }, "scroll");
    tl.to(vignette, { opacity: 0, duration: DUR.logoOut }, "scroll+=0.10");

    // Camera back to neutral
    tl.to(stage, { rotateX: 0, rotateZ: 0, duration: DUR.logoOut * 0.9 }, "<");

    return () => { cancelled = true; tl.kill(); };
  }, [router, targetHref, onDone, reduce]);

  return (
    <div
      ref={stageRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* ORGANIC MASK + OLIVEA GRADIENT */}
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <filter id="oliveaLiquid" filterUnits="userSpaceOnUse">
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="2"
              seed="3"
              result="tNoise"
            />
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="tNoise"
              scale="36"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur stdDeviation="0.8" in="displaced" />
          </filter>

          <mask id="oliveaMask">
            <rect x="0" y="0" width={VB} height={VB} fill="black" />
            <circle ref={circleRef} cx={CENTER} cy={CENTER} r={R_START} fill="white" filter="url(#oliveaLiquid)" />
          </mask>

          <radialGradient id="oliveaGrad" cx="50%" cy="48%" r="65%">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.06)" />
            <stop offset="35%" stopColor="rgba(255,255,255,0.00)" />
          </radialGradient>
          <radialGradient id="oliveaBase" cx="50%" cy="50%" r="80%">
            <stop offset="0%"  stopColor="var(--olivea-olive, #5a6852)" />
            <stop offset="56%" stopColor="#4f5d46" />
            <stop offset="100%" stopColor="#3a4533" />
          </radialGradient>
        </defs>

        <g mask="url(#oliveaMask)">
          <rect x="0" y="0" width={VB} height={VB} fill="url(#oliveaGrad)" />
          <rect x="0" y="0" width={VB} height={VB} fill="url(#oliveaBase)" />
        </g>
      </svg>

      {/* Conic light sweep */}
      <div
        ref={sweepRef}
        style={{
          position: "fixed",
          inset: 0,
          background:
            "conic-gradient(from 210deg at 50% 50%, rgba(255,255,255,0.00) 0deg, rgba(255,255,255,0.24) 38deg, rgba(255,255,255,0.00) 120deg)",
          mixBlendMode: "soft-light",
          filter: "blur(18px)",
          willChange: "transform, opacity",
        }}
      />

      {/* Vignette */}
      <div
        ref={vignetteRef}
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.16) 100%)",
          pointerEvents: "none",
          willChange: "opacity",
        }}
      />

      {/* Centered logo (rides with the wipe on exit) */}
      <div
        ref={logoRef}
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 10,
          willChange: "transform, opacity",
        }}
      >
        <Logo width={220} height="auto" />
      </div>

      {/* Subtle grain */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.04,
          mixBlendMode: "overlay",
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px), " +
            "repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px)",
        }}
      />
    </div>
  );
}