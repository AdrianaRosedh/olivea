// app/(main)/[lang]/menu/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MenuDeepLink({ params }: { params: { lang: string } }) {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    // optional tab support: /es/menu?tab=vinos
    const tab = search.get("tab");

    try { sessionStorage.setItem("olivea:autoopen-menu", "1"); } catch {}
    if (tab) {
      try { sessionStorage.setItem("olivea:autoopen-tab", tab); } catch {}
    }

    router.replace(`/${params.lang}/farmtotable#menu`);
  }, [router, params.lang, search]);

  return null;
}