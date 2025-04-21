"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Calendar, BookOpen, MessageSquare } from "lucide-react"

type MobileNavProps = {
  lang: "en" | "es"
  isDrawerOpen: boolean
}

export function MobileNav({ lang, isDrawerOpen }: MobileNavProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  return (
    <nav
      className={`
        fixed bottom-0 w-full flex justify-between bg-white border-t py-2 px-6 md:hidden transition-opacity duration-200
        ${isDrawerOpen ? "opacity-0 pointer-events-none" : "opacity-100 z-50"}
      `}
    >
      <Link href={`/${lang}/journal`} className="flex flex-col items-center text-sm text-muted-foreground">
        <BookOpen className="h-5 w-5 mb-1" />
        Journal
      </Link>

      <Link href={`/${lang}/reservations`} className="flex flex-col items-center text-sm text-muted-foreground">
        <Calendar className="h-5 w-5 mb-1" />
        Reserve
      </Link>

      <button id="chatbot-toggle" className="flex flex-col items-center text-sm text-muted-foreground">
        <MessageSquare className="h-5 w-5 mb-1" />
        Chat
      </button>
    </nav>
  )
}