// components/navigation/MenuToggle.tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ComponentProps, FC, Ref } from "react";

type PathProps = ComponentProps<typeof motion.path>;

const Path: FC<PathProps> = (props) => (
  <motion.path
    fill="transparent"
    strokeWidth="2.5"
    stroke="currentColor"
    strokeLinecap="round"
    {...props}
  />
);

type MenuToggleProps = {
  toggle: () => void;
  isOpen: boolean;
  className?: string;
  buttonRef?: Ref<HTMLButtonElement>;
};

export default function MenuToggle({
  toggle,
  isOpen,
  className,
  buttonRef,
}: MenuToggleProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => {
        navigator.vibrate?.(10);
        toggle();
      }}
      aria-label="Toggle menu"
      aria-expanded={isOpen}
      className={cn(
        "p-3 rounded-full focus:outline-none focus:ring-0 focus:bg-transparent active:bg-transparent transition",
        className
      )}
      style={{
        zIndex: 1001,
        position: "relative",
        pointerEvents: "auto",
      }}
    >
      <svg width="28" height="28" viewBox="0 0 23 23" aria-hidden="true">
        <Path
          // ✅ fallback d so it’s never undefined
          d="M 2 2.5 L 20 2.5"
          variants={{
            closed: { d: "M 2 2.5 L 20 2.5" },
            open: { d: "M 3 16.5 L 17 2.5" },
          }}
          initial={false}
          animate={isOpen ? "open" : "closed"}
        />

        <Path
          d="M 2 9.423 L 20 9.423"
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }}
          initial={false}
          animate={isOpen ? "open" : "closed"}
          transition={{ duration: 0.1 }}
        />

        <Path
          // ✅ fallback d so it’s never undefined
          d="M 2 16.346 L 20 16.346"
          variants={{
            closed: { d: "M 2 16.346 L 20 16.346" },
            open: { d: "M 3 2.5 L 17 16.346" },
          }}
          initial={false}
          animate={isOpen ? "open" : "closed"}
        />
      </svg>
    </button>
  );
}