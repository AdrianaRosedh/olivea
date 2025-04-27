import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getDictionary } from "./dictionaries"

export default async function NotFound({ params }: { params: { lang?: string } }) {
  const lang = params?.lang || "en"
  const dict = await getDictionary(lang)

  return (
    <main className="relative w-full h-screen flex items-center justify-center text-white text-center">
      <Image src="/images/hero.jpg" alt="Background" fill className="object-cover -z-10" priority />
      <div className="bg-black/60 p-10 rounded-xl max-w-lg">
        <h1 className="text-5xl font-light mb-4">404</h1>
        <p className="text-xl font-light mb-6">{dict?.notFound?.message || "This page could not be found."}</p>
        <Link href={`/${lang}`}>
          <Button variant="secondary">{dict?.notFound?.cta || "Go Home"}</Button>
        </Link>
      </div>
    </main>
  )
}
