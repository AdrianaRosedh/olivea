"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type DockRightItem = {
  id: string
  href: string
  icon: ReactNode
  label: string
}

type DockRightProps = {
  items: DockRightItem[]
}

export default function DockRight({ items }: DockRightProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-4 items-center">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            "group relative flex flex-col items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-300 shadow-sm text-gray-700 hover:text-white hover:bg-[var(--olivea-soil)] transition-colors",
            pathname === item.href && "bg-[var(--olivea-soil)] text-white"
          )}
        >
          {item.icon}
          <span className="absolute left-full ml-2 text-xs bg-white shadow rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  )
}