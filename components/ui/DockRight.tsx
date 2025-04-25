// components/ui/DockRight.tsx

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import { type MotionValue } from "framer-motion"

interface DockRightItem {
  id: string
  href: string
  icon: ReactNode
  label: string
}

interface DockRightProps {
  items: DockRightItem[]
}

export default function DockRight({ items }: DockRightProps) {
  const pathname = usePathname()
  const mouseY: MotionValue<number> = useMotionValue(Infinity)

  return (
    <motion.div
      onMouseMove={(e) => mouseY.set(e.pageY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className="flex flex-col gap-8 items-end pr-6 p-2"
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
  )
}

function IconContainer({
  item,
  active,
  mouseY,
}: {
  item: DockRightItem
  active: boolean
  mouseY: MotionValue<number> 
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  const distance = useTransform(mouseY, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 }
    return val - bounds.y - bounds.height / 2
  })

  const size = useTransform(distance, [-150, 0, 150], [64, 80, 64])
  const iconSize = useTransform(distance, [-150, 0, 150], [28, 36, 28])

  const animatedSize = useSpring(size, { mass: 0.1, stiffness: 150, damping: 12 })
  const animatedIcon = useSpring(iconSize, { mass: 0.1, stiffness: 150, damping: 12 })

  return (
    <Link href={item.href} tabIndex={0} aria-label={item.label} className="relative">
      <motion.div
        ref={ref}
        style={{ width: animatedSize, height: animatedSize }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "flex items-center justify-center transition-colors rounded-[40%_60%_60%_40%_/_40%_40%_60%_60%]",
          active
            ? "bg-[var(--olivea-clay)] text-white"
            : "bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] hover:text-white"
        )}
      >
        <motion.div
          style={{ width: animatedIcon, height: animatedIcon }}
          className="flex items-center justify-center"
        >
          {item.icon}
        </motion.div>

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute right-full mr-4 px-6 py-3 text-lg rounded-xl backdrop-blur-sm shadow-lg border border-[var(--olivea-olive)/20] bg-white text-[var(--olivea-olive)] whitespace-nowrap font-bold"
            >
              {item.label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  )
}