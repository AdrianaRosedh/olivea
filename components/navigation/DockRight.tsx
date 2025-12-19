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
} from "framer-motion";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
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

export default function DockRight({ items }: DockRightProps) {
  const pathname = usePathname();
  const mouseY: MotionValue<number> = useMotionValue(Number.POSITIVE_INFINITY);

  return (
    <motion.div
      onMouseMove={(e) => mouseY.set(e.clientY)}
      onMouseLeave={() => mouseY.set(Number.POSITIVE_INFINITY)}
      className="fixed top-1/2 right-6 -translate-y-1/2 z-60 hidden md:flex flex-col gap-6 items-end"
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
          />
        );
      })}
    </motion.div>
  );
}

function seededBlobRadius(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return 40 + (h % 21); // 40–60
  };
  const p = () => `${rand()}%`;
  return `${p()} ${p()} ${p()} ${p()} / ${p()} ${p()} ${p()} ${p()}`;
}

function IconContainer({
  item,
  active,
  mouseY,
}: {
  item: DockRightItem;
  active: boolean;
  mouseY: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const centerY = useRef(0);
  const [open, setOpen] = useState(false);

  const tipId = `dockright-tip-${item.id}`;
  const borderRadiusValue = useMemo(() => seededBlobRadius(item.id), [item.id]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const b = el.getBoundingClientRect();
      centerY.current = b.top + b.height / 2;
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const distance = useTransform(mouseY, (y) => y - centerY.current);

  const containerSize = useTransform(distance, [-180, 0, 180], [56, 78, 56], {
    clamp: true,
  });
  const iconSize = useTransform(distance, [-180, 0, 180], [22, 30, 22], {
    clamp: true,
  });

  const animatedContainer = useSpring(containerSize, {
    mass: 0.18,
    stiffness: 140,
    damping: 16,
  });
  const animatedIcon = useSpring(iconSize, {
    mass: 0.18,
    stiffness: 140,
    damping: 16,
  });

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-describedby={open ? tipId : undefined}
      className="relative"
    >
      <motion.div
        ref={ref}
        style={{
          width: animatedContainer,
          height: animatedContainer,
          borderRadius: borderRadiusValue,
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={cn(
          "flex items-center justify-center transition-colors outline-none border",
          "focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/35 focus-visible:ring-offset-2 focus-visible:ring-offset-(--olivea-white)",
          active
            ? "bg-(--olivea-olive) text-(--olivea-cream) border-(--olivea-olive)/20 shadow-sm"
            : "bg-(--olivea-clay) text-(--olivea-white) border-transparent hover:bg-(--olivea-olive) hover:text-(--olivea-white)"
        )}
      >
        <motion.div
          style={{ width: animatedIcon, height: animatedIcon }}
          className="flex items-center justify-center"
        >
          {item.icon}
        </motion.div>

        <AnimatePresence mode="wait">
          {open && (
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
    </Link>
  );
}
