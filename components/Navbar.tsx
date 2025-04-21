"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { GlobeIcon } from "lucide-react"

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

  const switchLocale = (newLang: "en" | "es") => {
    const segments = pathname.split("/")
    segments[1] = newLang
    const newPath = segments.join("/") || "/"
    Cookies.set("NEXT_LOCALE", newLang)
    router.push(newPath)
  }

  return (
    <nav className="w-full border-b sticky top-0 z-50 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 relative flex flex-col items-center">
        {/* Language Toggle - Top Right */}
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center gap-1 border rounded transition hover:bg-gray-100",
                "text-sm px-3 py-2", // default (desktop)
                "md:text-sm md:px-3 md:py-2 text-xs px-2 py-1" // smaller on mobile
              )}
            >
              <GlobeIcon className="w-4 h-4" />
              {lang.toUpperCase()}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => switchLocale("en")}>
                🇺🇸 English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchLocale("es")}>
                🇲🇽 Español
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Logo centered */}
        <Link
          href={`/${lang}`}
          className="text-2xl md:text-4xl font-bold block text-center"
        >
          Olivea
        </Link>

        {/* Mobile View: nav under logo */}
        <div className="flex justify-around mt-4 md:hidden w-full">
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

        {/* Desktop View: nav centered below logo */}
        <div className="hidden md:flex justify-center gap-8 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-lg font-medium transition hover:underline",
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