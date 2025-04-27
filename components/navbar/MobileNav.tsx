"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { Calendar, BookOpen, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReservation } from "@/contexts/ReservationContext"

type MobileNavProps = {
  lang: "en" | "es"
  isDrawerOpen: boolean
}

export function MobileNav({ lang, isDrawerOpen }: MobileNavProps) {
  const [hasMounted, setHasMounted] = useState(false)
  const pathname = usePathname()
  const { openReservationModal } = useReservation()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Define vibrate function with useCallback to avoid recreation
  const vibrate = useCallback(() => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }, [])

  // Handle reservation click with useCallback
  const handleReservationClick = useCallback(() => {
    vibrate()
    try {
      console.log("Opening reservation modal from mobile nav")
      openReservationModal()
    } catch (error) {
      console.error("Error opening reservation modal:", error)
    }
  }, [vibrate, openReservationModal])

  if (!hasMounted) return null

  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`
  if (isHome) return null

  const navItems = [
    {
      label: "Journal",
      href: `/${lang}/journal`,
      icon: <BookOpen className="w-5 h-5" />,
      active: pathname.includes("/journal"),
    },
    {
      label: "Reserve",
      action: handleReservationClick,
      icon: <Calendar className="w-5 h-5" />,
      isButton: true,
    },
    {
      label: "Chat",
      href: "#chat",
      icon: <MessageSquare className="w-5 h-5" />,
      isButton: true,
    },
  ]

  return (
    <nav
      className={cn(
        "fixed bottom-0 w-full z-40 md:hidden border-t bg-[var(--olivea-paper)] backdrop-blur-sm",
        isDrawerOpen && "opacity-0 pointer-events-none",
      )}
    >
      <div className="flex justify-around items-center py-1.5 px-4">
        {navItems.map((item) =>
          item.href ? (
            <Link
              key={item.href}
              href={item.href}
              onClick={vibrate}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md transition-all duration-150",
                "px-4 py-1.5 text-[13px] font-medium active:scale-[0.95]",
                item.active
                  ? "bg-[var(--olivea-olive)] text-white"
                  : "text-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)] hover:text-white",
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ) : (
            <button
              key={item.label}
              onClick={item.action}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md transition-all duration-150",
                "text-[var(--olivea-olive)] active:scale-[0.95]",
                "hover:bg-[var(--olivea-olive)] hover:text-white px-4 py-1.5",
              )}
            >
              {item.icon}
              <span className="text-[13px] font-medium">{item.label}</span>
            </button>
          ),
        )}
      </div>
    </nav>
  )
}
