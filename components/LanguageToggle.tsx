"use client"

import { useRouter, usePathname } from "next/navigation"
import Cookies from "js-cookie"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { GlobeIcon } from "lucide-react"

export function LanguageToggle({ lang }: { lang: "en" | "es" }) {
  const router = useRouter()
  const pathname = usePathname()

  const switchLang = (newLang: "en" | "es") => {
    const segments = pathname.split("/")
    segments[1] = newLang
    const newPath = segments.join("/")
    Cookies.set("NEXT_LOCALE", newLang)
    router.push(newPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1 rounded-md text-sm hover:bg-muted">
        <GlobeIcon className="w-4 h-4" />
        {lang.toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchLang("en")}>
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLang("es")}>
          🇪🇸 Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}