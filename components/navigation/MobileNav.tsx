// components/navigation/MobileNav.tsx
"use client"

import Link from "next/link"
import { BookOpen, Calendar, MessageSquare } from "lucide-react"
import { useReservation } from "@/contexts/ReservationContext"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  isButton?: boolean
  id?: string
}

export function MobileNav({ isDrawerOpen }: { isDrawerOpen: boolean }) {
  const { openReservationModal } = useReservation()

  const items: NavItem[] = [
    { label: "Journal", href: "/journal", icon: <BookOpen className="w-5 h-5" /> },
    {
      label: "Reserve",
      href: "#reserve",
      icon: <Calendar className="w-5 h-5" />,
      isButton: true,
      id: "reserve-toggle",
    },
    {
      label: "Chat",
      href: "#chat",
      icon: <MessageSquare className="w-5 h-5" />,
      isButton: true,
      id: "chatbot-toggle",
    },
  ]

  return (
    <nav
      className={`
        fixed bottom-0 inset-x-0 z-50
        bg-transparent backdrop-blur-md
        ${isDrawerOpen ? "pt-20" : "pt-0"}`}
    >
      <ul className="flex justify-around py-3 bg-transparent">
        {items.map((item) =>
          item.isButton ? (
            <li key={item.label}>
              <button
                id={item.id}
                onClick={() => {
                  if (item.label === "Reserve") openReservationModal()
                  if (item.label === "Chat") {
                    window.dispatchEvent(new Event("open-chat"))
                  }
                }}
                className="flex flex-col items-center text-sm text-[var(--olivea-ink)] hover:text-[var(--olivea-olive)]"
              >
                {item.icon}
                <span className="mt-1">{item.label}</span>
              </button>
            </li>
          ) : (
            <li key={item.href}>
              <Link
                href={item.href}
                id={item.id}
                className="flex flex-col items-center text-sm text-[var(--olivea-ink)] hover:text-[var(--olivea-olive)]"
              >
                {item.icon}
                <span className="mt-1">{item.label}</span>
              </Link>
            </li>
          )
        )}
      </ul>
    </nav>
  )
}