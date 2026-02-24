// components/navigation/DockRight.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  MotionValue,
  useReducedMotion,
} from "framer-motion";
import { useLayoutEffect, useMemo, useRef, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DockRightItem {
  id: string;
  href: string;
  icon: ReactNode;
  label: string;
}

interface DockRightProps {
  items: DockRightItem[];
}

type DockMode = "off" | "desktop" | "tablet";

function useDockRightMode(): DockMode {
  const [mode, setMode] = useState<DockMode>("off");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mqDesktop = window.matchMedia("(min-width: 1025px)");
    const mqFine = window.matchMedia("(pointer: fine)");
    const mqHover = window.matchMedia("(hover: hover)");

    const mqTabletLandscape = window.matchMedia(
      "(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)"
    );

    const mqPortraitTablet = window.matchMedia(
      "(max-width: 900px) and (orientation: portrait)"
    );

    const compute = () => {
      if (mqPortraitTablet.matches) { setMode("off"); return; }
      if (mqDesktop.matches && mqFine.matches && mqHover.matches) { setMode("desktop"); return; }
      if (mqTabletLandscape.matches) { setMode("tablet"); return; }
      setMode("off");
    };

    compute();

    const opts: AddEventListenerOptions = { passive: true };

    mqDesktop.addEventListener?.("change", compute);
    mqFine.addEventListener?.("change", compute);
    mqHover.addEventListener?.("change", compute);
    mqTabletLandscape.addEventListener?.("change", compute);
    mqPortraitTablet.addEventListener?.("change", compute);

    window.addEventListener("resize", compute, opts);
    window.addEventListener("orientationchange", compute, opts);

    return () => {
      mqDesktop.removeEventListener?.("change", compute);
      mqFine.removeEventListener?.("change", compute);
      mqHover.removeEventListener?.("change", compute);
      mqTabletLandscape.removeEventListener?.("change", compute);
      mqPortraitTablet.removeEventListener?.("change", compute);

      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);

  return mode;
}

export default function DockRight({ items }: DockRightProps) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  // hooks must be unconditional
  const mode = useDockRightMode();

  const mouseY: MotionValue<number> = useMotionValue(Number.POSITIVE_INFINITY);
  const [hovering, setHovering] = useState(false);

  const desktopEnabled = mode === "desktop" && !reduce;

  const onEnter = useCallback(() => {
    if (!desktopEnabled) return;
    setHovering(true);
  }, [desktopEnabled]);

  const onLeave = useCallback(() => {
    setHovering(false);
    mouseY.set(Number.POSITIVE_INFINITY);
  }, [mouseY]);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!desktopEnabled) return;
      if (!hovering) return;
      mouseY.set(e.clientY);
    },
    [desktopEnabled, hovering, mouseY]
  );

  useEffect(() => {
    setHovering(false);
    mouseY.set(Number.POSITIVE_INFINITY);
  }, [mode, mouseY]);

  if (mode === "off") return null;

  const right = "calc(var(--gutter) + env(safe-area-inset-right))";

  return (
    <motion.nav
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onPointerMove={onMove}
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-60 flex flex-col items-end",
        mode === "tablet" ? "gap-4" : "gap-6"
      )}
      style={{ right }}
      aria-label="Quick navigation"
    >
      {items.map((item) => {
        const active =
          pathname === item.href ||
          pathname.startsWith(item.href + "/") ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <IconContainer
            key={item.id}
            item={item}
            active={active}
            mouseY={mouseY}
            reduce={!!reduce}
            mode={mode}
          />
        );
      })}
    </motion.nav>
  );
}

function seededBlobRadius(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return 40 + (h % 21);
  };
  const p = () => `${rand()}%`;
  return `${p()} ${p()} ${p()} ${p()} / ${p()} ${p()} ${p()} ${p()}`;
}

function IconContainer({
  item,
  active,
  mouseY,
  reduce,
  mode,
}: {
  item: DockRightItem;
  active: boolean;
  mouseY: MotionValue<number>;
  reduce: boolean;
  mode: DockMode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const centerY = useRef(0);

  const [open, setOpen] = useState(false);
  const tipId = `dockright-tip-${item.id}`;
  const borderRadiusValue = useMemo(() => seededBlobRadius(item.id), [item.id]);

  const desktop = mode === "desktop";
  const tablet = mode === "tablet";

  useLayoutEffect(() => {
    if (!desktop) return;
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const b = el.getBoundingClientRect();
      centerY.current = b.top + b.height / 2;
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [desktop]);

  const distance = useTransform(mouseY, (y) => {
    if (!desktop || reduce) return 0;
    return y - centerY.current;
  });

  const containerSize = useTransform(
    distance,
    [-180, 0, 180],
    desktop ? [56, 80, 56] : [56, 56, 56],
    { clamp: true }
  );

  const iconSize = useTransform(
    distance,
    [-180, 0, 180],
    desktop ? [22, 30, 22] : [24, 24, 24],
    { clamp: true }
  );

  const animatedContainer = useSpring(containerSize, { mass: 0.18, stiffness: 140, damping: 16 });
  const animatedIcon = useSpring(iconSize, { mass: 0.18, stiffness: 140, damping: 16 });

  const onOpen = () => desktop && setOpen(true);
  const onClose = () => desktop && setOpen(false);

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-describedby={desktop && open ? tipId : undefined}
      className="relative"
    >
      <motion.div
        ref={ref}
        style={{ width: animatedContainer, height: animatedContainer, borderRadius: borderRadiusValue }}
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
        onFocus={onOpen}
        onBlur={onClose}
        className={cn(
          "flex items-center justify-center outline-none border transition-colors",
          "focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/35 focus-visible:ring-offset-2 focus-visible:ring-offset-(--olivea-white)",
          active
            ? "bg-(--olivea-olive) text-(--olivea-cream) border-(--olivea-olive)/20 shadow-sm"
            : "bg-(--olivea-clay) text-(--olivea-white) border-transparent hover:bg-(--olivea-olive) hover:text-(--olivea-white)"
        )}
      >
        <motion.div style={{ width: animatedIcon, height: animatedIcon }} className="flex items-center justify-center">
          {item.icon}
        </motion.div>

        <AnimatePresence mode="wait">
          {desktop && open && (
            <motion.div
              id={tipId}
              role="tooltip"
              initial={{ opacity: 0, x: 10, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="pointer-events-none absolute right-full mr-3 px-4 py-2 text-sm rounded-lg backdrop-blur-sm shadow-md border border-(--olivea-olive)/10 bg-(--olivea-white) text-(--olivea-olive) font-semibold whitespace-nowrap"
            >
              {item.label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {tablet && (
        <div
          className={cn(
            "absolute right-full mr-3 top-1/2 -translate-y-1/2",
            "px-3 py-1 rounded-full border border-(--olivea-olive)/10",
            "bg-(--olivea-white)/90 backdrop-blur-sm shadow-sm",
            "text-[12px] font-semibold whitespace-nowrap",
            active ? "text-(--olivea-olive) opacity-95" : "text-(--olivea-olive) opacity-75"
          )}
          aria-hidden="true"
        >
          {item.label}
        </div>
      )}
    </Link>
  );
}