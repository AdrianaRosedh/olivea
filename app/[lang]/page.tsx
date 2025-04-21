import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getDictionary } from "./dictionaries"
import type { Dictionary } from "@/types"

type Props = {
  params: Promise<{ lang: "en" | "es" }>
}

export default async function Home({ params }: Props) {
  const { lang } = await params
  const dict: Dictionary = await getDictionary(lang)
  const home = dict.home

  return (
    <main className="min-h-screen flex flex-col">
      <section className="relative w-full h-[90vh] flex items-center justify-center text-white text-center">
        <Image
          src="/images/hero.jpg"
          alt="Olivea Garden"
          fill
          className="object-cover -z-10"
          priority
        />
        <div className="bg-black/40 p-6 rounded-xl">
          <h1 className="text-4xl md:text-6xl font-light tracking-tight">
            {home.title}
          </h1>
          <p className="mt-4 text-lg md:text-xl font-light">{home.subtitle}</p>
          <div className="mt-6 flex flex-col md:flex-row gap-4 justify-center">
            <Link href={`/${lang}/restaurant`}>
              <Button variant="secondary">{home.cta_restaurant}</Button>
            </Link>
            <Link href={`/${lang}/casa`}>
              <Button variant="ghost">{home.cta_casa}</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}