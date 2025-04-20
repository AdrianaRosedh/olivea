"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type NavbarProps = {
  lang: "en" | "es"
}

export default function Navbar({ lang }: NavbarProps) {
  const pathname = usePathname()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  const navItems = [
    { label: "Hotel", href: `/${lang}/casa` },
    { label: "Restaurant", href: `/${lang}/restaurant` },
    { label: "Café", href: `/${lang}/cafe` },
  ]

  return (
    <nav className="w-full border-b sticky top-0 z-50 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Logo centered */}
        <Link href={`/${lang}`} className="text-xl font-bold block text-center">
          Olivea
        </Link>

        {/* Mobile View: nav under logo */}
        <div className="flex justify-around mt-4 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition hover:underline",
                pathname === item.href && "text-black"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop View: nav top right */}
        <div className="hidden md:flex justify-end gap-6 mt-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition hover:underline",
                pathname === item.href && "text-black"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}