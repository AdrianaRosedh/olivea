"use client"

import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" } },
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const path = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={path}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}