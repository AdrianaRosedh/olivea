"use client";

// The 404 text in the reader's language. The page itself stays static (reading
// the language on the server would make every page in this segment dynamic),
// so the language is taken from the address once the page is in the browser.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type Bi = { es: string; en: string };

export default function NotFoundBody({ message, cta }: { message: Bi; cta: Bi }) {
  const lang = usePathname()?.split("/")[1] === "en" ? "en" : "es";
  return (
    <div className="bg-black/60 p-10 rounded-xl max-w-lg">
      <h1 className="text-5xl font-light mb-4">404</h1>
      <p className="text-xl font-light mb-6">{message[lang] || message.es}</p>
      <Link href={`/${lang}`}>
        <Button variant="secondary">{cta[lang] || cta.es}</Button>
      </Link>
    </div>
  );
}
