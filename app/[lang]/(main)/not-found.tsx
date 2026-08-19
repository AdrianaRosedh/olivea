// app/(main)/[lang]/not-found.tsx
// Server component — keeps SSG eligibility for the parent [lang] segment.
// We default to ES (the primary locale) rather than reading headers(), since
// using next/headers here would opt every page in this segment into dynamic
// rendering at request time. The visual 404 fallback is nearly identical in
// both languages, so the small UX cost is worth the SSG win.
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getContent, t } from "@/lib/content";

export default async function NotFound() {
  const lang = "es" as const;
  const notFound = await getContent("notFound");

  return (
    <main className="relative w-full mk-fullh flex items-center justify-center text-white text-center">
      <Image
        src="/images/farm/hero.jpg"
        alt="Background"
        fill
        sizes="100vw"
        className="object-cover -z-10"
        priority
      />
      <div className="bg-black/60 p-10 rounded-xl max-w-lg">
        <h1 className="text-5xl font-light mb-4">404</h1>
        <p className="text-xl font-light mb-6">{t(lang, notFound.message)}</p>
        <Link href={`/${lang}`}>
          <Button variant="secondary">{t(lang, notFound.cta)}</Button>
        </Link>
      </div>
    </main>
  );
}
