// app/(main)/[lang]/not-found.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getDictionary, type Lang } from "./dictionaries"

export default function NotFound() {
  // 1) get lang from route
  const { lang: rawLang } = useParams<{ lang?: string }>() || {}
  const lang: Lang = rawLang === "es" ? "es" : "en"

  // 2) just keep the piece we need
  const [dict, setDict] = useState<{
    notFound: { title?: string; message?: string; cta?: string }
  } | null>(null)

  useEffect(() => {
    // getDictionary is synchronous
    const d = getDictionary(lang)
    setDict({
      notFound: d.notFound ?? {
        title:   lang === "es" ? "404" : "404",
        message: lang === "es" ? "La página que buscas no existe." : "Page not found.",
        cta:     lang === "es" ? "Volver al inicio" : "Go Home",
      },
    })
  }, [lang])

  if (!dict) return null

  const { title, message, cta } = dict.notFound

  return (
    <main className="relative w-full mk-fullh flex items-center justify-center text-white text-center">
      <Image
        src="/images/farm/hero.jpg"
        alt="Background"
        fill
        className="object-cover -z-10"
        priority
      />
      <div className="bg-black/60 p-10 rounded-xl max-w-lg">
        <h1 className="text-5xl font-light mb-4">{title ?? "404"}</h1>
        <p className="text-xl font-light mb-6">{message ?? "Page not found."}</p>
        <Link href={`/${lang}`}>
          <Button variant="secondary">{cta ?? "Go Home"}</Button>
        </Link>
      </div>
    </main>
  )
}