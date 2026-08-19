// app/(main)/[lang]/menu/MenuDeepLinkClient.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MenuDeepLinkClient({ lang }: { lang: string }) {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const tab = search.get("tab");
    try {
      sessionStorage.setItem("olivea:autoopen-menu", "1");
      if (tab) sessionStorage.setItem("olivea:autoopen-tab", tab);
    } catch {}

    router.replace(`/${lang}/farmtotable#menu`);
  }, [router, search, lang]);

  return null;
}
