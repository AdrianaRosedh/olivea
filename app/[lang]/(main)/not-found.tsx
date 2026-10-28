// app/(main)/[lang]/not-found.tsx
// Server component — keeps SSG eligibility for the parent [lang] segment.
// Reading headers() here would opt every page in this segment into dynamic
// rendering, so the text is chosen in the browser from the address instead
// (NotFoundBody): English visitors used to get the Spanish message.
import Image from "next/image";
import { getContent } from "@/lib/content";
import NotFoundBody from "./NotFoundBody";

export default async function NotFound() {
  const notFound = await getContent("notFound");

  return (
    <main className="relative w-full mk-fullh flex items-center justify-center text-white text-center">
      <Image
        src="/images/farm/hero.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover -z-10"
        priority
      />
      <NotFoundBody message={notFound.message} cta={notFound.cta} />
    </main>
  );
}
