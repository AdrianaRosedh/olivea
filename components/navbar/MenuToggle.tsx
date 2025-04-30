"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const Path = (props: any) => (
  <motion.path fill="transparent" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" {...props} />
)

type MenuToggleProps = {
  toggle: () => void
  isOpen: boolean
  className?: string
}

export default function MenuToggle({ toggle, isOpen, className }: MenuToggleProps) {
  return (
    <button
      onClick={() => {
        navigator.vibrate?.(10)
        toggle()
      }}
      aria-label="Toggle menu"
      className={cn(
        "p-3 rounded-full focus:outline-none focus:ring-0 focus:bg-transparent active:bg-transparent transition",
        className,
      )}
      style={{
        zIndex: 1001, // Increased z-index to be higher than the drawer
        position: "relative", // Ensure the z-index works properly
        pointerEvents: "auto", // Ensure clicks are always captured
      }}
    >
      <svg width="28" height="28" viewBox="0 0 23 23">
        <Path
          variants={{
            closed: { d: "M 2 2.5 L 20 2.5" },
            open: { d: "M 3 16.5 L 17 2.5" },
          }}
          animate={isOpen ? "open" : "closed"}
        />
        <Path
          d="M 2 9.423 L 20 9.423"
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }}
          animate={isOpen ? "open" : "closed"}
          transition={{ duration: 0.1 }}
        />
        <Path
          variants={{
            closed: { d: "M 2 16.346 L 20 16.346" },
            open: { d: "M 3 2.5 L 17 16.346" },
          }}
          animate={isOpen ? "open" : "closed"}
        />
      </svg>
    </button>
  )
}
