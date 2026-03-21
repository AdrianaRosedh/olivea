"use client";

import type { Lang } from "@/app/(main)/[lang]/dictionaries";
import type { TocItem } from "@/components/journal/ArticleTOC";
import { useArticleDock } from "./useArticleDock";
import { ArticleDockMobile } from "./ArticleDockMobile";
import { ArticleDockDesktop } from "./ArticleDockDesktop";

export default function ArticleDock({
  lang,
  canonicalPath,
  toc,
}: {
  lang: Lang;
  canonicalPath: string;
  toc: TocItem[];
}) {
  const state = useArticleDock({ lang, canonicalPath, toc });

  return (
    <>
      <ArticleDockMobile state={state} toc={toc} />
      <ArticleDockDesktop state={state} toc={toc} />
    </>
  );
}
