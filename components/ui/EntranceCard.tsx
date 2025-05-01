"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface EntranceCardProps {
  href: string
  label: string
  desc: string
}

export function EntranceCard({ href, label, desc }: EntranceCardProps) {
  return (
    <Link href={href} className="group relative w-64 h-40">
      {/* subtle gradient accent behind */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--olivea-olive)] to-[var(--olivea-sage)] opacity-20",
          "transition-opacity group-hover:opacity-40"
        )}
      />
      {/* frosted glass panel */}
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative z-10 flex flex-col items-center justify-center h-full rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-[var(--olivea-ink)]"
      >
        <h3 className="text-xl font-serif mb-1">{label}</h3>
        <p className="text-sm font-sans opacity-80">{desc}</p>
      </motion.div>
    </Link>
  )
}