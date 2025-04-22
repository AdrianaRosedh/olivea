"use client"

import { cn } from "@/lib/utils"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { useRef, useState } from "react"

export const FloatingDock = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[]
  className?: string
}) => {
  return (
    <div className="hidden md:block">
      <FloatingDockDesktop items={items} className={className} />
    </div>
  )
}

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[]
  className?: string
}) => {
  const mouseY = useMotionValue(Infinity)

  return (
    <motion.div
      onMouseMove={(e) => mouseY.set(e.clientY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={cn(
        "fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer key={item.title} mouseY={mouseY} {...item} />
      ))}
    </motion.div>
  )
}

function IconContainer({
  mouseY,
  title,
  icon,
  href,
}: {
  mouseY: MotionValue
  title: string
  icon: React.ReactNode
  href: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const distance = useTransform(mouseY, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 }
    return val - bounds.y - bounds.height / 2
  })

  const size = useTransform(distance, [-100, 0, 100], [40, 60, 40])
  const iconSize = useTransform(distance, [-100, 0, 100], [20, 32, 20])

  const sizeSpring = useSpring(size, { mass: 0.1, stiffness: 150, damping: 12 })
  const iconSpring = useSpring(iconSize, { mass: 0.1, stiffness: 150, damping: 12 })

  const [hovered, setHovered] = useState(false)

  return (
    <a href={href} aria-label={title}>
      <motion.div
        ref={ref}
        style={{ width: sizeSpring, height: sizeSpring }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center justify-center rounded-full bg-[var(--background)] border border-[var(--border)] transition-colors"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="absolute left-full ml-3 px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded-md text-xs text-[var(--foreground)]"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div style={{ width: iconSpring, height: iconSpring }}>
          {icon}
        </motion.div>
      </motion.div>
    </a>
  )
}