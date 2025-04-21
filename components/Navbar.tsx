"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie"

type NavbarProps = {
  lang: "en" | "es"
}

export default function Navbar({ lang }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
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

  const toggleLang = () => {
    const newLang = lang === "en" ? "es" : "en"

    // Swap `/en/xyz` → `/es/xyz`, preserving the path
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`)

    // Set preferred language cookie (for middleware)
    Cookies.set("NEXT_LOCALE", newLang, { expires: 365 })

    router.push(newPath)
  }

  return (
    <nav className="w-full border-b sticky top-0 z-50 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Logo centered */}
        <Link href={`/${lang}`} className="text-xl font-bold block text-center">
          Olivea
        </Link>

        {/* Language Toggle */}
        <div className="absolute right-4 top-4">
          <button
            onClick={toggleLang}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-100 transition"
          >
            {lang === "en" ? "ES" : "EN"}
          </button>
        </div>

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