"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, MotionValue } from "framer-motion";
import { useRef, useState } from "react";
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
      className="fixed top-1/2 right-6 -translate-y-1/2 z-[60] flex flex-col gap-6 items-end"
    >
      {items.map((item) => (
        <IconContainer
          key={item.id}
          item={item}
          active={pathname === item.href}
          mouseY={mouseY}
        />
      ))}
    </motion.div>
  );
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
  const [hovered, setHovered] = useState(false);

  // Generate a more rounded and organic-looking borderRadius
  const [borderRadiusValue] = useState(() => {
    const randPercent = () => `${Math.floor(Math.random() * 20 + 40)}%`;
    return `${randPercent()} ${randPercent()} ${randPercent()} ${randPercent()} / ${randPercent()} ${randPercent()} ${randPercent()} ${randPercent()}`;
  });

  const distance = useTransform<number, number>(mouseY, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - bounds.y - bounds.height / 2;
  });

  const containerSize = useTransform(distance, [-150, 0, 150], [60, 80, 60]);
  const iconSize = useTransform(distance, [-150, 0, 150], [24, 32, 24]);

  const animatedContainer = useSpring(containerSize, { mass: 0.2, stiffness: 120, damping: 14 });
  const animatedIcon = useSpring(iconSize, { mass: 0.2, stiffness: 120, damping: 14 });

  return (
    <Link href={item.href} aria-label={item.label} className="relative">
      <motion.div
        ref={ref}
        style={{ width: animatedContainer, height: animatedContainer, borderRadius: borderRadiusValue }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "flex items-center justify-center transition-colors",
          active
            ? "bg-[var(--olivea-clay)] text-white"
            : "bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] hover:text-white"
        )}
      >
        <motion.div style={{ width: animatedIcon, height: animatedIcon }} className="flex items-center justify-center">
          {item.icon}
        </motion.div>

        <AnimatePresence mode="wait">
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute right-full mr-3 px-4 py-2 text-sm rounded-lg backdrop-blur-sm shadow-md border border-[var(--olivea-olive)]/10 bg-[var(--olivea-white)] text-[var(--olivea-olive)] font-semibold whitespace-nowrap"
            >
              {item.label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}