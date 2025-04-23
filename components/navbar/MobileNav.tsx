"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Calendar, BookOpen, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

type MobileNavProps = {
  lang: "en" | "es"
  isDrawerOpen: boolean
}

export function MobileNav({ lang, isDrawerOpen }: MobileNavProps) {
  const [hasMounted, setHasMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`
  if (isHome) return null

  const vibrate = () => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  const navItems = [
    {
      label: "Journal",
      href: `/${lang}/journal`,
      icon: <BookOpen className="w-6 h-6" />,
      active: pathname.includes("/journal"),
    },
    {
      label: "Reserve",
      href: `/${lang}/reservations`,
      icon: <Calendar className="w-6 h-6" />,
      active: pathname.includes("/reservations"),
    },
    {
      label: "Chat",
      href: "#chat",
      icon: <MessageSquare className="w-6 h-6" />,
      isButton: true,
    },
  ]

  return (
    <nav
      className={cn(
        "fixed bottom-0 w-full z-50 md:hidden border-t bg-[var(--olivea-paper)] backdrop-blur-sm",
        isDrawerOpen && "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex justify-around items-center py-3 px-4">
        {navItems.map(({ label, href, icon, active, isButton }) =>
          isButton ? (
            <button
              key={label}
              id="chatbot-toggle"
              onClick={vibrate}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md transition-all duration-150",
                "text-[var(--olivea-soil)] active:scale-[0.95]",
                "hover:bg-[var(--olivea-soil)] hover:text-white px-5 py-3"
              )}
            >
              {icon}
              <span className="text-[13px] font-medium">{label}</span>
            </button>
          ) : (
            <Link
              key={href}
              href={href}
              onClick={vibrate}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md transition-all duration-150",
                "px-5 py-3 text-[13px] font-medium active:scale-[0.95]",
                active
                  ? "bg-[var(--olivea-soil)] text-white"
                  : "text-[var(--olivea-soil)] hover:bg-[var(--olivea-soil)] hover:text-white"
              )}
            >
              {icon}
              <span>{label}</span>
            </Link>
          )
        )}
      </div>
    </nav>
  )
}